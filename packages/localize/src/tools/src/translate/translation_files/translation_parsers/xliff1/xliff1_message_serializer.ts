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
import {getAttrOrThrow} from '../../translation_utils';

const INLINE_ELEMENTS = ['g', 'bx', 'ex', 'bpt', 'ept', 'ph', 'it', 'mrk'];

export class Xliff1MessageSerializer<T> extends BaseVisitor {
  constructor(private renderer: MessageRenderer<T>) { super(); }

  serialize(nodes: Node[]): T {
    this.renderer.startRender();
    visitAll(this, nodes);
    this.renderer.endRender();
    return this.renderer.message;
  }

  visitElement(element: Element): void {
    if (element.name === 'x') {
      this.visitPlaceholder(getAttrOrThrow(element, 'id'), '');
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



  visitPlaceholder(name: string, body: string|undefined): void {
    this.renderer.placeholder(name, body);
  }
}
