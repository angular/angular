/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as html from '../../src/ml_parser/ast';
import {ParseTreeResult} from '../../src/ml_parser/parser';
import {ParseLocation} from '../../src/parse_util';

export function humanizeDom(parseResult: ParseTreeResult, addSourceSpan: boolean = false): any[] {
  if (parseResult.errors.length > 0) {
    const errorString = parseResult.errors.join('\n');
    throw new Error(`Unexpected parse errors:\n${errorString}`);
  }

  return humanizeNodes(parseResult.rootNodes, addSourceSpan);
}

export function humanizeDomSourceSpans(parseResult: ParseTreeResult): any[] {
  return humanizeDom(parseResult, true);
}

export function humanizeNodes(nodes: html.Node[], addSourceSpan: boolean = false): any[] {
  const humanizer = new _Humanizer(addSourceSpan);
  html.visitAll(humanizer, nodes);
  return humanizer.result;
}

export function humanizeLineColumn(location: ParseLocation): string {
  return `${location.line}:${location.col}`;
}

class _Humanizer implements html.Visitor {
  result: any[] = [];
  elDepth: number = 0;

  constructor(private includeSourceSpan: boolean) {}

  visitElement(element: html.Element): any {
    const res = this._appendContext(element, [html.Element, element.name, this.elDepth++]);
    if (element.isSelfClosing) {
      res.push('#selfClosing');
    }
    if (this.includeSourceSpan) {
      res.push(element.startSourceSpan.toString() ?? null);
      res.push(element.endSourceSpan?.toString() ?? null);
    }
    this.result.push(res);
    html.visitAll(this, element.attrs);
    html.visitAll(this, element.directives);
    html.visitAll(this, element.children);
    this.elDepth--;
  }

  visitAttribute(attribute: html.Attribute): any {
    const valueTokens = attribute.valueTokens ?? [];
    const res = this._appendContext(attribute, [
      html.Attribute,
      attribute.name,
      attribute.value,
      ...valueTokens.map((token) => token.parts),
    ]);
    this.result.push(res);
  }

  visitText(text: html.Text): any {
    const res = this._appendContext(text, [
      html.Text,
      text.value,
      this.elDepth,
      ...text.tokens.map((token) => token.parts),
    ]);
    this.result.push(res);
  }

  visitComment(comment: html.Comment): any {
    const res = this._appendContext(comment, [html.Comment, comment.value, this.elDepth]);
    this.result.push(res);
  }

  visitExpansion(expansion: html.Expansion): any {
    const res = this._appendContext(expansion, [
      html.Expansion,
      expansion.switchValue,
      expansion.type,
      this.elDepth++,
    ]);
    this.result.push(res);
    html.visitAll(this, expansion.cases);
    this.elDepth--;
  }

  visitExpansionCase(expansionCase: html.ExpansionCase): any {
    const res = this._appendContext(expansionCase, [
      html.ExpansionCase,
      expansionCase.value,
      this.elDepth,
    ]);
    this.result.push(res);
  }

  visitBlock(block: html.Block) {
    const res = this._appendContext(block, [html.Block, block.name, this.elDepth++]);
    if (this.includeSourceSpan) {
      res.push(block.startSourceSpan.toString() ?? null);
      res.push(block.endSourceSpan?.toString() ?? null);
    }
    this.result.push(res);
    html.visitAll(this, block.parameters);
    html.visitAll(this, block.children);
    this.elDepth--;
  }

  visitBlockParameter(parameter: html.BlockParameter) {
    this.result.push(this._appendContext(parameter, [html.BlockParameter, parameter.expression]));
  }

  visitLetDeclaration(decl: html.LetDeclaration) {
    const res = this._appendContext(decl, [html.LetDeclaration, decl.name, decl.value]);

    if (this.includeSourceSpan) {
      res.push(decl.nameSpan?.toString() ?? null);
      res.push(decl.valueSpan?.toString() ?? null);
    }

    this.result.push(res);
  }

  visitComponent(node: html.Component): any {
    const res = this._appendContext(node, [
      html.Component,
      node.componentName,
      node.tagName,
      node.fullName,
      this.elDepth++,
    ]);
    if (node.isSelfClosing) {
      res.push('#selfClosing');
    }
    if (this.includeSourceSpan) {
      res.push(node.startSourceSpan.toString() ?? null, node.endSourceSpan?.toString() ?? null);
    }
    this.result.push(res);
    html.visitAll(this, node.attrs);
    html.visitAll(this, node.directives);
    html.visitAll(this, node.children);
    this.elDepth--;
  }

  visitDirective(directive: html.Directive) {
    const res = this._appendContext(directive, [html.Directive, directive.name]);
    if (this.includeSourceSpan) {
      res.push(directive.startSourceSpan.toString(), directive.endSourceSpan?.toString() ?? null);
    }
    this.result.push(res);
    html.visitAll(this, directive.attrs);
  }

  private _appendContext(ast: html.Node, input: any[]): any[] {
    if (!this.includeSourceSpan) return input;
    input.push(ast.sourceSpan.toString());
    if (ast.sourceSpan.fullStart.offset !== ast.sourceSpan.start.offset) {
      input.push(
        ast.sourceSpan.fullStart.file.content.substring(
          ast.sourceSpan.fullStart.offset,
          ast.sourceSpan.end.offset,
        ),
      );
    }
    return input;
  }
}
