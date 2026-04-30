export const DEFAULT_YUNO_SETTINGS = Object.freeze({
  gasRate: 8.71,
  gasStanding: 137.64,
  elecStdRate: 28.74,
  elecStdStanding: 201.12,
  elecDnDayRate: 31.34,
  elecDnNightRate: 18.94,
  elecDnStanding: 227.47,
  elecSmartDayRate: 30.91,
  elecSmartNightRate: 18.91,
  elecSmartPeakRate: 33.54,
  elecSmartStanding: 216.30,
  // Cashback by fuel type: electricity-only vs dual fuel
  elecOnlyCashback: 20.00,
  dualFuelCashback: 60.00,
  dualFuelSmartCashback: 75.00,
})

export const NATIONAL_AVERAGES = Object.freeze({
  elecStd: 4200,
  elecDnDay: 2000,
  elecDnNight: 2200,
  elecSmartDay: 2000,
  elecSmartNight: 1500,
  elecSmartPeak: 700,
  gas: 11000,
})

export function calculateSavings({ config, currentRates, usage, yunoSettings }) {
  const { fuelType, inContract, meterType } = config

  let currentElecCost = 0
  let yunoElecCost = 0
  let cashbackAmount = 0

  if (meterType === 'standard') {
    currentElecCost = (usage.elecStd * currentRates.elecStdRate) / 100 + currentRates.elecStdStanding
    yunoElecCost = (usage.elecStd * yunoSettings.elecStdRate) / 100 + yunoSettings.elecStdStanding
  } else if (meterType === 'daynight') {
    currentElecCost =
      ((usage.elecDnDay * currentRates.elecDnDayRate + usage.elecDnNight * currentRates.elecDnNightRate) / 100) +
      currentRates.elecDnStanding
    yunoElecCost =
      ((usage.elecDnDay * yunoSettings.elecDnDayRate + usage.elecDnNight * yunoSettings.elecDnNightRate) / 100) +
      yunoSettings.elecDnStanding
  } else if (meterType === 'smart') {
    currentElecCost =
      ((usage.elecSmartDay * currentRates.elecSmartDayRate +
        usage.elecSmartNight * currentRates.elecSmartNightRate +
        usage.elecSmartPeak * currentRates.elecSmartPeakRate) /
        100) +
      currentRates.elecSmartStanding
    yunoElecCost =
      ((usage.elecSmartDay * yunoSettings.elecSmartDayRate +
        usage.elecSmartNight * yunoSettings.elecSmartNightRate +
        usage.elecSmartPeak * yunoSettings.elecSmartPeakRate) /
        100) +
      yunoSettings.elecSmartStanding
  }

  if (fuelType === 'single') {
    cashbackAmount = yunoSettings.elecOnlyCashback
  } else if (meterType === 'smart') {
    cashbackAmount = yunoSettings.dualFuelSmartCashback
  } else {
    cashbackAmount = yunoSettings.dualFuelCashback
  }

  const elecSavings = currentElecCost - yunoElecCost

  let gasSavings = 0
  if (fuelType === 'dual') {
    const currentGasCost = (usage.gas * currentRates.gasRate) / 100 + currentRates.gasStanding
    const yunoGasCost = (usage.gas * yunoSettings.gasRate) / 100 + yunoSettings.gasStanding
    gasSavings = currentGasCost - yunoGasCost
  }

  const penaltyAmount = inContract ? (fuelType === 'dual' ? 100 : 50) : 0
  const netSavings = elecSavings + gasSavings + cashbackAmount - penaltyAmount

  return { elecSavings, gasSavings, cashbackAmount, penaltyAmount, netSavings }
}
