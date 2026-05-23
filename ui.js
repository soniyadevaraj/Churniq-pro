/**
 * ui.js — DOM rendering: KPIs, risk table, segments, SHAP, insight chips, ticker
 */

function renderKPIs() {
  var t  = filtered.length;
  var ch = filtered.filter(function(c){ return c.churned; }).length;
  document.getElementById('k-total').textContent    = t.toLocaleString();
  document.getElementById('k-churn').textContent    = getChurnRate() + '%';
  document.getElementById('k-churn-sub').textContent = ch + ' customers lost';
  document.getElementById('k-risk').textContent     = getHighRisk();
  document.getElementById('k-risk-sub').textContent  = 'Score ≥ 65%';
  document.getElementById('k-rev').textContent      = '$' + getRevRisk() + 'K/mo';
  document.getElementById('k-rev-sub').textContent   = 'Monthly exposure';
}

function renderTable() {
  var rows = filtered
    .filter(function(c){ return c.score >= 65; })
    .sort(function(a, b){ return b.score - a.score; })
    .slice(0, 8);

  document.getElementById('risk-tbody').innerHTML = rows.map(function(c) {
    var col = c.score >= 65 ? 'var(--danger)' : c.score >= 35 ? 'var(--warn)' : 'var(--accent3)';
    var cls = c.score >= 65 ? 'pill-h'        : c.score >= 35 ? 'pill-m'      : 'pill-l';
    var lbl = c.score >= 65 ? 'High'          : c.score >= 35 ? 'Medium'      : 'Low';
    return '<tr>' +
      '<td style="color:#79aeff;font-family:DM Mono,monospace;font-size:11px">' + c.id + '</td>' +
      '<td>' + c.contract + '</td>' +
      '<td>' + c.tenure + '</td>' +
      '<td>$' + c.mc + '</td>' +
      '<td>' + c.internet + '</td>' +
      '<td><div style="display:flex;align-items:center;gap:8px">' +
        '<div style="flex:1;background:var(--surface2);border-radius:4px;height:5px;overflow:hidden">' +
          '<div style="width:' + c.score + '%;background:' + col + ';height:100%;border-radius:4px"></div>' +
        '</div>' +
        '<span style="font-size:11px;color:var(--text2)">' + c.score + '%</span>' +
      '</div></td>' +
      '<td><span class="pill ' + cls + '">' + lbl + '</span></td>' +
    '</tr>';
  }).join('');
}

function renderSegs() {
  var types = ['Fiber optic', 'DSL', 'No internet'];
  var cols  = ['#ff4d6a', '#f5a623', '#00e5a0'];
  document.getElementById('seg-list').innerHTML = types.map(function(t, i) {
    var g = filtered.filter(function(c){ return c.internet === t; });
    var r = g.length ? Math.round(g.filter(function(c){ return c.churned; }).length / g.length * 100) : 0;
    return '<div class="seg-row">' +
      '<div class="seg-lbl">' + t + '</div>' +
      '<div class="seg-track"><div class="seg-fill" style="width:' + r + '%;background:' + cols[i] + '"></div></div>' +
      '<div class="seg-pct">' + r + '%</div>' +
    '</div>';
  }).join('');
}

function renderSHAP() {
  var features = [
    { l:'Contract type',  v:88, c:'#ff4d6a' },
    { l:'Tenure',         v:74, c:'#ff4d6a' },
    { l:'Internet service',v:67,c:'#f5a623' },
    { l:'Monthly charges',v:55, c:'#f5a623' },
    { l:'Senior citizen', v:38, c:'#4f8fff' },
    { l:'Tech support',   v:29, c:'#00e5a0' }
  ];
  document.getElementById('shap-list').innerHTML = features.map(function(f) {
    return '<div class="shap-row">' +
      '<div class="shap-top">' +
        '<span style="color:var(--text2)">' + f.l + '</span>' +
        '<span style="color:' + f.c + ';font-weight:600">' + f.v + '%</span>' +
      '</div>' +
      '<div class="shap-track"><div class="shap-bar" style="width:' + f.v + '%;background:' + f.c + '"></div></div>' +
    '</div>';
  }).join('');
}

function renderInsights() {
  var ch  = filtered.filter(function(c){ return c.churned; }).length;
  var rate= getChurnRate();
  var mmg = filtered.filter(function(c){ return c.contract === 'Month-to-month'; });
  var mmr = mmg.length ? Math.round(mmg.filter(function(c){ return c.churned; }).length / mmg.length * 100) : 0;
  var fg  = filtered.filter(function(c){ return c.internet === 'Fiber optic'; });
  var fr  = fg.length  ? Math.round(fg.filter(function(c){ return c.churned; }).length / fg.length * 100) : 0;

  document.getElementById('insight-chips').innerHTML =
    '<div class="chip chip-red">Overall churn ' + rate + '% — ' + ch + ' customers lost this period</div>' +
    '<div class="chip chip-yellow">Month-to-month contracts churn at ' + mmr + '% — highest risk segment</div>' +
    '<div class="chip chip-yellow">Fiber optic users churn at ' + fr  + '% — likely pricing sensitivity</div>' +
    '<div class="chip chip-blue">$' + getRevRisk() + 'K/mo at risk from ' + getHighRisk() + ' high-risk accounts</div>' +
    '<div class="chip chip-green">Two-year contracts show lowest churn — strong upsell opportunity</div>';
}

function updateTicker() {
  var msgs = [
    '⚡ ' + getHighRisk() + ' high-risk accounts detected — immediate retention action recommended',
    '📊 Churn rate at ' + getChurnRate() + '% — month-to-month customers are primary risk vector',
    '💸 $' + getRevRisk() + 'K monthly revenue at risk from churning accounts',
    '🎯 Fiber optic segment: consider targeted loyalty discount to reduce friction',
    '📈 Two-year contract upgrade drive could cut churn by an estimated 18–24%',
    '🔬 Senior customer segment shows elevated churn — personalised support may help'
  ];
  var idx = Math.floor(Math.random() * msgs.length);
  document.getElementById('ticker-text').textContent = msgs[idx];
}

function renderAll() {
  renderKPIs();
  renderDonut();
  renderBar();
  renderTable();
  renderSegs();
  renderInsights();
  updateTicker();
}
