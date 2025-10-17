const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11));

const storage = {
  txs: 'txs_v1',
  bills: 'bills_v1',
  weight: 'weight_v1',
  water: 'water_v1',
  cycle: 'cycle_v1',
  labs: 'labs_v1',
  prefs: 'prefs_v1'
};

const state = {
  transactions: [],
  accounts: [],
  weight: { year: dayjs().year(), month: dayjs().month(), values: {} },
  water: { year: dayjs().year(), month: dayjs().month(), values: {} },
  cycle: [],
  labs: [],
  tpc: '',
  accountStatusFilter: 'all',
  txPage: 1,
  theme: 'dark',
  font: 'Inter'
};

const perPage = 20;

function loadState() {
  const prefs = JSON.parse(localStorage.getItem(storage.prefs) || '{}');
  state.theme = prefs.theme || 'dark';
  state.font = prefs.font || 'Inter';
  applyThemeFont();

  state.transactions = JSON.parse(localStorage.getItem(storage.txs) || '[]');
  if (!state.transactions.length) {
    const seedDate = dayjs();
    state.transactions = [
      { id: uuid(), type: 'entrada', value: 3000, category: 'Salário', date: seedDate.subtract(3, 'day').format('YYYY-MM-DD'), note: 'Pagamento mensal' },
      { id: uuid(), type: 'saida', value: 540, category: 'Saúde', date: seedDate.subtract(2, 'day').format('YYYY-MM-DD'), note: 'Exames laboratoriais' },
      { id: uuid(), type: 'saida', value: 508, category: 'Transporte', date: seedDate.subtract(1, 'day').format('YYYY-MM-DD'), note: 'Combustível e pedágios' },
      { id: uuid(), type: 'entrada', value: 1193, category: 'Outros', date: seedDate.format('YYYY-MM-DD'), note: 'Projeto freelancer' }
    ];
    saveTransactions();
  }

  state.accounts = JSON.parse(localStorage.getItem(storage.bills) || '[]');
  if (!state.accounts.length) {
    state.accounts = [
      { id: uuid(), name: 'Aluguel Loft', value: 1950, due: dayjs().startOf('month').add(3, 'day').format('YYYY-MM-DD'), type: 'pagar', status: 'pendente', recurring: true },
      { id: uuid(), name: 'Consultoria UX', value: 850, due: dayjs().startOf('month').add(12, 'day').format('YYYY-MM-DD'), type: 'receber', status: 'pendente', recurring: false },
      { id: uuid(), name: 'Energia', value: 240, due: dayjs().subtract(2, 'day').format('YYYY-MM-DD'), type: 'pagar', status: 'vencido', recurring: true }
    ];
    saveAccounts();
  }

  state.weight = JSON.parse(localStorage.getItem(storage.weight) || 'null') || {
    year: dayjs().year(),
    month: dayjs().month(),
    values: { '1': 79.5, '2': 79.1, '3': 78.7, '4': 78.9 }
  };
  state.water = JSON.parse(localStorage.getItem(storage.water) || 'null') || {
    year: dayjs().year(),
    month: dayjs().month(),
    values: { [dayjs().format('YYYY-MM-DD')]: 2.5 }
  };

  const cycleData = JSON.parse(localStorage.getItem(storage.cycle) || 'null');
  if (cycleData) {
    state.cycle = cycleData.items || [];
    state.tpc = cycleData.tpc || '';
  } else {
    state.cycle = [
      { id: uuid(), compound: 'Oxandrolona', dose: '20 mg', date: dayjs().startOf('month').add(5, 'day').format('YYYY-MM-DD'), note: 'Dose matinal' },
      { id: uuid(), compound: 'Durateston', dose: '1 ml', date: dayjs().startOf('month').add(12, 'day').format('YYYY-MM-DD'), note: 'Aplicação semanal' }
    ];
    state.tpc = 'Planejar início da TPC com Tamoxifeno 40/20mg';
    saveCycle();
  }

  state.labs = JSON.parse(localStorage.getItem(storage.labs) || '[]');
  if (!state.labs.length) {
    state.labs = [
      { id: uuid(), name: 'Testosterona Total', value: 980, unit: 'ng/dL', refMin: 240, refMax: 870 },
      { id: uuid(), name: 'Hemoglobina', value: 13.2, unit: 'g/dL', refMin: 13.5, refMax: 17.5 }
    ];
    saveLabs();
  }
}

function saveTransactions() {
  localStorage.setItem(storage.txs, JSON.stringify(state.transactions));
}

function saveAccounts() {
  localStorage.setItem(storage.bills, JSON.stringify(state.accounts));
}

function saveWeight() {
  localStorage.setItem(storage.weight, JSON.stringify(state.weight));
}

function saveWater() {
  localStorage.setItem(storage.water, JSON.stringify(state.water));
}

function saveCycle() {
  localStorage.setItem(storage.cycle, JSON.stringify({ items: state.cycle, tpc: state.tpc }));
}

function saveLabs() {
  localStorage.setItem(storage.labs, JSON.stringify(state.labs));
}

function savePrefs() {
  localStorage.setItem(storage.prefs, JSON.stringify({ theme: state.theme, font: state.font }));
}

function applyThemeFont() {
  const app = document.querySelector('.app');
  if (app) {
    app.dataset.theme = state.theme;
  }
  document.body.dataset.theme = state.theme;
  const family = state.font === 'system' ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' : `${state.font}, Inter, Poppins, sans-serif`;
  document.body.style.fontFamily = family;
  document.documentElement.style.setProperty('--font-body', family);
}

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function initNavigation() {
  const navButtons = $all('.nav-item');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      showSection(target);
      navButtons.forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  document.querySelector('.sidebar-toggle').addEventListener('click', () => {
    $('.sidebar').classList.toggle('collapsed');
  });
}

function showSection(id) {
  $all('.view').forEach(section => section.classList.toggle('active', section.id === id));
  $all('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.target === id));
}

let donutChart;
let summaryChart;
let weightChart;
let waterChart;

function buildDonut() {
  const ctx = document.getElementById('donutChart');
  if (!ctx) return;
  if (donutChart) donutChart.destroy();
  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Progresso', 'Restante'],
      datasets: [{
        data: [75, 25],
        backgroundColor: [
          createGradient(ctx, [
            { offset: 0, color: '#ff6a00' },
            { offset: 0.5, color: '#ff2a8a' },
            { offset: 1, color: '#8a2be2' }
          ]),
          '#2a1733'
        ],
        borderWidth: 0,
        hoverOffset: 0,
        cutout: '78%',
        spacing: 6
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });
}

function updateDonutFromData() {
  if (!donutChart) return;
  const expenses = state.transactions.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.value, 0);
  const income = state.transactions.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.value, 0);
  const progress = income === 0 ? 0 : Math.max(0, Math.min(100, Math.round(((income - expenses) / income) * 100)));
  donutChart.data.datasets[0].data = [progress, 100 - progress];
  donutChart.update();
  const center = document.querySelector('.donut-center');
  if (center) center.textContent = `${progress}%`;
}

function createGradient(ctx, stops) {
  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 260, 260);
  stops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
  return gradient;
}

function buildSummaryChart() {
  const ctx = document.getElementById('summaryChart');
  if (!ctx) return;
  if (summaryChart) summaryChart.destroy();
  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 160);
  gradient.addColorStop(0, 'rgba(255, 106, 0, 0.6)');
  gradient.addColorStop(0.5, 'rgba(255, 42, 138, 0.6)');
  gradient.addColorStop(1, 'rgba(138, 43, 226, 0.6)');
  summaryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      datasets: [{
        data: [2100, 2250, 2380, 2500, 2650, 2800, 2940, 3010, 3100, 3145, 3200, 3300],
        borderColor: gradient,
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointRadius: 0
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
}

function buildEqualizer() {
  const barsWrapper = document.querySelector('.equalizer .bars');
  if (!barsWrapper) return;
  const heights = [100, 140, 120, 180, 80, 160, 120, 90, 150, 110, 200, 80, 150, 110, 140, 120, 160, 70, 100, 140, 180, 120];
  barsWrapper.innerHTML = '';
  heights.forEach(h => {
    const div = document.createElement('div');
    div.className = 'bar';
    div.style.height = `${h}px`;
    div.dataset.base = h;
    barsWrapper.appendChild(div);
  });
}

function renderTransactions() {
  const tbody = $('#transactionList');
  const pagination = $('#transactionPagination');
  const filterCategory = $('#filterCategory').value;
  const filterType = $('#filterType').value;
  const monthFilter = document.querySelector('.chip.filter').classList.contains('active');
  const sort = $('#sortTransactions').value;

  let items = [...state.transactions];
  if (filterCategory) items = items.filter(i => i.category === filterCategory);
  if (filterType) items = items.filter(i => i.type === filterType);
  if (monthFilter) {
    const monthStart = dayjs().startOf('month');
    const monthEnd = dayjs().endOf('month');
    items = items.filter(i => dayjs(i.date).isAfter(monthStart.subtract(1, 'day')) && dayjs(i.date).isBefore(monthEnd.add(1, 'day')));
  }

  items.sort((a, b) => {
    switch (sort) {
      case 'date_asc': return dayjs(a.date) - dayjs(b.date);
      case 'value_desc': return b.value - a.value;
      case 'value_asc': return a.value - b.value;
      default: return dayjs(b.date) - dayjs(a.date);
    }
  });

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  if (state.txPage > totalPages) state.txPage = totalPages;
  const start = (state.txPage - 1) * perPage;
  const paginated = items.slice(start, start + perPage);

  tbody.innerHTML = paginated.map(item => `
    <tr>
      <td>${dayjs(item.date).format('DD/MM/YYYY')}</td>
      <td><span class="tag ${item.type === 'entrada' ? 'income' : 'expense'}">${item.type === 'entrada' ? 'Entrada' : 'Saída'}</span></td>
      <td>${item.category}</td>
      <td>${formatCurrency(item.value)}</td>
      <td>${item.note || '-'}</td>
      <td>
        <button data-action="edit" data-id="${item.id}">Editar</button>
        <button data-action="delete" data-id="${item.id}">Excluir</button>
      </td>
    </tr>
  `).join('');

  pagination.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === state.txPage) btn.classList.add('primary');
    btn.addEventListener('click', () => {
      state.txPage = i;
      renderTransactions();
    });
    pagination.appendChild(btn);
  }

  tbody.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (btn.dataset.action === 'edit') fillTransactionForm(id);
      if (btn.dataset.action === 'delete') deleteTransaction(id);
    });
  });

  renderTransactionTotals();
}

function populateTransactionFilters() {
  $('#filterCategory').innerHTML = '<option value="">Todas categorias</option>' + [...new Set(state.transactions.map(t => t.category))].map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function renderTransactionTotals() {
  const income = state.transactions.filter(t => t.type === 'entrada').reduce((sum, t) => sum + Number(t.value), 0);
  const expense = state.transactions.filter(t => t.type === 'saida').reduce((sum, t) => sum + Number(t.value), 0);
  $('#totalIncome').textContent = formatCurrency(income);
  $('#totalExpense').textContent = formatCurrency(expense);
  const balance = income - expense;
  const balanceEl = $('#balance');
  balanceEl.textContent = formatCurrency(balance);
  balanceEl.style.color = balance >= 0 ? 'var(--positive)' : 'var(--negative)';
}

function fillTransactionForm(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;
  $('#transactionId').value = tx.id;
  $('#transactionType').value = tx.type;
  $('#transactionValue').value = tx.value;
  $('#transactionCategory').value = tx.category;
  $('#transactionDate').value = tx.date;
  $('#transactionNote').value = tx.note;
  $('#transactionForm .primary').textContent = 'Atualizar';
}

function deleteTransaction(id) {
  if (!confirm('Deseja excluir este lançamento?')) return;
  state.transactions = state.transactions.filter(t => t.id !== id);
  saveTransactions();
  renderTransactions();
  populateTransactionFilters();
  updateDashboardFromData();
}

function initTransactionForm() {
  const form = $('#transactionForm');
  $('#transactionDate').value = dayjs().format('YYYY-MM-DD');
  populateTransactionFilters();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const id = $('#transactionId').value;
    const item = {
      id: id || uuid(),
      type: $('#transactionType').value,
      value: Number($('#transactionValue').value),
      category: $('#transactionCategory').value,
      date: $('#transactionDate').value,
      note: $('#transactionNote').value
    };
    if (id) {
      const idx = state.transactions.findIndex(t => t.id === id);
      state.transactions[idx] = item;
    } else {
      state.transactions.push(item);
    }
    saveTransactions();
    form.reset();
    $('#transactionId').value = '';
    $('#transactionForm .primary').textContent = 'Adicionar';
    $('#transactionDate').value = dayjs().format('YYYY-MM-DD');
    renderTransactions();
    populateTransactionFilters();
    updateDashboardFromData();
  });

  $('#transactionClear').addEventListener('click', () => {
    form.reset();
    $('#transactionId').value = '';
    $('#transactionForm .primary').textContent = 'Adicionar';
    $('#transactionDate').value = dayjs().format('YYYY-MM-DD');
  });

  document.querySelector('.chip.filter').addEventListener('click', e => {
    e.currentTarget.classList.toggle('active');
    state.txPage = 1;
    renderTransactions();
  });

  $('#filterCategory').addEventListener('change', () => {
    state.txPage = 1;
    renderTransactions();
  });
  $('#filterType').addEventListener('change', () => {
    state.txPage = 1;
    renderTransactions();
  });
  $('#sortTransactions').addEventListener('change', renderTransactions);

  $('#exportTransactions').addEventListener('click', () => {
    const jsonBlob = new Blob([JSON.stringify(state.transactions, null, 2)], { type: 'application/json' });
    download(jsonBlob, 'lancamentos.json');
    const csvHeader = 'tipo;valor;categoria;data;observacao\n';
    const csvBody = state.transactions.map(item => `${item.type};${item.value};${item.category};${item.date};${item.note || ''}`).join('\n');
    download(new Blob([csvHeader + csvBody], { type: 'text/csv' }), 'lancamentos.csv');
  });
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function renderAccounts() {
  const tbody = $('#accountList');
  const filters = document.getElementById('accountStatusFilters');
  filters.innerHTML = '';
  ['all', 'pendente', 'pago', 'vencido'].forEach(status => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = status === 'all' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1);
    if (state.accountStatusFilter === status) btn.classList.add('primary');
    btn.addEventListener('click', () => {
      state.accountStatusFilter = status;
      renderAccounts();
    });
    filters.appendChild(btn);
  });

  let items = [...state.accounts];
  if (state.accountStatusFilter !== 'all') items = items.filter(a => a.status === state.accountStatusFilter);

  tbody.innerHTML = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${formatCurrency(item.value)}</td>
      <td>${dayjs(item.due).format('DD/MM/YYYY')}</td>
      <td>${item.type === 'pagar' ? 'Pagar' : 'Receber'}</td>
      <td><span class="badge ${item.status === 'vencido' ? 'due' : item.type === 'pagar' ? 'pay' : 'receive'}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span></td>
      <td>
        <button data-action="status" data-id="${item.id}">Marcar pago</button>
        <button data-action="edit" data-id="${item.id}">Editar</button>
        <button data-action="delete" data-id="${item.id}">Excluir</button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === 'status') toggleAccountStatus(id);
      if (action === 'edit') fillAccountForm(id);
      if (action === 'delete') deleteAccount(id);
    });
  });

  renderCalendar();
}

function fillAccountForm(id) {
  const account = state.accounts.find(a => a.id === id);
  if (!account) return;
  $('#accountId').value = account.id;
  $('#accountName').value = account.name;
  $('#accountValue').value = account.value;
  $('#accountDue').value = account.due;
  $('#accountType').value = account.type;
  $('#accountRecurring').checked = account.recurring;
  $('#accountForm .primary').textContent = 'Atualizar';
}

function toggleAccountStatus(id) {
  const account = state.accounts.find(a => a.id === id);
  if (!account) return;
  account.status = account.status === 'pago' ? 'pendente' : 'pago';
  saveAccounts();
  renderAccounts();
}

function deleteAccount(id) {
  if (!confirm('Deseja excluir esta conta?')) return;
  state.accounts = state.accounts.filter(a => a.id !== id);
  saveAccounts();
  renderAccounts();
}

function initAccountForm() {
  const form = $('#accountForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const id = $('#accountId').value;
    const account = {
      id: id || uuid(),
      name: $('#accountName').value,
      value: Number($('#accountValue').value),
      due: $('#accountDue').value,
      type: $('#accountType').value,
      status: id ? state.accounts.find(a => a.id === id).status : 'pendente',
      recurring: $('#accountRecurring').checked
    };
    if (id) {
      const index = state.accounts.findIndex(a => a.id === id);
      state.accounts[index] = account;
    } else {
      state.accounts.push(account);
    }
    saveAccounts();
    form.reset();
    $('#accountId').value = '';
    $('#accountForm .primary').textContent = 'Salvar';
    renderAccounts();
  });

  $('#accountClear').addEventListener('click', () => {
    form.reset();
    $('#accountId').value = '';
    $('#accountForm .primary').textContent = 'Salvar';
  });
}

const calendar = {
  current: dayjs().startOf('month')
};

function renderCalendar() {
  $('#calendarTitle').textContent = calendar.current.format('MMMM [de] YYYY');
  const grid = $('#calendarGrid');
  grid.innerHTML = '';
  const startDay = calendar.current.startOf('week');
  for (let i = 0; i < 42; i++) {
    const date = startDay.add(i, 'day');
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    if (!date.isSame(calendar.current, 'month')) cell.style.opacity = 0.3;
    cell.innerHTML = `<span>${date.date()}</span>`;
    const items = getAccountsForDate(date);
    items.forEach(item => {
      const badge = document.createElement('span');
      badge.className = `badge ${item.type === 'pagar' ? 'pay' : 'receive'}`;
      badge.textContent = item.name;
      cell.appendChild(badge);
    });
    cell.addEventListener('click', () => showCalendarPanel(date, items));
    grid.appendChild(cell);
  }
}

function getAccountsForDate(date) {
  const items = state.accounts.filter(acc => dayjs(acc.due).isSame(date, 'day'));
  state.accounts.filter(acc => acc.recurring).forEach(acc => {
    const due = dayjs(acc.due);
    const diffMonths = date.month() - due.month() + (date.year() - due.year()) * 12;
    if (diffMonths > 0 && date.date() === due.date()) {
      items.push({ ...acc, id: `${acc.id}-${diffMonths}` });
    }
  });
  return items;
}

function showCalendarPanel(date, items) {
  const panel = $('#calendarPanel');
  panel.innerHTML = `<h3>${date.format('DD [de] MMMM')}</h3>`;
  if (!items.length) {
    panel.innerHTML += '<p>Sem contas neste dia.</p>';
    return;
  }
  const list = document.createElement('ul');
  list.style.listStyle = 'none';
  list.style.marginTop = '12px';
  list.style.display = 'grid';
  list.style.gap = '8px';
  items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.name}</strong> • ${formatCurrency(item.value)} • ${item.type === 'pagar' ? 'Pagar' : 'Receber'}`;
    list.appendChild(li);
  });
  panel.appendChild(list);
}

$('#addAccount').addEventListener('click', () => {
  $('#accountForm').scrollIntoView({ behavior: 'smooth' });
});

$('.calendar-prev').addEventListener('click', () => {
  calendar.current = calendar.current.subtract(1, 'month');
  renderCalendar();
});

$('.calendar-next').addEventListener('click', () => {
  calendar.current = calendar.current.add(1, 'month');
  renderCalendar();
});

function initWeight() {
  const select = $('#weightWeek');
  select.innerHTML = Array.from({ length: 5 }, (_, i) => `<option value="${i + 1}">Semana ${i + 1}</option>`).join('');
  renderWeightStats();
  buildWeightChart();
  $('#weightForm').addEventListener('submit', e => {
    e.preventDefault();
    const week = $('#weightWeek').value;
    const value = Number($('#weightValue').value);
    state.weight.values[week] = value;
    saveWeight();
    buildWeightChart();
    renderWeightStats();
    e.target.reset();
  });
}

function buildWeightChart() {
  const ctx = document.getElementById('weightChart');
  if (!ctx) return;
  if (weightChart) weightChart.destroy();
  const labels = ['Sem1', 'Sem2', 'Sem3', 'Sem4', 'Sem5'];
  const data = labels.map((_, idx) => state.weight.values[idx + 1] || null);
  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#ff2a8a',
        backgroundColor: 'transparent',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: '#ff6a00',
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: 'var(--text-sub)' } },
        y: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: 'var(--text-sub)' } }
      },
      onClick(evt) {
        const points = weightChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (points.length) {
          const index = points[0].index;
          $('#weightWeek').value = index + 1;
          $('#weightValue').value = state.weight.values[index + 1] || '';
        }
      }
    }
  });
}

function renderWeightStats() {
  const values = Object.values(state.weight.values);
  if (!values.length) {
    $('#weightStats').textContent = 'Sem registros.';
    return;
  }
  const avg = values.reduce((sum, v) => sum + Number(v), 0) / values.length;
  const diff = values[values.length - 1] - values[0];
  $('#weightStats').innerHTML = `<span>Média: ${avg.toFixed(1)} kg</span><span>Variação: ${diff >= 0 ? '+' : ''}${diff.toFixed(1)} kg</span>`;
}

function initWater() {
  $('#waterDate').value = dayjs().format('YYYY-MM-DD');
  $('#waterForm').addEventListener('submit', e => {
    e.preventDefault();
    const date = $('#waterDate').value;
    const value = Number($('#waterValue').value);
    state.water.values[date] = value;
    saveWater();
    buildWaterChart();
    e.target.reset();
    $('#waterDate').value = dayjs().format('YYYY-MM-DD');
  });

  $('#saveWaterToday').addEventListener('click', () => {
    const liters = Number($('#waterToday').value);
    if (!liters) return;
    const date = dayjs().format('YYYY-MM-DD');
    state.water.values[date] = (state.water.values[date] || 0) + liters;
    saveWater();
    buildWaterChart();
    $('#waterToday').value = '';
  });

  buildWaterChart();
}

function buildWaterChart() {
  const ctx = document.getElementById('waterChart');
  if (!ctx) return;
  if (waterChart) waterChart.destroy();
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const data = days.map(day => {
    const key = dayjs().date(day).format('YYYY-MM-DD');
    return state.water.values[key] || 0;
  });
  waterChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        data,
        borderRadius: 6,
        backgroundColor: days.map(() => '#8a2be2')
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: 'var(--text-sub)' } },
        y: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: 'var(--text-sub)' } }
      }
    }
  });
}

function initCycle() {
  renderCycle();
  $('#cycleForm').addEventListener('submit', e => {
    e.preventDefault();
    const id = $('#cycleId').value;
    const item = {
      id: id || uuid(),
      compound: $('#cycleCompound').value,
      dose: $('#cycleDose').value,
      date: $('#cycleDate').value,
      note: $('#cycleNote').value
    };
    if (id) {
      const idx = state.cycle.findIndex(c => c.id === id);
      state.cycle[idx] = item;
    } else {
      state.cycle.push(item);
    }
    saveCycle();
    renderCycle();
    e.target.reset();
    $('#cycleId').value = '';
  });

  $('#cycleClear').addEventListener('click', () => {
    $('#cycleForm').reset();
    $('#cycleId').value = '';
  });

  $('#tpcNotes').value = state.tpc;
  $('#tpcNotes').addEventListener('input', e => {
    state.tpc = e.target.value;
    saveCycle();
  });

  $('#importLabs').addEventListener('click', () => {
    $('#labFile').click();
  });

  $('#labFile').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    text.split(/\r?\n/).filter(Boolean).forEach(line => {
      const [name, value, unit, refMin, refMax] = line.split(';');
      if (!name) return;
      state.labs.push({
        id: uuid(),
        name,
        value: Number(value),
        unit,
        refMin: Number(refMin),
        refMax: Number(refMax)
      });
    });
    saveLabs();
    renderLabs();
    e.target.value = '';
  });

  renderLabs();
}

function renderCycle() {
  const tbody = $('#cycleList');
  tbody.innerHTML = state.cycle.map(item => `
    <tr>
      <td>${item.compound}</td>
      <td>${item.dose}</td>
      <td>${dayjs(item.date).format('DD/MM/YYYY')}</td>
      <td>${item.note || '-'}</td>
      <td>
        <button data-action="edit" data-id="${item.id}">Editar</button>
        <button data-action="delete" data-id="${item.id}">Excluir</button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = state.cycle.find(c => c.id === id);
      if (btn.dataset.action === 'edit') {
        $('#cycleId').value = item.id;
        $('#cycleCompound').value = item.compound;
        $('#cycleDose').value = item.dose;
        $('#cycleDate').value = item.date;
        $('#cycleNote').value = item.note;
      }
      if (btn.dataset.action === 'delete' && confirm('Deseja excluir este registro?')) {
        state.cycle = state.cycle.filter(c => c.id !== id);
        saveCycle();
        renderCycle();
      }
    });
  });
}

function renderLabs() {
  const tbody = $('#labList');
  tbody.innerHTML = state.labs.map(item => {
    const outLow = item.value < item.refMin;
    const outHigh = item.value > item.refMax;
    const status = outLow ? '↓' : outHigh ? '↑' : '';
    return `
      <tr class="${outLow || outHigh ? 'out-range' : ''}">
        <td>${item.name}</td>
        <td>${item.value} ${status}</td>
        <td>${item.unit}</td>
        <td>${item.refMin} - ${item.refMax}</td>
      </tr>
    `;
  }).join('');
}

function initSettings() {
  $('#themeSelect').value = state.theme;
  $('#fontSelect').value = state.font;

  $('#themeSelect').addEventListener('change', e => {
    state.theme = e.target.value;
    applyThemeFont();
    savePrefs();
  });

  $('#fontSelect').addEventListener('change', e => {
    state.font = e.target.value === 'system' ? 'system' : e.target.value;
    applyThemeFont();
    savePrefs();
  });

  $('#exportSnapshot').addEventListener('click', () => {
    const snapshot = {
      transactions: state.transactions,
      accounts: state.accounts,
      weight: state.weight,
      water: state.water,
      cycle: state.cycle,
      tpc: state.tpc,
      labs: state.labs
    };
    download(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }), 'snapshot.json');
  });

  $('#exportBackup').addEventListener('click', () => {
    const backup = {
      transactions: state.transactions,
      accounts: state.accounts,
      weight: state.weight,
      water: state.water,
      cycle: state.cycle,
      labs: state.labs,
      tpc: state.tpc,
      prefs: { theme: state.theme, font: state.font }
    };
    download(new Blob([JSON.stringify(backup)], { type: 'application/json' }), 'backup.json');
  });

  $('#importBackup').addEventListener('click', () => {
    $('#backupFile').click();
  });

  $('#backupFile').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.transactions) state.transactions = data.transactions;
      if (data.accounts) state.accounts = data.accounts;
      if (data.weight) state.weight = data.weight;
      if (data.water) state.water = data.water;
      if (data.cycle) state.cycle = data.cycle;
      if (data.labs) state.labs = data.labs;
      if (data.tpc) state.tpc = data.tpc;
      if (data.prefs) {
        state.theme = data.prefs.theme || state.theme;
        state.font = data.prefs.font || state.font;
      }
      saveTransactions();
      saveAccounts();
      saveWeight();
      saveWater();
      saveCycle();
      saveLabs();
      savePrefs();
      applyThemeFont();
      renderTransactions();
      renderAccounts();
      buildWeightChart();
      buildWaterChart();
      renderCycle();
      renderLabs();
      $('#tpcNotes').value = state.tpc;
    } catch (err) {
      alert('Arquivo inválido.');
    }
    e.target.value = '';
  });

  $('#resetApp').addEventListener('click', () => {
    if (!confirm('Deseja realmente resetar o app?')) return;
    if (!confirm('Esta ação apagará todos os dados. Confirmar?')) return;
    Object.values(storage).forEach(key => localStorage.removeItem(key));
    location.reload();
  });
}

function updateDashboardFromData() {
  const total = state.transactions.reduce((sum, item) => sum + (item.type === 'entrada' ? item.value : -item.value), 0);
  document.querySelector('.card-amount').textContent = `${total.toFixed(0)} $`;
  const expenses = state.transactions.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.value, 0);
  const income = state.transactions.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.value, 0);
  const balance = income - expenses;
  const ratio = income === 0 ? 0 : Math.min(100, Math.round((income - expenses) / income * 100));
  document.querySelector('.chip-value').textContent = `${Math.max(0, ratio)}%`;
  const chip = document.querySelector('.card-info .chip');
  chip.classList.toggle('negative', balance < 0);
  chip.classList.toggle('positive', balance >= 0);
  updateDonutFromData();
}

function initEqualizerAnimation() {
  document.querySelector('.equalizer').addEventListener('mousemove', e => {
    const bars = document.querySelectorAll('.equalizer .bar');
    bars.forEach((bar, idx) => {
      const variation = Math.sin((Date.now() / 600) + idx) * 10;
      const base = Number(bar.dataset.base || bar.offsetHeight);
      bar.style.height = `${base + variation}px`;
    });
  });
}

function initDashboardInteractions() {
  const mappings = [
    { selector: '.donut-card', target: 'accounts' },
    { selector: '.card.highlight', target: 'transactions' },
    { selector: '.equalizer', target: 'weight' },
    { selector: '.pyramid', target: 'cycle' }
  ];
  mappings.forEach(({ selector, target }) => {
    const el = document.querySelector(selector);
    el.addEventListener('click', () => showSection(target));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showSection(target);
      }
    });
  });
}

function init() {
  loadState();
  initNavigation();
  buildDonut();
  buildSummaryChart();
  buildEqualizer();
  renderTransactions();
  initTransactionForm();
  renderAccounts();
  initAccountForm();
  initWeight();
  initWater();
  initCycle();
  initSettings();
  updateDashboardFromData();
  initEqualizerAnimation();
  initDashboardInteractions();
}

document.addEventListener('DOMContentLoaded', init);
