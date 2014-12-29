module.exports = {
  createObjectStatsAggregator: createObjectStatsAggregator,
  calculateCoefficientOfVariation: calculateCoefficientOfVariation,
  calculateMean: calculateMean,
  calculateStandardDeviation: calculateStandardDeviation
};

function createObjectStatsAggregator(sampleSize) {
  var propSamples = {};
  var lastResult;
  return addData;

  function addData(data) {
    lastResult = {};
    for (var prop in data) {
      var samples = propSamples[prop];
      if (!samples) {
        samples = propSamples[prop] = [];
      }
      samples.push(data[prop]);
      samples.splice(0, samples.length - sampleSize);
      var mean = calculateMean(samples);
      lastResult[prop] = {
        mean: mean,
        coefficientOfVariation: calculateCoefficientOfVariation(samples, mean),
        count: samples.length
      };
    }
    addData.current = lastResult;
    return lastResult;
  }
}

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