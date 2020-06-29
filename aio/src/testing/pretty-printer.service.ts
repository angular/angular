// The actual `PrettyPrinter` service has to load `prettify.js`, which (a) is slow and (b) pollutes
// the global `window` object (which in turn may affect other tests).
// This is a mock implementation that does not load `prettify.js` and does not pollute the global
// scope.

import { of } from 'rxjs';

export class MockPrettyPrinter {
  formatCode(code: string, language?: string, linenums?: number | boolean) {
    const linenumsStr = (linenums === undefined) ? '' : `, linenums: ${linenums}`;
    return of(`Formatted code (language: ${language || 'auto'}${linenumsStr}): ${code}`);
  }
}
