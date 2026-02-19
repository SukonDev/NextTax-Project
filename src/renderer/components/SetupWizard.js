// Setup Wizard Component
import setupWizard from '../utils/setupManager.js';
import logo from '../assets/logo.png';

export function initSetupWizard() {
  const container = document.getElementById('setup-wizard-container');
  if (!container) return;

  container.innerHTML = `
    <div class="setup-wizard">
      <div class="wizard-container fade-in">
        <!-- Header -->
        <div class="wizard-header">
          <h1 class="wizard-title" id="wizard-title">ยินดีต้อนรับสู่ NextTax</h1>
          <p class="wizard-subtitle" id="wizard-subtitle">ตั้งค่าเบื้องต้นเพื่อเริ่มใช้งาน</p>
        </div>

        <!-- Body -->
        <div class="wizard-body">
          <!-- Error Container -->
          <div id="wizard-errors" class="hidden"></div>

          <!-- Step 1: Welcome -->
          <div class="wizard-step active" data-step="1">
            <div class="welcome-content">
              <img src="${logo}" alt="NextTax" class="welcome-logo">
              <h2 class="welcome-title">NextTax</h2>
              <p class="welcome-description">
                แอปพลิเคชันบริหารรายรับ-รายจ่าย<br>
                และคำนวณภาษี SME ไทยอย่างแม่นยำ
              </p>
            </div>
          </div>

          <!-- Step 2: Business Profile -->
          <div class="wizard-step" data-step="2">
            <div class="form-group">
              <label class="form-label required" for="business-name">ชื่อธุรกิจ</label>
              <input 
                type="text" 
                id="business-name" 
                class="form-input" 
                placeholder="เช่น ร้านค้า ABC"
                autocomplete="organization"
              >
            </div>

            <div class="form-group">
              <label class="form-label" for="tax-id">เลขประจำตัวผู้เสียภาษี</label>
              <input 
                type="text" 
                id="tax-id" 
                class="form-input" 
                placeholder="X-XXXX-XXXXX-XX-X"
                maxlength="17"
              >
            </div>

            <div class="form-group">
              <label class="form-label required">ประเภทภาษี</label>
              <div class="radio-group">
                <label class="radio-option selected" data-value="personal">
                  <input 
                    type="radio" 
                    name="tax-type" 
                    value="personal" 
                    class="radio-input" 
                    checked
                  >
                  <div>
                    <div class="radio-label">บุคคลธรรมดา</div>
                    <div class="radio-description">สำหรับผู้ประกอบการรายบุคคล</div>
                  </div>
                </label>
                <label class="radio-option" data-value="sme">
                  <input 
                    type="radio" 
                    name="tax-type" 
                    value="sme" 
                    class="radio-input"
                  >
                  <div>
                    <div class="radio-label">นิติบุคคล SME</div>
                    <div class="radio-description">สำหรับห้างหุ้นส่วน/บริษัท ขนาดกลางและขนาดย่อม</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Step 3: Accounting Period -->
          <div class="wizard-step" data-step="3">
            <div class="form-group">
              <label class="form-label required">รอบบัญชี</label>
              <div class="radio-group">
                <label class="radio-option selected" data-value="standard">
                  <input 
                    type="radio" 
                    name="accounting-period" 
                    value="standard" 
                    class="radio-input" 
                    checked
                  >
                  <div>
                    <div class="radio-label">มาตรฐาน (1 มกราคม - 31 ธันวาคม)</div>
                    <div class="radio-description">ใช้รอบบัญชีมาตรฐานตามปีปฏิทิน</div>
                  </div>
                </label>
                <label class="radio-option" data-value="custom">
                  <input 
                    type="radio" 
                    name="accounting-period" 
                    value="custom" 
                    class="radio-input"
                  >
                  <div>
                    <div class="radio-label">กำหนดเอง</div>
                    <div class="radio-description">กำหนดวันเริ่มต้นและสิ้นสุดเอง</div>
                  </div>
                </label>
              </div>
            </div>

            <div class="date-group hidden" id="custom-dates">
              <div class="form-group">
                <label class="form-label" for="period-start">วันเริ่มต้น</label>
                <input 
                  type="date" 
                  id="period-start" 
                  class="form-input"
                >
              </div>
              <div class="form-group">
                <label class="form-label" for="period-end">วันสิ้นสุด</label>
                <input 
                  type="date" 
                  id="period-end" 
                  class="form-input"
                >
              </div>
            </div>
          </div>

          <!-- Step 4: Completion -->
          <div class="wizard-step" data-step="4">
            <div class="completion-content">
              <div class="completion-icon">✅</div>
              <h2 class="welcome-title">ตั้งค่าเสร็จสมบูรณ์!</h2>
              
              <div class="summary-list">
                <div class="summary-item">
                  <span class="summary-label">ชื่อธุรกิจ:</span>
                  <span class="summary-value" id="summary-business-name">-</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">เลขประจำตัวผู้เสียภาษี:</span>
                  <span class="summary-value" id="summary-tax-id">-</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">ประเภทภาษี:</span>
                  <span class="summary-value" id="summary-tax-type">-</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">รอบบัญชี:</span>
                  <span class="summary-value" id="summary-period">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="wizard-footer">
          <div class="progress-dots">
            <div class="progress-dot active" data-step="1"></div>
            <div class="progress-dot" data-step="2"></div>
            <div class="progress-dot" data-step="3"></div>
            <div class="progress-dot" data-step="4"></div>
          </div>

          <div class="wizard-buttons">
            <button class="wizard-btn wizard-btn-secondary" id="wizard-back" disabled>
              ← ย้อนกลับ
            </button>
            <button class="wizard-btn wizard-btn-primary" id="wizard-next">
              เริ่มต้นใช้งาน →
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize wizard logic
  initWizardLogic();
}

function initWizardLogic() {
  const backBtn = document.getElementById('wizard-back');
  const nextBtn = document.getElementById('wizard-next');

  // Update UI based on current step
  function updateUI() {
    const steps = document.querySelectorAll('.wizard-step');
    const dots = document.querySelectorAll('.progress-dot');

    // Update steps
    steps.forEach((step, index) => {
      step.classList.toggle('active', index + 1 === setupWizard.currentStep);
    });

    // Update progress dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index + 1 === setupWizard.currentStep);
    });

    // Update buttons
    backBtn.disabled = setupWizard.currentStep === 1;

    if (setupWizard.currentStep === 1) {
      nextBtn.textContent = 'เริ่มต้นใช้งาน →';
    } else if (setupWizard.currentStep === setupWizard.totalSteps) {
      nextBtn.textContent = 'เริ่มใช้งาน NextTax →';
    } else {
      nextBtn.textContent = 'ถัดไป →';
    }

    // Update header based on step
    updateHeader();
  }

  function updateHeader() {
    const title = document.getElementById('wizard-title');
    const subtitle = document.getElementById('wizard-subtitle');

    const headers = {
      1: { title: 'ยินดีต้อนรับสู่ NextTax', subtitle: 'ตั้งค่าเบื้องต้นเพื่อเริ่มใช้งาน' },
      2: { title: 'ข้อมูลธุรกิจ', subtitle: 'กรอกข้อมูลพื้นฐานของธุรกิจ' },
      3: { title: 'รอบบัญชี', subtitle: 'กำหนดรอบเวลาสำหรับการคำนวณภาษี' },
      4: { title: 'เสร็จสมบูรณ์', subtitle: 'ตรวจสอบข้อมูลและเริ่มใช้งาน' }
    };

    title.textContent = headers[setupWizard.currentStep].title;
    subtitle.textContent = headers[setupWizard.currentStep].subtitle;
  }

  // Form input handlers
  document.getElementById('business-name').addEventListener('input', (e) => {
    setupWizard.formData.businessName = e.target.value;
  });

  document.getElementById('tax-id').addEventListener('input', (e) => {
    const formatted = setupWizard.formatTaxId(e.target.value);
    e.target.value = formatted;
    setupWizard.formData.taxId = formatted;
  });

  // Tax type radio handlers
  document.querySelectorAll('input[name="tax-type"]').forEach(radio => {
    radio.parentElement.addEventListener('click', () => {
      document.querySelectorAll('.radio-option[data-value]').forEach(opt => {
        opt.classList.remove('selected');
      });
      radio.parentElement.classList.add('selected');
      setupWizard.formData.taxType = radio.value;
    });
  });

  // Accounting period radio handlers
  const customDatesDiv = document.getElementById('custom-dates');
  document.querySelectorAll('input[name="accounting-period"]').forEach(radio => {
    radio.parentElement.addEventListener('click', () => {
      document.querySelectorAll('.radio-option[data-value]').forEach(opt => {
        opt.classList.remove('selected');
      });
      radio.parentElement.classList.add('selected');
      setupWizard.formData.accountingPeriod = radio.value;

      // Show/hide custom date inputs
      customDatesDiv.classList.toggle('hidden', radio.value === 'standard');
    });
  });

  document.getElementById('period-start').addEventListener('change', (e) => {
    setupWizard.formData.periodStart = e.target.value;
  });

  document.getElementById('period-end').addEventListener('change', (e) => {
    setupWizard.formData.periodEnd = e.target.value;
  });

  // Navigation
  nextBtn.addEventListener('click', async () => {
    if (setupWizard.currentStep === setupWizard.totalSteps) {
      // Save and complete
      const saved = await setupWizard.saveSettings();
      if (saved) {
        // Hide wizard and reload to show main app
        document.getElementById('setup-wizard-container').style.display = 'none';
        location.reload();
      }
    } else if (setupWizard.currentStep === setupWizard.totalSteps - 1) {
      // Before going to completion, update summary
      if (setupWizard.validateCurrentStep()) {
        updateSummary();
        setupWizard.nextStep();
        updateUI();
      }
    } else {
      if (setupWizard.nextStep()) {
        updateUI();
      }
    }
  });

  backBtn.addEventListener('click', () => {
    if (setupWizard.previousStep()) {
      updateUI();
    }
  });

  function updateSummary() {
    document.getElementById('summary-business-name').textContent =
      setupWizard.formData.businessName || '-';

    document.getElementById('summary-tax-id').textContent =
      setupWizard.formData.taxId || 'ไม่ระบุ';

    document.getElementById('summary-tax-type').textContent =
      setupWizard.formData.taxType === 'personal' ? 'บุคคลธรรมดา' : 'นิติบุคคล SME';

    if (setupWizard.formData.accountingPeriod === 'standard') {
      const year = new Date().getFullYear();
      document.getElementById('summary-period').textContent =
        `1 มกราคม ${year} - 31 ธันวาคม ${year}`;
    } else {
      const start = new Date(setupWizard.formData.periodStart).toLocaleDateString('th-TH');
      const end = new Date(setupWizard.formData.periodEnd).toLocaleDateString('th-TH');
      document.getElementById('summary-period').textContent = `${start} - ${end}`;
    }
  }

  // Initial UI update
  updateUI();
}
