import * as XRegExp from 'xregexp';
import { FirebaseGlob } from './FirebaseGlob';

export class FirebaseRedirect {
  glob = new FirebaseGlob(this.source);
  constructor(public source: string, public destination: string) {}

  replace(url: string) {
    const match = this.glob.match(url);
    if (match) {
      const replacers = Object.keys(match).map(name => [ XRegExp(`:${name}`, 'g'), match[name] ]);
      return XRegExp.replaceEach(this.destination, replacers);
    }
  }
}
