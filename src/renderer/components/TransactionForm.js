// Transaction Form Component
import setupWizard from '../utils/setupManager.js'; // Reusing formatTaxId if needed
import { Icons } from '../utils/Icons.js';
import { Toast } from '../utils/Toast.js';

let currentCategories = [];
let selectedFile = null;

export async function initTransactionForm(container) {
  // Load categories first
  try {
    currentCategories = await window.nextTaxAPI.getCategories();
  } catch (error) {
    console.error('Failed to load categories:', error);
  }

  container.innerHTML = `
    <div class="transaction-form-container fade-in">
      <!-- Main Form Area -->
      <div class="form-main">
        <div class="type-toggle-container">
          <button type="button" class="type-toggle-btn active expense" data-type="expense">รายจ่าย (Expense)</button>
          <button type="button" class="type-toggle-btn income" data-type="income">รายรับ (Income)</button>
        </div>

        <form id="transaction-form">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label required">วันที่ (Date)</label>
              <input type="date" id="trans-date" class="form-input" required>
            </div>

            <div class="form-group">
              <label class="form-label required">หมวดหมู่ (Category)</label>
              <select id="trans-category" class="form-input" required>
                <option value="">-- เลือกหมวดหมู่ --</option>
                <!-- populated dynamically -->
              </select>
            </div>

            <div class="form-group col-span-2">
              <label class="form-label required">รายละเอียด (Description)</label>
              <input type="text" id="trans-desc" class="form-input" placeholder="ระบุรายละเอียดรายการ..." required>
            </div>

            <div class="form-group">
              <label class="form-label required">จำนวนเงิน (Amount)</label>
              <div class="amount-input-group">
                <input type="number" id="trans-amount" class="form-input form-input-lg" placeholder="0.00" step="0.01" min="0" required>
                <span class="currency-symbol">฿</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">การคำนวณภาษี (VAT Calc)</label>
              <select id="trans-vat-type" class="form-input">
                <option value="none">ไม่มี VAT (No VAT)</option>
                <option value="inclusive">รวม VAT 7% (Inclusive)</option>
                <option value="exclusive">แยก VAT 7% (Exclusive)</option>
              </select>
            </div>
          </div>

          <!-- VAT Summary Section -->
          <div id="vat-section" class="vat-section hidden">
            <div class="vat-details">
              <span>ยอดก่อน VAT:</span>
              <span class="vat-value" id="val-base">0.00</span>
            </div>
            <div class="vat-details" style="border:none; padding-top:4px;">
              <span>ภาษีมูลค่าเพิ่ม (7%):</span>
              <span class="vat-value" id="val-vat">0.00</span>
            </div>
            <div class="vat-details" style="border-top:1px dashed #ccc; margin-top:8px;">
              <span>ยอดรวมสุทธิ:</span>
              <span class="vat-value" id="val-total" style="font-size:16px;">0.00</span>
            </div>
          </div>

          <div class="form-group col-span-2" style="margin-top:24px;">
            <label class="form-label">หมายเหตุ (Notes)</label>
            <textarea id="trans-notes" class="form-input" rows="2"></textarea>
          </div>

          <div style="margin-top: auto; display:flex; gap:12px; padding-top:24px;">
            <button type="button" class="wizard-btn wizard-btn-secondary" style="flex:1" id="btn-clear">ล้างข้อมูล</button>
            <button type="submit" class="wizard-btn wizard-btn-primary" style="flex:2" id="btn-save">บันทึกรายการ</button>
          </div>
        </form>
      </div>

      <!-- Sidebar: Receipt & Recent -->
      <div class="form-sidebar">
        <!-- Receipt Upload -->
        <div class="mini-list-card" style="flex:0">
          <h3 class="mini-list-header">ใบเสร็จ / หลักฐาน</h3>
          <div id="receipt-dropzone" class="receipt-dropzone">
            <div class="upload-content text-center">
              <div class="upload-icon text-accent-primary">${Icons.paperclip}</div>
              <div class="upload-text">ลากไฟล์มาวางที่นี่<br>หรือคลิกเพื่อเลือกไฟล์</div>
            </div>
            <input type="file" id="file-input" accept="image/*,.pdf" hidden>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="mini-list-card">
          <h3 class="mini-list-header">รายการล่าสุด</h3>
          <div id="mini-recent-list" class="mini-list-items">
            <div class="text-center text-gray-500 text-sm mt-4">กำลังโหลด...</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize Logic
  initFormLogic();
  updateCategoryDropdown('expense'); // Default to expense
  loadRecentTransactions();
}

function initFormLogic() {
  const form = document.getElementById('transaction-form');
  const typeBtns = document.querySelectorAll('.type-toggle-btn');
  const dateInput = document.getElementById('trans-date');
  const amountInput = document.getElementById('trans-amount');
  const vatSelect = document.getElementById('trans-vat-type');
  const dropzone = document.getElementById('receipt-dropzone');
  const fileInput = document.getElementById('file-input');

  // Set default date to today
  dateInput.valueAsDate = new Date();

  // Type Toggle Logic
  let currentType = 'expense';
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active state
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentType = btn.dataset.type;
      updateCategoryDropdown(currentType);
    });
  });

  // VAT Calculation Logic
  function calculateVAT() {
    const amount = parseFloat(amountInput.value) || 0;
    const vatType = vatSelect.value;
    const vatSection = document.getElementById('vat-section');

    if (vatType === 'none' || amount === 0) {
      vatSection.classList.add('hidden');
      return;
    }

    vatSection.classList.remove('hidden');
    let base = 0, vat = 0, total = 0;

    if (vatType === 'inclusive') {
      // Inclusive: Amount is Total
      total = amount;
      base = total * 100 / 107;
      vat = total - base;
    } else {
      // Exclusive: Amount is Base
      base = amount;
      vat = base * 0.07;
      total = base + vat;
    }

    document.getElementById('val-base').textContent = base.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('val-vat').textContent = vat.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('val-total').textContent = total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  amountInput.addEventListener('input', calculateVAT);
  vatSelect.addEventListener('change', calculateVAT);

  // File Upload Logic
  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-active');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-active');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-active');
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  function handleFiles(files) {
    if (files.length > 0) {
      const file = files[0];
      selectedFile = file; // Store file object (path needed for Electron)

      // Preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          dropzone.innerHTML = `
            <img src="${e.target.result}" class="file-preview">
            <button type="button" class="remove-file-btn" id="remove-file">×</button>
          `;
          document.getElementById('remove-file').addEventListener('click', (e) => {
            e.stopPropagation();
            resetDropzone();
          });
        };
        reader.readAsDataURL(file);
      } else {
        dropzone.innerHTML = `
            <div class="text-center">
              <div class="upload-icon text-gray-500">${Icons.file}</div>
              <div class="upload-text">${file.name}</div>
              <button type="button" class="remove-file-btn" id="remove-file" style="position:static; margin-top:8px;">ล้าง</button>
            </div>
          `;
        document.getElementById('remove-file').addEventListener('click', (e) => {
          e.stopPropagation();
          resetDropzone();
        });
      }
    }
  }

  function resetDropzone() {
    selectedFile = null;
    fileInput.value = '';
    dropzone.innerHTML = `
      <div class="upload-content text-center">
        <div class="upload-icon text-accent-primary">${Icons.paperclip}</div>
        <div class="upload-text">ลากไฟล์มาวางที่นี่<br>หรือคลิกเพื่อเลือกไฟล์</div>
      </div>
    `;
  }

  // Form Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = parseFloat(amountInput.value);
    const vatType = vatSelect.value;
    let vatAmount = 0;
    let totalWithVat = amount;

    if (vatType === 'inclusive') {
      const base = amount * 100 / 107;
      vatAmount = amount - base;
      totalWithVat = amount;
    } else if (vatType === 'exclusive') {
      vatAmount = amount * 0.07;
      totalWithVat = amount + vatAmount;
    }

    // Handle File Save
    let receiptPath = null;
    if (selectedFile) {
      // In Native application renderer, file input gives us the full path in 'path' property
      // We access it directly thanks to the secure bridge configuration.
      // Actually, webFile doesn't have path in standard web, but the application adds 'path' to File object
      if (selectedFile.path) {
        try {
          receiptPath = await window.nextTaxAPI.saveReceipt(selectedFile.path);
        } catch (err) {
          console.error("Save receipt failed", err);
          Toast.show("บันทึกไฟล์ไม่สำเร็จ: " + err.message, 'error');
        }
      }
    }

    const transaction = {
      type: currentType,
      transaction_date: dateInput.value,
      category_id: parseInt(document.getElementById('trans-category').value),
      description: document.getElementById('trans-desc').value,
      amount: amount,
      vat_type: vatType,
      vat_amount: vatAmount,
      total_with_vat: totalWithVat,
      notes: document.getElementById('trans-notes').value,
      receipt_path: receiptPath
    };

    try {
      await window.nextTaxAPI.createTransaction(transaction);

      // Reset Form
      form.reset();
      dateInput.valueAsDate = new Date();
      resetDropzone();
      calculateVAT();

      // Refresh Lists
      loadRecentTransactions();

      // Show Success Toast
      Toast.show('บันทึกรายการสำเร็จ!', 'success');

      // Reset focus to date input for next entry
      setTimeout(() => {
        dateInput.focus();
      }, 100);

    } catch (error) {
      console.error('Save failed:', error);
      Toast.show('เกิดข้อผิดพลาดในการบันทึก: ' + error.message, 'error');
    }
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    form.reset();
    dateInput.valueAsDate = new Date();
    resetDropzone();
    calculateVAT();
  });
}

function updateCategoryDropdown(type) {
  const select = document.getElementById('trans-category');
  select.innerHTML = '<option value="">-- เลือกหมวดหมู่ --</option>';

  const filtered = currentCategories.filter(c => c.type === type);
  filtered.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    select.appendChild(option);
  });
}

async function loadRecentTransactions() {
  try {
    const listContainer = document.getElementById('mini-recent-list');
    // Get last 5 transactions
    const transactions = await window.nextTaxAPI.getTransactions({ limit: 5 });

    if (transactions.length === 0) {
      listContainer.innerHTML = '<div class="text-center text-gray-400 text-sm mt-4">ยังไม่มีรายการ</div>';
      return;
    }

    listContainer.innerHTML = transactions.map(t => `
      <div class="mini-trans-item">
        <div class="mini-trans-info">
          <span class="mini-trans-title">${t.description}</span>
          <span class="mini-trans-meta">
            ${new Date(t.transaction_date).toLocaleDateString('th-TH')} • ${t.category_name}
          </span>
        </div>
        <div class="mini-trans-amount ${t.type === 'income' ? 'text-income' : 'text-expense'}">
          ${t.type === 'income' ? '+' : '-'}${t.total_with_vat.toLocaleString('th-TH')}
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Failed to load recent transactions:', error);
  }
}
