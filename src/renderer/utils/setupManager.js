// Setup Wizard Manager
// Handles wizard state, navigation, and form validation

class SetupWizardManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {
            businessName: '',
            taxId: '',
            taxType: 'personal', // personal | sme
            accountingPeriod: 'standard', // standard | custom
            periodStart: '',
            periodEnd: ''
        };
    }

    /**
     * Navigate to next step with validation
     */
    async nextStep() {
        if (!this.validateCurrentStep()) {
            return false;
        }

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            return true;
        }
        return false;
    }

    /**
     * Navigate to previous step
     */
    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            return true;
        }
        return false;
    }

    /**
     * Validate current step
     */
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1: // Welcome - always valid
                return true;

            case 2: // Business Profile
                return this.validateBusinessProfile();

            case 3: // Accounting Period
                return this.validateAccountingPeriod();

            case 4: // Completion - always valid
                return true;

            default:
                return false;
        }
    }

    /**
     * Validate business profile step
     */
    validateBusinessProfile() {
        const errors = [];

        // Business name required
        if (!this.formData.businessName || this.formData.businessName.trim().length === 0) {
            errors.push('กรุณากรอกชื่อธุรกิจ');
        }

        // Tax ID validation (13 digits)
        if (this.formData.taxId) {
            const taxIdClean = this.formData.taxId.replace(/[^0-9]/g, '');
            if (taxIdClean.length !== 13) {
                errors.push('เลขประจำตัวผู้เสียภาษีต้องเป็น 13 หลัก');
            }
        }

        if (errors.length > 0) {
            this.showErrors(errors);
            return false;
        }

        return true;
    }

    /**
     * Validate accounting period step
     */
    validateAccountingPeriod() {
        if (this.formData.accountingPeriod === 'custom') {
            const errors = [];

            if (!this.formData.periodStart) {
                errors.push('กรุณาเลือกวันเริ่มต้นรอบบัญชี');
            }

            if (!this.formData.periodEnd) {
                errors.push('กรุณาเลือกวันสิ้นสุดรอบบัญชี');
            }

            if (this.formData.periodStart && this.formData.periodEnd) {
                const start = new Date(this.formData.periodStart);
                const end = new Date(this.formData.periodEnd);

                if (end <= start) {
                    errors.push('วันสิ้นสุดต้องมาหลังวันเริ่มต้น');
                }
            }

            if (errors.length > 0) {
                this.showErrors(errors);
                return false;
            }
        }

        return true;
    }

    /**
     * Show validation errors
     */
    showErrors(errors) {
        const errorContainer = document.getElementById('wizard-errors');
        if (errorContainer) {
            errorContainer.innerHTML = errors.map(err =>
                `<div class="error-message fade-in">⚠️ ${err}</div>`
            ).join('');
            errorContainer.classList.remove('hidden');

            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorContainer.classList.add('hidden');
            }, 5000);
        }
    }

    /**
     * Save settings to database
     */
    async saveSettings() {
        try {
            // Set business name
            await window.nextTaxAPI.setSetting('business_name', this.formData.businessName);

            // Set tax ID
            await window.nextTaxAPI.setSetting('tax_id', this.formData.taxId);

            // Set tax type
            await window.nextTaxAPI.setSetting('tax_type', this.formData.taxType);

            // Set accounting period
            if (this.formData.accountingPeriod === 'standard') {
                const currentYear = new Date().getFullYear();
                await window.nextTaxAPI.setSetting('accounting_period_start', `${currentYear}-01-01`);
                await window.nextTaxAPI.setSetting('accounting_period_end', `${currentYear}-12-31`);
            } else {
                await window.nextTaxAPI.setSetting('accounting_period_start', this.formData.periodStart);
                await window.nextTaxAPI.setSetting('accounting_period_end', this.formData.periodEnd);
            }

            // Mark first run as complete
            await window.nextTaxAPI.setSetting('first_run', 'false');

            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showErrors(['เกิดข้อผิดพลาดในการบันทึกข้อมูล']);
            return false;
        }
    }

    /**
     * Format tax ID for display (X-XXXX-XXXXX-XX-X)
     */
    formatTaxId(value) {
        const cleaned = value.replace(/[^0-9]/g, '');
        const parts = [];

        if (cleaned.length > 0) parts.push(cleaned.substring(0, 1));
        if (cleaned.length > 1) parts.push(cleaned.substring(1, 5));
        if (cleaned.length > 5) parts.push(cleaned.substring(5, 10));
        if (cleaned.length > 10) parts.push(cleaned.substring(10, 12));
        if (cleaned.length > 12) parts.push(cleaned.substring(12, 13));

        return parts.join('-');
    }
}

// Export singleton instance
const setupWizard = new SetupWizardManager();
export default setupWizard;
