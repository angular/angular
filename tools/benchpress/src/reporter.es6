var vsprintf = require("sprintf-js").vsprintf;

var HEADER_SEPARATORS = ['----', '----', '----', '----'];
var FOOTER_SEPARATORS = ['====', '====', '====', '===='];

module.exports = {
  printHeading: printHeading,
  printTableHeader: printTableHeader,
  printTableFooter: printTableFooter,
  printRow: printRow
};

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