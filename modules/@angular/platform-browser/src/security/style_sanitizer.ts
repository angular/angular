/**
 * Regular expression for safe style values.
 *
 * Quotes (" and ') are allowed, but a check must be done elsewhere to ensure
 * they're balanced.
 *
 * ',' allows multiple values to be assigned to the same property
 * (e.g. background-attachment or font-family) and hence could allow
 * multiple values to get injected, but that should pose no risk of XSS.
 *
 * The rgb() and rgba() expression checks only for XSS safety, not for CSS
 * validity.
 *
 * This regular expression was taken from the Closure sanitization library.
 */
const SAFE_STYLE_VALUE = /^([-,."'%_!# a-zA-Z0-9]+|(?:rgb|hsl)a?\([0-9.%, ]+\))$/;

/**
 * Checks that quotes (" and ') are properly balanced inside a string. Assumes
 * that neither escape (\) nor any other character that could result in
 * breaking out of a string parsing context are allowed;
 * see http://www.w3.org/TR/css3-syntax/#string-token-diagram.
 *
 * This code was taken from the Closure sanitization library.
 */
function hasBalancedQuotes(value: string) {
  let outsideSingle = true;
  let outsideDouble = true;
  for (let i = 0; i < value.length; i++) {
    let c = value.charAt(i);
    if (c === '\'' && outsideDouble) {
      outsideSingle = !outsideSingle;
    } else if (c === '"' && outsideSingle) {
      outsideDouble = !outsideDouble;
    }
  }
  return outsideSingle && outsideDouble;
}

export function sanitizeStyle(value: string): string {
  if (String(value).match(SAFE_STYLE_VALUE) && hasBalancedQuotes(value)) return value;
  return 'unsafe';
}
