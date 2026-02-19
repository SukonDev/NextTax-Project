// Renderer Process Entry Point
import { initSetupWizard } from './components/SetupWizard.js';
import { initDashboard } from './components/Dashboard.js';

// Production Polish: Strip Logs
if (window.nextTaxAPI && window.nextTaxAPI.isProduction) {
  console.log = () => { };
  console.info = () => { };
  console.warn = () => { };
  // Keep error logs for debugging even in prod? usually yes, or better logging service.
}

/**
 * Check if this is first run and show setup wizard
 */
async function checkFirstRun() {
  try {
    const firstRun = await window.nextTaxAPI.getSetting('first_run');

    if (firstRun === 'true') {
      // Show setup wizard
      initSetupWizard();
      // Hide main app container (will be used by Dashboard)
      document.getElementById('app').innerHTML = '';
      document.getElementById('app').style.display = 'block';
    } else {
      // Hide wizard container strictly
      const wizardContainer = document.getElementById('setup-wizard-container');
      wizardContainer.style.display = 'none';
      wizardContainer.style.zIndex = '-1';
      wizardContainer.innerHTML = ''; // Clear content to remove any fixed position elements

      // Initialize Dashboard
      initDashboard();
    }

    // Hide splash screen
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) splash.classList.add('hidden');
    }, 1500);

  } catch (error) {
    console.error('Failed to check first run:', error);
    // Default to Dashboard
    document.getElementById('setup-wizard-container').style.display = 'none';
    initDashboard();

    // Hide splash screen even on error
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) splash.classList.add('hidden');
    }, 1500);
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkFirstRun);
} else {
  checkFirstRun();
}


/**
 * Window Controls
 */
document.getElementById('min-btn').addEventListener('click', () => {
  window.nextTaxAPI.minimizeWindow();
});

document.getElementById('max-btn').addEventListener('click', () => {
  window.nextTaxAPI.maximizeWindow();
});

document.getElementById('close-btn').addEventListener('click', () => {
  window.nextTaxAPI.closeWindow();
});

/**
 * Database Test Function
 */
document.getElementById('test-db-btn').addEventListener('click', async () => {
  const resultDiv = document.getElementById('test-result');
  resultDiv.innerHTML = '<p class="text-gray-600">กำลังทดสอบ...</p>';

  try {
    // Test 1: Get Settings
    const appVersion = await window.nextTaxAPI.getSetting('app_version');
    const firstRun = await window.nextTaxAPI.getSetting('first_run');

    // Test 2: Get Categories
    const categories = await window.nextTaxAPI.getCategories();

    // Test 3: Get Summary (empty initially)
    const summary = await window.nextTaxAPI.getSummary('2024-01-01', '2024-12-31');

    // Display results
    resultDiv.innerHTML = `
      <div class="win-card text-left max-w-2xl fade-in">
        <h3 class="font-semibold text-lg mb-3 text-accent">✅ ทดสอบระบบสำเร็จ!</h3>
        
        <div class="space-y-2">
          <p><strong>App Version:</strong> ${appVersion}</p>
          <p><strong>First Run:</strong> ${firstRun === 'true' ? 'ใช่' : 'ไม่'}</p>
          <p><strong>Categories:</strong> ${categories.length} หมวดหมู่</p>
          <p><strong>Summary:</strong> รายรับ ฿${summary.income.toLocaleString()}, รายจ่าย ฿${summary.expense.toLocaleString()}</p>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-600">
            <strong>หมวดหมู่ที่มีในระบบ:</strong>
          </p>
          <ul class="mt-2 space-y-1 text-sm">
            ${categories.slice(0, 5).map(cat => `
              <li class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full" style="background: ${cat.color}"></span>
                ${cat.name} (${cat.type === 'income' ? 'รายรับ' : 'รายจ่าย'})
              </li>
            `).join('')}
            ${categories.length > 5 ? `<li class="text-gray-500">...และอีก ${categories.length - 5} หมวดหมู่</li>` : ''}
          </ul>
        </div>

        <div class="mt-4 p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            <strong>✨ Phase 1 สำเร็จ:</strong> ฐานข้อมูลและระบบจัดเก็บไฟล์พร้อมใช้งาน
          </p>
        </div>
      </div>
    `;
  } catch (error) {
    resultDiv.innerHTML = `
      <div class="win-card text-left max-w-lg bg-red-50 border-red-200">
        <h3 class="font-semibold text-lg mb-2 text-red-600">❌ เกิดข้อผิดพลาด</h3>
        <p class="text-sm text-red-700">${error.message}</p>
      </div>
    `;
  }
});

// Log app ready
console.log('NextTax Renderer Ready');
console.log('nextTaxAPI available:', !!window.nextTaxAPI);
