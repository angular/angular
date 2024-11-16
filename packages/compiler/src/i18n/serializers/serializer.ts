/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as i18n from '../i18n_ast';

export abstract class Serializer {
  // - The `placeholders` and `placeholderToMessage` properties are irrelevant in the input messages
  // - The `id` contains the message id that the serializer is expected to use
  // - Placeholder names are already map to public names using the provided mapper
  abstract write(messages: i18n.Message[], locale: string | null): string;

  abstract load(
    content: string,
    url: string,
  ): {locale: string | null; i18nNodesByMsgId: {[msgId: string]: i18n.Node[]}};

  abstract digest(message: i18n.Message): string;

  // Creates a name mapper, see `PlaceholderMapper`
  // Returning `null` means that no name mapping is used.
  createNameMapper(message: i18n.Message): PlaceholderMapper | null {
    return null;
  }
}

/**
 * A `PlaceholderMapper` converts placeholder names from internal to serialized representation and
 * back.
 *
 * It should be used for serialization format that put constraints on the placeholder names.
 */
export interface PlaceholderMapper {
  toPublicName(internalName: string): string | null;

  toInternalName(publicName: string): string | null;
}

/**
 * A simple mapper that take a function to transform an internal name to a public name
 */
export class SimplePlaceholderMapper extends i18n.RecurseVisitor implements PlaceholderMapper {
  private internalToPublic: {[k: string]: string} = {};
  private publicToNextId: {[k: string]: number} = {};
  private publicToInternal: {[k: string]: string} = {};

  // create a mapping from the message
  constructor(
    message: i18n.Message,
    private mapName: (name: string) => string,
  ) {
    super();
    message.nodes.forEach((node) => node.visit(this));
  }

  toPublicName(internalName: string): string | null {
    return this.internalToPublic.hasOwnProperty(internalName)
      ? this.internalToPublic[internalName]
      : null;
  }

  toInternalName(publicName: string): string | null {
    return this.publicToInternal.hasOwnProperty(publicName)
      ? this.publicToInternal[publicName]
      : null;
  }

  override visitText(text: i18n.Text, context?: any): any {
    return null;
  }

  override visitTagPlaceholder(ph: i18n.TagPlaceholder, context?: any): any {
    this.visitPlaceholderName(ph.startName);
    super.visitTagPlaceholder(ph, context);
    this.visitPlaceholderName(ph.closeName);
  }

  override visitPlaceholder(ph: i18n.Placeholder, context?: any): any {
    this.visitPlaceholderName(ph.name);
  }

  override visitBlockPlaceholder(ph: i18n.BlockPlaceholder, context?: any): any {
    this.visitPlaceholderName(ph.startName);
    super.visitBlockPlaceholder(ph, context);
    this.visitPlaceholderName(ph.closeName);
  }

  override visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any {
    this.visitPlaceholderName(ph.name);
  }

  // XMB placeholders could only contains A-Z, 0-9 and _
  private visitPlaceholderName(internalName: string): void {
    if (!internalName || this.internalToPublic.hasOwnProperty(internalName)) {
      return;
    }

    let publicName = this.mapName(internalName);

    if (this.publicToInternal.hasOwnProperty(publicName)) {
      // Create a new XMB when it has already been used
      const nextId = this.publicToNextId[publicName];
      this.publicToNextId[publicName] = nextId + 1;
      publicName = `${publicName}_${nextId}`;
    } else {
      this.publicToNextId[publicName] = 1;
    }

    this.internalToPublic[internalName] = publicName;
    this.publicToInternal[publicName] = internalName;
  }
}
