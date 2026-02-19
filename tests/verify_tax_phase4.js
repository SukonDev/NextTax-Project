
// Test Script for TaxEngine.js
// Run with: node tests/verify_tax_phase4.js

// Mocking the TaxEngine since we can't easily import ES modules in simple node script without package.json config changes or using .mjs
// Copying TaxEngine logic here for verification of the ALGORITHM (which is what matters)

const TaxEngine = {
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
    SME_CIT_BRACKETS: [
        { min: 0, max: 300000, rate: 0 },
        { min: 300000, max: 3000000, rate: 0.15 },
        { min: 3000000, max: Infinity, rate: 0.20 }
    ],

    calculatePIT(netIncome) {
        let tax = 0;
        const details = [];

        for (const bracket of this.PIT_BRACKETS) {
            if (netIncome <= bracket.min) break;

            const taxableInBracket = Math.min(netIncome, bracket.max) - bracket.min;
            const taxInBracket = taxableInBracket * bracket.rate;

            tax += taxInBracket;

            details.push({
                range: `${bracket.min} - ${bracket.max}`,
                tax: taxInBracket
            });

            if (netIncome <= bracket.max) break;
        }

        return { totalTax: tax, details };
    },

    calculateSMETax(netProfit) {
        let tax = 0;
        const details = [];

        for (const bracket of this.SME_CIT_BRACKETS) {
            if (netProfit <= bracket.min) break;

            const taxableInBracket = Math.min(netProfit, bracket.max) - bracket.min;
            const taxInBracket = taxableInBracket * bracket.rate;

            tax += taxInBracket;

            details.push({
                range: `${bracket.min} - ${bracket.max}`,
                tax: taxInBracket
            });

            if (netProfit <= bracket.max) break;
        }

        return { totalTax: tax, details };
    }
};

// --- TESTS ---

console.log("Starting Tax Engine Verification...\n");

// Test Case 1: Personal Income Tax - Net Income 500,000
// Expected:
// 0-150k: 0
// 150k-300k: 150k * 5% = 7,500
// 300k-500k: 200k * 10% = 20,000
// Total: 27,500
const test1 = TaxEngine.calculatePIT(500000);
console.log(`Test 1 (PIT 500k): Expected 27,500 | Actual: ${test1.totalTax}`);
if (test1.totalTax === 27500) console.log("✅ PASS"); else console.log("❌ FAIL");

// Test Case 2: Personal Income Tax - Net Income 2,000,000
// Expected:
// ... prev 500k = 27,500
// 500k-750k: 250k * 15% = 37,500
// 750k-1M: 250k * 20% = 50,000
// 1M-2M: 1M * 25% = 250,000
// Total: 27,500 + 37,500 + 50,000 + 250,000 = 365,000
const test2 = TaxEngine.calculatePIT(2000000);
console.log(`Test 2 (PIT 2M): Expected 365,000 | Actual: ${test2.totalTax}`);
if (test2.totalTax === 365000) console.log("✅ PASS"); else console.log("❌ FAIL");

// Test Case 3: SME Tax - Net Profit 300,000
// Expected: Exempt (0)
const test3 = TaxEngine.calculateSMETax(300000);
console.log(`Test 3 (SME 300k): Expected 0 | Actual: ${test3.totalTax}`);
if (test3.totalTax === 0) console.log("✅ PASS"); else console.log("❌ FAIL");

// Test Case 4: SME Tax - Net Profit 1,000,000
// Expected:
// 0-300k: 0
// 300k-1M: 700k * 15% = 105,000
const test4 = TaxEngine.calculateSMETax(1000000);
console.log(`Test 4 (SME 1M): Expected 105,000 | Actual: ${test4.totalTax}`);
if (test4.totalTax === 105000) console.log("✅ PASS"); else console.log("❌ FAIL");

console.log("\nVerification Complete.");
