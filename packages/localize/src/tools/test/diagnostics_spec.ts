/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Diagnostics} from '../src/diagnostics';

describe('Diagnostics', () => {
  describe('formatDiagnostics', () => {
    it('should just return the message passed in if there are no errors nor warnings', () => {
      const diagnostics = new Diagnostics();
      expect(diagnostics.formatDiagnostics('This is a message')).toEqual('This is a message');
    });

    it('should return a string with all the errors listed', () => {
      const diagnostics = new Diagnostics();
      diagnostics.error('Error 1');
      diagnostics.error('Error 2');
      diagnostics.error('Error 3');
      expect(diagnostics.formatDiagnostics('This is a message'))
          .toEqual('This is a message\nERRORS:\n - Error 1\n - Error 2\n - Error 3');
    });

    it('should return a string with all the warnings listed', () => {
      const diagnostics = new Diagnostics();
      diagnostics.warn('Warning 1');
      diagnostics.warn('Warning 2');
      diagnostics.warn('Warning 3');
      expect(diagnostics.formatDiagnostics('This is a message'))
          .toEqual('This is a message\nWARNINGS:\n - Warning 1\n - Warning 2\n - Warning 3');
    });

    it('should return a string with all the errors and warnings listed', () => {
      const diagnostics = new Diagnostics();
      diagnostics.warn('Warning 1');
      diagnostics.warn('Warning 2');
      diagnostics.error('Error 1');
      diagnostics.error('Error 2');
      diagnostics.warn('Warning 3');
      diagnostics.error('Error 3');
      expect(diagnostics.formatDiagnostics('This is a message'))
          .toEqual(
              'This is a message\nERRORS:\n - Error 1\n - Error 2\n - Error 3\nWARNINGS:\n - Warning 1\n - Warning 2\n - Warning 3');
    });
  });
});
