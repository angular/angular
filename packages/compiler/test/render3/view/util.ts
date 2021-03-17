/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as e from '../../../src/expression_parser/ast';
import {Lexer} from '../../../src/expression_parser/lexer';
import {Parser} from '../../../src/expression_parser/parser';
import * as html from '../../../src/ml_parser/ast';
import {HtmlParser, ParseTreeResult} from '../../../src/ml_parser/html_parser';
import {WhitespaceVisitor} from '../../../src/ml_parser/html_whitespaces';
import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from '../../../src/ml_parser/interpolation_config';
import * as a from '../../../src/render3/r3_ast';
import {htmlAstToRender3Ast, Render3ParseResult} from '../../../src/render3/r3_template_transform';
import {I18nMetaVisitor} from '../../../src/render3/view/i18n/meta';
import {LEADING_TRIVIA_CHARS} from '../../../src/render3/view/template';
import {BindingParser} from '../../../src/template_parser/binding_parser';
import {MockSchemaRegistry} from '../../../testing';

export function findExpression(tmpl: a.Node[], expr: string): e.AST|null {
  const res = tmpl.reduce((found, node) => {
    if (found !== null) {
      return found;
    } else {
      return findExpressionInNode(node, expr);
    }
  }, null as e.AST | null);
  if (res instanceof e.ASTWithSource) {
    return res.ast;
  }
  return res;
}

function findExpressionInNode(node: a.Node, expr: string): e.AST|null {
  if (node instanceof a.Element || node instanceof a.Template) {
    return findExpression(
        [
          ...node.inputs,
          ...node.outputs,
          ...node.children,
        ],
        expr);
  } else if (node instanceof a.BoundAttribute || node instanceof a.BoundText) {
    const ts = toStringExpression(node.value);
    return toStringExpression(node.value) === expr ? node.value : null;
  } else if (node instanceof a.BoundEvent) {
    return toStringExpression(node.handler) === expr ? node.handler : null;
  } else {
    return null;
  }
}

export function toStringExpression(expr: e.AST): string {
  while (expr instanceof e.ASTWithSource) {
    expr = expr.ast;
  }
  if (expr instanceof e.PropertyRead) {
    if (expr.receiver instanceof e.ImplicitReceiver) {
      return expr.name;
    } else {
      return `${toStringExpression(expr.receiver)}.${expr.name}`;
    }
  } else if (expr instanceof e.ImplicitReceiver) {
    return '';
  } else if (expr instanceof e.Interpolation) {
    let str = '{{';
    for (let i = 0; i < expr.expressions.length; i++) {
      str += expr.strings[i] + toStringExpression(expr.expressions[i]);
    }
    str += expr.strings[expr.strings.length - 1] + '}}';
    return str;
  } else {
    throw new Error(`Unsupported type: ${(expr as any).constructor.name}`);
  }
}

// Parse an html string to IVY specific info
export function parseR3(
    input: string,
    options: {preserveWhitespaces?: boolean,
              leadingTriviaChars?: string[],
              ignoreError?: boolean} = {}): Render3ParseResult {
  const htmlParser = new HtmlParser();

  const parseResult = htmlParser.parse(input, 'path:://to/template', {
    tokenizeExpansionForms: true,
    leadingTriviaChars: options.leadingTriviaChars ?? LEADING_TRIVIA_CHARS,
  });

  if (parseResult.errors.length > 0 && !options.ignoreError) {
    const msg = parseResult.errors.map(e => e.toString()).join('\n');
    throw new Error(msg);
  }

  let htmlNodes = processI18nMeta(parseResult).rootNodes;

  if (!options.preserveWhitespaces) {
    htmlNodes = html.visitAll(new WhitespaceVisitor(), htmlNodes);
  }

  const expressionParser = new Parser(new Lexer());
  const schemaRegistry = new MockSchemaRegistry(
      {'invalidProp': false}, {'mappedAttr': 'mappedProp'}, {'unknown': false, 'un-known': false},
      ['onEvent'], ['onEvent']);
  const bindingParser =
      new BindingParser(expressionParser, DEFAULT_INTERPOLATION_CONFIG, schemaRegistry, null, []);
  const r3Result = htmlAstToRender3Ast(htmlNodes, bindingParser, {collectCommentNodes: false});

  if (r3Result.errors.length > 0 && !options.ignoreError) {
    const msg = r3Result.errors.map(e => e.toString()).join('\n');
    throw new Error(msg);
  }

  return r3Result;
}

export function processI18nMeta(
    htmlAstWithErrors: ParseTreeResult,
    interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG): ParseTreeResult {
  return new ParseTreeResult(
      html.visitAll(
          new I18nMetaVisitor(interpolationConfig, /* keepI18nAttrs */ false),
          htmlAstWithErrors.rootNodes),
      htmlAstWithErrors.errors);
}
