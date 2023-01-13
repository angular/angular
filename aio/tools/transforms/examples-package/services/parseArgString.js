/**
 * @dgService parseArgString
 * @description
 * processes an arg string in 'almost' the same fashion that the command processor does
 * and returns an args object in yargs format.
 * @kind function
 * @param  {String} str   The arg string to process
 * @return {Object} The args parsed into a yargs format.
 */

module.exports = function parseArgString() {

  return function parseArgStringImpl(str) {
    // regex from npm string-argv
    //[^\s'"] Match if not a space ' or "

    //+|['] or Match '
    //([^']*) Match anything that is not '
    //['] Close match if '

    //+|["] or Match "
    //([^"]*) Match anything that is not "
    //["] Close match if "
    var rx = /[^\s'"]+|[']([^']*?)[']|["]([^"]*?)["]/gi;
    var value = str;
    var unnammedArgs = [];
    var args = {_: unnammedArgs};
    var match, key;
    do {
      // Each call to exec returns the next regex match as an array
      match = rx.exec(value);
      if (match !== null) {
        // Index 1 in the array is the captured group if it exists
        // Index 0 is the matched text, which we use if no captured group exists
        var arg = match[2] ? match[2] : (match[1] ? match[1] : match[0]);
        if (key) {
          args[key] = arg;
          key = null;
        } else {
          if (arg.slice(-1) === '=') {
            key = arg.slice(0, -1);
            // remove leading '-' (or '--') if it exists.
            if (key.slice(0, 1) == '-') {
              key = key.slice(1);
            }
            if (key.slice(0, 1) == '-') {
              key = key.slice(1);
            }
          } else {
            unnammedArgs.push(arg);
            key = null;
          }
        }
      }
    } while (match !== null);
    return args;
  };
};
