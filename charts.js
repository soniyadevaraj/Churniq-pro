/**
 * charts.js — Chart.js initialisation & rendering
 */

var donutChart = null;
var barChart   = null;

function renderDonut() {
  var ch  = filtered.filter(function(c){ return c.churned; }).length;
  var re  = filtered.length - ch;
  var leg = document.getElementById('donut-legend');
  leg.innerHTML =
    '<span style="display:flex;align-items:center;gap:6px">' +
      '<span style="width:8px;height:8px;border-radius:2px;background:var(--accent);display:inline-block"></span>' +
      '<span style="color:var(--text2)">Retained ' + re + '</span>' +
    '</span>' +
    '<span style="display:flex;align-items:center;gap:6px">' +
      '<span style="width:8px;height:8px;border-radius:2px;background:var(--danger);display:inline-block"></span>' +
      '<span style="color:var(--text2)">Churned ' + ch + '</span>' +
    '</span>';

  if (donutChart) {
    donutChart.data.datasets[0].data = [re, ch];
    donutChart.update();
    return;
  }
  donutChart = new Chart(document.getElementById('c-donut'), {
    type: 'doughnut',
    data: {
      labels: ['Retained', 'Churned'],
      datasets: [{ data: [re, ch], backgroundColor: ['#4f8fff','#ff4d6a'], borderWidth: 0, hoverOffset: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: function(c){ return ' ' + c.label + ': ' + c.raw + ' (' + Math.round(c.raw / filtered.length * 100) + '%)'; } } }
      }
    }
  });
}

function renderBar() {
  var labels = ['Month-to-month', 'One year', 'Two year'];
  var rates  = labels.map(function(ct) {
    var g = filtered.filter(function(c){ return c.contract === ct; });
    return g.length ? Math.round(g.filter(function(c){ return c.churned; }).length / g.length * 100) : 0;
  });

  if (barChart) {
    barChart.data.datasets[0].data = rates;
    barChart.update();
    return;
  }
  barChart = new Chart(document.getElementById('c-bar'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{ data: rates, backgroundColor: ['#ff4d6a','#f5a623','#00e5a0'], borderRadius: 6, borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#8898b4', font: { size: 11 } }, grid: { color: '#1e2535' } },
        y: { ticks: { color: '#8898b4', callback: function(v){ return v + '%'; } }, grid: { color: '#1e2535' }, beginAtZero: true, max: 100 }
      }
    }
  });
}

function buildTrend() {
  var months   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var actual   = [18,20,22,21,25,24,26,23,27,26,28,29];
  var forecast = [null,null,null,null,null,null,null,null,null,27,30,31];
  new Chart(document.getElementById('c-trend'), {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        { label:'Actual',   data: actual,   borderColor:'#ff4d6a', backgroundColor:'rgba(255,77,106,0.08)', tension:.4, fill:true,  pointRadius:3, pointBackgroundColor:'#ff4d6a' },
        { label:'Forecast', data: forecast, borderColor:'#4f8fff', borderDash:[5,4],                         tension:.4, fill:false, pointRadius:3, pointBackgroundColor:'#4f8fff' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color:'#8898b4', font:{ size:11 } }, grid:{ color:'#1e2535' } },
        y: { ticks: { color:'#8898b4', callback:function(v){ return v+'%'; } }, grid:{ color:'#1e2535' } }
      }
    }
  });
}

function buildScatter() {
  var pts  = allC.slice(0, 200).map(function(c){ return { x: c.tenure, y: c.mc }; });
  var cols = allC.slice(0, 200).map(function(c){
    return c.score >= 65 ? 'rgba(255,77,106,0.7)' :
           c.score >= 35 ? 'rgba(245,166,35,0.7)' :
                           'rgba(0,229,160,0.7)';
  });
  new Chart(document.getElementById('c-scatter'), {
    type: 'scatter',
    data: { datasets: [{ data: pts, backgroundColor: cols, pointRadius: 4 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: function(c){ return 'Tenure: ' + c.parsed.x + 'mo | $' + c.parsed.y + '/mo'; } } }
      },
      scales: {
        x: { title:{ display:true, text:'Tenure (months)', color:'#8898b4', font:{size:10} }, ticks:{ color:'#8898b4' }, grid:{ color:'#1e2535' }, min:0, max:75 },
        y: { title:{ display:true, text:'Monthly ($)',     color:'#8898b4', font:{size:10} }, ticks:{ color:'#8898b4' }, grid:{ color:'#1e2535' }, min:10, max:120 }
      }
    }
  });
}
