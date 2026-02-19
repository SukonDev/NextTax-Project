export const Toast = {
    /**
     * Show a toast message
     * @param {string} message - Message to display
     * @param {'success'|'error'|'warning'|'info'} type - Type of toast
     * @param {number} duration - Duration in ms (default 3000)
     */
    show(message, type = 'success', duration = 3000) {
        // Create container if not exists
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
      `;
            document.body.appendChild(container); // Append to body to be global
        }

        // Create toast element
        const toast = document.createElement('div');

        // Icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        // Colors
        const colors = {
            success: '#34C759',
            error: '#FF3B30',
            warning: '#FF9500',
            info: '#007AFF'
        };

        const styles = `
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: #1c1c1e;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-left: 4px solid ${colors[type]};
      font-family: -apple-system, system-ui, sans-serif;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 280px;
      max-width: 400px;
      pointer-events: auto;
      transform: translateX(120%);
      transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
      margin-bottom: 8px;
    `;

        toast.style.cssText = styles;
        toast.innerHTML = `
      <span style="font-size: 18px;">${icons[type]}</span>
      <span style="flex: 1;">${message}</span>
    `;

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        // Auto remove
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            toast.addEventListener('transitionend', () => {
                if (toast.parentElement) {
                    toast.remove();
                }
            });
        }, duration);
    }
};
