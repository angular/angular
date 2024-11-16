/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {extractIcuPlaceholders} from '../../../src/extract/translation_files/icu_parsing';

describe('extractIcuPlaceholders()', () => {
  it('should return a single string if there is no ICU', () => {
    expect(extractIcuPlaceholders('')).toEqual(['']);
    expect(extractIcuPlaceholders('some text')).toEqual(['some text']);
    expect(extractIcuPlaceholders('some } text')).toEqual(['some } text']);
    expect(extractIcuPlaceholders('this is {not an ICU}')).toEqual(['this is {not an ICU}']);
  });

  it('should return a single string if there are no ICU placeholders', () => {
    expect(
      extractIcuPlaceholders('{VAR_PLURAL, plural, one {SOME} few {FEW} other {OTHER}}'),
    ).toEqual(['{VAR_PLURAL, plural, one {SOME} few {FEW} other {OTHER}}']);
    expect(
      extractIcuPlaceholders('{VAR_SELECT, select, male {HE} female {SHE} other {XE}}'),
    ).toEqual(['{VAR_SELECT, select, male {HE} female {SHE} other {XE}}']);
  });

  it('should split out simple interpolation placeholders', () => {
    expect(
      extractIcuPlaceholders(
        '{VAR_PLURAL, plural, one {{INTERPOLATION}} few {pre {INTERPOLATION_1}} other {{INTERPOLATION_2} post}}',
      ),
    ).toEqual([
      '{VAR_PLURAL, plural, one {',
      'INTERPOLATION',
      '} few {pre ',
      'INTERPOLATION_1',
      '} other {',
      'INTERPOLATION_2',
      ' post}}',
    ]);
  });

  it('should split out element placeholders', () => {
    expect(
      extractIcuPlaceholders(
        '{VAR_PLURAL, plural, one {{START_BOLD_TEXT}something bold{CLOSE_BOLD_TEXT}} other {pre {START_TAG_SPAN}middle{CLOSE_TAG_SPAN} post}}',
      ),
    ).toEqual([
      '{VAR_PLURAL, plural, one {',
      'START_BOLD_TEXT',
      'something bold',
      'CLOSE_BOLD_TEXT',
      '} other {pre ',
      'START_TAG_SPAN',
      'middle',
      'CLOSE_TAG_SPAN',
      ' post}}',
    ]);
  });

  it('should handle nested ICUs', () => {
    expect(
      extractIcuPlaceholders(
        [
          '{VAR_SELECT_1, select,',
          '  invoice {Invoice for {INTERPOLATION}}',
          '  payment {{VAR_SELECT, select,',
          '    processor {Payment gateway}',
          '    other {{INTERPOLATION_1}}',
          '  }}',
          '}',
        ].join('\n'),
      ),
    ).toEqual([
      '{VAR_SELECT_1, select,\n  invoice {Invoice for ',
      'INTERPOLATION',
      '}\n  payment {{VAR_SELECT, select,\n    processor {Payment gateway}\n    other {',
      'INTERPOLATION_1',
      '}\n  }}\n}',
    ]);
  });
});
