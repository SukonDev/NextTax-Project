// Reports Component - Phase 4
// Tax calculation report, fiscal year summary, export
import { TaxEngine } from '../utils/TaxEngine.js';
import { Icons } from '../utils/Icons.js';
import { Toast } from '../utils/Toast.js';

let displayedTransactions = [];

export async function initReports(container) {
  container.innerHTML = `
    <div class="reports-container fade-in">
      <!-- Report Header -->
      <div class="report-header-bar">
        <div class="report-header-left">
          <div class="flex items-center gap-3">
             <span class="text-accent-primary">${Icons.reports}</span>
             <h3 class="report-main-title">รายงานภาษีประจำปี</h3>
          </div>
          <p class="report-subtitle" id="report-fiscal-year">ปีภาษี ...</p>
        </div>
        <div class="report-header-actions">
          <select id="report-year-select" class="report-select">
            <!-- Dynamically populated -->
          </select>
          <button class="report-btn report-btn-outline" id="btn-export-csv" style="margin-right: 8px;">
            ${Icons.fileText || '📄'} Export CSV
          </button>
          <button class="report-btn report-btn-outline" id="btn-print-report">
            ${Icons.print} พิมพ์รายงาน
          </button>
        </div>
      </div>

      <!-- Summary Cards Row -->
      <div class="report-cards-row">
        <div class="report-card report-card-income">
          <div class="report-card-icon">${Icons.trendingUp}</div>
          <div class="report-card-body">
            <div class="report-card-label">รายรับรวม (Total Income)</div>
            <div class="report-card-value" id="rpt-total-income">฿0.00</div>
          </div>
        </div>
        <div class="report-card report-card-expense">
          <div class="report-card-icon">${Icons.trendingDown}</div>
          <div class="report-card-body">
            <div class="report-card-label">รายจ่ายรวม (Total Expense)</div>
            <div class="report-card-value" id="rpt-total-expense">฿0.00</div>
          </div>
        </div>
        <div class="report-card report-card-profit">
          <div class="report-card-icon">${Icons.wallet}</div>
          <div class="report-card-body">
            <div class="report-card-label">กำไรสุทธิ (Net Profit)</div>
            <div class="report-card-value" id="rpt-net-profit">฿0.00</div>
          </div>
        </div>
        <div class="report-card report-card-tax">
          <div class="report-card-icon">${Icons.taxScale}</div>
          <div class="report-card-body">
            <div class="report-card-label">ภาษีประมาณการ (Est. Tax)</div>
            <div class="report-card-value" id="rpt-estimated-tax">฿0.00</div>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="report-grid-2col">
        <!-- Left: Tax Bracket Breakdown -->
        <div class="report-section">
          <div class="report-section-header">
            <div class="flex items-center gap-2">
                ${Icons.taxScale}
                <h4 class="report-section-title">รายละเอียดการคำนวณภาษี</h4>
            </div>
            <span class="report-badge" id="rpt-tax-type-badge">--</span>
          </div>
          <div class="report-section-body">
            <table class="report-table" id="rpt-bracket-table">
              <thead>
                <tr>
                  <th>ช่วงเงินได้ (Range)</th>
                  <th>อัตรา (Rate)</th>
                  <th>เงินได้สุทธิ (Taxable)</th>
                  <th>ภาษี (Tax)</th>
                </tr>
              </thead>
              <tbody id="rpt-bracket-tbody">
                <!-- Dynamic -->
              </tbody>
              <tfoot>
                <tr class="report-table-total">
                  <td colspan="3">รวมภาษี (Total Tax)</td>
                  <td id="rpt-table-total-tax">฿0.00</td>
                </tr>
              </tfoot>
            </table>

            <!-- Tax Bracket Visual -->
            <div class="bracket-visual" id="rpt-bracket-visual">
              <!-- Dynamic bars -->
            </div>
          </div>
        </div>

        <!-- Right: Monthly Summary -->
        <div class="report-section">
          <div class="report-section-header">
            <div class="flex items-center gap-2">
                ${Icons.calendar}
                <h4 class="report-section-title">สรุปรายเดือน</h4>
            </div>
          </div>
          <div class="report-section-body">
            <div class="monthly-chart" id="rpt-monthly-chart">
              <!-- Dynamic monthly bars -->
            </div>
            <div class="monthly-table-wrap">
              <table class="report-table report-table-compact" id="rpt-monthly-table">
                <thead>
                  <tr>
                    <th>เดือน</th>
                    <th>รายรับ</th>
                    <th>รายจ่าย</th>
                    <th>กำไร/ขาดทุน</th>
                  </tr>
                </thead>
                <tbody id="rpt-monthly-tbody">
                  <!-- Dynamic -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Breakdown Section -->
      <div class="report-section">
        <div class="report-section-header">
          <div class="flex items-center gap-2">
            ${Icons.layers}
            <h4 class="report-section-title">สรุปตามหมวดหมู่</h4>
          </div>
        </div>
        <div class="report-section-body">
          <div class="category-breakdown-grid" id="rpt-category-grid">
            <!-- Dynamic -->
          </div>
        </div>
      </div>

      <!-- VAT Summary Section -->
      <div class="report-section">
        <div class="report-section-header">
          <div class="flex items-center gap-2">
            ${Icons.fileText}
            <h4 class="report-section-title">สรุป VAT</h4>
          </div>
        </div>
        <div class="report-section-body">
          <div class="vat-summary-grid" id="rpt-vat-grid">
            <div class="vat-summary-card">
              <div class="vat-summary-label">VAT ขาย (Output VAT)</div>
              <div class="vat-summary-value" id="rpt-vat-output">฿0.00</div>
            </div>
            <div class="vat-summary-card">
              <div class="vat-summary-label">VAT ซื้อ (Input VAT)</div>
              <div class="vat-summary-value" id="rpt-vat-input">฿0.00</div>
            </div>
            <div class="vat-summary-card vat-summary-card-highlight">
              <div class="vat-summary-label">VAT สุทธิ (Net VAT)</div>
              <div class="vat-summary-value" id="rpt-vat-net">฿0.00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  await loadReportData();
  setupReportEvents();
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
  'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

function formatCurrency(amount) {
  return '฿' + amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function loadReportData(selectedYear = null) {
  try {
    // Determine fiscal year
    const currentYear = selectedYear || new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;

    // Populate year selector
    const yearSelect = document.getElementById('report-year-select');
    if (yearSelect.options.length === 0) {
      for (let y = currentYear; y >= currentYear - 5; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = `ปี ${y} (${y + 543})`;
        yearSelect.appendChild(opt);
      }
    }
    yearSelect.value = currentYear;

    // Update fiscal year label
    document.getElementById('report-fiscal-year').textContent =
      `ปีภาษี ${currentYear} (พ.ศ. ${currentYear + 543})`;

    // Get tax type
    const taxType = await window.nextTaxAPI.getSetting('tax_type') || 'personal';
    document.getElementById('rpt-tax-type-badge').textContent =
      taxType === 'personal' ? 'บุคคลธรรมดา (PIT)' : 'นิติบุคคล SME (CIT)';

    // Get all transactions for this year
    const transactions = await window.nextTaxAPI.getTransactions({
      start_date: startDate,
      end_date: endDate
    });

    displayedTransactions = transactions;

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    let vatOutput = 0; // VAT from income
    let vatInput = 0;  // VAT from expense

    // Monthly data
    const monthlyData = Array.from({ length: 12 }, () => ({ income: 0, expense: 0 }));

    // Category data
    const categoryMap = {};

    transactions.forEach(t => {
      let baseAmount = t.amount;
      if (t.vat_type === 'inclusive') {
        baseAmount = t.amount * 100 / 107;
      }

      const month = parseInt(t.transaction_date.split('-')[1]) - 1;

      if (t.type === 'income') {
        totalIncome += baseAmount;
        monthlyData[month].income += baseAmount;
        if (t.vat_amount > 0) vatOutput += t.vat_amount;
      } else {
        totalExpense += baseAmount;
        monthlyData[month].expense += baseAmount;
        if (t.vat_amount > 0) vatInput += t.vat_amount;
      }

      // Category tracking
      const catKey = t.category_name || 'ไม่ระบุหมวดหมู่';
      if (!categoryMap[catKey]) {
        categoryMap[catKey] = {
          name: catKey,
          color: t.category_color || '#888',
          type: t.type,
          total: 0,
          count: 0
        };
      }
      categoryMap[catKey].total += baseAmount;
      categoryMap[catKey].count += 1;
    });

    const netProfit = totalIncome - totalExpense;

    // Calculate tax
    let taxResult;
    if (taxType === 'personal') {
      taxResult = TaxEngine.calculatePIT(Math.max(0, netProfit));
    } else {
      taxResult = TaxEngine.calculateSMETax(Math.max(0, netProfit));
    }

    // Update summary cards
    document.getElementById('rpt-total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('rpt-total-expense').textContent = formatCurrency(totalExpense);
    document.getElementById('rpt-net-profit').textContent = formatCurrency(netProfit);
    document.getElementById('rpt-estimated-tax').textContent = formatCurrency(taxResult.totalTax);

    // Update net profit color
    const netProfitEl = document.getElementById('rpt-net-profit');
    netProfitEl.classList.toggle('value-positive', netProfit >= 0);
    netProfitEl.classList.toggle('value-negative', netProfit < 0);

    // Render bracket table
    renderBracketTable(taxResult);

    // Render bracket visual
    renderBracketVisual(taxResult, netProfit);

    // Render monthly chart & table
    renderMonthlyData(monthlyData);

    // Render category breakdown
    renderCategoryBreakdown(categoryMap, totalIncome, totalExpense);

    // Render VAT summary
    document.getElementById('rpt-vat-output').textContent = formatCurrency(vatOutput);
    document.getElementById('rpt-vat-input').textContent = formatCurrency(vatInput);
    const netVat = vatOutput - vatInput;
    const netVatEl = document.getElementById('rpt-vat-net');
    netVatEl.textContent = formatCurrency(Math.abs(netVat));
    if (netVat > 0) {
      netVatEl.textContent += ' (ต้องชำระ)';
      netVatEl.classList.add('value-negative');
    } else if (netVat < 0) {
      netVatEl.textContent += ' (ขอคืน)';
      netVatEl.classList.add('value-positive');
    }

  } catch (error) {
    console.error('Report error:', error);
  }
}

function renderBracketTable(taxResult) {
  const tbody = document.getElementById('rpt-bracket-tbody');
  tbody.innerHTML = taxResult.details.map(d => `
    <tr>
      <td>${d.range}</td>
      <td><span class="rate-badge">${d.rate}</span></td>
      <td>${formatCurrency(d.taxable)}</td>
      <td class="${d.tax > 0 ? 'value-negative' : ''}">${formatCurrency(d.tax)}</td>
    </tr>
  `).join('');

  document.getElementById('rpt-table-total-tax').textContent = formatCurrency(taxResult.totalTax);
}

function renderBracketVisual(taxResult, netProfit) {
  const container = document.getElementById('rpt-bracket-visual');
  if (taxResult.details.length === 0 || netProfit <= 0) {
    container.innerHTML = `
      <div class="bracket-empty">
        <span class="bracket-empty-icon text-gray-300">${Icons.box}</span>
        <p>ไม่มีภาษีที่ต้องชำระ</p>
      </div>
    `;
    return;
  }

  const maxTax = Math.max(...taxResult.details.map(d => d.tax));

  container.innerHTML = `
    <div class="bracket-bars">
      ${taxResult.details.map((d, i) => {
    const pct = maxTax > 0 ? (d.tax / maxTax * 100) : 0;
    const colors = ['#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#F97316'];
    const color = colors[i % colors.length];
    return `
          <div class="bracket-bar-item">
            <div class="bracket-bar-label">${d.rate}</div>
            <div class="bracket-bar-track">
              <div class="bracket-bar-fill" style="width: ${Math.max(pct, 2)}%; background: ${color};">
                <span class="bracket-bar-value">${formatCurrency(d.tax)}</span>
              </div>
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;
}

function renderMonthlyData(monthlyData) {
  // Find max for chart scaling
  const allValues = monthlyData.flatMap(m => [m.income, m.expense]);
  const maxVal = Math.max(...allValues, 1);

  // Render chart
  const chartContainer = document.getElementById('rpt-monthly-chart');
  chartContainer.innerHTML = `
    <div class="monthly-bars">
      ${monthlyData.map((m, i) => {
    const incPct = (m.income / maxVal * 100);
    const expPct = (m.expense / maxVal * 100);
    return `
          <div class="monthly-bar-group" title="${THAI_MONTHS[i]}">
            <div class="monthly-bar-pair">
              <div class="monthly-bar monthly-bar-income" style="height: ${Math.max(incPct, 1)}%;"></div>
              <div class="monthly-bar monthly-bar-expense" style="height: ${Math.max(expPct, 1)}%;"></div>
            </div>
            <div class="monthly-bar-label">${THAI_MONTHS_SHORT[i]}</div>
          </div>
        `;
  }).join('')}
    </div>
    <div class="monthly-legend">
      <span class="legend-item"><span class="legend-dot legend-income"></span> รายรับ</span>
      <span class="legend-item"><span class="legend-dot legend-expense"></span> รายจ่าย</span>
    </div>
  `;

  // Render table
  const tbody = document.getElementById('rpt-monthly-tbody');
  tbody.innerHTML = monthlyData.map((m, i) => {
    const profit = m.income - m.expense;
    return `
      <tr>
        <td>${THAI_MONTHS[i]}</td>
        <td class="value-positive">${formatCurrency(m.income)}</td>
        <td class="value-negative">${formatCurrency(m.expense)}</td>
        <td class="${profit >= 0 ? 'value-positive' : 'value-negative'}">${formatCurrency(profit)}</td>
      </tr>
    `;
  }).join('');
}

function renderCategoryBreakdown(categoryMap, totalIncome, totalExpense) {
  const container = document.getElementById('rpt-category-grid');
  const categories = Object.values(categoryMap).sort((a, b) => b.total - a.total);

  if (categories.length === 0) {
    container.innerHTML = `
      <div class="category-empty">
        <span class="text-gray-300">${Icons.box}</span>
        <p>ยังไม่มีข้อมูล</p>
      </div>
    `;
    return;
  }

  container.innerHTML = categories.map(cat => {
    const total = cat.type === 'income' ? totalIncome : totalExpense;
    const pct = total > 0 ? (cat.total / total * 100) : 0;
    return `
      <div class="category-card">
        <div class="category-card-header">
          <span class="category-color-dot" style="background: ${cat.color}"></span>
          <span class="category-card-name">${cat.name}</span>
          <span class="category-card-count">${cat.count} รายการ</span>
        </div>
        <div class="category-card-value">${formatCurrency(cat.total)}</div>
        <div class="category-progress-track">
          <div class="category-progress-fill" style="width: ${pct}%; background: ${cat.color};"></div>
        </div>
        <div class="category-pct">${pct.toFixed(1)}%</div>
      </div>
    `;
  }).join('');
}

function setupReportEvents() {
  // Year selector
  document.getElementById('report-year-select').addEventListener('change', (e) => {
    loadReportData(parseInt(e.target.value));
  });

  // Print button
  document.getElementById('btn-print-report').addEventListener('click', () => {
    window.print();
  });

  // Export CSV button
  document.getElementById('btn-export-csv').addEventListener('click', () => {
    exportToCSV();
  });
}

function exportToCSV() {
  if (displayedTransactions.length === 0) {
    Toast.show('ไม่มีข้อมูลสำหรับส่งออก', 'warning');
    return;
  }

  try {
    // Define headers
    const headers = [
      'Date',
      'Description',
      'Category',
      'Type',
      'Amount',
      'VAT Type',
      'VAT Amount',
      'Total',
      'Notes'
    ];

    // Convert data to CSV rows
    const csvRows = [headers.join(',')];

    displayedTransactions.forEach(t => {
      const row = [
        t.transaction_date,
        `"${(t.description || '').replace(/"/g, '""')}"`, // Escape quotes
        `"${(t.category_name || '').replace(/"/g, '""')}"`,
        t.type,
        t.amount,
        t.vat_type,
        t.vat_amount,
        t.total_with_vat,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    // Create blob and download
    const csvString = '\uFEFF' + csvRows.join('\n'); // Add BOM for Excel UTF-8
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexttax_report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Toast.show('ส่งออกไฟล์ CSV สำเร็จ!', 'success');
  } catch (error) {
    console.error('Export failed:', error);
    Toast.show('ส่งออกไฟล์ไม่สำเร็จ: ' + error.message, 'error');
  }
}
