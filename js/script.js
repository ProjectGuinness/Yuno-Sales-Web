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
    yunoElecSmartCashback: 75.00,
    yunoRateEffectiveDate: '2026-04-01'
});

const YUNO_RATE_PRESETS = Object.freeze({
    'apr-2026': { ...DEFAULT_YUNO_SETTINGS, yunoRateEffectiveDate: '2026-04-01' },
    'jan-2026': {
        yunoGasRate: 8.95,
        yunoGasStanding: 141.20,
        yunoElecStdRate: 29.15,
        yunoElecStdStanding: 208.90,
        yunoElecStdCashback: 50.00,
        yunoElecDnDayRate: 31.90,
        yunoElecDnNightRate: 19.20,
        yunoElecDnStanding: 232.50,
        yunoElecDnCashback: 50.00,
        yunoElecSmartDayRate: 31.60,
        yunoElecSmartNightRate: 19.30,
        yunoElecSmartPeakRate: 34.25,
        yunoElecSmartStanding: 221.80,
        yunoElecSmartCashback: 65.00,
        yunoRateEffectiveDate: '2026-01-01'
    }
});

function validateYunoValue(value, kind) {
    if (!Number.isFinite(value) || value < 0) {
        return { isWarning: true, message: 'Please keep Yuno settings at zero or above.' };
    }
    if (kind === 'rate' && value > 100) {
        return { isWarning: true, message: 'One or more unit rates look unusually high (>100c).' };
    }
    if (kind === 'standing' && value > 500) {
        return { isWarning: true, message: 'One or more standing charges look unusually high (>€500).' };
    }
    if (kind === 'cashback' && value > 250) {
        return { isWarning: true, message: 'One or more cashback values look unusually high (>€250).' };
    }
    return { isWarning: false, message: '' };
}

function buildSettingsSummary(rates, effectiveDate) {
    const formattedDate = effectiveDate || 'Not set';
    return `Std ${rates.yunoElecStdRate.toFixed(2)}c + €${rates.yunoElecStdStanding.toFixed(2)} | D/N ${rates.yunoElecDnDayRate.toFixed(2)}c/${rates.yunoElecDnNightRate.toFixed(2)}c | Smart ${rates.yunoElecSmartDayRate.toFixed(2)}c/${rates.yunoElecSmartNightRate.toFixed(2)}c/${rates.yunoElecSmartPeakRate.toFixed(2)}c | Gas ${rates.yunoGasRate.toFixed(2)}c + €${rates.yunoGasStanding.toFixed(2)} | Effective ${formattedDate}`;
}

function init() {
    const form = document.getElementById('calculator-form');
    if (!form) return;

    // --- UI Toggles ---
    // Sales Rep Settings Toggle
    const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
    const settingsContent = document.getElementById('settings-content');
    const settingsIcon = document.getElementById('settings-icon');

    if (toggleSettingsBtn && settingsContent && settingsIcon) {
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
    const yunoRatePreset = document.getElementById('yuno-rate-preset');
    const yunoRateEffectiveDate = document.getElementById('yuno-rate-effective-date');
    const settingsSummary = document.getElementById('settings-summary');
    const settingsWarning = document.getElementById('settings-warning');
    const resetYunoSettingsBtn = document.getElementById('reset-yuno-settings-btn');
    const exportYunoSettingsBtn = document.getElementById('export-yuno-settings-btn');
    const importYunoSettingsBtn = document.getElementById('import-yuno-settings-btn');
    const importYunoSettingsFile = document.getElementById('import-yuno-settings-file');
    const YUNO_STORAGE_PREFIX = 'yuno-setting:';

    // Persistence for Yuno Settings
    const yunoInputs = [
        yunoGasRate, yunoGasStanding, yunoElecStdRate, yunoElecStdStanding, yunoElecStdCashback,
        yunoElecDnDayRate, yunoElecDnNightRate, yunoElecDnStanding, yunoElecDnCashback,
        yunoElecSmartDayRate, yunoElecSmartNightRate, yunoElecSmartPeakRate, yunoElecSmartStanding, yunoElecSmartCashback
    ];

    const yunoInputKeys = {
        yunoGasRate,
        yunoGasStanding,
        yunoElecStdRate,
        yunoElecStdStanding,
        yunoElecStdCashback,
        yunoElecDnDayRate,
        yunoElecDnNightRate,
        yunoElecDnStanding,
        yunoElecDnCashback,
        yunoElecSmartDayRate,
        yunoElecSmartNightRate,
        yunoElecSmartPeakRate,
        yunoElecSmartStanding,
        yunoElecSmartCashback,
    };

    // Debounce function to limit rapid I/O
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    function persistSetting(key, value) {
        localStorage.setItem(`${YUNO_STORAGE_PREFIX}${key}`, value);
    }

    function readPersistedSetting(key) {
        return localStorage.getItem(`${YUNO_STORAGE_PREFIX}${key}`);
    }

    function getCurrentYunoRates() {
        return Object.keys(yunoInputKeys).reduce((acc, key) => {
            const input = yunoInputKeys[key];
            const value = parseFloat(input?.value ?? '');
            acc[key] = Number.isFinite(value) && value >= 0 ? value : 0;
            return acc;
        }, {});
    }

    function applyYunoSettings(settings, persist = true) {
        Object.entries(yunoInputKeys).forEach(([key, input]) => {
            if (!input) return;
            const value = settings[key];
            if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
                input.value = value.toFixed(2);
            }
            if (persist) {
                persistSetting(input.id, input.value);
            }
        });
        if (yunoRateEffectiveDate && settings.yunoRateEffectiveDate) {
            yunoRateEffectiveDate.value = settings.yunoRateEffectiveDate;
            if (persist) persistSetting(yunoRateEffectiveDate.id, yunoRateEffectiveDate.value);
        }
    }

    function updateSettingsSummaryText() {
        if (!settingsSummary) return;
        settingsSummary.textContent = buildSettingsSummary(getCurrentYunoRates(), yunoRateEffectiveDate?.value);
    }

    function updateSettingsWarnings() {
        if (!settingsWarning) return;
        const warnings = [];
        yunoInputs.forEach((input) => {
            if (!input) return;
            const value = parseFloat(input.value);
            const kind = input.dataset.kind || '';
            const warning = validateYunoValue(value, kind);
            input.classList.toggle('input-warning', warning.isWarning);
            if (warning.isWarning) warnings.push(warning.message);
        });
        if (warnings.length > 0) {
            settingsWarning.style.display = 'block';
            settingsWarning.textContent = [...new Set(warnings)][0];
        } else {
            settingsWarning.style.display = 'none';
            settingsWarning.textContent = '';
        }
    }

    yunoInputs.forEach(input => {
        if (!input) return;
        // Load saved value
        const savedVal = readPersistedSetting(input.id);
        if (savedVal !== null) {
            input.value = savedVal;
        }
        // Save on input change (debounced)
        input.addEventListener('input', debounce(() => {
            persistSetting(input.id, input.value);
        }, 500));
        input.addEventListener('input', () => {
            if (yunoRatePreset) yunoRatePreset.value = 'custom';
            if (yunoRatePreset) persistSetting(yunoRatePreset.id, yunoRatePreset.value);
            updateSettingsWarnings();
            updateSettingsSummaryText();
        });
    });

    if (yunoRateEffectiveDate) {
        const savedDate = readPersistedSetting(yunoRateEffectiveDate.id);
        if (savedDate) yunoRateEffectiveDate.value = savedDate;
        yunoRateEffectiveDate.addEventListener('change', () => {
            persistSetting(yunoRateEffectiveDate.id, yunoRateEffectiveDate.value);
            if (yunoRatePreset) {
                yunoRatePreset.value = 'custom';
                persistSetting(yunoRatePreset.id, yunoRatePreset.value);
            }
            updateSettingsSummaryText();
        });
    }

    if (yunoRatePreset) {
        const savedPreset = readPersistedSetting(yunoRatePreset.id);
        if (savedPreset && (savedPreset === 'custom' || YUNO_RATE_PRESETS[savedPreset])) {
            yunoRatePreset.value = savedPreset;
            if (savedPreset !== 'custom') applyYunoSettings(YUNO_RATE_PRESETS[savedPreset], false);
        }
        yunoRatePreset.addEventListener('change', () => {
            const selectedPreset = yunoRatePreset.value;
            persistSetting(yunoRatePreset.id, selectedPreset);
            if (selectedPreset !== 'custom' && YUNO_RATE_PRESETS[selectedPreset]) {
                applyYunoSettings(YUNO_RATE_PRESETS[selectedPreset], true);
            }
            updateSettingsWarnings();
            updateSettingsSummaryText();
        });
    }

    resetYunoSettingsBtn?.addEventListener('click', () => {
        applyYunoSettings(DEFAULT_YUNO_SETTINGS, true);
        if (yunoRatePreset) {
            yunoRatePreset.value = 'apr-2026';
            persistSetting(yunoRatePreset.id, yunoRatePreset.value);
        }
        updateSettingsWarnings();
        updateSettingsSummaryText();
    });

    exportYunoSettingsBtn?.addEventListener('click', () => {
        const exportPayload = {
            preset: yunoRatePreset?.value ?? 'custom',
            yunoRateEffectiveDate: yunoRateEffectiveDate?.value ?? '',
            rates: getCurrentYunoRates()
        };
        const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'yuno-rate-settings.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    });

    importYunoSettingsBtn?.addEventListener('click', () => {
        importYunoSettingsFile?.click();
    });

    importYunoSettingsFile?.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const payload = JSON.parse(String(reader.result || '{}'));
                applyYunoSettings({ ...payload.rates, yunoRateEffectiveDate: payload.yunoRateEffectiveDate || '' }, true);
                if (yunoRatePreset) {
                    yunoRatePreset.value = 'custom';
                    persistSetting(yunoRatePreset.id, yunoRatePreset.value);
                }
                updateSettingsWarnings();
                updateSettingsSummaryText();
            } catch (_error) {
                if (settingsWarning) {
                    settingsWarning.style.display = 'block';
                    settingsWarning.textContent = 'Could not import settings file. Please use a valid JSON export.';
                }
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    });

    updateSettingsWarnings();
    updateSettingsSummaryText();
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

        // Extract rates
        const rateVal = (inputEl) => {
            const value = parseFloat(inputEl?.value ?? '');
            return Number.isFinite(value) && value >= 0 ? value : 0;
        };

        const rates = {
            yunoGasRate: rateVal(yunoGasRate),
            yunoGasStanding: rateVal(yunoGasStanding),
            yunoElecStdRate: rateVal(yunoElecStdRate),
            yunoElecStdStanding: rateVal(yunoElecStdStanding),
            yunoElecStdCashback: rateVal(yunoElecStdCashback),
            yunoElecDnDayRate: rateVal(yunoElecDnDayRate),
            yunoElecDnNightRate: rateVal(yunoElecDnNightRate),
            yunoElecDnStanding: rateVal(yunoElecDnStanding),
            yunoElecDnCashback: rateVal(yunoElecDnCashback),
            yunoElecSmartDayRate: rateVal(yunoElecSmartDayRate),
            yunoElecSmartNightRate: rateVal(yunoElecSmartNightRate),
            yunoElecSmartPeakRate: rateVal(yunoElecSmartPeakRate),
            yunoElecSmartStanding: rateVal(yunoElecSmartStanding),
            yunoElecSmartCashback: rateVal(yunoElecSmartCashback),
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
    module.exports = { calculateSavings, validateYunoValue, buildSettingsSummary, DEFAULT_YUNO_SETTINGS };
}
