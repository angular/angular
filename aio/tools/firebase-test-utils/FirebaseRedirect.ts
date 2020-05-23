import * as XRegExp from 'xregexp';
import { FirebaseGlob } from './FirebaseGlob';

export class FirebaseRedirect {
  glob = new FirebaseGlob(this.source);
  constructor(public source: string, public destination: string) {}

  replace(url: string): string | undefined {
    const match = this.glob.match(url);

    if (!match) {
      return undefined;
    }

    const paramReplacers = Object.keys(this.glob.namedParams).map(name => [ XRegExp(`:${name}`, 'g'), match[name] ]);
    const restReplacers = Object.keys(this.glob.restParams).map(name => [ XRegExp(`:${name}\\*`, 'g'), match[name] ]);
    return XRegExp.replaceEach(this.destination, [...paramReplacers, ...restReplacers]);
  }
}
