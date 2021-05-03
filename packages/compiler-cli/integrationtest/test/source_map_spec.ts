/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './init';
import {BindingErrorComp} from '../src/errors';
import {createComponent} from './util';

// TODO(tbosch): source maps does not currently work with the transformer pipeline
xdescribe('source maps', () => {
  it('should report source location for binding errors', () => {
    const comp = createComponent(BindingErrorComp);
    let error: any;
    try {
      comp.detectChanges();
    } catch (e) {
      error = e;
    }
    const sourcePosition = getSourcePositionForStack(error.stack);
    expect(sourcePosition.line).toBe(2);
    expect(sourcePosition.column).toBe(13);
    expect(sourcePosition.source.endsWith('errors.html')).toBe(true);
  });
});

function getSourcePositionForStack(stack: string): {source: string, line: number, column: number} {
  const htmlLocations = stack
                            .split('\n')
                            // e.g. at View_MyComp_0 (...html:153:40)
                            .map(line => /\((.*\.html):(\d+):(\d+)/.exec(line)!)
                            .filter(match => !!match)
                            .map(match => ({
                                   source: match[1],
                                   line: parseInt(match[2], 10),
                                   column: parseInt(match[3], 10)
                                 }));
  return htmlLocations[0];
}
