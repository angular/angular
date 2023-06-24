import XRegExp from 'xregexp';

// The `XRegExp` typings are not accurate.
interface XRegExp extends RegExp {
  xregexp: {captureNames?: string[]};
}

export class FirebaseRedirectSource {
  regex = XRegExp(this.pattern) as XRegExp;
  namedGroups: string[] = [];

  private constructor(public pattern: string, public restNamedGroups: string[] = []) {
    const restNamedGroupsSet = new Set(restNamedGroups);
    pattern.replace(/\(\?<([^>]+)>/g, (_, name) => {
      if (!restNamedGroupsSet.has(name)) {
        this.namedGroups.push(name);
      }
      return '';
    });
  }

  static fromGlobPattern(glob: string): FirebaseRedirectSource {
    const dot = /\./g;
    const star = /\*/g;
    const doubleStar = /(^|\/)\*\*($|\/)/g;             // e.g. a/**/b or **/b or a/** but not a**b
    const modifiedPatterns = /(.)\(([^)]+)\)/g;         // e.g. `@(a|b)
    const restParam = /(\/?):([A-Za-z]+)\*/g;           // e.g. `:rest*`
    const namedParam = /(\/?):([A-Za-z]+)/g;            // e.g. `:api`
    const possiblyEmptyInitialSegments = /^\.🐷\//g;  // e.g. `**/a` can also match `a`
    const possiblyEmptySegments = /\/\.🐷\//g;        // e.g. `a/**/b` can also match `a/b`
    const willBeStar = /🐷/g;                         // e.g. `a**b` not matched by previous rule

    try {
      const restNamedGroups: string[] = [];
      const pattern =
          glob.replace(dot, '\\.')
              .replace(modifiedPatterns, replaceModifiedPattern)
              .replace(
                  restParam,
                  (_, leadingSlash, groupName) => {
                    // capture the rest of the string
                    restNamedGroups.push(groupName);
                    return `(?:${leadingSlash}(?<${groupName}>.🐷))?`;
                  })
              .replace(namedParam, '$1(?<$2>[^/]+)')
              .replace(doubleStar, '$1.🐷$2')  // use the pig to avoid replacing ** in next rule
              .replace(star, '[^/]*')          // match a single segment
              .replace(possiblyEmptyInitialSegments, '(?:.*)')  // deal with **/ special cases
              .replace(possiblyEmptySegments, '(?:/|/.*/)')     // deal with /**/ special cases
              .replace(willBeStar, '*');                        // other ** matches

      return new FirebaseRedirectSource(`^${pattern}$`, restNamedGroups);
    } catch (err) {
      throw new Error(`Error in FirebaseRedirectSource: "${glob}" - ${(err as Error).message}`);
    }
  }

  static fromRegexPattern(regex: string): FirebaseRedirectSource {
    try {
      // NOTE:
      // Firebase redirect regexes use the [RE2 library](https://github.com/google/re2/wiki/Syntax),
      // which requires named capture groups to begin with `?P`. See
      // https://firebase.google.com/docs/hosting/full-config#capture-url-segments-for-redirects.

      if (/\(\?<[^>]+>/.test(regex)) {
        // Throw if the regex contains a non-RE2 named capture group.
        throw new Error(
            'The regular expression pattern contains a named capture group of the format ' +
            '`(?<name>...)`, which is not compatible with the RE2 library. Use `(?P<name>...)` ' +
            'instead.');
      }

      // Replace `(?P<...>` with just `(?<...>` to convert to `XRegExp`-compatible syntax for named
      // capture groups.
      return new FirebaseRedirectSource(regex.replace(/(\(\?)P(<[^>]+>)/g, '$1$2'));
    } catch (err) {
      throw new Error(`Error in FirebaseRedirectSource: "${regex}" - ${(err as Error).message}`);
    }
  }

  test(url: string): boolean {
    return XRegExp.test(url, this.regex);
  }

  match(url: string): {[key: string]: string}|undefined {
    const match = XRegExp.exec(url, this.regex) as ReturnType<typeof XRegExp.exec>;

    if (!match) {
      return undefined;
    }

    const result: {[key: string]: string} = {};
    const names = this.regex.xregexp.captureNames || [];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    names.forEach(name => result[name] = match.groups![name]);
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
