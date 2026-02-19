// Overview Component
import { TaxEngine } from '../utils/TaxEngine.js';
import { Icons } from '../utils/Icons.js';
import { Charts } from './Charts.js';

export async function initOverview(container) {
  // Layout using Tailwind classes since we have them (or standard CSS if we prefer consistency with other files)
  // Reusing existing CSS structure
  container.innerHTML = `
    <div class="overview-container fade-in">
      <div class="grid grid-cols-3 gap-6 mb-8">
        <!-- Summary Cards -->
        <div class="card p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-2 mb-1">
             <span class="text-green-600">${Icons.trendingUp}</span>
             <div class="text-sm text-gray-500">รายรับทั้งหมด (Income)</div>
          </div>
          <div class="text-2xl font-bold text-green-600" id="total-income">...</div>
        </div>
        
        <div class="card p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-2 mb-1">
             <span class="text-red-600">${Icons.trendingDown}</span>
             <div class="text-sm text-gray-500">รายจ่ายทั้งหมด (Expense)</div>
          </div>
          <div class="text-2xl font-bold text-red-600" id="total-expense">...</div>
        </div>
        
        <div class="card p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-2 mb-1">
             <span class="text-blue-600">${Icons.wallet}</span>
             <div class="text-sm text-gray-500">กำไรสุทธิ (Net Profit)</div>
          </div>
          <div class="text-2xl font-bold text-blue-600" id="net-profit">...</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-3 gap-6 mb-8">
        <!-- Cashflow Chart (2 cols) -->
        <div class="col-span-2 card p-6 bg-white rounded-xl shadow-sm border border-gray-100">
           <h3 class="text-lg font-semibold text-gray-800 mb-4">กระแสเงินสด (Cashflow)</h3>
           <div style="height: 300px; position: relative;">
             <canvas id="cashflow-chart"></canvas>
           </div>
        </div>

        <!-- Expense Chart (1 col) -->
        <div class="card p-6 bg-white rounded-xl shadow-sm border border-gray-100">
           <h3 class="text-lg font-semibold text-gray-800 mb-4">สัดส่วนรายจ่าย (Expenses)</h3>
           <div style="height: 300px; position: relative; display: flex; justify-content: center;">
             <canvas id="expense-chart"></canvas>
           </div>
        </div>
      </div>

      <!-- Tax Estimation Section -->
      <div class="tax-estimation-section bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            ${Icons.taxScale} ประมาณการภาษี (Tax Estimation)
          </h3>
          <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium" id="tax-type-badge">
            Loading...
          </span>
        </div>

        <div class="grid grid-cols-2 gap-8">
          <!-- Tax Calculation Details -->
          <div class="tax-details">
            <div class="text-gray-500 mb-4 text-sm">รายละเอียดการคำนวณ (Calculation Details)</div>
            <div id="tax-brackets-container" class="space-y-3">
              <!-- Brackets will be injected here -->
            </div>
          </div>

          <!-- Tax Summary -->
          <div class="tax-total bg-gray-50 rounded-lg p-6 flex flex-col justify-center items-center text-center">
            <div class="text-gray-500 mb-2">ภาษีที่ต้องจ่าย (Estimated Tax)</div>
            <div class="text-4xl font-bold text-gray-900 mb-2" id="estimated-tax">0.00</div>
            <div class="text-xs text-gray-400">
              * เป็นการประมาณการเบื้องต้นเท่านั้น<br>
              ยังไม่รวมรายการลดหย่อนอื่นๆ
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  await loadOverviewData();
}

async function loadOverviewData() {
  try {
    // 1. Get Settings (Tax Type)
    const taxType = await window.nextTaxAPI.getSetting('tax_type') || 'personal';
    const businessName = await window.nextTaxAPI.getSetting('business_name');

    // Update Badge
    const badge = document.getElementById('tax-type-badge');
    badge.textContent = taxType === 'personal' ? 'บุคคลธรรมดา (Personal)' : 'นิติบุคคล (SME)';

    // 2. Get All Transactions
    // Ideally we should filter by fiscal year. For now, we fetch all.
    const transactions = await window.nextTaxAPI.getTransactions({});

    // 3. Calculate Totals
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      // Use Net Amount (before VAT) for Profit Calculation?
      // For Tax:
      // Personal/SME Tax is based on Net Profit (Income - Expense).
      // VAT is separate.
      // If VAT is exclusive, Amount is base. Total is Amount + VAT.
      // If VAT is inclusive, Amount is Total. Base is Amount / 1.07.
      // We should use the 'base amount' (excluding VAT) for profit calculation generally.
      // Let's assume t.amount is what user entered.
      // We need to verify how we stored it.
      // Looking at TransactionForm.js:
      // We stored 'amount', 'vat_amount', 'total_with_vat'.
      // If Exclusive: amount = base.
      // If Inclusive: total_with_vat = amount (user input). base = calculated.
      // We assume the DB 'amount' column stores the user input?
      // Wait, let's check creating logic in Form:
      // const transaction = { ... amount: amount ... }
      // So 'amount' is user input.

      // Correct logic for Net Profit:
      // We need the Base Amount (Before VAT).

      let baseAmount = t.amount;
      if (t.vat_type === 'inclusive') {
        baseAmount = t.amount * 100 / 107;
      }
      // If exclusive, t.amount is already base.

      if (t.type === 'income') {
        income += baseAmount;
      } else {
        expense += baseAmount;
      }
    });

    const netProfit = income - expense;

    // 4. Update UI - Totals
    document.getElementById('total-income').textContent = formatVal(income);
    document.getElementById('total-expense').textContent = formatVal(expense);
    document.getElementById('net-profit').textContent = formatVal(netProfit);

    // 5. Calculate Tax
    let taxResult;
    if (taxType === 'personal') {
      taxResult = TaxEngine.calculatePIT(Math.max(0, netProfit));
    } else {
      taxResult = TaxEngine.calculateSMETax(Math.max(0, netProfit));
    }

    // 6. Update UI - Tax
    document.getElementById('estimated-tax').textContent = formatVal(taxResult.totalTax) + ' ฿';

    // Render Brackets
    const bracketContainer = document.getElementById('tax-brackets-container');
    bracketContainer.innerHTML = taxResult.details.map(detail => `
      <div class="flex justify-between items-center text-sm p-2 rounded hover:bg-white transition-colors">
        <div class="flex-1">
          <span class="text-gray-600 block">ช่วงเงินได้ (Range)</span>
          <span class="font-medium text-gray-800">${detail.range}</span>
        </div>
        <div class="w-24 text-center">
          <span class="text-gray-600 block">อัตรา (Rate)</span>
          <span class="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-700">${detail.rate}</span>
        </div>
        <div class="flex-1 text-right">
          <span class="text-gray-600 block">ภาษี (Tax)</span>
          <span class="font-medium ${detail.tax > 0 ? 'text-red-600' : 'text-gray-400'}">
            ${formatVal(detail.tax)}
          </span>
        </div>
      </div>
    `).join('');

    // 7. Process Chart Data

    // Monthly Cashflow
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const monthlyIncome = new Array(12).fill(0);
    const monthlyExpense = new Array(12).fill(0);

    // Expense Categories
    const expenseCategories = {};

    transactions.forEach(t => {
      let baseAmount = t.amount;
      if (t.vat_type === 'inclusive') {
        baseAmount = t.amount * 100 / 107;
      }

      const date = new Date(t.transaction_date);
      const monthIndex = date.getMonth();

      if (t.type === 'income') {
        monthlyIncome[monthIndex] += baseAmount;
      } else {
        monthlyExpense[monthIndex] += baseAmount;

        // Category grouping
        const catName = t.category_name || 'Uncategorized';
        // Use color from DB or generate/default
        const color = t.category_color || '#9CA3AF';

        if (!expenseCategories[catName]) {
          expenseCategories[catName] = { value: 0, color: color };
        }
        expenseCategories[catName].value += baseAmount;
      }
    });

    // Render Cashflow Chart
    Charts.renderCashflowArea('cashflow-chart', months, monthlyIncome, monthlyExpense);

    // Render Expense Chart
    const expenseChartData = Object.entries(expenseCategories).map(([label, data]) => ({
      label,
      value: data.value,
      color: data.color
    })).sort((a, b) => b.value - a.value);

    Charts.renderExpenseDonut('expense-chart', expenseChartData);

  } catch (error) {
    console.error('Overview error:', error);
  }
}

function formatVal(num) {
  return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
