// Transaction List Component - Modern Design
import { Icons } from '../utils/Icons.js';
import { Toast } from '../utils/Toast.js';

export async function initTransactionList(container) {
  // Load CSS if not already loaded (id check)
  if (!document.getElementById('transaction-list-css')) {
    const link = document.createElement('link');
    link.id = 'transaction-list-css';
    link.rel = 'stylesheet';
    link.href = './styles/TransactionList.css';
    document.head.appendChild(link);
  }

  container.innerHTML = `
    <div class="transaction-list-container fade-in">
      <div class="list-header">
        <div class="flex items-center gap-2">
            <span class="text-accent-primary">${Icons.history}</span>
            <h3 class="list-title">ประวัติรายการ (Transaction History)</h3>
        </div>
        
        <div class="list-filters">
          <!-- Search -->
          <div class="search-box">
            <span class="search-icon">${Icons.search || '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>'}</span>
            <input type="text" id="list-search" placeholder="ค้นหารายการ..." class="search-input">
          </div>

          <!-- Month Filter -->
          <input type="month" id="list-month-filter" class="filter-input">

          <!-- Type Filter -->
          <select id="list-type-filter" class="filter-select">
            <option value="all">ทั้งหมด (All)</option>
            <option value="income">รายรับ (Income)</option>
            <option value="expense">รายจ่าย (Expense)</option>
          </select>
        </div>
      </div>

      <!-- Table/List Area -->
      <div class="table-container">
        <table class="transaction-table">
          <thead>
            <tr>
              <th width="15%">วันที่</th>
              <th width="35%">รายการ</th>
              <th width="15%">หมวดหมู่</th>
              <th width="10%">Type</th>
              <th width="15%" class="text-right">จำนวนเงิน</th>
              <th width="10%" class="text-center">Action</th>
            </tr>
          </thead>
          <tbody id="transaction-list-body">
            <tr>
              <td colspan="6" class="text-center py-8 text-gray-500">
                <div class="flex justify-center items-center gap-2">
                    <span class="animate-spin text-accent-primary">${Icons.spinner}</span>
                    <span>กำลังโหลดข้อมูล...</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="list-footer">
        <span class="text-sm text-gray-500" id="list-summary">แสดง 0 รายการ</span>
      </div>
    </div>
  `;

  initListLogic();
}



let transactions = [];
let currentFilters = {
  search: '',
  month: new Date().toISOString().slice(0, 7), // YYYY-MM
  type: 'all'
};

function initListLogic() {
  const searchInput = document.getElementById('list-search');
  const monthInput = document.getElementById('list-month-filter');
  const typeSelect = document.getElementById('list-type-filter');
  const tbody = document.getElementById('transaction-list-body');

  // Set default month
  monthInput.value = currentFilters.month;

  // Event Listeners
  searchInput.addEventListener('input', (e) => {
    currentFilters.search = e.target.value.toLowerCase();
    renderTable();
  });

  monthInput.addEventListener('change', (e) => {
    currentFilters.month = e.target.value;
    loadTransactions();
  });

  typeSelect.addEventListener('change', (e) => {
    currentFilters.type = e.target.value;
    renderTable();
  });

  // Delete Event Delegation
  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.delete-btn');
    if (!btn) return;

    const id = btn.dataset.id;
    if (confirm('ยืนยันที่จะลบรายการนี้? (Confirm Delete?)')) {
      try {
        await window.nextTaxAPI.deleteTransaction(id);
        loadTransactions(); // Reload
      } catch (error) {
        console.error('Delete failed:', error);
        Toast.show('ลบรายการไม่สำเร็จ: ' + error.message, 'error');
      }
    }
  });

  // Initial Load
  loadTransactions();
}

async function loadTransactions() {
  const tbody = document.getElementById('transaction-list-body');
  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8">กำลังโหลด...</td></tr>';

  try {
    const year = parseInt(currentFilters.month.split('-')[0]);
    const month = parseInt(currentFilters.month.split('-')[1]);

    // Construct simplified date range (YYYY-MM-01 to YYYY-MM-31)
    // Actually, SQLITE date comparison works with strings.
    // Let's rely on filter logic if DB supports it, or fetch all and filter?
    // Based on Phase 3 plan: "getTransactions(filters)"
    // Let's assume the API handles startDate/endDate or we pass them.

    const startDate = `${currentFilters.month}-01`;
    // Simple end date calculation
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${currentFilters.month}-${lastDay}`;

    const result = await window.nextTaxAPI.getTransactions({
      startDate,
      endDate
    });

    transactions = result || [];
    renderTable();

  } catch (error) {
    console.error('Failed to load transactions:', error);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-red-500">โหลดข้อมูลไม่สำเร็จ: ${error.message}</td></tr>`;
  }
}

function renderTable() {
  const tbody = document.getElementById('transaction-list-body');
  const summary = document.getElementById('list-summary');

  // Filter Client-Side (Search & Type)
  const filtered = transactions.filter(t => {
    const matchSearch = !currentFilters.search ||
      t.description.toLowerCase().includes(currentFilters.search) ||
      (t.category_name && t.category_name.toLowerCase().includes(currentFilters.search));

    const matchType = currentFilters.type === 'all' || t.type === currentFilters.type;

    return matchSearch && matchType;
  });

  summary.textContent = `แสดง ${filtered.length} รายการ`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div class="flex flex-col items-center justify-center py-12 text-gray-400">
            <div class="mb-2 text-primary opacity-50">${Icons.box}</div>
            <div>ไม่มีรายการในช่วงเวลานี้</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    const date = new Date(t.transaction_date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' });
    const amountClass = t.type === 'income' ? 'text-income' : 'text-expense';
    const sign = t.type === 'income' ? '+' : '-';
    const categoryName = t.category_name || '-';

    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-3 text-sm text-gray-600">${date}</td>
        <td class="px-4 py-3 font-medium text-gray-800">${t.description}</td>
        <td class="px-4 py-3">
          <span class="category-pill">${categoryName}</span>
        </td>
        <td class="px-4 py-3">
          <span class="type-badge ${t.type}">${t.type === 'income' ? 'รายรับ' : 'รายจ่าย'}</span>
        </td>
        <td class="px-4 py-3 text-right font-bold ${amountClass}">
          ${sign}${t.total_with_vat.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </td>
        <td class="px-4 py-3 text-center">
          <button class="action-btn delete-btn text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors" data-id="${t.id}" title="ลบรายการ">
            ${Icons.trash}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}
