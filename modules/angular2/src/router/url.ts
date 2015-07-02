import {RegExpWrapper, StringWrapper} from 'angular2/src/facade/lang';

var specialCharacters = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];

var escapeRe = RegExpWrapper.create('(\\' + specialCharacters.join('|\\') + ')', 'g');

export function escapeRegex(string: string): string {
  return StringWrapper.replaceAllMapped(string, escapeRe, (match) => { return "\\" + match; });
}
