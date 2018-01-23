import * as XRegExp from 'xregexp';

const questionExpr = /\?([^(])/g;
const catchAllNamedMatchExpr = /\/:([A-Za-z]+)\*/g
const namedMatchExpr = /\/:([A-Za-z]+)([^/]*)/g
const wildcardSegmentExpr = /(^\/).🐷\//;

export class FirebaseGlob {
  pattern: string;
  regex: XRegExp;
  constructor(glob: string) {
    const pattern = glob
        .replace('.', '\\.')
        .replace(questionExpr, '[^/]$1')
        .replace(catchAllNamedMatchExpr, '/(?<$1>.+)')
        .replace(namedMatchExpr, '/(?<$1>[^/]+)$2')
        .replace('**', '.🐷')
        .replace('*', '[^/]*')
        .replace(wildcardSegmentExpr, '(?:$1|/.*/)')
        .replace('.🐷', '.*');
    this.pattern = `^${pattern}$`;
    this.regex = XRegExp(this.pattern);
  }

  test(url: string) {
    return XRegExp.test(url, this.regex);
  }

  match(url: string) {
    const match = XRegExp.exec(url, this.regex);
    if (match) {
      const result = {};
      const names = (this.regex as any).xregexp.captureNames || [];
      names.forEach(name => result[name] = match[name]);
      return result;
    }
  }
}
