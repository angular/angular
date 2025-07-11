// Apply LZW-compression to a string and return base64 compressed string.
export function zip(s: string): string {
  try {
    var dict: Record<string, number> = {};
    var data = (s + '').split('');
    var out: any[] = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i = 1; i < data.length; i++) {
      currChar = data[i];
      if (dict[phrase + currChar] != null) {
        phrase += currChar;
      } else {
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        dict[phrase + currChar] = code;
        code++;
        phrase = currChar;
      }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var j = 0; j < out.length; j++) {
      out[j] = String.fromCharCode(out[j]);
    }
    return utoa(out.join(''));
  } catch (e) {
    console.log('Failed to zip string return empty string', e);
    return '';
  }
}

// Decompress an LZW-encoded base64 string
export function unzip(base64ZippedString: string) {
  try {
    var s = atou(base64ZippedString);
    var dict: Record<string, string> = {};
    var data = (s + '').split('');
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 256;
    var phrase;
    for (var i = 1; i < data.length; i++) {
      var currCode = data[i].charCodeAt(0);
      if (currCode < 256) {
        phrase = data[i];
      } else {
        phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar;
      }
      out.push(phrase);
      currChar = phrase.charAt(0);
      dict[code] = oldPhrase + currChar;
      code++;
      oldPhrase = phrase;
    }
    return out.join('');
  } catch (e) {
    console.log('Failed to unzip string return empty string', e);
    return '';
  }
}

// ucs-2 string to base64 encoded ascii
function utoa(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}
// base64 encoded ascii to ucs-2 string
function atou(str: string): string {
  return decodeURIComponent(escape(atob(str)));
}
