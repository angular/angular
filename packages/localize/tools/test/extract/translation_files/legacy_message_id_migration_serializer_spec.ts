/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵParsedMessage} from '../../../../index';
import {Diagnostics} from '../../../src/diagnostics';
import {LegacyMessageIdMigrationSerializer} from '../../../src/extract/translation_files/legacy_message_id_migration_serializer';
import {mockMessage} from './mock_message';

// Doesn't need to run in each file system since it doesn't interact with the file system.

describe('LegacyMessageIdMigrationSerializer', () => {
  let serializer: LegacyMessageIdMigrationSerializer;

  beforeEach(() => {
    serializer = new LegacyMessageIdMigrationSerializer(new Diagnostics());
  });

  it('should convert a set of parsed messages into a migration mapping file', () => {
    const messages: ɵParsedMessage[] = [
      mockMessage('one', [], [], {legacyIds: ['legacy-one', 'other-legacy-one']}),
      mockMessage('two', [], [], {legacyIds: ['legacy-two']}),
      mockMessage('three', [], [], {legacyIds: ['legacy-three', 'other-legacy-three']}),
    ];
    const output = serializer.serialize(messages);
    expect(output.split('\n')).toEqual([
      '{',
      '  "legacy-one": "one",',
      '  "other-legacy-one": "one",',
      '  "legacy-two": "two",',
      '  "legacy-three": "three",',
      '  "other-legacy-three": "three"',
      '}',
    ]);
  });

  it('should not include messages that have a custom ID', () => {
    const messages: ɵParsedMessage[] = [
      mockMessage('one', [], [], {legacyIds: ['legacy-one']}),
      mockMessage('two', [], [], {legacyIds: ['legacy-two'], customId: 'custom-two'}),
      mockMessage('three', [], [], {legacyIds: ['legacy-three']}),
    ];
    const output = serializer.serialize(messages);
    expect(output.split('\n')).toEqual([
      '{',
      '  "legacy-one": "one",',
      '  "legacy-three": "three"',
      '}',
    ]);
  });

  it('should not include messages that do not have legacy IDs', () => {
    const messages: ɵParsedMessage[] = [
      mockMessage('one', [], [], {legacyIds: ['legacy-one']}),
      mockMessage('two', [], [], {}),
      mockMessage('three', [], [], {legacyIds: ['legacy-three']}),
    ];
    const output = serializer.serialize(messages);
    expect(output.split('\n')).toEqual([
      '{',
      '  "legacy-one": "one",',
      '  "legacy-three": "three"',
      '}',
    ]);
  });

  it('should produce an empty file if none of the messages need to be migrated', () => {
    const messages: ɵParsedMessage[] = [
      mockMessage('one', [], [], {legacyIds: ['legacy-one'], customId: 'custom-one'}),
      mockMessage('two', [], [], {}),
      mockMessage('three', [], [], {legacyIds: []}),
    ];
    const output = serializer.serialize(messages);
    expect(output).toBe('{}');
  });
});
