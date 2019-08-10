/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, Expansion, ExpansionCase, Node, Text, visitAll} from '@angular/compiler';

import {BaseVisitor} from '../base_visitor';
import {I18nError} from '../i18n_error';
import {getAttrOrThrow, getAttribute} from '../utils';

import {Xliff2MessageRenderer} from './renderer';

const INLINE_ELEMENTS = ['cp', 'ph', 'pc', 'sc', 'ec', 'mrk', 'sm', 'em'];

export class Xliff2MessageSerializer extends BaseVisitor {
  serialize(renderer: Xliff2MessageRenderer, nodes: Node[]): void {
    renderer.startRender();
    visitAll(this, nodes, renderer);
    renderer.endRender();
  }

  visitElement(element: Element, renderer: Xliff2MessageRenderer): void {
    if (element.name === 'ph') {
      this.visitPlaceholder(
          getAttrOrThrow(element, 'equiv'), getAttribute(element, 'disp'), renderer);
    } else if (element.name === 'pc') {
      this.visitPlaceholderContainer(
          getAttrOrThrow(element, 'equivStart'), element.children,
          getAttrOrThrow(element, 'equivEnd'), renderer);
    } else if (INLINE_ELEMENTS.indexOf(element.name) !== -1) {
      visitAll(this, element.children, renderer);
    } else {
      throw new I18nError(element.sourceSpan, `Invalid element found in message.`);
    }
  }

  visitText(text: Text, renderer: Xliff2MessageRenderer): void { renderer.text(text.value); }

  visitExpansion(expansion: Expansion, renderer: Xliff2MessageRenderer): void {
    renderer.startIcu();
    renderer.text(`{${expansion.switchValue}, ${expansion.type}, `);
    visitAll(this, expansion.cases, renderer);
    renderer.text('}');
    renderer.endIcu();
  }

  visitExpansionCase(expansionCase: ExpansionCase, renderer: Xliff2MessageRenderer): void {
    renderer.text(`${expansionCase.value} {`);
    renderer.startContainer();
    visitAll(this, expansionCase.expression, renderer);
    renderer.closeContainer();
    renderer.text(`}`);
  }

  visitContainedNodes(nodes: Node[], renderer: Xliff2MessageRenderer): void {
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
          renderer.startContainer();
          visitAll(this, nodes.slice(startOfContainedNodes, index - 1), renderer);
          renderer.closeContainer();
        }
      }
      if (index < length) {
        nodes[index].visit(this, renderer);
      }
      index++;
    }
  }

  visitPlaceholder(name: string, body: string|undefined, renderer: Xliff2MessageRenderer): void {
    renderer.placeholder(name, body);
  }

  visitPlaceholderContainer(
      startName: string, children: Node[], closeName: string,
      renderer: Xliff2MessageRenderer): void {
    renderer.startPlaceholder(startName);
    this.visitContainedNodes(children, renderer);
    renderer.closePlaceholder(closeName);
  }
}

function isPlaceholderContainer(node: Node): boolean {
  return node instanceof Element && node.name === 'pc';
}
