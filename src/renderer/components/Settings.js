// Settings Component - Phase 4
// Business profile editing, preferences, data management
import { Icons } from '../utils/Icons.js';

export async function initSettings(container) {
  container.innerHTML = `
    <div class="settings-container fade-in">
      <div class="settings-grid">

        <!-- Business Profile Section -->
        <div class="settings-section">
          <div class="settings-section-header">
            <div class="flex items-center gap-2">
                ${Icons.building}
                <h4 class="settings-section-title">ข้อมูลธุรกิจ (Business Profile)</h4>
            </div>
          </div>
          <div class="settings-section-body">
            <div class="settings-form-group">
              <label class="settings-label required" for="set-business-name">ชื่อธุรกิจ</label>
              <input type="text" id="set-business-name" class="settings-input" placeholder="ชื่อธุรกิจ...">
            </div>
            <div class="settings-form-group">
              <label class="settings-label" for="set-tax-id">เลขประจำตัวผู้เสียภาษี</label>
              <input type="text" id="set-tax-id" class="settings-input" placeholder="X-XXXX-XXXXX-XX-X" maxlength="17">
            </div>
            <div class="settings-form-group">
              <label class="settings-label required">ประเภทภาษี</label>
              <div class="settings-radio-group">
                <label class="settings-radio-option" id="opt-personal">
                  <input type="radio" name="set-tax-type" value="personal" class="settings-radio-input">
                  <div class="settings-radio-body">
                    <div class="settings-radio-label">👤 บุคคลธรรมดา</div>
                    <div class="settings-radio-desc">ภาษีเงินได้บุคคลธรรมดา (PIT)</div>
                  </div>
                </label>
                <label class="settings-radio-option" id="opt-sme">
                  <input type="radio" name="set-tax-type" value="sme" class="settings-radio-input">
                  <div class="settings-radio-body">
                    <div class="settings-radio-label">🏢 นิติบุคคล SME</div>
                    <div class="settings-radio-desc">ภาษีเงินได้นิติบุคคล SME (CIT)</div>
                  </div>
                </label>
              </div>
            </div>
            <button class="settings-btn settings-btn-primary" id="btn-save-profile">
               ${Icons.save} บันทึกข้อมูล
            </button>
          </div>
        </div>

        <!-- Accounting Period Section -->
        <div class="settings-section">
          <div class="settings-section-header">
            <div class="flex items-center gap-2">
                ${Icons.calendar}
                <h4 class="settings-section-title">รอบบัญชี (Accounting Period)</h4>
            </div>
          </div>
          <div class="settings-section-body">
            <div class="settings-form-group">
              <label class="settings-label">ประเภทรอบบัญชี</label>
              <div class="settings-radio-group">
                <label class="settings-radio-option" id="opt-period-standard">
                  <input type="radio" name="set-period-type" value="standard" class="settings-radio-input">
                  <div class="settings-radio-body">
                    <div class="settings-radio-label">📆 มาตรฐาน</div>
                    <div class="settings-radio-desc">1 มกราคม - 31 ธันวาคม</div>
                  </div>
                </label>
                <label class="settings-radio-option" id="opt-period-custom">
                  <input type="radio" name="set-period-type" value="custom" class="settings-radio-input">
                  <div class="settings-radio-body">
                    <div class="settings-radio-label">⚙️ กำหนดเอง</div>
                    <div class="settings-radio-desc">ระบุวันเริ่มต้น-สิ้นสุดเอง</div>
                  </div>
                </label>
              </div>
            </div>
            <div class="settings-date-row hidden" id="custom-period-dates">
              <div class="settings-form-group">
                <label class="settings-label" for="set-period-start">วันเริ่มต้น</label>
                <input type="date" id="set-period-start" class="settings-input">
              </div>
              <div class="settings-form-group">
                <label class="settings-label" for="set-period-end">วันสิ้นสุด</label>
                <input type="date" id="set-period-end" class="settings-input">
              </div>
            </div>
            <button class="settings-btn settings-btn-primary" id="btn-save-period">
              ${Icons.save} บันทึกรอบบัญชี
            </button>
          </div>
        </div>

        <!-- App Info Section -->
        <div class="settings-section">
          <div class="settings-section-header">
            <div class="flex items-center gap-2">
                ${Icons.info}
                <h4 class="settings-section-title">ข้อมูลแอป (App Info)</h4>
            </div>
          </div>
          <div class="settings-section-body">
            <div class="app-info-grid">
              <div class="app-info-item">
                <span class="app-info-label">เวอร์ชัน</span>
                <span class="app-info-value" id="set-app-version">--</span>
              </div>
              <div class="app-info-item">
                <span class="app-info-label">ชื่อแอป</span>
                <span class="app-info-value">NextTax</span>
              </div>
              <div class="app-info-item">
                <span class="app-info-label">จำนวนรายการ</span>
                <span class="app-info-value" id="set-trans-count">--</span>
              </div>
              <div class="app-info-item">
                <span class="app-info-label">หมวดหมู่</span>
                <span class="app-info-value" id="set-cat-count">--</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="settings-section settings-section-danger">
          <div class="settings-section-header">
            <div class="flex items-center gap-2">
                ${Icons.alert}
                <h4 class="settings-section-title">ตั้งค่าขั้นสูง (Advanced)</h4>
            </div>
          </div>
          <div class="settings-section-body">
            <div class="danger-zone-info">
              <p>การดำเนินการเหล่านี้ไม่สามารถย้อนกลับได้ กรุณาดำเนินการด้วยความระมัดระวัง</p>
            </div>
            <div class="danger-actions">
              <button class="settings-btn settings-btn-warning" id="btn-reset-wizard">
                ${Icons.trash} ตั้งค่าเริ่มต้นใหม่
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div class="settings-toast hidden" id="settings-toast">
        <span class="toast-icon">✅</span>
        <span class="toast-message" id="toast-message">บันทึกสำเร็จ</span>
      </div>
    </div>
  `;

  await loadSettingsData();
  setupSettingsEvents();
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('settings-toast');
  const msgEl = document.getElementById('toast-message');
  const iconEl = toast.querySelector('.toast-icon');

  msgEl.textContent = message;
  iconEl.textContent = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
  toast.classList.remove('hidden');
  toast.classList.add('toast-show');

  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('hidden');
  }, 3000);
}

function formatTaxId(value) {
  const digits = value.replace(/\D/g, '');
  let formatted = '';
  if (digits.length > 0) formatted += digits.substring(0, 1);
  if (digits.length > 1) formatted += '-' + digits.substring(1, 5);
  if (digits.length > 5) formatted += '-' + digits.substring(5, 10);
  if (digits.length > 10) formatted += '-' + digits.substring(10, 12);
  if (digits.length > 12) formatted += '-' + digits.substring(12, 13);
  return formatted;
}

async function loadSettingsData() {
  try {
    // Load business info
    const businessName = await window.nextTaxAPI.getSetting('business_name') || '';
    const taxId = await window.nextTaxAPI.getSetting('tax_id') || '';
    const taxType = await window.nextTaxAPI.getSetting('tax_type') || 'personal';
    const appVersion = await window.nextTaxAPI.getSetting('app_version') || '1.0.0';
    const periodStart = await window.nextTaxAPI.getSetting('accounting_period_start') || '';
    const periodEnd = await window.nextTaxAPI.getSetting('accounting_period_end') || '';

    // Set values
    document.getElementById('set-business-name').value = businessName;
    document.getElementById('set-tax-id').value = taxId;
    document.getElementById('set-app-version').textContent = appVersion;

    // Tax type radios
    const personalRadio = document.querySelector('input[name="set-tax-type"][value="personal"]');
    const smeRadio = document.querySelector('input[name="set-tax-type"][value="sme"]');
    if (taxType === 'personal') {
      personalRadio.checked = true;
      document.getElementById('opt-personal').classList.add('selected');
    } else {
      smeRadio.checked = true;
      document.getElementById('opt-sme').classList.add('selected');
    }

    // Period type
    const isCustom = periodStart && periodStart !== '';
    const customRadio = document.querySelector('input[name="set-period-type"][value="custom"]');
    const standardRadio = document.querySelector('input[name="set-period-type"][value="standard"]');
    if (isCustom) {
      customRadio.checked = true;
      document.getElementById('opt-period-custom').classList.add('selected');
      document.getElementById('custom-period-dates').classList.remove('hidden');
      document.getElementById('set-period-start').value = periodStart;
      document.getElementById('set-period-end').value = periodEnd;
    } else {
      standardRadio.checked = true;
      document.getElementById('opt-period-standard').classList.add('selected');
    }

    // Stats
    const transactions = await window.nextTaxAPI.getTransactions({});
    const categories = await window.nextTaxAPI.getCategories();
    document.getElementById('set-trans-count').textContent = `${transactions.length} รายการ`;
    document.getElementById('set-cat-count').textContent = `${categories.length} หมวดหมู่`;

  } catch (error) {
    console.error('Settings load error:', error);
  }
}

function setupSettingsEvents() {
  // Tax type radio selection
  document.querySelectorAll('input[name="set-tax-type"]').forEach(radio => {
    radio.parentElement.addEventListener('click', () => {
      document.querySelectorAll('.settings-radio-option').forEach(opt => opt.classList.remove('selected'));
      radio.parentElement.classList.add('selected');
      radio.checked = true;
    });
  });

  // Period type radio selection
  document.querySelectorAll('input[name="set-period-type"]').forEach(radio => {
    radio.parentElement.addEventListener('click', () => {
      document.getElementById('opt-period-standard').classList.remove('selected');
      document.getElementById('opt-period-custom').classList.remove('selected');
      radio.parentElement.classList.add('selected');
      radio.checked = true;

      const customDates = document.getElementById('custom-period-dates');
      customDates.classList.toggle('hidden', radio.value === 'standard');
    });
  });

  // Tax ID formatting
  document.getElementById('set-tax-id').addEventListener('input', (e) => {
    e.target.value = formatTaxId(e.target.value);
  });

  // Save Profile
  document.getElementById('btn-save-profile').addEventListener('click', async () => {
    const businessName = document.getElementById('set-business-name').value.trim();
    const taxId = document.getElementById('set-tax-id').value.trim();
    const taxType = document.querySelector('input[name="set-tax-type"]:checked')?.value || 'personal';

    if (!businessName) {
      showToast('กรุณากรอกชื่อธุรกิจ', 'error');
      return;
    }

    try {
      await window.nextTaxAPI.setSetting('business_name', businessName);
      await window.nextTaxAPI.setSetting('tax_id', taxId);
      await window.nextTaxAPI.setSetting('tax_type', taxType);
      showToast('บันทึกข้อมูลธุรกิจสำเร็จ!');
    } catch (error) {
      showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
  });

  // Save Period
  document.getElementById('btn-save-period').addEventListener('click', async () => {
    const periodType = document.querySelector('input[name="set-period-type"]:checked')?.value || 'standard';

    try {
      if (periodType === 'standard') {
        const year = new Date().getFullYear();
        await window.nextTaxAPI.setSetting('accounting_period_start', `${year}-01-01`);
        await window.nextTaxAPI.setSetting('accounting_period_end', `${year} -12 - 31`);
      } else {
        const start = document.getElementById('set-period-start').value;
        const end = document.getElementById('set-period-end').value;

        if (!start || !end) {
          showToast('กรุณากำหนดวันเริ่มต้นและสิ้นสุด', 'error');
          return;
        }
        if (new Date(start) >= new Date(end)) {
          showToast('วันเริ่มต้นต้องน้อยกว่าวันสิ้นสุด', 'error');
          return;
        }

        await window.nextTaxAPI.setSetting('accounting_period_start', start);
        await window.nextTaxAPI.setSetting('accounting_period_end', end);
      }
      showToast('บันทึกรอบบัญชีสำเร็จ!');
    } catch (error) {
      showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
  });

  // Reset Wizard
  document.getElementById('btn-reset-wizard').addEventListener('click', async () => {
    const confirmed = confirm('คุณต้องการรีเซ็ตการตั้งค่าทั้งหมดหรือไม่?\n\nข้อมูลธุรกิจจะถูกลบ และจะกลับไปหน้าตั้งค่าเริ่มต้น\n(ข้อมูลรายการจะไม่ถูกลบ)');
    if (!confirmed) return;

    try {
      await window.nextTaxAPI.setSetting('first_run', 'true');
      await window.nextTaxAPI.setSetting('business_name', '');
      await window.nextTaxAPI.setSetting('tax_id', '');
      await window.nextTaxAPI.setSetting('tax_type', 'personal');
      await window.nextTaxAPI.setSetting('accounting_period_start', '');
      await window.nextTaxAPI.setSetting('accounting_period_end', '');
      showToast('รีเซ็ตสำเร็จ กำลังรีโหลด...', 'warning');
      setTimeout(() => location.reload(), 2000);
    } catch (error) {
      showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
  });
}
