/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, getFileSystem, relativeFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {MockLogger} from '@angular/compiler-cli/src/ngtsc/logging/testing';

import {MessageExtractor} from '../../src/extract/extraction';

runInEachFileSystem(() => {
  describe('extractMessages', () => {
    it('should extract a message for each $localize template tag', () => {
      const fs = getFileSystem();
      const logger = new MockLogger();
      const basePath = absoluteFrom('/root/path/');
      const filename = 'relative/path.js';
      const file = fs.resolve(basePath, filename);
      const extractor = new MessageExtractor(fs, logger, {basePath});
      fs.ensureDir(absoluteFrom('/root/path/relative'));
      fs.writeFile(file, [
        '$localize`:meaning|description:a${1}b${2}c`;',
        '$localize(__makeTemplateObject(["a", ":custom-placeholder:b", "c"], ["a", ":custom-placeholder:b", "c"]), 1, 2);',
        '$localize`:@@custom-id:a${1}b${2}c`;',
      ].join('\n'));
      const messages = extractor.extractMessages(filename);

      expect(messages.length).toEqual(3);

      expect(messages[0]).toEqual({
        id: '2714330828844000684',
        customId: undefined,
        description: 'description',
        meaning: 'meaning',
        messageParts: ['a', 'b', 'c'],
        text: 'a{$PH}b{$PH_1}c',
        placeholderNames: ['PH', 'PH_1'],
        substitutions: jasmine.any(Object),
        legacyIds: [],
        location: {start: {line: 0, column: 9}, end: {line: 0, column: 43}, file},
      });

      expect(messages[1]).toEqual({
        id: '5692770902395945649',
        customId: undefined,
        description: '',
        meaning: '',
        messageParts: ['a', 'b', 'c'],
        text: 'a{$custom-placeholder}b{$PH_1}c',
        placeholderNames: ['custom-placeholder', 'PH_1'],
        substitutions: jasmine.any(Object),
        legacyIds: [],
        location: {start: {line: 1, column: 0}, end: {line: 1, column: 111}, file},
      });

      expect(messages[2]).toEqual({
        id: 'custom-id',
        customId: 'custom-id',
        description: '',
        meaning: '',
        messageParts: ['a', 'b', 'c'],
        text: 'a{$PH}b{$PH_1}c',
        placeholderNames: ['PH', 'PH_1'],
        substitutions: jasmine.any(Object),
        legacyIds: [],
        location: {start: {line: 2, column: 9}, end: {line: 2, column: 35}, file},
      });
    });
  });
});
