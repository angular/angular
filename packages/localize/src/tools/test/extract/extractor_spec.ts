/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Extractor} from '../../src/extract/extractor';

describe('Extractor', () => {
  it('should extract a message for each $localize template tag', () => {
    const extractor = new Extractor();
    const contents = '$localize`:meaning|description:a${1}b${2}c`;\n' +
        '$localize(__makeTemplateObject(["a", ":custom-placeholder:b", "c"], ["a", ":custom-placeholder:b", "c"]), 1, 2);';
    extractor.extractMessages(contents, '/root/path/relative/path.js');

    expect(extractor.messages.length).toEqual(2);

    expect(extractor.messages[0]).toEqual({
      messageId: '2714330828844000684',
      description: 'description',
      meaning: 'meaning',
      messageParts: ['a', 'b', 'c'],
      messageString: 'a{$PH}b{$PH_1}c',
      placeholderNames: ['PH', 'PH_1'],
      substitutions: jasmine.any(Object),
    });

    expect(extractor.messages[1]).toEqual({
      messageId: '5692770902395945649',
      description: '',
      meaning: '',
      messageParts: ['a', 'b', 'c'],
      messageString: 'a{$custom-placeholder}b{$PH_1}c',
      placeholderNames: ['custom-placeholder', 'PH_1'],
      substitutions: jasmine.any(Object),
    });
  });
});
