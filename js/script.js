document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');

    // --- UI Toggles ---
    // Sales Rep Settings Toggle
    const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
    const settingsContent = document.getElementById('settings-content');
    const settingsIcon = document.getElementById('settings-icon');

    toggleSettingsBtn.addEventListener('click', () => {
        const isExpanded = toggleSettingsBtn.getAttribute('aria-expanded') === 'true';
        if (!isExpanded) {
            settingsContent.style.display = 'block';
            settingsIcon.textContent = '▲';
            toggleSettingsBtn.setAttribute('aria-expanded', 'true');
        } else {
            settingsContent.style.display = 'none';
            settingsIcon.textContent = '▼';
            toggleSettingsBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Configuration Listeners
    const fuelTypeRadios = document.querySelectorAll('input[name="fuel-type"]');
    const meterTypeRadios = document.querySelectorAll('input[name="meter-type"]');
    const gasSection = document.getElementById('gas-section');

    const elecStandardInputs = document.getElementById('elec-standard-inputs');
    const elecDayNightInputs = document.getElementById('elec-daynight-inputs');
    const elecSmartInputs = document.getElementById('elec-smart-inputs');

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

    // Initialize visibility
    updateFormVisibility();

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
    const breakdownPenalty = document.getElementById('breakdown-penalty');
    const breakdownPenaltyVal = breakdownPenalty.querySelector('.value');

    // Yuno Settings Inputs
    const yunoGasRate = document.getElementById('yuno-gas-rate');
    const yunoGasStanding = document.getElementById('yuno-gas-standing');
    const yunoElecStdRate = document.getElementById('yuno-elec-std-rate');
    const yunoElecStdStanding = document.getElementById('yuno-elec-std-standing');
    const yunoElecDnDayRate = document.getElementById('yuno-elec-dn-day-rate');
    const yunoElecDnNightRate = document.getElementById('yuno-elec-dn-night-rate');
    const yunoElecDnStanding = document.getElementById('yuno-elec-dn-standing');
    const yunoElecSmartDayRate = document.getElementById('yuno-elec-smart-day-rate');
    const yunoElecSmartNightRate = document.getElementById('yuno-elec-smart-night-rate');
    const yunoElecSmartPeakRate = document.getElementById('yuno-elec-smart-peak-rate');
    const yunoElecSmartStanding = document.getElementById('yuno-elec-smart-standing');

    let currentResults = null;

    // --- Calculation Logic (Separated) ---
    function calculateSavings(data, rates) {
        let currentElecCost = 0;
        let yunoElecCost = 0;

        if (data.meterType === 'standard') {
            currentElecCost = ((data.elecStdUsage * data.cElecStdRate) / 100) + data.cElecStdStanding;
            yunoElecCost = ((data.elecStdUsage * rates.yunoElecStdRate) / 100) + rates.yunoElecStdStanding;
        } else if (data.meterType === 'daynight') {
            currentElecCost = (((data.elecDnDayUsage * data.cElecDnDayRate) + (data.elecDnNightUsage * data.cElecDnNightRate)) / 100) + data.cElecDnStanding;
            yunoElecCost = (((data.elecDnDayUsage * rates.yunoElecDnDayRate) + (data.elecDnNightUsage * rates.yunoElecDnNightRate)) / 100) + rates.yunoElecDnStanding;
        } else if (data.meterType === 'smart') {
            currentElecCost = (((data.elecSmartDayUsage * data.cElecSmartDayRate) + (data.elecSmartNightUsage * data.cElecSmartNightRate) + (data.elecSmartPeakUsage * data.cElecSmartPeakRate)) / 100) + data.cElecSmartStanding;
            yunoElecCost = (((data.elecSmartDayUsage * rates.yunoElecSmartDayRate) + (data.elecSmartNightUsage * rates.yunoElecSmartNightRate) + (data.elecSmartPeakUsage * rates.yunoElecSmartPeakRate)) / 100) + rates.yunoElecSmartStanding;
        }

        const elecSavings = currentElecCost - yunoElecCost;

        let gasSavings = 0;
        if (data.fuelType === 'dual') {
            const currentGasCost = ((data.gasUsage * data.cGasRate) / 100) + data.cGasStanding;
            const yunoGasCost = ((data.gasUsage * rates.yunoGasRate) / 100) + rates.yunoGasStanding;
            gasSavings = currentGasCost - yunoGasCost;
        }

        let penaltyAmount = 0;
        if (data.inContract) {
            penaltyAmount = (data.fuelType === 'dual') ? 100 : 50;
        }

        const netSavings = (elecSavings + gasSavings) - penaltyAmount;

        return {
            elecSavings,
            gasSavings,
            penaltyAmount,
            netSavings
        };
    }

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

        let isValid = true;
        const data = { fuelType, meterType, inContract };

        // Helper to parse and validate, highlighting errors
        const getVal = (id) => {
            const el = document.getElementById(id);
            const val = parseFloat(el.value);
            if (isNaN(val) || val < 0) {
                isValid = false;
                el.classList.add('input-error');
            }
            return val;
        };

        // Extract input values
        if (meterType === 'standard') {
            data.cElecStdRate = getVal('current-elec-std-rate');
            data.elecStdUsage = getVal('elec-std-usage');
            data.cElecStdStanding = getVal('current-elec-std-standing');
        } else if (meterType === 'daynight') {
            data.cElecDnDayRate = getVal('current-elec-dn-day-rate');
            data.elecDnDayUsage = getVal('elec-dn-day-usage');
            data.cElecDnNightRate = getVal('current-elec-dn-night-rate');
            data.elecDnNightUsage = getVal('elec-dn-night-usage');
            data.cElecDnStanding = getVal('current-elec-dn-standing');
        } else if (meterType === 'smart') {
            data.cElecSmartDayRate = getVal('current-elec-smart-day-rate');
            data.elecSmartDayUsage = getVal('elec-smart-day-usage');
            data.cElecSmartNightRate = getVal('current-elec-smart-night-rate');
            data.elecSmartNightUsage = getVal('elec-smart-night-usage');
            data.cElecSmartPeakRate = getVal('current-elec-smart-peak-rate');
            data.elecSmartPeakUsage = getVal('elec-smart-peak-usage');
            data.cElecSmartStanding = getVal('current-elec-smart-standing');
        }

        if (fuelType === 'dual') {
            data.cGasRate = getVal('current-gas-rate');
            data.gasUsage = getVal('gas-usage');
            data.cGasStanding = getVal('current-gas-standing');
        }

        if (!isValid) {
            errorMessage.style.display = 'block';
            return;
        }

        // Extract rates
        const rates = {
            yunoGasRate: parseFloat(yunoGasRate.value),
            yunoGasStanding: parseFloat(yunoGasStanding.value),
            yunoElecStdRate: parseFloat(yunoElecStdRate.value),
            yunoElecStdStanding: parseFloat(yunoElecStdStanding.value),
            yunoElecDnDayRate: parseFloat(yunoElecDnDayRate.value),
            yunoElecDnNightRate: parseFloat(yunoElecDnNightRate.value),
            yunoElecDnStanding: parseFloat(yunoElecDnStanding.value),
            yunoElecSmartDayRate: parseFloat(yunoElecSmartDayRate.value),
            yunoElecSmartNightRate: parseFloat(yunoElecSmartNightRate.value),
            yunoElecSmartPeakRate: parseFloat(yunoElecSmartPeakRate.value),
            yunoElecSmartStanding: parseFloat(yunoElecSmartStanding.value),
        };

        // Perform Calculation
        currentResults = calculateSavings(data, rates);
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
});
