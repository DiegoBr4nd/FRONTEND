import { useState, useEffect, useMemo } from 'react';
import { TEAMS, EN_BY_ES, ABBR_BY_ES } from './teams';
import { analyzeMatch } from './verdict';
import './dashboard.css';

// URL de tu backend en Render
const API_BASE = 'https://mundial-95mx.onrender.com';

const CONF_ORDER = ['CONMEBOL', 'UEFA', 'CONCACAF', 'AFC', 'CAF', 'OFC'];

export default function App() {
  const [home, setHome] = useState('Portugal');
  const [away, setAway] = useState('RD Congo');
  const [neutral, setNeutral] = useState(true);
  const [model, setModel] = useState('ensemble');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [btts, setBtts] = useState('no'); // toggle visual yes/no

  const teamsByConf = useMemo(() => {
    const g = {};
    for (const c of CONF_ORDER) g[c] = TEAMS.filter(t => t.conf === c);
    return g;
  }, []);

  async function predict() {
    setLoading(true); setError(null);
    try {
      const h = EN_BY_ES[home], a = EN_BY_ES[away];
      const url = `${API_BASE}/predict?home=${encodeURIComponent(h)}&away=${encodeURIComponent(a)}&neutral=${neutral}&model=${model}`;
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Error ${res.status}`);
      }
      setData(await res.json());
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  // Predicción inicial al cargar
  useEffect(() => { predict(); /* eslint-disable-next-line */ }, []);

  const m = data?.markets;
  const lambdas = data?.lambdas_by_model;
  const homeAbbr = ABBR_BY_ES[home] || home.slice(0, 3).toUpperCase();
  const awayAbbr = ABBR_BY_ES[away] || away.slice(0, 3).toUpperCase();

  const p1x2 = m?.result_1x2;
  const pct = (x) => (x * 100).toFixed(1);

  // Veredicto interpretable (claridad para decidir)
  const verdict = useMemo(
    () => (m ? analyzeMatch(m, home, away) : null),
    [m, home, away]
  );

  // Anchos de barra para el header 1X2
  const barW = p1x2 ? {
    h: pct(p1x2.home.prob), d: pct(p1x2.draw.prob), a: pct(p1x2.away.prob),
  } : { h: 33, d: 34, a: 33 };

  return (
    <div className="layout">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <div className="brand-block glass">
          <div className="brand-logo">◈</div>
          <div>
            <div className="brand-name c-primary">Elite Analytics</div>
            <div className="brand-sub label-md c-variant">Pro Dashboard</div>
          </div>
        </div>

        <nav className="nav">
          <NavItem icon="◉" label="En vivo" />
          <NavItem icon="▦" label="Programados" />
          <NavItem icon="↺" label="Historial" />
          <NavItem icon="📈" label="Analítica" active />
          <NavItem icon="⚙" label="Ajustes" />
        </nav>

        <div className="sidebar-foot">
          <button className="btn-vip">Actualizar a VIP</button>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <main className="main">
        <Topbar />

        <div className="controls glass">
          <TeamSelect label="Local" value={home} onChange={setHome} groups={teamsByConf} exclude={away} />
          <div className="vs-pill data-mono">VS</div>
          <TeamSelect label="Visitante" value={away} onChange={setAway} groups={teamsByConf} exclude={home} />

          <div className="ctrl-group">
            <label className="label-md c-variant">Sede</label>
            <div className="seg">
              <button className={neutral ? 'on' : ''} onClick={() => setNeutral(true)}>Neutral</button>
              <button className={!neutral ? 'on' : ''} onClick={() => setNeutral(false)}>Local</button>
            </div>
          </div>

          <div className="ctrl-group">
            <label className="label-md c-variant">Modelo</label>
            <select className="model-sel" value={model} onChange={e => setModel(e.target.value)}>
              <option value="ensemble">Ensemble</option>
              <option value="dixon_coles">Dixon-Coles</option>
              <option value="poisson_glm">Poisson GLM</option>
              <option value="xgboost">XGBoost</option>
            </select>
          </div>

          <button className="btn-primary" onClick={predict} disabled={loading}>
            {loading ? 'Calculando…' : 'Predecir'}
          </button>
        </div>

        {error && (
          <div className="error-banner glass">
            <strong className="c-error">No se pudo predecir.</strong>
            <span className="c-variant"> {error}</span>
          </div>
        )}

        {/* ===== Hero del partido ===== */}
        <section className="hero glass glow-hover">
          <div className="hero-left">
            <div className="venue-tag label-md c-variant">
              ▣ {neutral ? 'Sede neutral' : `${home} local`}
            </div>
            <h1 className="match-title">
              <span className="display-lg">{home}</span>
              <span className="vs-sm c-variant">vs</span>
              <span className="display-lg">{away}</span>
            </h1>
          </div>
          <div className="hero-right">
            {p1x2 && (
              <>
                <div className="prob-legend">
                  <span className="c-secondary">{homeAbbr} {pct(p1x2.home.prob)}%</span>
                  <span className="c-variant">EMPATE {pct(p1x2.draw.prob)}%</span>
                  <span className="c-error">{awayAbbr} {pct(p1x2.away.prob)}%</span>
                </div>
                <div className="prob-bar">
                  <span style={{ width: `${barW.h}%`, background: 'var(--secondary)' }} />
                  <span style={{ width: `${barW.d}%`, background: 'var(--surface-bright)' }} />
                  <span style={{ width: `${barW.a}%`, background: 'var(--error)' }} />
                </div>
              </>
            )}
          </div>
        </section>

        {/* ===== Veredicto / claridad para decidir ===== */}
        {verdict && (
          <section className={`verdict glass glow-hover conf-${verdict.confidence}`}>
            <div className="verdict-main">
              <div className="verdict-head">
                <span className={`conf-badge c-${verdict.confColor}`}>
                  <span className="conf-dot" /> Confianza {verdict.confidence}
                </span>
                <span className="label-md c-variant">Lectura del modelo</span>
              </div>
              <p className="verdict-headline">{verdict.headline}</p>
              <ul className="verdict-notes">
                {verdict.notes.map((n, i) => (
                  <li key={i} className="body-md c-variant">{n}</li>
                ))}
              </ul>
            </div>
            <div className="verdict-bet">
              <div className="label-md c-variant">Dato más sólido</div>
              <div className="bet-label">{verdict.bestBet.label}</div>
              <div className="bet-prob data-mono c-secondary">{pct(verdict.bestBet.prob)}%</div>
              <div className="bet-reason body-md c-variant">{verdict.bestBet.reason}</div>
            </div>
          </section>
        )}

        {/* ===== Grid de mercados ===== */}
        {m && (
          <div className="grid">
            {/* Expected goals */}
            <section className="card glass glow-hover col-8">
              <h3 className="card-title label-md c-variant">Σ Goles esperados algorítmicos (xG · λ)</h3>
              <div className="xg-row">
                <XgBox label={`${home} xG global`} val={m.expected_goals.home} color="primary" />
                <XgBox label="Total esperado" val={m.expected_goals.total} color="surface" big />
                <XgBox label={`${away} xG global`} val={m.expected_goals.away} color="error" />
              </div>
              <div className="model-bars">
                {lambdas && (
                  <>
                    <ModelBar name="Dixon-Coles" h={lambdas.dixon_coles.home} a={lambdas.dixon_coles.away} />
                    <ModelBar name="Poisson GLM" h={lambdas.poisson_glm.home} a={lambdas.poisson_glm.away} />
                    <ModelBar name="XGBoost" h={lambdas.xgboost.home} a={lambdas.xgboost.away} />
                  </>
                )}
              </div>
            </section>

            {/* Over/Under */}
            <section className="card glass glow-hover col-4 row-span-2">
              <h3 className="card-title label-md c-variant">☰ Goles totales (O/U)</h3>
              <table className="ou-table">
                <thead>
                  <tr><th>Línea</th><th>Over % (Cuota)</th><th>Under % (Cuota)</th></tr>
                </thead>
                <tbody>
                  {Object.entries(m.over_under).map(([line, v]) => (
                    <tr key={line} className={line === '2.5' ? 'highlight' : ''}>
                      <td className="data-mono">{line}</td>
                      <td><span className="c-secondary data-mono">{pct(v.over)}%</span> <span className="c-variant data-mono">{v.over_odds}</span></td>
                      <td><span className={v.under > v.over ? 'c-secondary data-mono' : 'data-mono'}>{pct(v.under)}%</span> <span className="c-variant data-mono">{v.under_odds}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 1X2 */}
            <section className="card glass glow-hover col-4">
              <h3 className="card-title label-md c-variant">Resultado (1X2)</h3>
              <div className="oddrow selected">
                <div><div className="oddrow-team">{home}</div><div className="oddrow-pct c-secondary data-mono">{pct(p1x2.home.prob)}%</div></div>
                <div className="oddrow-odds c-tertiary data-mono">{p1x2.home.odds}</div>
              </div>
              <div className="oddrow">
                <div><div className="oddrow-team">Empate</div><div className="oddrow-pct c-variant data-mono">{pct(p1x2.draw.prob)}%</div></div>
                <div className="oddrow-odds data-mono">{p1x2.draw.odds}</div>
              </div>
              <div className="oddrow">
                <div><div className="oddrow-team">{away}</div><div className="oddrow-pct c-error data-mono">{pct(p1x2.away.prob)}%</div></div>
                <div className="oddrow-odds data-mono">{p1x2.away.odds}</div>
              </div>
            </section>

            {/* Double chance */}
            <section className="card glass glow-hover col-4">
              <h3 className="card-title label-md c-variant">Doble oportunidad</h3>
              <div className="dc-row">
                <DcBox label="1X" val={pct(m.double_chance['1X'])} />
                <DcBox label="12" val={pct(m.double_chance['12'])} />
                <DcBox label="X2" val={pct(m.double_chance['X2'])} dim />
              </div>
            </section>

            {/* BTTS */}
            <section className="card glass glow-hover col-4">
              <div className="btts-head">
                <h3 className="card-title label-md c-variant">Ambos marcan</h3>
                <div className="seg seg-sm">
                  <button className={btts === 'yes' ? 'on' : ''} onClick={() => setBtts('yes')}>Sí</button>
                  <button className={btts === 'no' ? 'on' : ''} onClick={() => setBtts('no')}>No</button>
                </div>
              </div>
              <div className="btts-body">
                <div>
                  <div className="label-md c-variant">{btts === 'yes' ? 'Sí (implícita)' : 'No (implícita)'}</div>
                  <div className="btts-big c-primary data-mono">
                    {btts === 'yes' ? pct(m.btts.yes) : pct(m.btts.no)}%
                  </div>
                </div>
                <div className="btts-odds">
                  <div className="label-md c-variant">Cuota justa</div>
                  <div className="btts-big c-tertiary data-mono">
                    {btts === 'yes' ? m.btts.yes_odds : m.btts.no_odds}
                  </div>
                </div>
              </div>
            </section>

            {/* Top exact scores */}
            <section className="card glass glow-hover col-4 row-span-2">
              <h3 className="card-title label-md c-variant">⚑ Marcadores más probables</h3>
              <div className="score-list">
                {m.exact_scores.slice(0, 6).map((s, i) => (
                  <div key={s.score} className={`score-row ${i === 0 ? 'top' : ''}`}>
                    <span className="score-rank c-variant data-mono">{i + 1}</span>
                    <span className="score-val data-mono">{s.score.replace('-', ' - ')}</span>
                    <span className="score-pct c-secondary data-mono">{pct(s.prob)}%</span>
                    <span className="score-odds c-tertiary data-mono">{s.odds}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------- Subcomponentes ---------- */
function NavItem({ icon, label, active }) {
  return (
    <div className={`nav-item ${active ? 'active' : ''}`}>
      <span className="nav-icon">{icon}</span>
      <span className="body-md">{label}</span>
      {active && <span className="nav-bar" />}
    </div>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <div className="logo headline-md">Stryker <span className="c-primary">Analytics</span></div>
      <nav className="top-nav">
        <a className="active">Mercados</a><a>Cuotas</a><a>Stats</a><a>En vivo</a>
      </nav>
      <div className="top-actions"><span>🔔</span><span>▣</span><span className="avatar" /></div>
    </header>
  );
}

function TeamSelect({ label, value, onChange, groups, exclude }) {
  return (
    <div className="ctrl-group team-ctrl">
      <label className="label-md c-variant">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="team-sel">
        {Object.entries(groups).map(([conf, list]) => (
          <optgroup key={conf} label={conf}>
            {list.map(t => (
              <option key={t.es} value={t.es} disabled={t.es === exclude}>{t.es}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

function XgBox({ label, val, color, big }) {
  return (
    <div className={`xg-box ${big ? 'xg-big' : ''}`}>
      <div className="label-md c-variant">{label}</div>
      <div className={`xg-val data-mono c-${color}`}>{val?.toFixed(2)}</div>
    </div>
  );
}

function ModelBar({ name, h, a }) {
  const total = h + a;
  const hw = (h / total) * 100;
  return (
    <div className="mbar">
      <span className="mbar-name body-md c-variant">{name}</span>
      <span className="mbar-h data-mono c-primary">{h.toFixed(2)}</span>
      <div className="mbar-track">
        <span className="mbar-fill-h" style={{ width: `${hw}%` }} />
        <span className="mbar-fill-a" style={{ width: `${100 - hw}%` }} />
      </div>
      <span className="mbar-a data-mono c-error">{a.toFixed(2)}</span>
    </div>
  );
}

function DcBox({ label, val, dim }) {
  return (
    <div className={`dc-box ${dim ? 'dim' : ''}`}>
      <div className="dc-label data-mono">{label}</div>
      <div className={`dc-val data-mono ${dim ? 'c-variant' : 'c-secondary'}`}>{val}%</div>
    </div>
  );
}
