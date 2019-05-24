/**
 * A factory for creating a rule for the `checkContentRules` processor, which disallows markdown
 * headings in a content property.
 *
 * @param {...number|string} disallowedHeadings
 * Each parameter identifies heading levels that are not allowed. They can be in the form of:
 *
 * - a number (e.g. 1), which implies that the specified heading is not allowed
 * - a range (e.g. '2,3'), which implies the range of headings that are not allowed
 *
 * (A range can be open ended on the upper bound by not specifying a value after the comma.)
 *
 * @example
 * To create a rule that will only allow level 3 headings:
 *
 * ```
 * const rule = createNoMarkdownHeadingRule(1, 2, '4,');
 * ```
 *
 */
module.exports = function createrNoMarkdownHeadingRule() {
  const args = Array.prototype.slice.apply(arguments);
  const disallowedHeadings = args.map(arg => `#{${arg}}`);
  if (!disallowedHeadings.length) {
    disallowedHeadings.push('#{1,}');
  }
  const regex = new RegExp(`^ {0,3}(${disallowedHeadings.join('|')}) +.*$`, 'mg');
  return (doc, prop, value) => {
    let match, matches = [];
    while(match = regex.exec(value)) { // eslint-disable-line no-cond-assign
      matches.push(match[0]);
    }
    if (matches.length) {
      const list = listify(matches.map(match => `"${match}"`));
      return `Invalid headings found in "${prop}" property: ${list}.`;
    }
  };
};


/**
 * Convert an array of strings in to a human list - e.g separated by commas and the word `and`.
 * @param {string[]} values The strings to convert to a list
 */
function listify(values) {
  if (values.length <= 1) return values;
  const last = values[values.length - 1];
  const rest = values.slice(0, values.length - 1);
  return [rest.join(', '), last].join(' and ');
}