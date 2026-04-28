const { calculateSavings } = require('./script.js');

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
            cElecStdStanding: 250.00 // Current standing
        };

        // Expected Current Cost: (4200 * 30 / 100) + 250 = 1260 + 250 = 1510
        // Expected Yuno Cost: (4200 * 28.74 / 100) + 201.12 = 1207.08 + 201.12 = 1408.20
        // Expected Elec Savings: 1510 - 1408.20 = 101.80
        // Net Savings: 101.80

        const results = calculateSavings(data, defaultRates);
        expect(results.elecSavings).toBeCloseTo(101.80);
        expect(results.gasSavings).toBe(0);
        expect(results.cashbackAmount).toBe(0);
        expect(results.penaltyAmount).toBe(0);
        expect(results.netSavings).toBeCloseTo(101.80);
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
            cElecDnStanding: 280.00
        };

        // Expected Current Cost: ((2000*35 + 2200*20) / 100) + 280 = (70000 + 44000)/100 + 280 = 1140 + 280 = 1420
        // Expected Yuno Cost: ((2000*31.34 + 2200*18.94) / 100) + 227.47 = (62680 + 41668)/100 + 227.47 = 1043.48 + 227.47 = 1270.95
        // Expected Elec Savings: 1420 - 1270.95 = 149.05

        const results = calculateSavings(data, defaultRates);
        expect(results.elecSavings).toBeCloseTo(149.05);
        expect(results.netSavings).toBeCloseTo(149.05);
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
            cElecSmartStanding: 250.00
        };

        // Expected Current Cost: ((2000*35 + 1500*20 + 700*40) / 100) + 250 = (70000 + 30000 + 28000)/100 + 250 = 1280 + 250 = 1530
        // Expected Yuno Cost: ((2000*30.91 + 1500*18.91 + 700*33.54) / 100) + 216.30 = (61820 + 28365 + 23478)/100 + 216.30 = 1136.63 + 216.30 = 1352.93
        // Expected Elec Savings: 1530 - 1352.93 = 177.07

        const results = calculateSavings(data, defaultRates);
        expect(results.elecSavings).toBeCloseTo(177.07);
        expect(results.netSavings).toBeCloseTo(177.07);
    });

    test('calculates dual fuel savings correctly', () => {
        const data = {
            fuelType: 'dual',
            meterType: 'standard',
            inContract: false,
            elecStdUsage: 4200,
            cElecStdRate: 30.00,
            cElecStdStanding: 250.00,
            gasUsage: 11000,
            cGasRate: 10.00,
            cGasStanding: 150.00
        };

        // Elec Savings: 101.80 (from first test)
        // Expected Current Gas Cost: (11000 * 10 / 100) + 150 = 1100 + 150 = 1250
        // Expected Yuno Gas Cost: (11000 * 8.71 / 100) + 137.64 = 958.10 + 137.64 = 1095.74
        // Expected Gas Savings: 1250 - 1095.74 = 154.26
        // Total Savings: 101.80 + 154.26 = 256.06

        const results = calculateSavings(data, defaultRates);
        expect(results.elecSavings).toBeCloseTo(101.80);
        expect(results.gasSavings).toBeCloseTo(154.26);
        expect(results.netSavings).toBeCloseTo(256.06);
    });

    test('applies penalty when in contract', () => {
        const data = {
            fuelType: 'single',
            meterType: 'standard',
            inContract: true,
            elecStdUsage: 4200,
            cElecStdRate: 30.00,
            cElecStdStanding: 250.00
        };

        // Savings before penalty: 101.80
        // Penalty for single fuel: 50
        // Net: 51.80

        const results = calculateSavings(data, defaultRates);
        expect(results.penaltyAmount).toBe(50);
        expect(results.netSavings).toBeCloseTo(51.80);
    });

    test('applies dual fuel penalty when in contract', () => {
        const data = {
            fuelType: 'dual',
            meterType: 'standard',
            inContract: true,
            elecStdUsage: 4200,
            cElecStdRate: 30.00,
            cElecStdStanding: 250.00,
            gasUsage: 11000,
            cGasRate: 10.00,
            cGasStanding: 150.00
        };

        // Savings before penalty: 256.06
        // Penalty for dual fuel: 100
        // Net: 156.06

        const results = calculateSavings(data, defaultRates);
        expect(results.penaltyAmount).toBe(100);
        expect(results.netSavings).toBeCloseTo(156.06);
    });

    test('applies cashback', () => {
        const ratesWithCashback = { ...defaultRates, yunoElecStdCashback: 50 };
        const data = {
            fuelType: 'single',
            meterType: 'standard',
            inContract: false,
            elecStdUsage: 4200,
            cElecStdRate: 30.00,
            cElecStdStanding: 250.00
        };

        // Savings before cashback: 101.80
        // Net: 151.80

        const results = calculateSavings(data, ratesWithCashback);
        expect(results.cashbackAmount).toBe(50);
        expect(results.netSavings).toBeCloseTo(151.80);
    });
});
