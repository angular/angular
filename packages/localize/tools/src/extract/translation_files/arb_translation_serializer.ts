/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {AbsoluteFsPath, PathManipulation} from '@angular/compiler-cli/private/localize';
import {ɵParsedMessage, ɵSourceLocation} from '../../../../index';
import {TranslationSerializer} from './translation_serializer';
import {consolidateMessages, hasLocation} from './utils';

/**
 * A translation serializer that can render JSON formatted as an Application Resource Bundle (ARB).
 *
 * See https://github.com/google/app-resource-bundle/wiki/ApplicationResourceBundleSpecification
 *
 * ```json
 * {
 *   "@@locale": "en-US",
 *   "message-id": "Target message string",
 *   "@message-id": {
 *     "type": "text",
 *     "description": "Some description text",
 *     "x-locations": [
 *       {
 *         "start": {"line": 23, "column": 145},
 *         "end": {"line": 24, "column": 53},
 *         "file": "some/file.ts"
 *       },
 *       ...
 *     ]
 *   },
 *   ...
 * }
 * ```
 */
export class ArbTranslationSerializer implements TranslationSerializer {
  constructor(
    private sourceLocale: string,
    private basePath: AbsoluteFsPath,
    private fs: PathManipulation,
  ) {}

  serialize(messages: ɵParsedMessage[]): string {
    const messageGroups = consolidateMessages(messages, (message) => getMessageId(message));

    let output = `{\n  "@@locale": ${JSON.stringify(this.sourceLocale)}`;

    for (const duplicateMessages of messageGroups) {
      const message = duplicateMessages[0];
      const id = getMessageId(message);
      output += this.serializeMessage(id, message);
      output += this.serializeMeta(
        id,
        message.description,
        message.meaning,
        duplicateMessages.filter(hasLocation).map((m) => m.location),
      );
    }

    output += '\n}';

    return output;
  }

  private serializeMessage(id: string, message: ɵParsedMessage): string {
    return `,\n  ${JSON.stringify(id)}: ${JSON.stringify(message.text)}`;
  }

  private serializeMeta(
    id: string,
    description: string | undefined,
    meaning: string | undefined,
    locations: ɵSourceLocation[],
  ): string {
    const meta: string[] = [];

    if (description) {
      meta.push(`\n    "description": ${JSON.stringify(description)}`);
    }

    if (meaning) {
      meta.push(`\n    "x-meaning": ${JSON.stringify(meaning)}`);
    }

    if (locations.length > 0) {
      let locationStr = `\n    "x-locations": [`;
      for (let i = 0; i < locations.length; i++) {
        locationStr += (i > 0 ? ',\n' : '\n') + this.serializeLocation(locations[i]);
      }
      locationStr += '\n    ]';
      meta.push(locationStr);
    }

    return meta.length > 0 ? `,\n  ${JSON.stringify('@' + id)}: {${meta.join(',')}\n  }` : '';
  }

  private serializeLocation({file, start, end}: ɵSourceLocation): string {
    return [
      `      {`,
      `        "file": ${JSON.stringify(this.fs.relative(this.basePath, file))},`,
      `        "start": { "line": "${start.line}", "column": "${start.column}" },`,
      `        "end": { "line": "${end.line}", "column": "${end.column}" }`,
      `      }`,
    ].join('\n');
  }
}

function getMessageId(message: ɵParsedMessage): string {
  return message.customId || message.id;
}
