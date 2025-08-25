const VALIDATION_CONSTANTS = {
  MIN_YEAR: 2000,
  MAX_FUTURE_YEARS: 10,
  getCurrentMaxYear: () => new Date().getFullYear() + VALIDATION_CONSTANTS.MAX_FUTURE_YEARS
};

module.exports = {
  VALIDATION_CONSTANTS
};