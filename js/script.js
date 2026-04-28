if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}

const DEFAULT_YUNO_SETTINGS = Object.freeze({
    yunoGasRate: 8.71,
    yunoGasStanding: 137.64,
    yunoElecStdRate: 28.74,
    yunoElecStdStanding: 201.12,
    yunoElecStdCashback: 60.00,
    yunoElecDnDayRate: 31.34,
    yunoElecDnNightRate: 18.94,
    yunoElecDnStanding: 227.47,
    yunoElecDnCashback: 60.00,
    yunoElecSmartDayRate: 30.91,
    yunoElecSmartNightRate: 18.91,
    yunoElecSmartPeakRate: 33.54,
    yunoElecSmartStanding: 216.30,
    yunoElecSmartCashback: 75.00
});

function init() {
    const form = document.getElementById('calculator-form');
    if (!form) return;

    const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
    const settingsContent = document.getElementById('settings-content');
    const settingsIcon = document.getElementById('settings-icon');

    if (toggleSettingsBtn && settingsContent && settingsIcon) {
        toggleSettingsBtn.addEventListener('click', () => {
            const isExpanded = toggleSettingsBtn.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                settingsContent.style.display = 'none';
                settingsIcon.textContent = '▼';
                toggleSettingsBtn.setAttribute('aria-expanded', 'false');
            } else {
                settingsContent.style.display = 'block';
                settingsIcon.textContent = '▲';
                toggleSettingsBtn.setAttribute('aria-expanded', 'true');
            }
        });
    }

    // Configuration Listeners
    const fuelTypeRadios = document.querySelectorAll('input[name="fuel-type"]');
    const meterTypeRadios = document.querySelectorAll('input[name="meter-type"]');
    const gasSection = document.getElementById('gas-section');

    const elecStandardInputs = document.getElementById('elec-standard-inputs');
    const elecDayNightInputs = document.getElementById('elec-daynight-inputs');
    const elecSmartInputs = document.getElementById('elec-smart-inputs');
    const useNationalAverageCheckbox = document.getElementById('use-national-average');
    const usageInputGroups = document.querySelectorAll('.usage-input');

    function updateUsageInputVisibility() {
        const useNationalAverage = useNationalAverageCheckbox?.checked;
        usageInputGroups.forEach((group) => {
            group.style.display = useNationalAverage ? 'none' : 'block';
        });
    }

    function updateFormVisibility() {
        const fuelType = document.querySelector('input[name="fuel-type"]:checked').value;
        const meterType = document.querySelector('input[name="meter-type"]:checked').value;

        // Fuel Type (Show/Hide Gas)
        if (fuelType === 'dual') {
            gasSection.style.display = 'block';
        } else {
            gasSection.style.display = 'none';
        }

        // Meter Type (Show/Hide Electricity Inputs)
        elecStandardInputs.style.display = 'none';
        elecDayNightInputs.style.display = 'none';
        elecSmartInputs.style.display = 'none';

        if (meterType === 'standard') elecStandardInputs.style.display = 'block';
        else if (meterType === 'daynight') elecDayNightInputs.style.display = 'block';
        else if (meterType === 'smart') elecSmartInputs.style.display = 'block';
    }

    fuelTypeRadios.forEach(radio => radio.addEventListener('change', updateFormVisibility));
    meterTypeRadios.forEach(radio => radio.addEventListener('change', updateFormVisibility));
    useNationalAverageCheckbox?.addEventListener('change', updateUsageInputVisibility);

    // Initialize visibility
    updateFormVisibility();
    updateUsageInputVisibility();

    // --- Main Logic ---
    const errorMessage = document.getElementById('error-message');
    const resultsSection = document.getElementById('results-section');
    const savingsContent = document.getElementById('savings-content');
    const noSavingsContent = document.getElementById('no-savings-content');
    const savingsAmountDisplay = document.getElementById('savings-amount');
    const savingsHeading = document.getElementById('savings-heading');
    const viewToggle = document.getElementById('view-toggle');
    const viewToggleLabel = document.getElementById('view-toggle-label');
    const resetBtn = document.getElementById('reset-btn');

    // Breakdown elements
    const breakdownElec = document.getElementById('breakdown-elec');
    const breakdownElecVal = breakdownElec.querySelector('.value');
    const breakdownGas = document.getElementById('breakdown-gas');
    const breakdownGasVal = breakdownGas.querySelector('.value');
    const breakdownCashback = document.getElementById('breakdown-cashback');
    const breakdownCashbackVal = breakdownCashback.querySelector('.value');
    const breakdownPenalty = document.getElementById('breakdown-penalty');
    const breakdownPenaltyVal = breakdownPenalty.querySelector('.value');

    // Yuno Settings Inputs
    const yunoGasRate = document.getElementById('yuno-gas-rate');
    const yunoGasStanding = document.getElementById('yuno-gas-standing');
    const yunoElecStdRate = document.getElementById('yuno-elec-std-rate');
    const yunoElecStdStanding = document.getElementById('yuno-elec-std-standing');
    const yunoElecStdCashback = document.getElementById('yuno-elec-std-cashback');
    const yunoElecDnDayRate = document.getElementById('yuno-elec-dn-day-rate');
    const yunoElecDnNightRate = document.getElementById('yuno-elec-dn-night-rate');
    const yunoElecDnStanding = document.getElementById('yuno-elec-dn-standing');
    const yunoElecDnCashback = document.getElementById('yuno-elec-dn-cashback');
    const yunoElecSmartDayRate = document.getElementById('yuno-elec-smart-day-rate');
    const yunoElecSmartNightRate = document.getElementById('yuno-elec-smart-night-rate');
    const yunoElecSmartPeakRate = document.getElementById('yuno-elec-smart-peak-rate');
    const yunoElecSmartStanding = document.getElementById('yuno-elec-smart-standing');
    const yunoElecSmartCashback = document.getElementById('yuno-elec-smart-cashback');

    let currentResults = null;

    function clearValidationErrors() {
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    }

    // --- Event Listeners ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        errorMessage.style.display = 'none';
        clearValidationErrors();

        resultsSection.style.display = 'none';
        resultsSection.classList.remove('fade-in');

        savingsContent.style.display = 'none';
        noSavingsContent.style.display = 'none';

        const fuelType = document.querySelector('input[name="fuel-type"]:checked').value;
        const meterType = document.querySelector('input[name="meter-type"]:checked').value;
        const inContract = document.getElementById('in-contract').checked;
        const useNationalAverage = useNationalAverageCheckbox?.checked ?? false;

        let isValid = true;
        const data = { fuelType, meterType, inContract };

        // Helper to parse and validate, highlighting errors
        const getVal = (id, allowEmpty = false) => {
            const el = document.getElementById(id);
            const rawValue = el.value.trim();

            if (allowEmpty && rawValue === '') {
                return parseFloat(el.defaultValue || '0');
            }

            const val = parseFloat(rawValue);
            if (isNaN(val) || val < 0) {
                isValid = false;
                el.classList.add('input-error');
            }
            return val;
        };

        // Extract input values
        if (meterType === 'standard') {
            data.cElecStdRate = getVal('current-elec-std-rate');
            data.elecStdUsage = getVal('elec-std-usage', useNationalAverage);
            data.cElecStdStanding = getVal('current-elec-std-standing');
        } else if (meterType === 'daynight') {
            data.cElecDnDayRate = getVal('current-elec-dn-day-rate');
            data.elecDnDayUsage = getVal('elec-dn-day-usage', useNationalAverage);
            data.cElecDnNightRate = getVal('current-elec-dn-night-rate');
            data.elecDnNightUsage = getVal('elec-dn-night-usage', useNationalAverage);
            data.cElecDnStanding = getVal('current-elec-dn-standing');
        } else if (meterType === 'smart') {
            data.cElecSmartDayRate = getVal('current-elec-smart-day-rate');
            data.elecSmartDayUsage = getVal('elec-smart-day-usage', useNationalAverage);
            data.cElecSmartNightRate = getVal('current-elec-smart-night-rate');
            data.elecSmartNightUsage = getVal('elec-smart-night-usage', useNationalAverage);
            data.cElecSmartPeakRate = getVal('current-elec-smart-peak-rate');
            data.elecSmartPeakUsage = getVal('elec-smart-peak-usage', useNationalAverage);
            data.cElecSmartStanding = getVal('current-elec-smart-standing');
        }

        if (fuelType === 'dual') {
            data.cGasRate = getVal('current-gas-rate');
            data.gasUsage = getVal('gas-usage', useNationalAverage);
            data.cGasStanding = getVal('current-gas-standing');
        }

        if (!isValid) {
            errorMessage.style.display = 'block';
            return;
        }

        const getRate = (input, fallback) => {
            const value = parseFloat(input?.value ?? '');
            if (Number.isFinite(value) && value >= 0) {
                return value;
            }
            if (input) {
                isValid = false;
                input.classList.add('input-error');
            }
            return fallback;
        };

        const rates = {
            yunoGasRate: getRate(yunoGasRate, DEFAULT_YUNO_SETTINGS.yunoGasRate),
            yunoGasStanding: getRate(yunoGasStanding, DEFAULT_YUNO_SETTINGS.yunoGasStanding),
            yunoElecStdRate: getRate(yunoElecStdRate, DEFAULT_YUNO_SETTINGS.yunoElecStdRate),
            yunoElecStdStanding: getRate(yunoElecStdStanding, DEFAULT_YUNO_SETTINGS.yunoElecStdStanding),
            yunoElecStdCashback: getRate(yunoElecStdCashback, DEFAULT_YUNO_SETTINGS.yunoElecStdCashback),
            yunoElecDnDayRate: getRate(yunoElecDnDayRate, DEFAULT_YUNO_SETTINGS.yunoElecDnDayRate),
            yunoElecDnNightRate: getRate(yunoElecDnNightRate, DEFAULT_YUNO_SETTINGS.yunoElecDnNightRate),
            yunoElecDnStanding: getRate(yunoElecDnStanding, DEFAULT_YUNO_SETTINGS.yunoElecDnStanding),
            yunoElecDnCashback: getRate(yunoElecDnCashback, DEFAULT_YUNO_SETTINGS.yunoElecDnCashback),
            yunoElecSmartDayRate: getRate(yunoElecSmartDayRate, DEFAULT_YUNO_SETTINGS.yunoElecSmartDayRate),
            yunoElecSmartNightRate: getRate(yunoElecSmartNightRate, DEFAULT_YUNO_SETTINGS.yunoElecSmartNightRate),
            yunoElecSmartPeakRate: getRate(yunoElecSmartPeakRate, DEFAULT_YUNO_SETTINGS.yunoElecSmartPeakRate),
            yunoElecSmartStanding: getRate(yunoElecSmartStanding, DEFAULT_YUNO_SETTINGS.yunoElecSmartStanding),
            yunoElecSmartCashback: getRate(yunoElecSmartCashback, DEFAULT_YUNO_SETTINGS.yunoElecSmartCashback),
        };

        if (!isValid) {
            errorMessage.style.display = 'block';
            return;
        }

        // Perform Calculation
        currentResults = calculateSavings(data, DEFAULT_YUNO_SETTINGS);
        currentResults.fuelType = fuelType;

        // Reset toggle to annual view on new calculation
        viewToggle.checked = false;

        // Display Results
        displayResults();
    });

    function displayResults() {
        if (!currentResults) return;

        const isMonthly = viewToggle.checked;
        const divider = isMonthly ? 12 : 1;
        const viewText = isMonthly ? 'Monthly' : 'Annual';

        viewToggleLabel.textContent = `Showing ${viewText} Savings`;
        savingsHeading.textContent = `Your Estimated ${viewText} Savings`;
        document.getElementById('savings-subtitle').textContent = `Net savings in Year 1 (${viewText.toLowerCase()})`;

        const elec = currentResults.elecSavings / divider;
        const gas = currentResults.gasSavings / divider;
        const cashback = currentResults.cashbackAmount / divider;
        const pen = currentResults.penaltyAmount / divider;
        const net = currentResults.netSavings / divider;

        // Update Breakdown
        breakdownElecVal.textContent = `€${elec.toFixed(2)}`;

        if (currentResults.fuelType === 'dual') {
            breakdownGas.style.display = 'flex';
            breakdownGasVal.textContent = `€${gas.toFixed(2)}`;
        } else {
            breakdownGas.style.display = 'none';
        }

        if (cashback > 0) {
            breakdownCashback.style.display = 'flex';
            breakdownCashbackVal.textContent = `€${cashback.toFixed(2)}`;
        } else {
            breakdownCashback.style.display = 'none';
        }

        if (pen > 0) {
            breakdownPenalty.style.display = 'flex';
            breakdownPenaltyVal.textContent = `-€${pen.toFixed(2)}`;
        } else {
            breakdownPenalty.style.display = 'none';
        }

        resultsSection.style.display = 'block';

        // Trigger reflow to restart animation
        void resultsSection.offsetWidth;
        resultsSection.classList.add('fade-in');

        // Determine if they save money
        if (currentResults.netSavings > 0) {
            savingsAmountDisplay.textContent = `€${net.toFixed(2)}`;
            savingsContent.style.display = 'block';
            noSavingsContent.style.display = 'none';

            const actualBreakdownBox = document.getElementById('breakdown-elec').closest('.breakdown-box');
            savingsContent.insertBefore(actualBreakdownBox, savingsAmountDisplay);
        } else {
            noSavingsContent.style.display = 'block';
            savingsContent.style.display = 'none';

            const actualBreakdownBox = document.getElementById('breakdown-elec').closest('.breakdown-box');
            noSavingsContent.appendChild(actualBreakdownBox);
        }

        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    viewToggle.addEventListener('change', displayResults);

    resetBtn.addEventListener('click', () => {
        form.reset();
        clearValidationErrors();
        errorMessage.style.display = 'none';
        resultsSection.style.display = 'none';
        resultsSection.classList.remove('fade-in');
        currentResults = null;
        updateFormVisibility(); // Reset to initial visibility state
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// --- Calculation Logic (Separated for Testing) ---
function calculateSavings(data, rates) {
    const DAYS_IN_YEAR = 365;
    const annualizeStandingCharge = (dailyStandingCharge) => dailyStandingCharge * DAYS_IN_YEAR;

    let currentElecCost = 0;
    let yunoElecCost = 0;
    let cashbackAmount = 0;

    if (data.meterType === 'standard') {
        currentElecCost = ((data.elecStdUsage * data.cElecStdRate) / 100) + annualizeStandingCharge(data.cElecStdStanding);
        yunoElecCost = ((data.elecStdUsage * rates.yunoElecStdRate) / 100) + rates.yunoElecStdStanding;
        cashbackAmount = rates.yunoElecStdCashback;
    } else if (data.meterType === 'daynight') {
        currentElecCost = (((data.elecDnDayUsage * data.cElecDnDayRate) + (data.elecDnNightUsage * data.cElecDnNightRate)) / 100) + annualizeStandingCharge(data.cElecDnStanding);
        yunoElecCost = (((data.elecDnDayUsage * rates.yunoElecDnDayRate) + (data.elecDnNightUsage * rates.yunoElecDnNightRate)) / 100) + rates.yunoElecDnStanding;
        cashbackAmount = rates.yunoElecDnCashback;
    } else if (data.meterType === 'smart') {
        currentElecCost = (((data.elecSmartDayUsage * data.cElecSmartDayRate) + (data.elecSmartNightUsage * data.cElecSmartNightRate) + (data.elecSmartPeakUsage * data.cElecSmartPeakRate)) / 100) + annualizeStandingCharge(data.cElecSmartStanding);
        yunoElecCost = (((data.elecSmartDayUsage * rates.yunoElecSmartDayRate) + (data.elecSmartNightUsage * rates.yunoElecSmartNightRate) + (data.elecSmartPeakUsage * rates.yunoElecSmartPeakRate)) / 100) + rates.yunoElecSmartStanding;
        cashbackAmount = rates.yunoElecSmartCashback;
    }

    const elecSavings = currentElecCost - yunoElecCost;

    let gasSavings = 0;
    if (data.fuelType === 'dual') {
        const currentGasCost = ((data.gasUsage * data.cGasRate) / 100) + annualizeStandingCharge(data.cGasStanding);
        const yunoGasCost = ((data.gasUsage * rates.yunoGasRate) / 100) + rates.yunoGasStanding;
        gasSavings = currentGasCost - yunoGasCost;
    }

    let penaltyAmount = 0;
    if (data.inContract) {
        penaltyAmount = (data.fuelType === 'dual') ? 100 : 50;
    }

    const netSavings = (elecSavings + gasSavings + cashbackAmount) - penaltyAmount;

    return {
        elecSavings,
        gasSavings,
        cashbackAmount,
        penaltyAmount,
        netSavings
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateSavings, DEFAULT_YUNO_SETTINGS };
}
