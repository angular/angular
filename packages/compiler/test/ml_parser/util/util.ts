/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as html from '@angular/compiler/src/ml_parser/ast';
import {getHtmlTagDefinition} from '@angular/compiler/src/ml_parser/html_tags';

class _SerializerVisitor implements html.Visitor {
  visitElement(element: html.Element, context: any): any {
    if (getHtmlTagDefinition(element.name).isVoid) {
      return `<${element.name}${this._visitAll(element.attrs, ' ', ' ')}/>`;
    }

    return `<${element.name}${this._visitAll(element.attrs, ' ', ' ')}>${this._visitAll(
      element.children,
    )}</${element.name}>`;
  }

  visitAttribute(attribute: html.Attribute, context: any): any {
    return `${attribute.name}="${attribute.value}"`;
  }

  visitText(text: html.Text, context: any): any {
    return text.value;
  }

  visitComment(comment: html.Comment, context: any): any {
    return `<!--${comment.value}-->`;
  }

  visitExpansion(expansion: html.Expansion, context: any): any {
    return `{${expansion.switchValue}, ${expansion.type},${this._visitAll(expansion.cases)}}`;
  }

  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any {
    return ` ${expansionCase.value} {${this._visitAll(expansionCase.expression)}}`;
  }

  visitBlock(block: html.Block, context: any) {
    const params =
      block.parameters.length === 0 ? ' ' : ` (${this._visitAll(block.parameters, ';', ' ')}) `;
    return `@${block.name}${params}{${this._visitAll(block.children)}}`;
  }

  visitBlockParameter(parameter: html.BlockParameter, context: any) {
    return parameter.expression;
  }

  visitLetDeclaration(decl: html.LetDeclaration, context: any) {
    return `@let ${decl.name} = ${decl.value};`;
  }

  private _visitAll(nodes: html.Node[], separator = '', prefix = ''): string {
    return nodes.length > 0 ? prefix + nodes.map((a) => a.visit(this, null)).join(separator) : '';
  }
}

const serializerVisitor = new _SerializerVisitor();

export function serializeNodes(nodes: html.Node[]): string[] {
  return nodes.map((node) => node.visit(serializerVisitor, null));
}
