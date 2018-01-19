// tslint:disable:file-header

/**
 * Like JSON.stringify, but without double quotes around keys, and without null instead of undefined
 * values
 * Based on https://github.com/json5/json5/blob/master/lib/json5.js
 */
module.exports.stringify = function(obj, replacer, space) {
  if (replacer && (typeof(replacer) !== 'function' && !isArray(replacer))) {
    throw new Error('Replacer must be a function or an array');
  }
  var getReplacedValueOrUndefined = function(holder, key, isTopLevel) {
    var value = holder[key];

    // Replace the value with its toJSON value first, if possible
    if (value && value.toJSON && typeof value.toJSON === 'function') {
      value = value.toJSON();
    }

    // If the user-supplied replacer if a function, call it. If it's an array, check objects' string
    // keys for
    // presence in the array (removing the key/value pair from the resulting JSON if the key is
    // missing).
    if (typeof(replacer) === 'function') {
      return replacer.call(holder, key, value);
    } else if (replacer) {
      if (isTopLevel || isArray(holder) || replacer.indexOf(key) >= 0) {
        return value;
      } else {
        return undefined;
      }
    } else {
      return value;
    }
  };

  function isWordChar(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') ||
        c === '_' || c === '$';
  }

  function isWordStart(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c === '$';
  }

  function isWord(key) {
    if (typeof key !== 'string') {
      return false;
    }
    if (!isWordStart(key[0])) {
      return false;
    }
    var i = 1, length = key.length;
    while (i < length) {
      if (!isWordChar(key[i])) {
        return false;
      }
      i++;
    }
    return true;
  }

  // polyfills
  function isArray(obj) {
    if (Array.isArray) {
      return Array.isArray(obj);
    } else {
      return Object.prototype.toString.call(obj) === '[object Array]';
    }
  }

  function isDate(obj) { return Object.prototype.toString.call(obj) === '[object Date]'; }

  var objStack = [];
  function checkForCircular(obj) {
    for (var i = 0; i < objStack.length; i++) {
      if (objStack[i] === obj) {
        throw new TypeError('Converting circular structure to JSON');
      }
    }
  }

  function makeIndent(str, num, noNewLine) {
    if (!str) {
      return '';
    }
    // indentation no more than 10 chars
    if (str.length > 10) {
      str = str.substring(0, 10);
    }

    var indent = noNewLine ? '' : '\n';
    for (var i = 0; i < num; i++) {
      indent += str;
    }

    return indent;
  }

  var indentStr;
  if (space) {
    if (typeof space === 'string') {
      indentStr = space;
    } else if (typeof space === 'number' && space >= 0) {
      indentStr = makeIndent(' ', space, true);
    } else {
      // ignore space parameter
    }
  }

  // Copied from Crokford's implementation of JSON
  // See
  // https://github.com/douglascrockford/JSON-js/blob/e39db4b7e6249f04a195e7dd0840e610cc9e941e/json2.js#L195
  // Begin
  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    meta = { // table of character substitutions
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"' : '\\"',
      '\\': '\\\\'
    };
  function escapeString(str) {
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    escapable.lastIndex = 0;
    return escapable.test(str) ? '"' + str.replace(escapable, function(a) {
      var c = meta[a];
      return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + str + '"';
  }
  // End

  function internalStringify(holder, key, isTopLevel) {
    var buffer, res;

    // Replace the value, if necessary
    var obj_part = getReplacedValueOrUndefined(holder, key, isTopLevel);

    if (obj_part && !isDate(obj_part)) {
      // unbox objects
      // don't unbox dates, since will turn it into number
      obj_part = obj_part.valueOf();
    }
    switch (typeof obj_part) {
      case 'boolean':
        return obj_part.toString();

      case 'number':
        if (isNaN(obj_part) || !isFinite(obj_part)) {
          return 'null';
        }
        return obj_part.toString();

      case 'string':
        return escapeString(obj_part.toString());

      case 'object':
        if (obj_part === null) {
          return 'null';
        } else if (isArray(obj_part)) {
          checkForCircular(obj_part);
          buffer = '[';
          objStack.push(obj_part);

          for (var i = 0; i < obj_part.length; i++) {
            res = internalStringify(obj_part, i, false);
            buffer += makeIndent(indentStr, objStack.length);
            if (res === null) {
              buffer += 'null';
            } else if (typeof res === 'undefined') {  // modified to support empty array values
              buffer += '';
            } else {
              buffer += res;
            }
            if (i < obj_part.length - 1) {
              buffer += ',';
            } else if (indentStr) {
              buffer += '\n';
            }
          }
          objStack.pop();
          if (obj_part.length) {
            buffer += makeIndent(indentStr, objStack.length, true);
          }
          buffer += ']';
        } else {
          checkForCircular(obj_part);
          buffer = '{';
          var nonEmpty = false;
          objStack.push(obj_part);
          for (var prop in obj_part) {
            if (obj_part.hasOwnProperty(prop)) {
              var value = internalStringify(obj_part, prop, false);
              isTopLevel = false;
              if (typeof value !== 'undefined' && value !== null) {
                buffer += makeIndent(indentStr, objStack.length);
                nonEmpty = true;
                key = isWord(prop) ? prop : escapeString(prop);
                buffer += key + ':' + (indentStr ? ' ' : '') + value + ',';
              }
            }
          }
          objStack.pop();
          if (nonEmpty) {
            buffer = buffer.substring(0, buffer.length - 1) +
                makeIndent(indentStr, objStack.length) + '}';
          } else {
            buffer = '{}';
          }
        }
        return buffer;
      default:
        // functions and undefined should be ignored
        return undefined;
    }
  }

  // special case...when undefined is used inside of
  // a compound object/array, return null.
  // but when top-level, return undefined
  var topLevelHolder = {'': obj};
  if (obj === undefined) {
    return getReplacedValueOrUndefined(topLevelHolder, '', true);
  }
  return internalStringify(topLevelHolder, '', true);
};
