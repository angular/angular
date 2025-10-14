/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as i18n from '../i18n_ast';
export class Serializer {
  // Creates a name mapper, see `PlaceholderMapper`
  // Returning `null` means that no name mapping is used.
  createNameMapper(message) {
    return null;
  }
}
/**
 * A simple mapper that take a function to transform an internal name to a public name
 */
export class SimplePlaceholderMapper extends i18n.RecurseVisitor {
  // create a mapping from the message
  constructor(message, mapName) {
    super();
    this.mapName = mapName;
    this.internalToPublic = {};
    this.publicToNextId = {};
    this.publicToInternal = {};
    message.nodes.forEach((node) => node.visit(this));
  }
  toPublicName(internalName) {
    return this.internalToPublic.hasOwnProperty(internalName)
      ? this.internalToPublic[internalName]
      : null;
  }
  toInternalName(publicName) {
    return this.publicToInternal.hasOwnProperty(publicName)
      ? this.publicToInternal[publicName]
      : null;
  }
  visitText(text, context) {
    return null;
  }
  visitTagPlaceholder(ph, context) {
    this.visitPlaceholderName(ph.startName);
    super.visitTagPlaceholder(ph, context);
    this.visitPlaceholderName(ph.closeName);
  }
  visitPlaceholder(ph, context) {
    this.visitPlaceholderName(ph.name);
  }
  visitBlockPlaceholder(ph, context) {
    this.visitPlaceholderName(ph.startName);
    super.visitBlockPlaceholder(ph, context);
    this.visitPlaceholderName(ph.closeName);
  }
  visitIcuPlaceholder(ph, context) {
    this.visitPlaceholderName(ph.name);
  }
  // XMB placeholders could only contains A-Z, 0-9 and _
  visitPlaceholderName(internalName) {
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
//# sourceMappingURL=serializer.js.map
