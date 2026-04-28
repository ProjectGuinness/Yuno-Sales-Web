const { calculateSavings, validateYunoValue, buildSettingsSummary, DEFAULT_YUNO_SETTINGS } = require('./script.js');

describe('calculateSavings', () => {
    const defaultRates = {
        yunoGasRate: 8.71,
        yunoGasStanding: 137.64,
        yunoElecStdRate: 28.74,
        yunoElecStdStanding: 201.12,
        yunoElecStdCashback: 0.00,
        yunoElecDnDayRate: 31.34,
        yunoElecDnNightRate: 18.94,
        yunoElecDnStanding: 227.47,
        yunoElecDnCashback: 0.00,
        yunoElecSmartDayRate: 30.91,
        yunoElecSmartNightRate: 18.91,
        yunoElecSmartPeakRate: 33.54,
        yunoElecSmartStanding: 216.30,
        yunoElecSmartCashback: 0.00,
    };

    test('calculates standard meter savings correctly (Single Fuel)', () => {
        const data = {
            fuelType: 'single',
            meterType: 'standard',
            inContract: false,
            elecStdUsage: 4200,
            cElecStdRate: 30.00, // Current rate
            cElecStdStanding: 0.68 // Current daily standing
        };

        // Expected Current Cost: (4200 * 30 / 100) + (0.68 * 365) = 1260 + 248.20 = 1508.20
        // Expected Yuno Cost: (4200 * 28.74 / 100) + 201.12 = 1207.08 + 201.12 = 1408.20
        // Expected Elec Savings: 1508.20 - 1408.20 = 100.00
        // Net Savings: 100.00

        const results = calculateSavings(data, defaultRates);
        expect(results.elecSavings).toBeCloseTo(100.00);
        expect(results.gasSavings).toBe(0);
        expect(results.cashbackAmount).toBe(0);
        expect(results.penaltyAmount).toBe(0);
        expect(results.netSavings).toBeCloseTo(100.00);
    });

    test('calculates day/night meter savings correctly (Single Fuel)', () => {
        const data = {
            fuelType: 'single',
            meterType: 'daynight',
            inContract: false,
            elecDnDayUsage: 2000,
            elecDnNightUsage: 2200,
            cElecDnDayRate: 35.00,
            cElecDnNightRate: 20.00,
            cElecDnStanding: 0.77
        };

        // Expected Current Cost: ((2000*35 + 2200*20) / 100) + (0.77 * 365) = 1140 + 281.05 = 1421.05
        // Expected Yuno Cost: ((2000*31.34 + 2200*18.94) / 100) + 227.47 = (62680 + 41668)/100 + 227.47 = 1043.48 + 227.47 = 1270.95
        // Expected Elec Savings: 1421.05 - 1270.95 = 150.10

        const results = calculateSavings(data, defaultRates);
        expect(results.elecSavings).toBeCloseTo(150.10);
        expect(results.netSavings).toBeCloseTo(150.10);
    });

    test('calculates smart meter savings correctly (Single Fuel)', () => {
        const data = {
            fuelType: 'single',
            meterType: 'smart',
            inContract: false,
            elecSmartDayUsage: 2000,
            elecSmartNightUsage: 1500,
            elecSmartPeakUsage: 700,
            cElecSmartDayRate: 35.00,
            cElecSmartNightRate: 20.00,
            cElecSmartPeakRate: 40.00,
            cElecSmartStanding: 0.68
        };

        // Expected Current Cost: ((2000*35 + 1500*20 + 700*40) / 100) + (0.68 * 365) = 1280 + 248.20 = 1528.20
        // Expected Yuno Cost: ((2000*30.91 + 1500*18.91 + 700*33.54) / 100) + 216.30 = (61820 + 28365 + 23478)/100 + 216.30 = 1136.63 + 216.30 = 1352.93
        // Expected Elec Savings: 1528.20 - 1352.93 = 175.27

        const results = calculateSavings(data, defaultRates);
        expect(results.elecSavings).toBeCloseTo(175.27);
        expect(results.netSavings).toBeCloseTo(175.27);
    });

    test('calculates dual fuel savings correctly', () => {
        const data = {
            fuelType: 'dual',
            meterType: 'standard',
            inContract: false,
            elecStdUsage: 4200,
            cElecStdRate: 30.00,
            cElecStdStanding: 0.68,
            gasUsage: 11000,
            cGasRate: 10.00,
            cGasStanding: 0.41
        };

        // Elec Savings: 100.00 (from first test)
        // Expected Current Gas Cost: (11000 * 10 / 100) + (0.41 * 365) = 1100 + 149.65 = 1249.65
        // Expected Yuno Gas Cost: (11000 * 8.71 / 100) + 137.64 = 958.10 + 137.64 = 1095.74
        // Expected Gas Savings: 1249.65 - 1095.74 = 153.91
        // Total Savings: 100.00 + 153.91 = 253.91

        const results = calculateSavings(data, defaultRates);
        expect(results.elecSavings).toBeCloseTo(100.00);
        expect(results.gasSavings).toBeCloseTo(153.91);
        expect(results.netSavings).toBeCloseTo(253.91);
    });

    test('applies penalty when in contract', () => {
        const data = {
            fuelType: 'single',
            meterType: 'standard',
            inContract: true,
            elecStdUsage: 4200,
            cElecStdRate: 30.00,
            cElecStdStanding: 0.68
        };

        // Savings before penalty: 100.00
        // Penalty for single fuel: 50
        // Net: 50.00

        const results = calculateSavings(data, defaultRates);
        expect(results.penaltyAmount).toBe(50);
        expect(results.netSavings).toBeCloseTo(50.00);
    });

    test('applies dual fuel penalty when in contract', () => {
        const data = {
            fuelType: 'dual',
            meterType: 'standard',
            inContract: true,
            elecStdUsage: 4200,
            cElecStdRate: 30.00,
            cElecStdStanding: 0.68,
            gasUsage: 11000,
            cGasRate: 10.00,
            cGasStanding: 0.41
        };

        // Savings before penalty: 253.91
        // Penalty for dual fuel: 100
        // Net: 153.91

        const results = calculateSavings(data, defaultRates);
        expect(results.penaltyAmount).toBe(100);
        expect(results.netSavings).toBeCloseTo(153.91);
    });

    test('applies cashback', () => {
        const ratesWithCashback = { ...defaultRates, yunoElecStdCashback: 50 };
        const data = {
            fuelType: 'single',
            meterType: 'standard',
            inContract: false,
            elecStdUsage: 4200,
            cElecStdRate: 30.00,
            cElecStdStanding: 0.68
        };

        // Savings before cashback: 100.00
        // Net: 150.00

        const results = calculateSavings(data, ratesWithCashback);
        expect(results.cashbackAmount).toBe(50);
        expect(results.netSavings).toBeCloseTo(150.00);
    });
});

describe('sales rep settings helpers', () => {
    test('flags warning for very high unit rates', () => {
        const result = validateYunoValue(120, 'rate');
        expect(result.isWarning).toBe(true);
    });

    test('does not flag warning for valid cashback values', () => {
        const result = validateYunoValue(75, 'cashback');
        expect(result.isWarning).toBe(false);
    });

    test('builds a readable summary string', () => {
        const summary = buildSettingsSummary(DEFAULT_YUNO_SETTINGS, '2026-04-01');
        expect(summary).toContain('Std 28.74c');
        expect(summary).toContain('Effective 2026-04-01');
    });
});
