/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {absoluteFrom, getFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {MockLogger} from '@angular/compiler-cli/src/ngtsc/logging/testing';

import {MessageExtractor} from '../../src/extract/extraction';
import {runInNativeFileSystem} from '../helpers';

runInNativeFileSystem(() => {
  describe('extractMessages', () => {
    it('should extract a message for each $localize template tag', () => {
      const fs = getFileSystem();
      const logger = new MockLogger();
      const basePath = absoluteFrom('/root/path/');
      const filename = 'relative/path.js';
      const file = fs.resolve(basePath, filename);
      const extractor = new MessageExtractor(fs, logger, {basePath});
      fs.ensureDir(fs.dirname(file));
      fs.writeFile(
        file,
        [
          '$localize`:meaning|description:a${1}b${2}:ICU@@associated-id:c`;',
          '$localize(__makeTemplateObject(["a", ":custom-placeholder:b", "c"], ["a", ":custom-placeholder:b", "c"]), 1, 2);',
          '$localize`:@@custom-id:a${1}b${2}c`;',
        ].join('\n'),
      );
      const messages = extractor.extractMessages(filename);

      expect(messages.length).toEqual(3);

      expect(messages[0]).toEqual({
        id: '8550342801935228331',
        customId: undefined,
        description: 'description',
        meaning: 'meaning',
        messageParts: ['a', 'b', 'c'],
        messagePartLocations: [
          {
            start: {line: 0, column: 10},
            end: {line: 0, column: 32},
            file,
            text: ':meaning|description:a',
          },
          {
            start: {line: 0, column: 36},
            end: {line: 0, column: 37},
            file,
            text: 'b',
          },
          {
            start: {line: 0, column: 41},
            end: {line: 0, column: 62},
            file,
            text: ':ICU@@associated-id:c',
          },
        ],
        text: 'a{$PH}b{$ICU}c',
        placeholderNames: ['PH', 'ICU'],
        associatedMessageIds: {ICU: 'associated-id'},
        substitutions: jasmine.any(Object),
        substitutionLocations: {
          PH: {start: {line: 0, column: 34}, end: {line: 0, column: 35}, file, text: '1'},
          ICU: {start: {line: 0, column: 39}, end: {line: 0, column: 40}, file, text: '2'},
        },
        legacyIds: [],
        location: {
          start: {line: 0, column: 9},
          end: {line: 0, column: 63},
          file,
          text: '`:meaning|description:a${1}b${2}:ICU@@associated-id:c`',
        },
      });

      expect(messages[1]).toEqual({
        id: '5692770902395945649',
        customId: undefined,
        description: '',
        meaning: '',
        messageParts: ['a', 'b', 'c'],
        messagePartLocations: [
          {
            start: {line: 1, column: 69},
            end: {line: 1, column: 72},
            file,
            text: '"a"',
          },
          {
            start: {line: 1, column: 74},
            end: {line: 1, column: 97},
            file,
            text: '":custom-placeholder:b"',
          },
          {
            start: {line: 1, column: 99},
            end: {line: 1, column: 102},
            file,
            text: '"c"',
          },
        ],
        text: 'a{$custom-placeholder}b{$PH_1}c',
        placeholderNames: ['custom-placeholder', 'PH_1'],
        associatedMessageIds: {},
        substitutions: jasmine.any(Object),
        substitutionLocations: {
          'custom-placeholder': {
            start: {line: 1, column: 106},
            end: {line: 1, column: 107},
            file,
            text: '1',
          },
          PH_1: {start: {line: 1, column: 109}, end: {line: 1, column: 110}, file, text: '2'},
        },
        legacyIds: [],
        location: {
          start: {line: 1, column: 10},
          end: {line: 1, column: 107},
          file,
          text: '__makeTemplateObject(["a", ":custom-placeholder:b", "c"], ["a", ":custom-placeholder:b", "c"])',
        },
      });

      expect(messages[2]).toEqual({
        id: 'custom-id',
        customId: 'custom-id',
        description: '',
        meaning: '',
        messageParts: ['a', 'b', 'c'],
        text: 'a{$PH}b{$PH_1}c',
        placeholderNames: ['PH', 'PH_1'],
        associatedMessageIds: {},
        substitutions: jasmine.any(Object),
        substitutionLocations: {
          PH: {start: {line: 2, column: 26}, end: {line: 2, column: 27}, file, text: '1'},
          PH_1: {start: {line: 2, column: 31}, end: {line: 2, column: 32}, file, text: '2'},
        },
        messagePartLocations: [
          {start: {line: 2, column: 10}, end: {line: 2, column: 24}, file, text: ':@@custom-id:a'},
          {start: {line: 2, column: 28}, end: {line: 2, column: 29}, file, text: 'b'},
          {start: {line: 2, column: 33}, end: {line: 2, column: 34}, file, text: 'c'},
        ],
        legacyIds: [],
        location: {
          start: {line: 2, column: 9},
          end: {line: 2, column: 35},
          file,
          text: '`:@@custom-id:a${1}b${2}c`',
        },
      });
    });
  });
});
