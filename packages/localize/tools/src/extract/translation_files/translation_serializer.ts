/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵParsedMessage} from '@angular/localize';

/**
 * Implement this interface to provide a class that can render messages into a translation file.
 */
export interface TranslationSerializer {
  /**
   * Serialize the contents of a translation file containing the given `messages`.
   *
   * @param messages The messages to render to the file.
   * @returns The contents of the serialized file.
   */
  serialize(messages: ɵParsedMessage[]): string;
}
