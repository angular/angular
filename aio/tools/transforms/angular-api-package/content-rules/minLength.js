module.exports = function createMinLengthRule(minLength) {
  minLength = minLength || 2;
  return (doc, prop, value) => {
    if (value.length < minLength) {
      return `Invalid "${prop}" property: "${value}". It must have at least ${minLength} characters.`;
    }
  };
};
