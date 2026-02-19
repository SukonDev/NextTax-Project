/**
 * precision Tax Engine for Thai SMEs and Individuals
 * Handles PIT (Personal Income Tax) and CIT (Corporate Income Tax) calculations
 */

export const TaxEngine = {
    // Personal Income Tax Brackets (2024)
    PIT_BRACKETS: [
        { min: 0, max: 150000, rate: 0 },
        { min: 150000, max: 300000, rate: 0.05 },
        { min: 300000, max: 500000, rate: 0.10 },
        { min: 500000, max: 750000, rate: 0.15 },
        { min: 750000, max: 1000000, rate: 0.20 },
        { min: 1000000, max: 2000000, rate: 0.25 },
        { min: 2000000, max: 5000000, rate: 0.30 },
        { min: 5000000, max: Infinity, rate: 0.35 }
    ],

    // SME Corporate Tax Brackets
    // Assumes Paid-up capital <= 5M and Income <= 30M
    SME_CIT_BRACKETS: [
        { min: 0, max: 300000, rate: 0 },
        { min: 300000, max: 3000000, rate: 0.15 },
        { min: 3000000, max: Infinity, rate: 0.20 }
    ],

    /**
     * Calculate Personal Income Tax (Progressive)
     * @param {number} netIncome - Net Taxable Income (Income - Expenses - Deductions)
     * @returns {object} { totalTax, brackets: [{ bracket, tax, accumulated }] }
     */
    calculatePIT(netIncome) {
        let tax = 0;
        const details = [];

        for (const bracket of this.PIT_BRACKETS) {
            if (netIncome <= bracket.min) break;

            const taxableInBracket = Math.min(netIncome, bracket.max) - bracket.min;
            const taxInBracket = taxableInBracket * bracket.rate;

            tax += taxInBracket;

            details.push({
                range: `${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? 'MAX' : bracket.max.toLocaleString()}`,
                rate: `${bracket.rate * 100}%`,
                taxable: taxableInBracket,
                tax: taxInBracket
            });

            if (netIncome <= bracket.max) break;
        }

        return { totalTax: tax, details };
    },

    /**
     * Calculate SME Corporate Income Tax (Step Rate)
     * @param {number} netProfit - Net Profit
     * @returns {object} { totalTax, details }
     */
    calculateSMETax(netProfit) {
        let tax = 0;
        const details = [];

        for (const bracket of this.SME_CIT_BRACKETS) {
            if (netProfit <= bracket.min) break;

            const taxableInBracket = Math.min(netProfit, bracket.max) - bracket.min;
            const taxInBracket = taxableInBracket * bracket.rate;

            tax += taxInBracket;

            details.push({
                range: `${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? 'MAX' : bracket.max.toLocaleString()}`,
                rate: `${bracket.rate * 100}%`,
                taxable: taxableInBracket,
                tax: taxInBracket
            });

            if (netProfit <= bracket.max) break;
        }

        return { totalTax: tax, details };
    },

    /**
     * Helper to format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(amount);
    }
};
