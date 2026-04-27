document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');

    // --- UI Toggles ---
    // Sales Rep Settings Toggle
    const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
    const settingsContent = document.getElementById('settings-content');
    const settingsIcon = document.getElementById('settings-icon');

    toggleSettingsBtn.addEventListener('click', () => {
        if (settingsContent.style.display === 'none') {
            settingsContent.style.display = 'block';
            settingsIcon.textContent = '▲';
        } else {
            settingsContent.style.display = 'none';
            settingsIcon.textContent = '▼';
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

    // Persistence for Yuno Settings
    const yunoInputs = [
        yunoGasRate, yunoGasStanding, yunoElecStdRate, yunoElecStdStanding,
        yunoElecDnDayRate, yunoElecDnNightRate, yunoElecDnStanding,
        yunoElecSmartDayRate, yunoElecSmartNightRate, yunoElecSmartPeakRate, yunoElecSmartStanding
    ];

    yunoInputs.forEach(input => {
        // Load saved value
        const savedVal = localStorage.getItem(input.id);
        if (savedVal !== null) {
            input.value = savedVal;
        }
        // Save on input change
        input.addEventListener('input', () => {
            localStorage.setItem(input.id, input.value);
        });
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        errorMessage.style.display = 'none';
        resultsSection.style.display = 'none';
        savingsContent.style.display = 'none';
        noSavingsContent.style.display = 'none';

        const fuelType = document.querySelector('input[name="fuel-type"]:checked').value;
        const meterType = document.querySelector('input[name="meter-type"]:checked').value;
        const inContract = document.getElementById('in-contract').checked;

        let currentElecCost = 0;
        let yunoElecCost = 0;
        let isValid = true;

        // Helper to parse and validate
        const getVal = (id) => {
            const val = parseFloat(document.getElementById(id).value);
            if (isNaN(val) || val < 0) isValid = false;
            return val;
        };

        // --- Calculate Electricity ---
        if (meterType === 'standard') {
            const cRate = getVal('current-elec-std-rate');
            const usage = getVal('elec-std-usage');
            const cStanding = getVal('current-elec-std-standing');
            if (isValid) {
                currentElecCost = ((usage * cRate) / 100) + cStanding;
                yunoElecCost = ((usage * parseFloat(yunoElecStdRate.value)) / 100) + parseFloat(yunoElecStdStanding.value);
            }
        } else if (meterType === 'daynight') {
            const cDayRate = getVal('current-elec-dn-day-rate');
            const dayUsage = getVal('elec-dn-day-usage');
            const cNightRate = getVal('current-elec-dn-night-rate');
            const nightUsage = getVal('elec-dn-night-usage');
            const cStanding = getVal('current-elec-dn-standing');
            if (isValid) {
                currentElecCost = (((dayUsage * cDayRate) + (nightUsage * cNightRate)) / 100) + cStanding;
                yunoElecCost = (((dayUsage * parseFloat(yunoElecDnDayRate.value)) + (nightUsage * parseFloat(yunoElecDnNightRate.value))) / 100) + parseFloat(yunoElecDnStanding.value);
            }
        } else if (meterType === 'smart') {
            const cDayRate = getVal('current-elec-smart-day-rate');
            const dayUsage = getVal('elec-smart-day-usage');
            const cNightRate = getVal('current-elec-smart-night-rate');
            const nightUsage = getVal('elec-smart-night-usage');
            const cPeakRate = getVal('current-elec-smart-peak-rate');
            const peakUsage = getVal('elec-smart-peak-usage');
            const cStanding = getVal('current-elec-smart-standing');
            if (isValid) {
                currentElecCost = (((dayUsage * cDayRate) + (nightUsage * cNightRate) + (peakUsage * cPeakRate)) / 100) + cStanding;
                yunoElecCost = (((dayUsage * parseFloat(yunoElecSmartDayRate.value)) + (nightUsage * parseFloat(yunoElecSmartNightRate.value)) + (peakUsage * parseFloat(yunoElecSmartPeakRate.value))) / 100) + parseFloat(yunoElecSmartStanding.value);
            }
        }

        const elecSavings = currentElecCost - yunoElecCost;

        // --- Calculate Gas ---
        let gasSavings = 0;
        if (fuelType === 'dual') {
            const cGasRate = getVal('current-gas-rate');
            const gasUsage = getVal('gas-usage');
            const cGasStanding = getVal('current-gas-standing');

            if (isValid) {
                const currentGasCost = ((gasUsage * cGasRate) / 100) + cGasStanding;
                const yunoGasCost = ((gasUsage * parseFloat(yunoGasRate.value)) / 100) + parseFloat(yunoGasStanding.value);
                gasSavings = currentGasCost - yunoGasCost;
            }
        }

        if (!isValid) {
            errorMessage.style.display = 'block';
            return;
        }

        // --- Calculate Penalty ---
        let penaltyAmount = 0;
        if (inContract) {
            penaltyAmount = (fuelType === 'dual') ? 100 : 50;
        }

        // --- Final Totals ---
        const totalGrossSavings = elecSavings + gasSavings;
        const netSavings = totalGrossSavings - penaltyAmount;

        // --- Display Results ---
        resultsSection.style.display = 'block';

        // Update Breakdown
        breakdownElecVal.textContent = `€${elecSavings.toFixed(2)}`;

        if (fuelType === 'dual') {
            breakdownGas.style.display = 'flex';
            breakdownGasVal.textContent = `€${gasSavings.toFixed(2)}`;
        } else {
            breakdownGas.style.display = 'none';
        }

        if (penaltyAmount > 0) {
            breakdownPenalty.style.display = 'flex';
            breakdownPenaltyVal.textContent = `-€${penaltyAmount.toFixed(2)}`;
        } else {
            breakdownPenalty.style.display = 'none';
        }

        // Determine if they save money
        if (netSavings > 0) {
            savingsAmountDisplay.textContent = `€${netSavings.toFixed(2)}`;
            savingsContent.style.display = 'block';

            // Move breakdown to savings section if it's not already there
            // Select the *actual* breakdown box by parent container, not the empty placeholder
            const actualBreakdownBox = document.getElementById('breakdown-elec').closest('.breakdown-box');
            savingsContent.insertBefore(actualBreakdownBox, savingsAmountDisplay);
        } else {
            noSavingsContent.style.display = 'block';

            // Move breakdown to no-savings section so they can see why
            const actualBreakdownBox = document.getElementById('breakdown-elec').closest('.breakdown-box');
            noSavingsContent.appendChild(actualBreakdownBox);
        }

        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
});
