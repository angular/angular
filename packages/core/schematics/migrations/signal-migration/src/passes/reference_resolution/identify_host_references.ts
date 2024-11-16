/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getAngularDecorators} from '@angular/compiler-cli/src/ngtsc/annotations';
import {unwrapExpression} from '@angular/compiler-cli/src/ngtsc/annotations/common';
import {ReflectionHost, reflectObjectLiteral} from '@angular/compiler-cli/src/ngtsc/reflection';
import ts from 'typescript';
import {
  AST,
  ParseLocation,
  ParseSourceSpan,
  ParsedEvent,
  ParsedProperty,
  makeBindingParser,
} from '@angular/compiler';
import {ProgramInfo, projectFile} from '../../../../../utils/tsurge';
import {
  TemplateExpressionReferenceVisitor,
  TmplInputExpressionReference,
} from './template_reference_visitor';
import {ReferenceResult} from './reference_result';
import {ClassFieldDescriptor, KnownFields} from './known_fields';
import {ReferenceKind} from './reference_kinds';

/**
 * Checks host bindings of the given class and tracks all
 * references to inputs within bindings.
 */
export function identifyHostBindingReferences<D extends ClassFieldDescriptor>(
  node: ts.ClassDeclaration,
  programInfo: ProgramInfo,
  checker: ts.TypeChecker,
  reflector: ReflectionHost,
  result: ReferenceResult<D>,
  knownFields: KnownFields<D>,
  fieldNamesToConsiderForReferenceLookup: Set<string> | null,
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
    /* isAngularCore */ false,
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
  const expressionResult: TmplInputExpressionReference<ts.Node, D>[] = [];
  const expressionVisitor = new TemplateExpressionReferenceVisitor<ts.Node, D>(
    checker,
    null,
    node,
    knownFields,
    fieldNamesToConsiderForReferenceLookup,
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
      expressionResult.push(...expressionVisitor.checkTemplateExpression(expression, parsed));
    }
  }

  for (const ref of expressionResult) {
    result.references.push({
      kind: ReferenceKind.InHostBinding,
      from: {
        read: ref.read,
        readAstPath: ref.readAstPath,
        isObjectShorthandExpression: ref.isObjectShorthandExpression,
        isWrite: ref.isWrite,
        file: projectFile(ref.context.getSourceFile(), programInfo),
        hostPropertyNode: ref.context,
      },
      target: ref.targetField,
    });
  }
}
