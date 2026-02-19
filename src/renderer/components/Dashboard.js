// Dashboard Component
// Manages the main application layout and navigation
import { initTransactionForm } from './TransactionForm.js';
import { initOverview } from './Overview.js';
import { initTransactionList } from './TransactionList.js';
import { initReports } from './Reports.js';
import { initSettings } from './Settings.js';
import { Icons } from '../utils/Icons.js';

export function initDashboard() {
  const container = document.getElementById('app');
  if (!container) return;

  // Get business info from settings to display in header
  loadDashboardData(container);
}

async function loadDashboardData(container) {
  try {
    const businessName = await window.nextTaxAPI.getSetting('business_name') || 'NextTax';
    const taxId = await window.nextTaxAPI.getSetting('tax_id') || '';

    renderDashboard(container, { businessName, taxId });
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    renderDashboard(container, { businessName: 'NextTax', taxId: '' });
  }
}

function renderDashboard(container, data) {
  const initialials = data.businessName.substring(0, 2).toUpperCase();

  container.innerHTML = `
    <div class="dashboard-container fade-in">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <img src="./assets/logo.png" alt="Logo" class="app-logo-img">
          <span class="app-name">NextTax</span>
        </div>
        
        <nav class="nav-menu">
          <a href="#" class="nav-item active" data-view="transactions">
            <span class="nav-icon">${Icons.plus}</span>
            <span>บันทึกรายการ</span>
          </a>
          <a href="#" class="nav-item" data-view="history">
            <span class="nav-icon">${Icons.history}</span>
            <span>ประวัติ</span>
          </a>
          <a href="#" class="nav-item" data-view="overview">
             <span class="nav-icon">${Icons.overview}</span>
            <span>ภาพรวม</span>
          </a>
          <a href="#" class="nav-item" data-view="reports">
            <span class="nav-icon">${Icons.reports}</span>
            <span>รายงาน</span>
          </a>
          <a href="#" class="nav-item" data-view="settings">
            <span class="nav-icon">${Icons.settings}</span>
            <span>ตั้งค่า</span>
          </a>
        </nav>
        
        <div class="sidebar-footer">
          <a href="#" class="nav-item" id="logout-btn">
             <span class="nav-icon">${Icons.logout}</span>
            <span>ออกจากระบบ</span>
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top Header -->
        <header class="top-header">
          <h2 class="header-title" id="page-title">บันทึกรายการ</h2>
          
          <div class="user-profile">
            <div class="business-info">
              <span class="business-name">${data.businessName}</span>
              <span class="tax-id-display">${data.taxId}</span>
            </div>
            <div class="avatar">${initialials}</div>
          </div>
        </header>

        <!-- Dynamic Content Area -->
        <div id="content-area" class="content-container">
          <!-- Views will be rendered here -->
          <div class="placeholder-content p-8 text-center text-gray-500">
            <p>Loading Transaction Module...</p>
          </div>
        </div>
      </main>
    </div>
  `;

  // Initialize Navigation Logic
  initNavigation();

  // Load default view (Transaction Form)
  const defaultView = document.querySelector('.nav-item[data-view="transactions"]');
  if (defaultView) {
    // We can manually trigger the click or call loadView
    // Triggering click updates the UI state (active class, title) as well
    defaultView.click();
  }
  // Logout Logic
  document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('คุณต้องการออกจากโปรแกรมหรือไม่?')) {
      window.nextTaxAPI.closeWindow();
    }
  });
}

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-view]');
  const pageTitle = document.getElementById('page-title');
  const contentArea = document.getElementById('content-area');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();

      // Update active state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Update Title
      const viewName = item.querySelector('span:not(.nav-icon)').textContent;
      pageTitle.textContent = viewName;

      // Load View (Placeholder for now)
      const viewId = item.getAttribute('data-view');
      loadView(viewId, contentArea);
    });
  });
}

function loadView(viewId, container) {
  // Clear container
  container.innerHTML = '';

  switch (viewId) {
    case 'transactions':
      initTransactionForm(container);
      break;
    case 'history':
      initTransactionList(container);
      break;
    case 'overview':
      initOverview(container);
      break;
    case 'reports':
      initReports(container);
      break;
    case 'settings':
      initSettings(container);
      break;
  }
}
