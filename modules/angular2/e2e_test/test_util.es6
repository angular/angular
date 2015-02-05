var benchpress = require('../../../tools/benchpress/index.js');

module.exports = {
  verifyNoBrowserErrors: benchpress.verifyNoBrowserErrors,
  clickAll: clickAll
};

function clickAll(buttonSelectors) {
  buttonSelectors.forEach(function(selector) {
    $(selector).click();
  });
}
