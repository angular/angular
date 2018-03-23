import { Injectable } from '@angular/core';

import { from as fromPromise, Observable } from 'rxjs';
import { first, map, share } from 'rxjs/operators';

import { Logger } from 'app/shared/logger.service';

declare const System: {
  import(name: string): Promise<any>;
};

type PrettyPrintOne = (code: string, language?: string, linenums?: number | boolean) => string;

/**
 * Wrapper around the prettify.js library
 */
@Injectable()
export class PrettyPrinter {

  private prettyPrintOne: Observable<PrettyPrintOne>;

  constructor(private logger: Logger) {
    this.prettyPrintOne = fromPromise(this.getPrettyPrintOne()).pipe(share());
  }

  private getPrettyPrintOne(): Promise<PrettyPrintOne> {
    const ppo = (window as any)['prettyPrintOne'];
    return ppo ? Promise.resolve(ppo) :
      // prettify.js is not in window global; load it with webpack loader
      System.import('assets/js/prettify.js')
        .then(
          () => (window as any)['prettyPrintOne'],
          err => {
            const msg = `Cannot get prettify.js from server: ${err.message}`;
            this.logger.error(new Error(msg));
            // return a pretty print fn that always fails.
            return () => { throw new Error(msg); };
          });
  }

  /**
   * Format code snippet as HTML
   * @param {string} code - the code snippet to format; should already be HTML encoded
   * @param {string} [language] - The language of the code to render (could be javascript, html, typescript, etc)
   * @param {string|number} [linenums] - Whether to display line numbers:
   *  - false: don't display
   *  - true: do display
   *  - number: do display but start at the given number
   * @returns Observable<string> - Observable of formatted code
   */
  formatCode(code: string, language?: string, linenums?: number | boolean) {
    return this.prettyPrintOne.pipe(
      map(ppo => {
        try {
          return ppo(code, language, linenums);
        } catch (err) {
          const msg = `Could not format code that begins '${code.substr(0, 50)}...'.`;
          console.error(msg, err);
          throw new Error(msg);
        }
      }),
      first(),  // complete immediately
    );
  }
}
