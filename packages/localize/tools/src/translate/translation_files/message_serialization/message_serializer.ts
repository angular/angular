/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, Expansion, ExpansionCase, Node, Text, visitAll} from '@angular/compiler';

import {BaseVisitor} from '../base_visitor';
import {TranslationParseError} from '../translation_parsers/translation_parse_error';
import {getAttribute, getAttrOrThrow} from '../translation_parsers/translation_utils';

import {MessageRenderer} from './message_renderer';

export interface MessageSerializerConfig {
  inlineElements: string[];
  placeholder?: {elementName: string; nameAttribute: string; bodyAttribute?: string;};
  placeholderContainer?: {elementName: string; startAttribute: string; endAttribute: string;};
}

/**
 * This visitor will walk over a set of XML nodes, which represent an i18n message, and serialize
 * them into a message object of type `T`.
 * The type of the serialized message is controlled by the
 */
export class MessageSerializer<T> extends BaseVisitor {
  constructor(private renderer: MessageRenderer<T>, private config: MessageSerializerConfig) {
    super();
  }

  serialize(nodes: Node[]): T {
    this.renderer.startRender();
    visitAll(this, nodes);
    this.renderer.endRender();
    return this.renderer.message;
  }

  override visitElement(element: Element): void {
    if (this.config.placeholder && element.name === this.config.placeholder.elementName) {
      const name = getAttrOrThrow(element, this.config.placeholder.nameAttribute);
      const body = this.config.placeholder.bodyAttribute &&
          getAttribute(element, this.config.placeholder.bodyAttribute);
      this.visitPlaceholder(name, body);
    } else if (
        this.config.placeholderContainer &&
        element.name === this.config.placeholderContainer.elementName) {
      const start = getAttrOrThrow(element, this.config.placeholderContainer.startAttribute);
      const end = getAttrOrThrow(element, this.config.placeholderContainer.endAttribute);
      this.visitPlaceholderContainer(start, element.children, end);
    } else if (this.config.inlineElements.indexOf(element.name) !== -1) {
      visitAll(this, element.children);
    } else {
      throw new TranslationParseError(element.sourceSpan, `Invalid element found in message.`);
    }
  }

  override visitText(text: Text): void {
    this.renderer.text(text.value);
  }

  override visitExpansion(expansion: Expansion): void {
    this.renderer.startIcu();
    this.renderer.text(`${expansion.switchValue}, ${expansion.type},`);
    visitAll(this, expansion.cases);
    this.renderer.endIcu();
  }

  override visitExpansionCase(expansionCase: ExpansionCase): void {
    this.renderer.text(` ${expansionCase.value} {`);
    this.renderer.startContainer();
    visitAll(this, expansionCase.expression);
    this.renderer.closeContainer();
    this.renderer.text(`}`);
  }

  visitContainedNodes(nodes: Node[]): void {
    this.renderer.startContainer();
    visitAll(this, nodes);
    this.renderer.closeContainer();
  }

  visitPlaceholder(name: string, body: string|undefined): void {
    this.renderer.placeholder(name, body);
  }

  visitPlaceholderContainer(startName: string, children: Node[], closeName: string): void {
    this.renderer.startPlaceholder(startName);
    this.visitContainedNodes(children);
    this.renderer.closePlaceholder(closeName);
  }

  private isPlaceholderContainer(node: Node): boolean {
    return node instanceof Element && node.name === this.config.placeholderContainer!.elementName;
  }
}
