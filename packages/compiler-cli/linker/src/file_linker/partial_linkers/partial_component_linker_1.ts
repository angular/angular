/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {compileComponentFromMetadata, ConstantPool, DeclarationListEmitMode, DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig, makeBindingParser, parseTemplate, R3ComponentMetadata, R3DeclareComponentMetadata, R3DeclareUsedDirectiveMetadata, R3PartialDeclaration, R3UsedDirectiveMetadata} from '@angular/compiler';
import {ChangeDetectionStrategy, ViewEncapsulation} from '@angular/compiler/src/core';
import * as o from '@angular/compiler/src/output/output_ast';

import {AbsoluteFsPath} from '../../../../src/ngtsc/file_system';
import {Range} from '../../ast/ast_host';
import {AstObject, AstValue} from '../../ast/ast_value';
import {FatalLinkerError} from '../../fatal_linker_error';
import {GetSourceFileFn} from '../get_source_file';

import {toR3DirectiveMeta} from './partial_directive_linker_1';
import {PartialLinker} from './partial_linker';
import {extractForwardRef} from './util';

/**
 * A `PartialLinker` that is designed to process `ɵɵngDeclareComponent()` call expressions.
 */
export class PartialComponentLinkerVersion1<TStatement, TExpression> implements
    PartialLinker<TExpression> {
  constructor(
      private readonly getSourceFile: GetSourceFileFn, private sourceUrl: AbsoluteFsPath,
      private code: string) {}

  linkPartialDeclaration(
      constantPool: ConstantPool,
      metaObj: AstObject<R3PartialDeclaration, TExpression>): o.Expression {
    const meta = this.toR3ComponentMeta(metaObj);
    const def = compileComponentFromMetadata(meta, constantPool, makeBindingParser());
    return def.expression;
  }

  /**
   * This function derives the `R3ComponentMetadata` from the provided AST object.
   */
  private toR3ComponentMeta(metaObj: AstObject<R3DeclareComponentMetadata, TExpression>):
      R3ComponentMetadata {
    const interpolation = parseInterpolationConfig(metaObj);
    const templateSource = metaObj.getValue('template');
    const isInline = metaObj.has('isInline') ? metaObj.getBoolean('isInline') : false;
    const templateInfo = this.getTemplateInfo(templateSource, isInline);

    const template = parseTemplate(templateInfo.code, templateInfo.sourceUrl, {
      escapedString: templateInfo.isEscaped,
      interpolationConfig: interpolation,
      range: templateInfo.range,
      enableI18nLegacyMessageIdFormat: false,
      preserveWhitespaces:
          metaObj.has('preserveWhitespaces') ? metaObj.getBoolean('preserveWhitespaces') : false,
      // We normalize line endings if the template is was inline.
      i18nNormalizeLineEndingsInICUs: isInline,
    });
    if (template.errors !== null) {
      const errors = template.errors.map(err => err.toString()).join('\n');
      throw new FatalLinkerError(
          templateSource.expression, `Errors found in the template:\n${errors}`);
    }

    let declarationListEmitMode = DeclarationListEmitMode.Direct;

    const collectUsedDirectives =
        (directives: AstValue<R3DeclareUsedDirectiveMetadata, TExpression>[]) => {
          return directives.map(directive => {
            const directiveExpr = directive.getObject();
            const type = directiveExpr.getValue('type');
            const selector = directiveExpr.getString('selector');

            const {expression: typeExpr, isForwardRef} = extractForwardRef(type);
            if (isForwardRef) {
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
        };

    let directives: R3UsedDirectiveMetadata[] = [];
    if (metaObj.has('components')) {
      directives.push(...collectUsedDirectives(metaObj.getArray('components')));
    }
    if (metaObj.has('directives')) {
      directives.push(...collectUsedDirectives(metaObj.getArray('directives')));
    }

    let pipes = new Map<string, o.Expression>();
    if (metaObj.has('pipes')) {
      pipes = metaObj.getObject('pipes').toMap(pipe => {
        const {expression: pipeType, isForwardRef} = extractForwardRef(pipe);
        if (isForwardRef) {
          declarationListEmitMode = DeclarationListEmitMode.Closure;
        }
        return pipeType;
      });
    }

    return {
      ...toR3DirectiveMeta(metaObj, this.code, this.sourceUrl),
      viewProviders: metaObj.has('viewProviders') ? metaObj.getOpaque('viewProviders') : null,
      template: {
        nodes: template.nodes,
        ngContentSelectors: template.ngContentSelectors,
      },
      declarationListEmitMode,
      styles: metaObj.has('styles') ? metaObj.getArray('styles').map(entry => entry.getString()) :
                                      [],
      encapsulation: metaObj.has('encapsulation') ?
          parseEncapsulation(metaObj.getValue('encapsulation')) :
          ViewEncapsulation.Emulated,
      interpolation,
      changeDetection: metaObj.has('changeDetection') ?
          parseChangeDetectionStrategy(metaObj.getValue('changeDetection')) :
          ChangeDetectionStrategy.Default,
      animations: metaObj.has('animations') ? metaObj.getOpaque('animations') : null,
      relativeContextFilePath: this.sourceUrl,
      i18nUseExternalIds: false,
      pipes,
      directives,
    };
  }

  /**
   * Update the range to remove the start and end chars, which should be quotes around the template.
   */
  private getTemplateInfo(templateNode: AstValue<unknown, TExpression>, isInline: boolean):
      TemplateInfo {
    const range = templateNode.getRange();

    if (!isInline) {
      // If not marked as inline, then we try to get the template info from the original external
      // template file, via source-mapping.
      const externalTemplate = this.tryExternalTemplate(range);
      if (externalTemplate !== null) {
        return externalTemplate;
      }
    }

    // Either the template is marked inline or we failed to find the original external template.
    // So just use the literal string from the partially compiled component declaration.
    return this.templateFromPartialCode(templateNode, range);
  }

  private tryExternalTemplate(range: Range): TemplateInfo|null {
    const sourceFile = this.getSourceFile();
    if (sourceFile === null) {
      return null;
    }

    const pos = sourceFile.getOriginalLocation(range.startLine, range.startCol);
    // Only interested if the original location is in an "external" template file:
    // * the file is different to the current file
    // * the file does not end in `.js` or `.ts` (we expect it to be something like `.html`).
    // * the range starts at the beginning of the file
    if (pos === null || pos.file === this.sourceUrl || /\.[jt]s$/.test(pos.file) ||
        pos.line !== 0 || pos.column !== 0) {
      return null;
    }

    const templateContents = sourceFile.sources.find(src => src?.sourcePath === pos.file)!.contents;

    return {
      code: templateContents,
      sourceUrl: pos.file,
      range: {startPos: 0, startLine: 0, startCol: 0, endPos: templateContents.length},
      isEscaped: false,
    };
  }

  private templateFromPartialCode(
      templateNode: AstValue<unknown, TExpression>,
      {startPos, endPos, startLine, startCol}: Range): TemplateInfo {
    if (!/["'`]/.test(this.code[startPos]) || this.code[startPos] !== this.code[endPos - 1]) {
      throw new FatalLinkerError(
          templateNode.expression,
          `Expected the template string to be wrapped in quotes but got: ${
              this.code.substring(startPos, endPos)}`);
    }
    return {
      code: this.code,
      sourceUrl: this.sourceUrl,
      range: {startPos: startPos + 1, endPos: endPos - 1, startLine, startCol: startCol + 1},
      isEscaped: true,
    };
  }
}

interface TemplateInfo {
  code: string;
  sourceUrl: string;
  range: Range;
  isEscaped: boolean;
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
