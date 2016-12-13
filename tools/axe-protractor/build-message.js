/**
 * Builds a simple message of the violation results of axe-core by listing
 * each violation and the associated element selector in a new line.
 * @param {!axe.Violation} violation
 */
exports.buildMessage = violation => {

  let selectors = violation.nodes.map(node => {
    return node.target.join(' ');
  });

  return selectors.reduce((content, selector) => {
    return content + '- ' + selector + '\n';
  }, '');

};