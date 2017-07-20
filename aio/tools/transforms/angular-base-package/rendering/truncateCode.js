module.exports = function() {
  return {
    name: 'truncateCode',
    process: function(str, lines) {
      if (lines === undefined) return str;

      const parts = str && str.split && str.split(/\r?\n/);
      if (parts && parts.length > lines) {
        return balance(parts[0] + '...', ['{', '(', '['], ['}', ')', ']']);
      } else {
        return str;
      }
    }
  };
};

/**
 * Try to balance the brackets by adding closers on to the end of a string
 * for every bracket that is left open.
 * The chars at each index in the openers and closers should match (i.e openers = ['{', '('], closers = ['}', ')'])
 *
 * @param {string} str The string to balance
 * @param {string[]} openers an array of chars that open a bracket
 * @param {string[]} closers an array of chars that close a brack
 * @returns the balanced string
 */
function balance(str, openers, closers) {
  const stack = [];

  // Add each open bracket to the stack, removing them when there is a matching closer
  str.split('').forEach(function(char) {
    const closerIndex = closers.indexOf(char);
    if (closerIndex !== -1 && stack[stack.length-1] === closerIndex) {
      stack.pop();
    } else {
      const openerIndex = openers.indexOf(char);
      if (openerIndex !== -1) {
        stack.push(openerIndex);
      }
    }
  });

  // Now the stack should contain all the unclosed brackets
  while(stack.length) {
    str += closers[stack.pop()];
  }

  return str;
}