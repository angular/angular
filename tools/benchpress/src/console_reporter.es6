var vsprintf = require("sprintf-js").vsprintf;
var statistics = require("./statistics");

var HEADER_SEPARATORS = ['----', '----', '----', '----', '----', '----', '----'];
var FOOTER_SEPARATORS = ['====', '====', '====', '====', '====', '====', '===='];

class ConsoleReporter {
  constructor(config) {
    this.config = config;
    this.rowFormat = ['%12s'].concat(config.metrics.map(function() {
      return '%12s';
    })).join(' | ');
  }
  begin() {
    printHeading('BENCHMARK '+this.config.id);
    console.log('sample size', this.config.sampleSize);
    console.log('run id', this.config.runId);
    console.log('params', JSON.stringify(this.config.params, null, '  '));
    printTableHeader(this.rowFormat, ['index', 'forceGc'].concat(this.config.metrics));
  }
  add(data) {
    var values = data.values;
    var index = data.index;
    printRow(this.rowFormat, ['#' + index, data.forceGc]
      .concat(formatValues(values))
    );
  }
  end(stableSample) {
    printTableFooter(this.rowFormat, [this.config.id, '']
      .concat(formatSample(stableSample, this.config.metrics)));
  }
}

function formatValues(values) {
  return values.map(function(val) {
    if (typeof val === 'number') {
      return val.toFixed(2);
    } else {
      return val;
    }
  });
}

function formatSample(sample, metrics) {
  return metrics.map(function(_, metricIndex) {
    var metricSample = sample.map(function(row) {
      return row.values[metricIndex];
    });
    var mean = statistics.calculateMean(metricSample);
    var coefficientOfVariation = statistics.calculateCoefficientOfVariation(metricSample, mean);
    return mean.toFixed(2) + '\u00B1' + coefficientOfVariation.toFixed(0)+ '%';
  });
}

function printHeading(title) {
  console.log('\n');
  console.log('## '+title);
}

function printTableHeader(format, values) {
  printRow(format, values);
  // TODO(tbosch): generate separators dynamically based on the format!
  printRow(format, HEADER_SEPARATORS);
}

function printTableFooter(format, values) {
  // TODO(tbosch): generate separators dynamically based on the format!
  printRow(format, FOOTER_SEPARATORS);
  printRow(format, values);
}

function printRow(format, values) {
  console.log(vsprintf(format, values));
}

module.exports = ConsoleReporter;
