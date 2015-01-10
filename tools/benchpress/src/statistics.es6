module.exports = {
  calculateCoefficientOfVariation: calculateCoefficientOfVariation,
  calculateMean: calculateMean,
  calculateStandardDeviation: calculateStandardDeviation,
  getRegressionSlope: getRegressionSlope
};

function calculateCoefficientOfVariation(sample, mean) {
  return calculateStandardDeviation(sample, mean) / mean * 100;
}

function calculateMean(sample) {
  var total = 0;
  sample.forEach(function(x) { total += x; });
  return total / sample.length;
}

function calculateStandardDeviation(sample, mean) {
  var deviation = 0;
  sample.forEach(function(x) {
    deviation += Math.pow(x - mean, 2);
  });
  deviation = deviation / (sample.length);
  deviation = Math.sqrt(deviation);
  return deviation;
}

function getRegressionSlope(xValues, xMean, yValues, yMean) {
  // See http://en.wikipedia.org/wiki/Simple_linear_regression
  var dividendSum = 0;
  var divisorSum = 0;
  for (var i=0; i<xValues.length; i++) {
    dividendSum += (xValues[i] - xMean) * (yValues[i] - yMean);
    divisorSum += Math.pow(xValues[i] - xMean, 2);
  }
  return dividendSum / divisorSum;
}