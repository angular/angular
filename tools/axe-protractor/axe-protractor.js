'use strict';

/**
 * Protractor Plugin to run axe-core accessibility audits after Angular bootstrapped.
 */

const AxeBuilder = require('axe-webdriverjs');
const {buildMessage} = require('./build-message');

/* List of pages which were already checked by axe-core and shouldn't run again */
const checkedPages = [];

/**
 * Protractor plugin hook which always runs when Angular successfully bootstrapped.
 */
function onPageStable() {
  AxeBuilder(browser.driver)
    .configure(this.config || {})
    .analyze(results => handleResults(this, results));
}

/**
 * Processes the axe-core results by reporting recognized violations
 * to Protractor and printing them out.
 * @param {!protractor.ProtractorPlugin} context
 * @param {!axe.AxeResults} results
 */
function handleResults(context, results) {

  if (checkedPages.indexOf(results.url) === -1) {

    checkedPages.push(results.url);

    results.violations.forEach(violation => {
      
      let specName = `${violation.help} (${results.url})`;
      let message = '\n' + buildMessage(violation);

      context.addFailure(message, {specName});

    });

  }

}

exports.name = 'protractor-axe';
exports.onPageStable = onPageStable;
