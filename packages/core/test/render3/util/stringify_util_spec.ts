/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵsetClassDebugInfo, ɵɵdefineComponent} from '../../../src/render3';
import {debugStringifyTypeForError} from '../../../src/render3/util/stringify_utils';

describe('stringify utils', () => {
  describe('stringifyTypeForError util', () => {
    it('should include the file path and line number for component if debug info includes them', () => {
      class Comp {
        static ɵcmp = ɵɵdefineComponent({type: Comp, decls: 0, vars: 0, template: () => ''});
      }
      ɵsetClassDebugInfo(Comp, {
        className: 'Comp',
        filePath: 'comp.ts',
        lineNumber: 11,
      });

      expect(debugStringifyTypeForError(Comp)).toBe('Comp (at comp.ts:11)');
    });

    it('should include only the class name if debug info does not contain file path', () => {
      class Comp {
        static ɵcmp = ɵɵdefineComponent({type: Comp, decls: 0, vars: 0, template: () => ''});
      }
      ɵsetClassDebugInfo(Comp, {
        className: 'Comp',
        lineNumber: 11,
      });

      expect(debugStringifyTypeForError(Comp)).toBe('Comp');
    });

    it('should default to showing just the class name for component if debug info is not available', () => {
      class Comp {
        static ɵcmp = ɵɵdefineComponent({type: Comp, decls: 0, vars: 0, template: () => ''});
      }

      expect(debugStringifyTypeForError(Comp)).toBe('Comp');
    });
  });
});
