/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, Expansion, ExpansionCase, Node, Text, visitAll} from '@angular/compiler';

import {MessageRenderer} from '../../../../message_renderers/message_renderer';
import {BaseVisitor} from '../../base_visitor';
import {I18nError} from '../../i18n_error';
import {getAttrOrThrow, getAttribute} from '../../translation_utils';

const INLINE_ELEMENTS = ['cp', 'sc', 'ec', 'mrk', 'sm', 'em'];

export class Xliff2MessageSerializer<T> extends BaseVisitor {
  constructor(private renderer: MessageRenderer<T>) { super(); }

  serialize(nodes: Node[]): T {
    this.renderer.startRender();
    visitAll(this, nodes);
    this.renderer.endRender();
    return this.renderer.message;
  }

  visitElement(element: Element): void {
    if (element.name === 'ph') {
      this.visitPlaceholder(getAttrOrThrow(element, 'equiv'), getAttribute(element, 'disp'));
    } else if (element.name === 'pc') {
      this.visitPlaceholderContainer(
          getAttrOrThrow(element, 'equivStart'), element.children,
          getAttrOrThrow(element, 'equivEnd'));
    } else if (INLINE_ELEMENTS.indexOf(element.name) !== -1) {
      visitAll(this, element.children);
    } else {
      throw new I18nError(element.sourceSpan, `Invalid element found in message.`);
    }
  }

  visitText(text: Text): void { this.renderer.text(text.value); }

  visitExpansion(expansion: Expansion): void {
    this.renderer.startIcu();
    this.renderer.text(`${expansion.switchValue}, ${expansion.type},`);
    visitAll(this, expansion.cases);
    this.renderer.endIcu();
  }

  visitExpansionCase(expansionCase: ExpansionCase): void {
    this.renderer.text(` ${expansionCase.value} {`);
    this.renderer.startContainer();
    visitAll(this, expansionCase.expression);
    this.renderer.closeContainer();
    this.renderer.text(`}`);
  }

  visitContainedNodes(nodes: Node[]): void {
    const length = nodes.length;
    let index = 0;
    while (index < length) {
      if (!isPlaceholderContainer(nodes[index])) {
        const startOfContainedNodes = index;
        while (index < length - 1) {
          index++;
          if (isPlaceholderContainer(nodes[index])) {
            break;
          }
        }
        if (index - startOfContainedNodes > 1) {
          // Only create a container if there are two or more contained Nodes in a row
          this.renderer.startContainer();
          visitAll(this, nodes.slice(startOfContainedNodes, index - 1));
          this.renderer.closeContainer();
        }
      }
      if (index < length) {
        nodes[index].visit(this, undefined);
      }
      index++;
    }
  }

  visitPlaceholder(name: string, body: string|undefined): void {
    this.renderer.placeholder(name, body);
  }

  visitPlaceholderContainer(startName: string, children: Node[], closeName: string): void {
    this.renderer.startPlaceholder(startName);
    this.visitContainedNodes(children);
    this.renderer.closePlaceholder(closeName);
  }
}

function isPlaceholderContainer(node: Node): boolean {
  return node instanceof Element && node.name === 'pc';
}
