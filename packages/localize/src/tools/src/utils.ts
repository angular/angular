/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵParsedTranslation as ParsedTranslation, ɵmakeTemplateObject as makeTemplateObject, ɵtranslate} from '@angular/localize';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';
import * as fs from 'fs';
import * as path from 'path';

// Re-export the private API from `@angular/localize`, removing the ɵ prefix, for use in the rest of
// this `tools` package.
export {ɵMessageId as MessageId, ɵParsedMessage as ParsedMessage, ɵParsedTranslation as ParsedTranslation, ɵParsedTranslations as ParsedTranslations, ɵSourceMessage as SourceMessage, ɵTargetMessage as TargetMessage, ɵcomputeMsgId as computeMsgId, ɵfindEndOfBlock as findEndOfBlock, ɵmakeParsedTranslation as makeParsedTranslation, ɵmakeTemplateObject as makeTemplateObject, ɵparseMessage as parseMessage, ɵparseMetadata as parseMetadata, ɵparseTranslation as parseTranslation, ɵsplitBlock as splitBlock} from '@angular/localize';

export function writeFile(absolutePath: string, contents: string | Buffer) {
  ensureDir(path.dirname(absolutePath));
  fs.writeFileSync(absolutePath, contents);
}

export function ensureDir(absolutePath: string): void {
  const parents: string[] = [];
  while (!isRoot(absolutePath) && !fs.existsSync(absolutePath)) {
    parents.push(absolutePath);
    absolutePath = path.dirname(absolutePath);
  }
  while (parents.length) {
    fs.mkdirSync(parents.pop() !);
  }
}

export function isRoot(absolutePath: string): boolean {
  return path.dirname(absolutePath) === absolutePath;
}

/**
 * Is the given `expression` an identifier with the correct name
 * @param expression The expression to check.
 */
export function isNamedIdentifier(
    expression: NodePath<t.Expression>, name: string): expression is NodePath<t.Identifier> {
  return expression.isIdentifier() && expression.node.name === name;
}

/**
 * Is the given `identifier` declared globally.
 * @param identifier The identifier to check.
 */
export function isGlobal(identifier: NodePath<t.Identifier>) {
  return !identifier.scope || !identifier.scope.hasBinding(identifier.node.name);
}

/**
 * Build a translated expression to replace the call to `$localize`.
 * @param messageParts The static parts of the message.
 * @param substitutions The expressions to substitute into the message.
 */
export function buildLocalizeReplacement(
    messageParts: TemplateStringsArray, substitutions: readonly t.Expression[]): t.Expression {
  let mappedString: t.Expression = t.stringLiteral(messageParts[0]);
  for (let i = 1; i < messageParts.length; i++) {
    mappedString =
        t.binaryExpression('+', mappedString, wrapInParensIfNecessary(substitutions[i - 1]));
    mappedString = t.binaryExpression('+', mappedString, t.stringLiteral(messageParts[i]));
  }
  return mappedString;
}

/**
 * Extract the message parts from the given `call` (to `$localize`).
 *
 * The message parts will either by the first argument to the `call` or it will be wrapped in call
 * to a helper function like `__makeTemplateObject`.
 *
 * @param call The AST node of the call to process.
 */
export function unwrapMessagePartsFromLocalizeCall(call: t.CallExpression): TemplateStringsArray {
  let cooked = call.arguments[0];
  if (!t.isExpression(cooked)) {
    throw new Error('Unexpected argument to `$localize`: ' + cooked);
  }

  // If there is no call to `__makeTemplateObject(...)`, then `raw` must be the same as `cooked`.
  let raw = cooked;

  // Check for cached call of the form `x || x = __makeTemplateObject(...)`
  if (t.isLogicalExpression(cooked) && cooked.operator === '||' && t.isIdentifier(cooked.left) &&
      t.isExpression(cooked.right)) {
    if (t.isAssignmentExpression(cooked.right)) {
      cooked = cooked.right.right;
    }
  }

  // Check for `__makeTemplateObject(cooked, raw)` call
  if (t.isCallExpression(cooked)) {
    raw = cooked.arguments[1] as t.Expression;
    if (!t.isExpression(raw)) {
      throw new Error('Unexpected `raw` argument to `__makeTemplateObject`: ' + raw);
    }
    cooked = cooked.arguments[0];
    if (!t.isExpression(cooked)) {
      throw new Error('Unexpected `cooked` argument to `__makeTemplateObject`: ' + cooked);
    }
  }

  const cookedStrings = unwrapStringLiteralArray(cooked);
  const rawStrings = unwrapStringLiteralArray(raw);
  return makeTemplateObject(cookedStrings, rawStrings);
}


export function unwrapSubstitutionsFromLocalizeCall(call: t.CallExpression): t.Expression[] {
  const expressions = call.arguments.splice(1);
  if (!isArrayOfExpressions(expressions)) {
    throw new Error('Invalid substitutions for `$localize` (expected an array of expressions).');
  }
  return expressions;
}

export function unwrapMessagePartsFromTemplateLiteral(elements: t.TemplateElement[]):
    TemplateStringsArray {
  const cooked = elements.map(q => {
    if (q.value.cooked === undefined) {
      throw new Error(
          `Unexpected undefined message part in "${elements.map(q => q.value.cooked)}"`);
    }
    return q.value.cooked;
  });
  const raw = elements.map(q => q.value.raw);
  return makeTemplateObject(cooked, raw);
}

/**
 * Wrap the given `expression` in parentheses if it is a binary expression.
 *
 * This ensures that this expression is evaluated correctly if it is embedded in another expression.
 *
 * @param expression The expression to potentially wrap.
 */
export function wrapInParensIfNecessary(expression: t.Expression): t.Expression {
  if (t.isBinaryExpression(expression)) {
    return t.parenthesizedExpression(expression);
  } else {
    return expression;
  }
}

/**
 * Extract the string values from an `array` of string literals.
 * @param array The array to unwrap.
 */
export function unwrapStringLiteralArray(array: t.Expression): string[] {
  if (!isStringLiteralArray(array)) {
    throw new Error('Unexpected messageParts for `$localize` (expected an array of strings).');
  }
  return array.elements.map((str: t.StringLiteral) => str.value);
}

/**
 * Is the given `node` an array of literal strings?
 *
 * @param node The node to test.
 */
export function isStringLiteralArray(node: t.Node): node is t.Expression&
    {elements: t.StringLiteral[]} {
  return t.isArrayExpression(node) && node.elements.every(element => t.isStringLiteral(element));
}

/**
 * Are all the given `nodes` expressions?
 * @param nodes The nodes to test.
 */
export function isArrayOfExpressions(nodes: t.Node[]): nodes is t.Expression[] {
  return nodes.every(element => t.isExpression(element));
}

/**
 * Translate the text of the given message, using the given translations.
 *
 * Logs as warning if the translation is not available
 */
export function translate(
    translations: Record<string, ParsedTranslation>, messageParts: TemplateStringsArray,
    substitutions: readonly any[]): [TemplateStringsArray, readonly any[]] {
  try {
    return ɵtranslate(translations, messageParts, substitutions);
  } catch (e) {
    console.warn(e.message);
    return [messageParts, substitutions];
  }
}
