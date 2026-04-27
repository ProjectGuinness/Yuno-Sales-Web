// Hardcoded Variables (Yuno Rates)
const YUNO_UNIT_RATE = 28.74; // cents
const YUNO_STANDING_CHARGE = 201.12; // euros

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');
    const unitRateInput = document.getElementById('current-unit-rate');
    const standingChargeInput = document.getElementById('current-standing-charge');
    const annualUsageInput = document.getElementById('annual-usage');

    const errorMessage = document.getElementById('error-message');
    const resultsSection = document.getElementById('results-section');
    const savingsContent = document.getElementById('savings-content');
    const noSavingsContent = document.getElementById('no-savings-content');
    const savingsAmountDisplay = document.getElementById('savings-amount');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent page reload

        // Hide previous errors/results
        errorMessage.style.display = 'none';
        resultsSection.style.display = 'none';
        savingsContent.style.display = 'none';
        noSavingsContent.style.display = 'none';

        // Parse inputs
        const currentUnitRate = parseFloat(unitRateInput.value);
        const currentStandingCharge = parseFloat(standingChargeInput.value);
        const annualUsage = parseFloat(annualUsageInput.value);

        // Validation: Check if numbers are positive
        if (
            isNaN(currentUnitRate) || currentUnitRate < 0 ||
            isNaN(currentStandingCharge) || currentStandingCharge < 0 ||
            isNaN(annualUsage) || annualUsage < 0
        ) {
            errorMessage.style.display = 'block';
            return;
        }

        // Calculation Logic
        // Current Cost: ((Annual Usage * Current Unit Rate) / 100) + Current Standing Charge
        const currentCost = ((annualUsage * currentUnitRate) / 100) + currentStandingCharge;

        // Yuno Cost: ((Annual Usage * YUNO_UNIT_RATE) / 100) + YUNO_STANDING_CHARGE
        const yunoCost = ((annualUsage * YUNO_UNIT_RATE) / 100) + YUNO_STANDING_CHARGE;

        // Total Savings
        const totalSavings = currentCost - yunoCost;

        // Display results
        resultsSection.style.display = 'block';

        if (totalSavings > 0) {
            // Show savings
            savingsAmountDisplay.textContent = `€${totalSavings.toFixed(2)}`;
            savingsContent.style.display = 'block';
        } else {
            // Show no savings message
            noSavingsContent.style.display = 'block';
        }

        // Smooth scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
});
