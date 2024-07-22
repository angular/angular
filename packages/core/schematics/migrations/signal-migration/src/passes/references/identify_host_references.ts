/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {getAngularDecorators} from '../../../../../../../compiler-cli/src/ngtsc/annotations';
import {unwrapExpression} from '../../../../../../../compiler-cli/src/ngtsc/annotations/common';
import {
  ReflectionHost,
  reflectObjectLiteral,
} from '../../../../../../../compiler-cli/src/ngtsc/reflection';
import {
  AST,
  ParseLocation,
  ParseSourceSpan,
  ParsedEvent,
  ParsedProperty,
  makeBindingParser,
} from '../../../../../../../compiler/public_api';
import {KnownInputs} from '../../input_detection/known_inputs';
import {
  TemplateExpressionReferenceVisitor,
  TmplInputExpressionReference,
} from '../../input_detection/template_reference_visitor';
import {MigrationHost} from '../../migration_host';
import {MigrationResult} from '../../result';
import {InputReferenceKind} from '../../utils/input_reference';

/**
 * Checks host bindings of the given class and tracks all
 * references to inputs within bindings.
 */
export function identifyHostBindingReferences(
  node: ts.ClassDeclaration,
  host: MigrationHost,
  checker: ts.TypeChecker,
  reflector: ReflectionHost,
  result: MigrationResult,
  knownDecoratorInputs: KnownInputs,
) {
  if (node.name === undefined) {
    return;
  }
  const decorators = reflector.getDecoratorsOfDeclaration(node);
  if (decorators === null) {
    return;
  }

  const angularDecorators = getAngularDecorators(
    decorators,
    ['Directive', 'Component'],
    host.isMigratingCore,
  );
  if (angularDecorators.length === 0) {
    return;
  }
  // Assume only one Angular decorator per class.
  const ngDecorator = angularDecorators[0];
  if (ngDecorator.args?.length !== 1) {
    return;
  }
  const metadataNode = unwrapExpression(ngDecorator.args[0]);
  if (!ts.isObjectLiteralExpression(metadataNode)) {
    return;
  }
  const metadata = reflectObjectLiteral(metadataNode);
  if (!metadata.has('host')) {
    return;
  }
  let hostField: ts.Node | undefined = unwrapExpression(metadata.get('host')!);

  // Special-case in case host bindings are shared via a variable.
  // e.g. Material button shares host bindings as a constant in the same target.
  if (ts.isIdentifier(hostField)) {
    let symbol = checker.getSymbolAtLocation(hostField);
    // Plain identifier references can point to alias symbols (e.g. imports).
    if (symbol !== undefined && symbol.flags & ts.SymbolFlags.Alias) {
      symbol = checker.getAliasedSymbol(symbol);
    }
    if (
      symbol !== undefined &&
      symbol.valueDeclaration !== undefined &&
      ts.isVariableDeclaration(symbol.valueDeclaration)
    ) {
      hostField = symbol?.valueDeclaration.initializer;
    }
  }

  if (hostField === undefined || !ts.isObjectLiteralExpression(hostField)) {
    return;
  }
  const hostMap = reflectObjectLiteral(hostField);
  const expressionResult: TmplInputExpressionReference<ts.Node>[] = [];
  const expressionVisitor = new TemplateExpressionReferenceVisitor(
    host,
    checker,
    null,
    node,
    knownDecoratorInputs,
    expressionResult,
  );

  for (const [rawName, expression] of hostMap.entries()) {
    if (!ts.isStringLiteralLike(expression)) {
      continue;
    }

    const isEventBinding = rawName.startsWith('(');
    const isPropertyBinding = rawName.startsWith('[');

    // Only migrate property or event bindings.
    if (!isPropertyBinding && !isEventBinding) {
      continue;
    }

    const parser = makeBindingParser();
    const sourceSpan: ParseSourceSpan = new ParseSourceSpan(
      // Fake source span to keep parsing offsets zero-based.
      // We then later combine these with the expression TS node offsets.
      new ParseLocation({content: '', url: ''}, 0, 0, 0),
      new ParseLocation({content: '', url: ''}, 0, 0, 0),
    );
    const name = rawName.substring(1, rawName.length - 1);

    let parsed: AST | undefined = undefined;
    if (isEventBinding) {
      const result: ParsedEvent[] = [];
      parser.parseEvent(
        name.substring(1, name.length - 1),
        expression.text,
        false,
        sourceSpan,
        sourceSpan,
        [],
        result,
        sourceSpan,
      );
      parsed = result[0].handler;
    } else {
      const result: ParsedProperty[] = [];
      parser.parsePropertyBinding(
        name,
        expression.text,
        true,
        /* isTwoWayBinding */ false,
        sourceSpan,
        0,
        sourceSpan,
        [],
        result,
        sourceSpan,
      );
      parsed = result[0].expression;
    }

    if (parsed != null) {
      expressionVisitor.checkTemplateExpression(expression, false, parsed);
    }
  }

  for (const ref of expressionResult) {
    result.references.push({
      kind: InputReferenceKind.InHostBinding,
      from: {
        read: ref.read,
        isObjectShorthandExpression: ref.isObjectShorthandExpression,
        fileId: host.fileToId(ref.context.getSourceFile()),
        hostPropertyNode: ref.context,
      },
      target: ref.targetInput,
    });
  }
}
