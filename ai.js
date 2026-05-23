/**
 * ai.js — API key setup, bot messaging, AI search
 */

var APIKEY     = localStorage.getItem('churniq_key') || '';
var currentBot = 'analyst';

// ─── Bot configuration ───
var BOT_SYSTEMS = {
  analyst:
    'You are a senior data analyst AI inside a telecom churn prediction dashboard. ' +
    'Be concise (3-4 sentences max). Use live numbers. Give data-driven business insights. Plain prose, no markdown.',
  retention:
    'You are a customer success and retention specialist AI. ' +
    'Focus on actionable retention plays, offer strategies, outreach tactics. 3-4 sentences. Plain prose, no markdown.',
  forecast:
    'You are a revenue intelligence and forecasting AI. ' +
    'Focus on projections, scenario modelling, trend analysis. Be specific with numbers. 3-4 sentences. Plain prose, no markdown.',
  segment:
    'You are a customer segmentation and cohort analysis specialist AI. ' +
    'Focus on segment behaviour differences, micro-targeting, and customer profile insights. 3-4 sentences. Plain prose, no markdown.'
};
var BOT_NAMES  = { analyst:'ANALYST AGENT', retention:'RETENTION BOT', forecast:'FORECAST BOT', segment:'SEGMENT INTEL BOT' };
var BOT_COLORS = { analyst:'var(--accent)',  retention:'var(--accent3)',  forecast:'#a78bfa',     segment:'var(--warn)' };

// ─── Key activation ───
(function init(){
  if (APIKEY) showActive();
})();

function showActive() {
  document.getElementById('global-setup-box').style.display = 'none';
  ['analyst','retention','forecast','segment'].forEach(function(id) {
    var b = document.getElementById('badge-' + id);
    b.textContent = '● Active';
    b.className   = 'ai-status-pill pill-active';
  });
}

function activateKey() {
  var k = document.getElementById('keyInput').value.trim();
  if (!k) { alert('Please paste your API key first.'); return; }
  APIKEY = k;
  localStorage.setItem('churniq_key', k);
  showActive();
  addMsg('analyst',  'ai', 'Ready! Connected to ' + filtered.length + ' customers, ' + getChurnRate() + '% churn, $' + getRevRisk() + 'K at risk. Ask me anything about your data.', 'var(--accent)',  'ANALYST AGENT');
  addMsg('retention','ai', 'Active! I can see ' + getHighRisk() + ' high-risk accounts. Let me build you a retention playbook to rescue that revenue.', 'var(--accent3)', 'RETENTION BOT');
  addMsg('forecast', 'ai', 'Online. Based on current trends I can model your next 90 days. What scenario shall we run first?', '#a78bfa', 'FORECAST BOT');
  addMsg('segment',  'ai', 'Initialised. I have profiled all ' + filtered.length + ' customers across 3 internet types and 3 contract tiers. Ready to segment.', 'var(--warn)', 'SEGMENT INTEL BOT');
}

// ─── Tab switching ───
function switchBot(id) {
  currentBot = id;
  document.querySelectorAll('.bot-tab').forEach(function(t){ t.classList.remove('active'); });
  event.currentTarget.classList.add('active');
  document.querySelectorAll('.ai-panel').forEach(function(p){ p.classList.remove('visible'); });
  document.getElementById('bot-' + id).classList.add('visible');
}

// ─── Messaging helpers ───
function addMsg(botId, role, text, nameColor, nameLabel) {
  var msgs = document.getElementById('msgs-' + botId);
  var el   = document.createElement('div');
  el.className = 'msg msg-' + role;
  if (role === 'ai') {
    el.innerHTML =
      '<strong style="color:' + (nameColor || 'var(--accent)') + ';font-family:DM Mono,monospace;font-size:10px;letter-spacing:.06em">' +
      (nameLabel || 'AI AGENT') + '</strong><br>' + text;
  } else {
    el.textContent = text;
  }
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
  return el;
}

function buildLiveContext(botId) {
  var mmg = filtered.filter(function(c){ return c.contract === 'Month-to-month'; });
  var mmr = mmg.length ? Math.round(mmg.filter(function(c){ return c.churned; }).length / mmg.length * 100) : 0;
  return BOT_SYSTEMS[botId] +
    ' Live data: total customers: ' + filtered.length +
    ', churn rate: ' + getChurnRate() + '%' +
    ', high-risk (65+): ' + getHighRisk() +
    ', monthly revenue at risk: $' + getRevRisk() + 'K' +
    ', month-to-month churn: ' + mmr + '%' +
    ', top SHAP: contract type 88%, tenure 74%, internet 67%, monthly charges 55%.';
}

// ─── Bot chat ───
async function askBot(botId, q) {
  if (!q || !q.trim()) return;
  document.getElementById('input-' + botId).value = '';

  if (!APIKEY) {
    addMsg(botId, 'ai', '<span style="color:var(--warn)">Please add your API key in the setup box above first.</span>', BOT_COLORS[botId], BOT_NAMES[botId]);
    return;
  }

  addMsg(botId, 'user', q);

  var msgs   = document.getElementById('msgs-' + botId);
  var typing = document.createElement('div');
  typing.className = 'msg-typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  try {
    var res  = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APIKEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 350,
        system:     buildLiveContext(botId),
        messages:   [{ role: 'user', content: q }]
      })
    });
    var data = await res.json();
    typing.remove();
    if (data.error) {
      addMsg(botId, 'ai', '<span style="color:var(--danger)">API Error: ' + data.error.message + '</span>', BOT_COLORS[botId], BOT_NAMES[botId]);
    } else {
      var txt = data.content && data.content[0] ? data.content[0].text : 'No response.';
      addMsg(botId, 'ai', txt, BOT_COLORS[botId], BOT_NAMES[botId]);
    }
  } catch (e) {
    typing.remove();
    addMsg(botId, 'ai', '<span style="color:var(--danger)">Error: ' + e.message + '</span>', BOT_COLORS[botId], BOT_NAMES[botId]);
  }
}

// ─── AI Search ───
async function runSearch(q) {
  var query = q || document.getElementById('search-input').value.trim();
  if (!query) return;
  document.getElementById('search-input').value = query;

  var res = document.getElementById('search-results');
  if (!APIKEY) {
    res.innerHTML = '<span style="color:var(--warn)">Please add your Anthropic API key above to activate AI search.</span>';
    return;
  }

  res.innerHTML = '<span style="color:var(--text3);font-style:italic">🔍 Searching your churn data...</span>';

  var mmg = filtered.filter(function(c){ return c.contract === 'Month-to-month'; });
  var mmr = mmg.length ? Math.round(mmg.filter(function(c){ return c.churned; }).length / mmg.length * 100) : 0;
  var sys =
    'You are a churn analytics search engine. Answer the question directly and concisely in 2-3 sentences using the live data provided. ' +
    'Data: total customers: ' + filtered.length +
    ', churn rate: ' + getChurnRate() + '%' +
    ', high-risk: ' + getHighRisk() +
    ', revenue at risk: $' + getRevRisk() + 'K' +
    ', month-to-month churn: ' + mmr + '%' +
    ', SHAP top features: contract type 88%, tenure 74%, internet service 67%, monthly charges 55%. Plain prose only.';

  try {
    var r    = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APIKEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 200,
        system:     sys,
        messages:   [{ role: 'user', content: query }]
      })
    });
    var data = await r.json();
    if (data.error) {
      res.innerHTML = '<span style="color:var(--danger)">API Error: ' + data.error.message + '</span>';
    } else {
      var txt = data.content && data.content[0] ? data.content[0].text : 'No result.';
      res.innerHTML = '<span style="color:var(--text)">' + txt + '</span>';
    }
  } catch (e) {
    res.innerHTML = '<span style="color:var(--danger)">Error: ' + e.message + '</span>';
  }
}
