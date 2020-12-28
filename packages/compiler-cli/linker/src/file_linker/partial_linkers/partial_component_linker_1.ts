/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {compileComponentFromMetadata, ConstantPool, DeclarationListEmitMode, DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig, makeBindingParser, parseTemplate, R3ComponentMetadata, R3DeclareComponentMetadata, R3PartialDeclaration, R3UsedDirectiveMetadata} from '@angular/compiler';
import {ChangeDetectionStrategy, ViewEncapsulation} from '@angular/compiler/src/core';
import * as o from '@angular/compiler/src/output/output_ast';

import {Range} from '../../ast/ast_host';
import {AstObject, AstValue} from '../../ast/ast_value';
import {FatalLinkerError} from '../../fatal_linker_error';
import {LinkerOptions} from '../linker_options';

import {toR3DirectiveMeta} from './partial_directive_linker_1';
import {PartialLinker} from './partial_linker';

/**
 * A `PartialLinker` that is designed to process `ɵɵngDeclareComponent()` call expressions.
 */
export class PartialComponentLinkerVersion1<TExpression> implements PartialLinker<TExpression> {
  constructor(private readonly options: LinkerOptions) {}

  linkPartialDeclaration(
      sourceUrl: string, code: string, constantPool: ConstantPool,
      metaObj: AstObject<R3PartialDeclaration, TExpression>): o.Expression {
    const meta = toR3ComponentMeta(metaObj, code, sourceUrl, this.options);
    const def = compileComponentFromMetadata(meta, constantPool, makeBindingParser());
    return def.expression;
  }
}

/**
 * This function derives the `R3ComponentMetadata` from the provided AST object.
 */
export function toR3ComponentMeta<TExpression>(
    metaObj: AstObject<R3DeclareComponentMetadata, TExpression>, code: string, sourceUrl: string,
    options: LinkerOptions): R3ComponentMetadata {
  const interpolation = parseInterpolationConfig(metaObj);
  const templateObj = metaObj.getObject('template');
  const templateSource = templateObj.getValue('source');
  const range = getTemplateRange(templateSource, code);
  const isInline = templateObj.getBoolean('isInline');

  // We always normalize line endings if the template is inline.
  const i18nNormalizeLineEndingsInICUs = isInline || options.i18nNormalizeLineEndingsInICUs;

  const template = parseTemplate(code, sourceUrl, {
    escapedString: true,
    interpolationConfig: interpolation,
    range,
    enableI18nLegacyMessageIdFormat: options.enableI18nLegacyMessageIdFormat,
    preserveWhitespaces:
        metaObj.has('preserveWhitespaces') ? metaObj.getBoolean('preserveWhitespaces') : false,
    i18nNormalizeLineEndingsInICUs,
    isInline,
  });
  if (template.errors !== null) {
    const errors = template.errors.map(err => err.toString()).join('\n');
    throw new FatalLinkerError(
        templateSource.expression, `Errors found in the template:\n${errors}`);
  }

  let declarationListEmitMode = DeclarationListEmitMode.Direct;

  let directives: R3UsedDirectiveMetadata[] = [];
  if (metaObj.has('directives')) {
    directives = metaObj.getArray('directives').map(directive => {
      const directiveExpr = directive.getObject();
      const type = directiveExpr.getValue('type');
      const selector = directiveExpr.getString('selector');

      let typeExpr = type.getOpaque();
      const forwardRefType = extractForwardRef(type);
      if (forwardRefType !== null) {
        typeExpr = forwardRefType;
        declarationListEmitMode = DeclarationListEmitMode.Closure;
      }

      return {
        type: typeExpr,
        selector: selector,
        inputs: directiveExpr.has('inputs') ?
            directiveExpr.getArray('inputs').map(input => input.getString()) :
            [],
        outputs: directiveExpr.has('outputs') ?
            directiveExpr.getArray('outputs').map(input => input.getString()) :
            [],
        exportAs: directiveExpr.has('exportAs') ?
            directiveExpr.getArray('exportAs').map(exportAs => exportAs.getString()) :
            null,
      };
    });
  }

  let pipes = new Map<string, o.Expression>();
  if (metaObj.has('pipes')) {
    pipes = metaObj.getObject('pipes').toMap(pipe => {
      const forwardRefType = extractForwardRef(pipe);
      if (forwardRefType !== null) {
        declarationListEmitMode = DeclarationListEmitMode.Closure;
        return forwardRefType;
      } else {
        return pipe.getOpaque();
      }
    });
  }

  return {
    ...toR3DirectiveMeta(metaObj, code, sourceUrl),
    viewProviders: metaObj.has('viewProviders') ? metaObj.getOpaque('viewProviders') : null,
    template: {
      nodes: template.nodes,
      ngContentSelectors: template.ngContentSelectors,
    },
    declarationListEmitMode,
    styles: metaObj.has('styles') ? metaObj.getArray('styles').map(entry => entry.getString()) : [],
    encapsulation: metaObj.has('encapsulation') ?
        parseEncapsulation(metaObj.getValue('encapsulation')) :
        ViewEncapsulation.Emulated,
    interpolation,
    changeDetection: metaObj.has('changeDetection') ?
        parseChangeDetectionStrategy(metaObj.getValue('changeDetection')) :
        ChangeDetectionStrategy.Default,
    animations: metaObj.has('animations') ? metaObj.getOpaque('animations') : null,
    relativeContextFilePath: sourceUrl,
    i18nUseExternalIds: options.i18nUseExternalIds,
    pipes,
    directives,
  };
}

/**
 * Extract an `InterpolationConfig` from the component declaration.
 */
function parseInterpolationConfig<TExpression>(
    metaObj: AstObject<R3DeclareComponentMetadata, TExpression>): InterpolationConfig {
  if (!metaObj.has('interpolation')) {
    return DEFAULT_INTERPOLATION_CONFIG;
  }

  const interpolationExpr = metaObj.getValue('interpolation');
  const values = interpolationExpr.getArray().map(entry => entry.getString());
  if (values.length !== 2) {
    throw new FatalLinkerError(
        interpolationExpr.expression,
        'Unsupported interpolation config, expected an array containing exactly two strings');
  }
  return InterpolationConfig.fromArray(values as [string, string]);
}

/**
 * Determines the `ViewEncapsulation` mode from the AST value's symbol name.
 */
function parseEncapsulation<TExpression>(encapsulation: AstValue<ViewEncapsulation, TExpression>):
    ViewEncapsulation {
  const symbolName = encapsulation.getSymbolName();
  if (symbolName === null) {
    throw new FatalLinkerError(
        encapsulation.expression, 'Expected encapsulation to have a symbol name');
  }
  const enumValue = ViewEncapsulation[symbolName as keyof typeof ViewEncapsulation];
  if (enumValue === undefined) {
    throw new FatalLinkerError(encapsulation.expression, 'Unsupported encapsulation');
  }
  return enumValue;
}

/**
 * Determines the `ChangeDetectionStrategy` from the AST value's symbol name.
 */
function parseChangeDetectionStrategy<TExpression>(
    changeDetectionStrategy: AstValue<ChangeDetectionStrategy, TExpression>):
    ChangeDetectionStrategy {
  const symbolName = changeDetectionStrategy.getSymbolName();
  if (symbolName === null) {
    throw new FatalLinkerError(
        changeDetectionStrategy.expression,
        'Expected change detection strategy to have a symbol name');
  }
  const enumValue = ChangeDetectionStrategy[symbolName as keyof typeof ChangeDetectionStrategy];
  if (enumValue === undefined) {
    throw new FatalLinkerError(
        changeDetectionStrategy.expression, 'Unsupported change detection strategy');
  }
  return enumValue;
}

/**
 * Update the range to remove the start and end chars, which should be quotes around the template.
 */
function getTemplateRange<TExpression>(
    templateNode: AstValue<unknown, TExpression>, code: string): Range {
  const {startPos, endPos, startLine, startCol} = templateNode.getRange();

  if (!/["'`]/.test(code[startPos]) || code[startPos] !== code[endPos - 1]) {
    throw new FatalLinkerError(
        templateNode.expression,
        `Expected the template string to be wrapped in quotes but got: ${
            code.substring(startPos, endPos)}`);
  }
  return {
    startPos: startPos + 1,
    endPos: endPos - 1,
    startLine,
    startCol: startCol + 1,
  };
}

/**
 * Extract the type reference expression from a `forwardRef` function call. For example, the
 * expression `forwardRef(function() { return FooDir; })` returns `FooDir`. Note that this
 * expression is required to be wrapped in a closure, as otherwise the forward reference would be
 * resolved before initialization.
 */
function extractForwardRef<TExpression>(expr: AstValue<unknown, TExpression>):
    o.WrappedNodeExpr<TExpression>|null {
  if (!expr.isCallExpression()) {
    return null;
  }

  const callee = expr.getCallee();
  if (callee.getSymbolName() !== 'forwardRef') {
    throw new FatalLinkerError(
        callee.expression, 'Unsupported directive type, expected forwardRef or a type reference');
  }

  const args = expr.getArguments();
  if (args.length !== 1) {
    throw new FatalLinkerError(expr, 'Unsupported forwardRef call, expected a single argument');
  }

  const wrapperFn = args[0] as AstValue<Function, TExpression>;
  if (!wrapperFn.isFunction()) {
    throw new FatalLinkerError(
        wrapperFn, 'Unsupported forwardRef call, expected a function argument');
  }

  return wrapperFn.getFunctionReturnValue().getOpaque();
}
