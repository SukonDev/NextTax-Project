// Charts Component - Wrapper for Chart.js
import Chart from 'chart.js/auto';

let expenseChartInstance = null;
let cashflowChartInstance = null;
let categoryChartInstance = null;

export const Charts = {
    /**
     * Render a Doughnut Chart for Expenses by Category
     * @param {string} canvasId - The ID of the canvas element
     * @param {Array} data - Array of { label, value, color }
     */
    renderExpenseDonut(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (expenseChartInstance) {
            expenseChartInstance.destroy();
        }

        expenseChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    data: data.map(d => d.value),
                    backgroundColor: data.map(d => d.color),
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            font: { family: '-apple-system, sans-serif', size: 12 }
                        }
                    }
                },
                cutout: '75%'
            }
        });
    },

    /**
     * Render an Area Chart for Cashflow (Income vs Expense)
     * @param {string} canvasId - The ID of the canvas element
     * @param {Array} labels - Array of month names
     * @param {Array} incomeData - Array of income values
     * @param {Array} expenseData - Array of expense values
     */
    renderCashflowArea(canvasId, labels, incomeData, expenseData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (cashflowChartInstance) {
            cashflowChartInstance.destroy();
        }

        const gradientIncome = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradientIncome.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradientIncome.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        const gradientExpense = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradientExpense.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        gradientExpense.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

        cashflowChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'รายรับ (Income)',
                        data: incomeData,
                        borderColor: '#10B981',
                        backgroundColor: gradientIncome,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        borderWidth: 2
                    },
                    {
                        label: 'รายจ่าย (Expense)',
                        data: expenseData,
                        borderColor: '#EF4444',
                        backgroundColor: gradientExpense,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        padding: 10,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: '#F3F4F6' },
                        ticks: { font: { size: 11 } }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
};
