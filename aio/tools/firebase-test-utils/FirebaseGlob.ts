import * as XRegExp from 'xregexp';

// The `XRegExp` typings are not accurate.
interface XRegExp extends RegExp {
  xregexp: { captureNames?: string[] };
}

const dot = /\./g;
const star = /\*/g;
const doubleStar = /(^|\/)\*\*($|\/)/g;           // e.g. a/**/b or **/b or a/** but not a**b
const modifiedPatterns = /(.)\(([^)]+)\)/g;       // e.g. `@(a|b)
const restParam = /\/:([A-Za-z]+)\*/g;            // e.g. `:rest*`
const namedParam = /\/:([A-Za-z]+)/g;             // e.g. `:api`
const possiblyEmptyInitialSegments = /^\.🐷\//g;  // e.g. `**/a` can also match `a`
const possiblyEmptySegments = /\/\.🐷\//g;        // e.g. `a/**/b` can also match `a/b`
const willBeStar = /🐷/g;                         // e.g. `a**b` not matched by previous rule

export class FirebaseGlob {
  pattern: string;
  regex: XRegExp;
  namedParams: { [key: string]: boolean } = {};
  restParams: { [key: string]: boolean } = {};
  constructor(glob: string) {
    try {
      const pattern = glob
          .replace(dot, '\\.')
          .replace(modifiedPatterns, replaceModifiedPattern)
          .replace(restParam, (_, param) => {
            // capture the rest of the string
            this.restParams[param] = true;
            return `(?:/(?<${param}>.🐷))?`;
          })
          .replace(namedParam, (_, param) => {
            // capture the named parameter
            this.namedParams[param] = true;
            return `/(?<${param}>[^/]+)`;
          })
          .replace(doubleStar, '$1.🐷$2')                 // use the pig to avoid replacing ** in next rule
          .replace(star, '[^/]*')                         // match a single segment
          .replace(possiblyEmptyInitialSegments, '(?:.*)')// deal with **/ special cases
          .replace(possiblyEmptySegments, '(?:/|/.*/)')   // deal with /**/ special cases
          .replace(willBeStar, '*');                      // other ** matches
      this.pattern = `^${pattern}$`;
      this.regex = XRegExp(this.pattern) as XRegExp;
    } catch (e) {
      throw new Error(`Error in FirebaseGlob: "${glob}" - ${e.message}`);
    }
  }

  test(url: string): boolean {
    return XRegExp.test(url, this.regex);
  }

  match(url: string): { [key: string]: string } | undefined {
    const match = XRegExp.exec(url, this.regex) as ReturnType<typeof XRegExp.exec> & { [captured: string]: string };

    if (!match) {
      return undefined;
    }

    const result: { [key: string]: string } = {};
    const names = this.regex.xregexp.captureNames || [];
    names.forEach(name => result[name] = (match[name]));
    return result;
  }
}

function replaceModifiedPattern(_: string, modifier: string, pattern: string) {
  switch (modifier) {
    case '!':
      throw new Error(`"not" expansions are not supported: "${_}"`);
    case '?':
    case '+':
      return `(${pattern})${modifier}`;
    case '*':
      return `(${pattern})🐷`;  // it will become a star
    case '@':
      return `(${pattern})`;
    default:
      throw new Error(`unknown expansion type: "${modifier}" in "${_}"`);
  }
}
