/**
 * data.js — Synthetic customer data generation & filtering
 */

var seed = 42;
function rand()    { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 4294967296; }
function randInt(a, b) { return Math.floor(rand() * (b - a + 1)) + a; }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

var CONTRACTS = ['Month-to-month', 'One year', 'Two year'];
var INTERNET   = ['Fiber optic', 'DSL', 'No internet'];
var FNAMES     = ['Alex','Jordan','Sam','Casey','Morgan','Riley','Taylor','Quinn','Avery','Blake'];
var LNAMES     = ['Smith','Jones','Brown','Wilson','Davis','Miller','Moore','Anderson','Thomas','Harris'];

function makeCustomers(n) {
  var out = [];
  for (var i = 0; i < n; i++) {
    var ct     = pick(CONTRACTS);
    var inet   = pick(INTERNET);
    var tenure = randInt(1, 72);
    var mc     = Math.round(
      inet === 'Fiber optic' ? randInt(70, 110) :
      inet === 'DSL'         ? randInt(40, 75)  :
                               randInt(20, 50)
    );
    var sr = rand() > 0.84 ? 1 : 0;
    var r  = 0;
    if (ct   === 'Month-to-month') r += 0.35;
    if (inet === 'Fiber optic')    r += 0.20;
    if (tenure < 12)               r += 0.20;
    if (mc > 80)                   r += 0.10;
    if (sr)                        r += 0.08;
    r = Math.min(0.95, r + rand() * 0.12);
    out.push({
      id:       'TLC-' + (1000 + i),
      name:     pick(FNAMES) + ' ' + pick(LNAMES),
      contract: ct,
      internet: inet,
      tenure:   tenure,
      mc:       mc,
      senior:   sr,
      score:    Math.round(r * 100),
      churned:  rand() < r
    });
  }
  return out;
}

// ─── Global state ───
var allC     = makeCustomers(500);
var filtered = allC.slice();

function applyFilter() {
  var v = document.getElementById('segFilter').value;
  if      (v === 'all')        filtered = allC.slice();
  else if (v === 'senior')     filtered = allC.filter(function(c){ return c.senior; });
  else if (v === 'fiber')      filtered = allC.filter(function(c){ return c.internet === 'Fiber optic'; });
  else if (v === 'monthly')    filtered = allC.filter(function(c){ return c.contract === 'Month-to-month'; });
  else if (v === 'nointernet') filtered = allC.filter(function(c){ return c.internet === 'No internet'; });
  renderAll();
}

// ─── Computed metrics ───
function getChurnRate() {
  return (filtered.filter(function(c){ return c.churned; }).length / filtered.length * 100).toFixed(1);
}
function getHighRisk() {
  return filtered.filter(function(c){ return c.score >= 65; }).length;
}
function getRevRisk() {
  return Math.round(
    filtered.filter(function(c){ return c.score >= 65; })
            .reduce(function(a, c){ return a + c.mc; }, 0) / 1000
  );
}
