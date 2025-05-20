/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  ChangeDetectionStrategy,
  compileComponentFromMetadata,
  ConstantPool,
  DeclarationListEmitMode,
  DEFAULT_INTERPOLATION_CONFIG,
  DeferBlockDepsEmitMode,
  ForwardRefHandling,
  InterpolationConfig,
  makeBindingParser,
  outputAst as o,
  ParsedTemplate,
  parseTemplate,
  R3ComponentDeferMetadata,
  R3ComponentMetadata,
  R3DeclareComponentMetadata,
  R3DeclareDirectiveDependencyMetadata,
  R3DeclarePipeDependencyMetadata,
  R3DirectiveDependencyMetadata,
  R3PartialDeclaration,
  R3TargetBinder,
  R3TemplateDependencyKind,
  R3TemplateDependencyMetadata,
  TmplAstDeferredBlock,
  ViewEncapsulation,
} from '@angular/compiler';
import semver from 'semver';

import {AbsoluteFsPath} from '../../../../src/ngtsc/file_system';
import {Range} from '../../ast/ast_host';
import {AstObject, AstValue} from '../../ast/ast_value';
import {FatalLinkerError} from '../../fatal_linker_error';
import {GetSourceFileFn} from '../get_source_file';

import {toR3DirectiveMeta} from './partial_directive_linker_1';
import {LinkedDefinition, PartialLinker} from './partial_linker';
import {extractForwardRef, PLACEHOLDER_VERSION} from './util';

function makeDirectiveMetadata<TExpression>(
  directiveExpr: AstObject<R3DeclareDirectiveDependencyMetadata, TExpression>,
  typeExpr: o.WrappedNodeExpr<TExpression>,
  isComponentByDefault: true | null = null,
): R3DirectiveDependencyMetadata {
  return {
    kind: R3TemplateDependencyKind.Directive,
    isComponent:
      isComponentByDefault ||
      (directiveExpr.has('kind') && directiveExpr.getString('kind') === 'component'),
    type: typeExpr,
    selector: directiveExpr.getString('selector'),
    inputs: directiveExpr.has('inputs')
      ? directiveExpr.getArray('inputs').map((input) => input.getString())
      : [],
    outputs: directiveExpr.has('outputs')
      ? directiveExpr.getArray('outputs').map((input) => input.getString())
      : [],
    exportAs: directiveExpr.has('exportAs')
      ? directiveExpr.getArray('exportAs').map((exportAs) => exportAs.getString())
      : null,
  };
}

/**
 * A `PartialLinker` that is designed to process `ɵɵngDeclareComponent()` call expressions.
 */
export class PartialComponentLinkerVersion1<TStatement, TExpression>
  implements PartialLinker<TExpression>
{
  constructor(
    private readonly getSourceFile: GetSourceFileFn,
    private sourceUrl: AbsoluteFsPath,
    private code: string,
  ) {}

  linkPartialDeclaration(
    constantPool: ConstantPool,
    metaObj: AstObject<R3PartialDeclaration, TExpression>,
    version: string,
  ): LinkedDefinition {
    const meta = this.toR3ComponentMeta(metaObj, version);
    return compileComponentFromMetadata(meta, constantPool, makeBindingParser());
  }

  /**
   * This function derives the `R3ComponentMetadata` from the provided AST object.
   */
  private toR3ComponentMeta(
    metaObj: AstObject<R3DeclareComponentMetadata, TExpression>,
    version: string,
  ): R3ComponentMetadata<R3TemplateDependencyMetadata> {
    const interpolation = parseInterpolationConfig(metaObj);
    const templateSource = metaObj.getValue('template');
    const isInline = metaObj.has('isInline') ? metaObj.getBoolean('isInline') : false;
    const templateInfo = this.getTemplateInfo(templateSource, isInline);
    const {major, minor} = new semver.SemVer(version);

    // Enable the new block syntax if compiled with v17 and
    // above, or when using the local placeholder version.
    const enableBlockSyntax = major >= 17 || version === PLACEHOLDER_VERSION;
    const enableLetSyntax =
      major > 18 || (major === 18 && minor >= 1) || version === PLACEHOLDER_VERSION;

    const template = parseTemplate(templateInfo.code, templateInfo.sourceUrl, {
      escapedString: templateInfo.isEscaped,
      interpolationConfig: interpolation,
      range: templateInfo.range,
      enableI18nLegacyMessageIdFormat: false,
      preserveWhitespaces: metaObj.has('preserveWhitespaces')
        ? metaObj.getBoolean('preserveWhitespaces')
        : false,
      // We normalize line endings if the template is was inline.
      i18nNormalizeLineEndingsInICUs: isInline,
      enableBlockSyntax,
      enableLetSyntax,
      // TODO(crisbeto): figure out how this is enabled.
      enableSelectorless: false,
    });
    if (template.errors !== null) {
      const errors = template.errors.map((err) => err.toString()).join('\n');
      throw new FatalLinkerError(
        templateSource.expression,
        `Errors found in the template:\n${errors}`,
      );
    }

    let declarationListEmitMode = DeclarationListEmitMode.Direct;

    const extractDeclarationTypeExpr = (
      type: AstValue<o.Expression | (() => o.Expression), TExpression>,
    ) => {
      const {expression, forwardRef} = extractForwardRef(type);
      if (forwardRef === ForwardRefHandling.Unwrapped) {
        declarationListEmitMode = DeclarationListEmitMode.Closure;
      }
      return expression;
    };

    let declarations: R3TemplateDependencyMetadata[] = [];

    // There are two ways that declarations (directives/pipes) can be represented in declare
    // metadata. The "old style" uses separate fields for each (arrays for components/directives and
    // an object literal for pipes). The "new style" uses a unified `dependencies` array. For
    // backwards compatibility, both are processed and unified here:

    // Process the old style fields:
    if (metaObj.has('components')) {
      declarations.push(
        ...metaObj.getArray('components').map((dir) => {
          const dirExpr = dir.getObject();
          const typeExpr = extractDeclarationTypeExpr(dirExpr.getValue('type'));
          return makeDirectiveMetadata(dirExpr, typeExpr, /* isComponentByDefault */ true);
        }),
      );
    }
    if (metaObj.has('directives')) {
      declarations.push(
        ...metaObj.getArray('directives').map((dir) => {
          const dirExpr = dir.getObject();
          const typeExpr = extractDeclarationTypeExpr(dirExpr.getValue('type'));
          return makeDirectiveMetadata(dirExpr, typeExpr);
        }),
      );
    }
    if (metaObj.has('pipes')) {
      const pipes = metaObj.getObject('pipes').toMap((pipe) => pipe);
      for (const [name, type] of pipes) {
        const typeExpr = extractDeclarationTypeExpr(type);
        declarations.push({
          kind: R3TemplateDependencyKind.Pipe,
          name,
          type: typeExpr,
        });
      }
    }

    // Process the new style field:
    if (metaObj.has('dependencies')) {
      for (const dep of metaObj.getArray('dependencies')) {
        const depObj = dep.getObject();
        const typeExpr = extractDeclarationTypeExpr(depObj.getValue('type'));

        switch (depObj.getString('kind')) {
          case 'directive':
          case 'component':
            declarations.push(makeDirectiveMetadata(depObj, typeExpr));
            break;
          case 'pipe':
            const pipeObj = depObj as AstObject<
              R3DeclarePipeDependencyMetadata & {kind: 'pipe'},
              TExpression
            >;
            declarations.push({
              kind: R3TemplateDependencyKind.Pipe,
              name: pipeObj.getString('name'),
              type: typeExpr,
            });
            break;
          case 'ngmodule':
            declarations.push({
              kind: R3TemplateDependencyKind.NgModule,
              type: typeExpr,
            });
            break;
          default:
            // Skip unknown types of dependencies.
            continue;
        }
      }
    }

    return {
      ...toR3DirectiveMeta(metaObj, this.code, this.sourceUrl, version),
      viewProviders: metaObj.has('viewProviders') ? metaObj.getOpaque('viewProviders') : null,
      template: {
        nodes: template.nodes,
        ngContentSelectors: template.ngContentSelectors,
      },
      declarationListEmitMode,
      styles: metaObj.has('styles')
        ? metaObj.getArray('styles').map((entry) => entry.getString())
        : [],
      defer: this.createR3ComponentDeferMetadata(metaObj, template),
      encapsulation: metaObj.has('encapsulation')
        ? parseEncapsulation(metaObj.getValue('encapsulation'))
        : ViewEncapsulation.Emulated,
      interpolation,
      changeDetection: metaObj.has('changeDetection')
        ? parseChangeDetectionStrategy(metaObj.getValue('changeDetection'))
        : ChangeDetectionStrategy.Default,
      animations: metaObj.has('animations') ? metaObj.getOpaque('animations') : null,
      relativeContextFilePath: this.sourceUrl,
      relativeTemplatePath: null,
      i18nUseExternalIds: false,
      declarations,
    };
  }

  /**
   * Update the range to remove the start and end chars, which should be quotes around the template.
   */
  private getTemplateInfo(
    templateNode: AstValue<unknown, TExpression>,
    isInline: boolean,
  ): TemplateInfo {
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

  private tryExternalTemplate(range: Range): TemplateInfo | null {
    const sourceFile = this.getSourceFile();
    if (sourceFile === null) {
      return null;
    }

    const pos = sourceFile.getOriginalLocation(range.startLine, range.startCol);
    // Only interested if the original location is in an "external" template file:
    // * the file is different to the current file
    // * the file does not end in `.js` or `.ts` (we expect it to be something like `.html`).
    // * the range starts at the beginning of the file
    if (
      pos === null ||
      pos.file === this.sourceUrl ||
      /\.[jt]s$/.test(pos.file) ||
      pos.line !== 0 ||
      pos.column !== 0
    ) {
      return null;
    }

    const templateContents = sourceFile.sources.find(
      (src) => src?.sourcePath === pos.file,
    )!.contents;

    return {
      code: templateContents,
      sourceUrl: pos.file,
      range: {startPos: 0, startLine: 0, startCol: 0, endPos: templateContents.length},
      isEscaped: false,
    };
  }

  private templateFromPartialCode(
    templateNode: AstValue<unknown, TExpression>,
    {startPos, endPos, startLine, startCol}: Range,
  ): TemplateInfo {
    if (!/["'`]/.test(this.code[startPos]) || this.code[startPos] !== this.code[endPos - 1]) {
      throw new FatalLinkerError(
        templateNode.expression,
        `Expected the template string to be wrapped in quotes but got: ${this.code.substring(
          startPos,
          endPos,
        )}`,
      );
    }
    return {
      code: this.code,
      sourceUrl: this.sourceUrl,
      range: {startPos: startPos + 1, endPos: endPos - 1, startLine, startCol: startCol + 1},
      isEscaped: true,
    };
  }

  private createR3ComponentDeferMetadata(
    metaObj: AstObject<R3DeclareComponentMetadata, TExpression>,
    template: ParsedTemplate,
  ): R3ComponentDeferMetadata {
    const result: R3ComponentDeferMetadata = {
      mode: DeferBlockDepsEmitMode.PerBlock,
      blocks: new Map<TmplAstDeferredBlock, o.Expression | null>(),
    };

    // Exit early if the template is empty.
    if (template.nodes.length === 0) {
      return result;
    }

    // We're only using the bound target to find defer blocks
    // so don't set up infrastructure for directive matching.
    const boundTarget = new R3TargetBinder(null).bind({template: template.nodes});
    const deferredBlocks = boundTarget.getDeferBlocks();
    const dependencies = metaObj.has('deferBlockDependencies')
      ? metaObj.getArray('deferBlockDependencies')
      : null;

    for (let i = 0; i < deferredBlocks.length; i++) {
      const matchingDependencyFn = dependencies?.[i];

      if (matchingDependencyFn == null) {
        result.blocks.set(deferredBlocks[i], null);
      } else {
        result.blocks.set(
          deferredBlocks[i],
          matchingDependencyFn.isNull() ? null : matchingDependencyFn.getOpaque(),
        );
      }
    }

    return result;
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
  metaObj: AstObject<R3DeclareComponentMetadata, TExpression>,
): InterpolationConfig {
  if (!metaObj.has('interpolation')) {
    return DEFAULT_INTERPOLATION_CONFIG;
  }

  const interpolationExpr = metaObj.getValue('interpolation');
  const values = interpolationExpr.getArray().map((entry) => entry.getString());
  if (values.length !== 2) {
    throw new FatalLinkerError(
      interpolationExpr.expression,
      'Unsupported interpolation config, expected an array containing exactly two strings',
    );
  }
  return InterpolationConfig.fromArray(values as [string, string]);
}

/**
 * Determines the `ViewEncapsulation` mode from the AST value's symbol name.
 */
function parseEncapsulation<TExpression>(
  encapsulation: AstValue<ViewEncapsulation | undefined, TExpression>,
): ViewEncapsulation {
  const symbolName = encapsulation.getSymbolName();
  if (symbolName === null) {
    throw new FatalLinkerError(
      encapsulation.expression,
      'Expected encapsulation to have a symbol name',
    );
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
  changeDetectionStrategy: AstValue<ChangeDetectionStrategy | undefined, TExpression>,
): ChangeDetectionStrategy {
  const symbolName = changeDetectionStrategy.getSymbolName();
  if (symbolName === null) {
    throw new FatalLinkerError(
      changeDetectionStrategy.expression,
      'Expected change detection strategy to have a symbol name',
    );
  }
  const enumValue = ChangeDetectionStrategy[symbolName as keyof typeof ChangeDetectionStrategy];
  if (enumValue === undefined) {
    throw new FatalLinkerError(
      changeDetectionStrategy.expression,
      'Unsupported change detection strategy',
    );
  }
  return enumValue;
}
