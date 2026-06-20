// verdict.js — Convierte las probabilidades crudas en una lectura interpretable.
// No usa el modelo ni la API: solo razona sobre la respuesta de /predict.

/**
 * Analiza los mercados y devuelve:
 *  - confidence: 'alta' | 'media' | 'baja'  (qué tan clara es la predicción)
 *  - confColor: token de color para el front
 *  - headline: frase corta de veredicto
 *  - bestBet: el mercado más sólido { label, prob, reason }
 *  - notes: observaciones adicionales (lista de strings)
 */
export function analyzeMatch(markets, homeName, awayName) {
  const p = markets.result_1x2;
  const ph = p.home.prob, pd = p.draw.prob, pa = p.away.prob;

  // --- 1. Nivel de confianza del 1X2 ---
  // Medimos cuánto destaca el favorito sobre el resto.
  const sorted = [ph, pd, pa].sort((a, b) => b - a);
  const top = sorted[0], second = sorted[1];
  const gap = top - second;          // separación favorito vs segundo
  const dominance = top;             // probabilidad del más probable

  let confidence, confColor;
  if (dominance >= 0.55 && gap >= 0.25) {
    confidence = 'alta'; confColor = 'secondary';   // verde
  } else if (dominance >= 0.45 || gap >= 0.15) {
    confidence = 'media'; confColor = 'primary';    // cyan
  } else {
    confidence = 'baja'; confColor = 'tertiary';    // púrpura (partido abierto)
  }

  // --- 2. ¿Quién es el favorito del 1X2? ---
  let favName, favProb, favKind;
  if (ph === top) { favName = homeName; favProb = ph; favKind = 'gana_local'; }
  else if (pa === top) { favName = awayName; favProb = pa; favKind = 'gana_visitante'; }
  else { favName = 'el empate'; favProb = pd; favKind = 'empate'; }

  // --- 3. Buscar el mercado MÁS SÓLIDO (mayor probabilidad razonable) ---
  // Recorremos varios mercados y elegimos el de probabilidad más alta,
  // porque es donde el modelo tiene una opinión más firme.
  const candidates = [];

  // 1X2
  candidates.push({
    label: favKind === 'empate' ? 'Empate' : `Gana ${favName}`,
    prob: favProb,
    group: '1X2',
    reason: 'resultado más probable del partido',
  });

  // Doble oportunidad (suele ser el más seguro)
  const dc = markets.double_chance;
  const dcEntries = [
    { k: '1X', v: dc['1X'], txt: `${homeName} o empate` },
    { k: '12', v: dc['12'], txt: `${homeName} o ${awayName}` },
    { k: 'X2', v: dc['X2'], txt: `empate o ${awayName}` },
  ].sort((a, b) => b.v - a.v)[0];
  candidates.push({
    label: `Doble oportunidad ${dcEntries.k}`,
    prob: dcEntries.v,
    group: 'doble',
    reason: `${dcEntries.txt} — cubre dos resultados`,
  });

  // Over/Under: el lado más probable de cada línea, nos quedamos con el mejor
  // Excluimos líneas triviales (Over 0.5 / Under 4.5 casi seguras) que no
  // aportan valor para apostar: solo consideramos mercados "disputados".
  let bestOU = null;
  for (const [line, v] of Object.entries(markets.over_under)) {
    const overBetter = v.over >= v.under;
    const prob = overBetter ? v.over : v.under;
    if (prob > 0.85) continue;  // demasiado obvio, no aporta valor
    const label = `${overBetter ? 'Over' : 'Under'} ${line} goles`;
    if (!bestOU || prob > bestOU.prob) bestOU = { label, prob, line };
  }
  if (bestOU) candidates.push({
    label: bestOU.label,
    prob: bestOU.prob,
    group: 'ou',
    reason: 'línea de goles más definida',
  });

  // BTTS
  const bttsBetter = markets.btts.no >= markets.btts.yes;
  candidates.push({
    label: `Ambos marcan: ${bttsBetter ? 'No' : 'Sí'}`,
    prob: bttsBetter ? markets.btts.no : markets.btts.yes,
    group: 'btts',
    reason: bttsBetter ? 'se espera que al menos uno no marque' : 'se esperan goles de ambos',
  });

  // Elegimos como "apuesta más sólida" la de mayor probabilidad,
  // excluyendo opciones triviales que no aportan valor:
  //  - doble oportunidad casi segura (>90%)
  //  - cualquier mercado por encima de 88% (demasiado obvio)
  const meaningful = candidates.filter(c => {
    if (c.group === 'doble' && c.prob > 0.90) return false;
    if (c.prob > 0.88) return false;
    return true;
  });
  // Si todo era trivial (raro), caemos al de mayor prob general.
  const pool = meaningful.length ? meaningful : candidates;
  const bestBet = pool.sort((a, b) => b.prob - a.prob)[0];

  // --- 4. Veredicto en lenguaje natural ---
  let headline;
  if (confidence === 'alta') {
    headline = `${favName} es claro favorito (${pct(favProb)}%). Predicción con respaldo sólido.`;
  } else if (confidence === 'media') {
    headline = favKind === 'empate'
      ? `Partido equilibrado con ligera tendencia al empate.`
      : `${favName} parte como favorito, pero sin gran ventaja.`;
  } else {
    headline = `Partido abierto: los tres resultados están cerca. Baja previsibilidad.`;
  }

  // --- 5. Notas contextuales ---
  const notes = [];
  const totalGoals = markets.expected_goals.total;
  if (totalGoals < 2.2) notes.push('Se esperan pocos goles (partido cerrado).');
  else if (totalGoals > 3.0) notes.push('Se esperan muchos goles (partido abierto).');

  if (Math.abs(ph - pa) < 0.08 && favKind !== 'empate') {
    notes.push('Local y visitante están muy parejos; considera la doble oportunidad.');
  }
  if (pd > 0.28) notes.push('Probabilidad de empate elevada para este tipo de partido.');

  const topScore = markets.exact_scores[0];
  notes.push(`Marcador más probable: ${topScore.score.replace('-', '–')} (${pct(topScore.prob)}%).`);

  return { confidence, confColor, headline, bestBet, notes, favName, favProb };
}

function pct(x) { return (x * 100).toFixed(1); }
