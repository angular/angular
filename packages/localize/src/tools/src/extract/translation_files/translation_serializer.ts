/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ParsedMessage} from '../../utils';

/**
 * Implement this interface to provide a class that can render messages into a translation file.
 */
export interface TranslationSerializer {
  /**
   * Render the contents of a translation file containing the given `messages`.
   * @param messages The messages to render to the file.
   */
  renderFile(messages: ParsedMessage[]): string;
}
