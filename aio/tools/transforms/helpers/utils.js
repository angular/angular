module.exports = {
  /**
   * Transform the values of an object via a mapper function
   * @param {Object} obj
   * @param {Function} mapper
   */
  mapObject(obj, mapper) {
    const mappedObj = {};
    Object.keys(obj).forEach(key => { mappedObj[key] = mapper(key, obj[key]); });
    return mappedObj;
  },

  /**
   * Parses the attributes from a string taken from an HTML element start tag
   * E.g. ` a="one" b="two" `
   * @param {string} str
   */
  parseAttributes(str) {
    const attrMap = {};
    let index = 0;

    skipSpace();

    while(index < str.length) {
      takeAttribute();
      skipSpace();
    }

    function takeAttribute() {
      const key = takeKey();
      skipSpace();
      if (tryEquals()) {
        skipSpace();
        const quote = tryQuote();
        attrMap[key] = takeValue(quote);
        // skip the closing quote or whitespace
        index++;
      } else {
        attrMap[key] = true;
      }
    }


    function skipSpace() {
      while(index < str.length && /\s/.test(str[index])) {
        index++;
      }
    }

    function tryEquals() {
      if (str[index] === '=') {
        index++;
        return true;
      }
    }

    function takeKey() {
      let startIndex = index;
      while(index < str.length && /[^\s=]/.test(str[index])) {
        index++;
      }
      return str.substring(startIndex, index);
    }

    function tryQuote() {
      const quote = str[index];
      if (['"', '\''].indexOf(quote) !== -1) {
        index++;
        return quote;
      }
    }

    function takeValue(quote) {
      let startIndex = index;

      if (quote) {
        while(index < str.length && str[index] !== quote) {
          index++;
        }
        if (index >= str.length) {
          throw new Error(`Unterminated quoted attribute value in \`${str}\`. Starting at ${startIndex}. Expected a ${quote} but got "end of string".`);
        }
      } else {
        while(index < str.length && /\S/.test(str[index])) {
          index++;
        }
      }
      return str.substring(startIndex, index);
    }

    return attrMap;
  },

  renderAttributes(attrMap) {
    return Object.keys(attrMap).map(key =>
      attrMap[key] === false ? '' :
      attrMap[key] === true ? ` ${key}` :
      ` ${key}="${attrMap[key].replace(/"/g, '&quot;')}"`).join('');
  }
};
