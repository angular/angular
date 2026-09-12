/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  LexerRange,
  ParsedTemplate,
  ParseSourceFile,
  parseTemplate,
  ParseTemplateOptions,
  TmplAstNode,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../../diagnostics';
import {absoluteFrom} from '../../../file_system';
import {DependencyTracker} from '../../../incremental/api';
import {Resource} from '../../../metadata';
import {PartialEvaluator} from '../../../partial_evaluator';
import {ClassDeclaration, DeclarationNode, Decorator} from '../../../reflection';
import {CompilationMode} from '../../../transform';
import {SourceMapping} from '../../../typecheck/api';
import {
  createValueHasWrongTypeError,
  isStringArray,
  ResourceLoader,
  assertLocalCompilationUnresolvedConst,
} from '../../common';
import {
  extractDirectiveStyleUrls,
  extractInlineStyleResources,
  extractStyleUrlsFromExpression,
  makeResourceNotFoundError,
  ResourceTypeForDiagnostics,
  StyleUrlMeta,
  transformDecoratorResources,
} from '../../directive';

export {
  ResourceTypeForDiagnostics,
  StyleUrlMeta,
  makeResourceNotFoundError,
  transformDecoratorResources,
  extractInlineStyleResources,
  extractStyleUrlsFromExpression,
};

/**
 * Information about the template which was extracted during parsing.
 *
 * This contains the actual parsed template as well as any metadata collected during its parsing,
 * some of which might be useful for re-parsing the template with different options.
 */
export interface ParsedComponentTemplate extends ParsedTemplate {
  /**
   * The template AST, parsed in a manner which preserves source map information for diagnostics.
   *
   * Not useful for emit.
   */
  diagNodes: TmplAstNode[];

  /**
   * The `ParseSourceFile` for the template.
   */
  file: ParseSourceFile;
}

export interface ParsedTemplateWithSource extends ParsedComponentTemplate {
  /** The string contents of the template. */
  content: string;
  sourceMapping: SourceMapping;
  declaration: TemplateDeclaration;
}

/**
 * Common fields extracted from the declaration of a template.
 */
interface CommonTemplateDeclaration {
  preserveWhitespaces: boolean;
  templateUrl: string;
  resolvedTemplateUrl: string;
}

/**
 * Information extracted from the declaration of an inline template.
 */
export interface InlineTemplateDeclaration extends CommonTemplateDeclaration {
  isInline: true;
  expression: ts.Expression;
}

/**
 * Information extracted from the declaration of an external template.
 */
export interface ExternalTemplateDeclaration extends CommonTemplateDeclaration {
  isInline: false;
  templateUrlExpression: ts.Expression;
}

/**
 * The declaration of a template extracted from a component decorator.
 *
 * This data is extracted and stored separately to facilitate re-interpreting the template
 * declaration whenever the compiler is notified of a change to a template file. With this
 * information, `ComponentDecoratorHandler` is able to re-read the template and update the component
 * record without needing to parse the original decorator again.
 */
export type TemplateDeclaration = InlineTemplateDeclaration | ExternalTemplateDeclaration;

/** Determines the node to use for debugging purposes for the given TemplateDeclaration. */
export function getTemplateDeclarationNodeForError(
  declaration: TemplateDeclaration,
): ts.Expression {
  return declaration.isInline ? declaration.expression : declaration.templateUrlExpression;
}

export interface ExtractTemplateOptions {
  usePoisonedData: boolean;
  enableI18nLegacyMessageIdFormat: boolean;
  i18nNormalizeLineEndingsInICUs: boolean;
  enableBlockSyntax: boolean;
  enableLetSyntax: boolean;
  enableSelectorless: boolean;
  preserveSignificantWhitespace?: boolean;
}

export function extractTemplate(
  node: ClassDeclaration,
  template: TemplateDeclaration,
  evaluator: PartialEvaluator,
  depTracker: DependencyTracker | null,
  resourceLoader: ResourceLoader,
  options: ExtractTemplateOptions,
  compilationMode: CompilationMode,
): ParsedTemplateWithSource {
  if (template.isInline) {
    let sourceStr: string;
    let sourceParseRange: LexerRange | null = null;
    let templateContent: string;
    let sourceMapping: SourceMapping;
    let escapedString = false;
    let sourceMapUrl: string | null;
    // We only support SourceMaps for inline templates that are simple string literals.
    if (
      ts.isStringLiteral(template.expression) ||
      ts.isNoSubstitutionTemplateLiteral(template.expression)
    ) {
      // the start and end of the `templateExpr` node includes the quotation marks, which we must
      // strip
      sourceParseRange = getTemplateRange(template.expression);
      sourceStr = template.expression.getSourceFile().text;
      templateContent = template.expression.text;
      escapedString = true;
      sourceMapping = {
        type: 'direct',
        node: template.expression,
      };
      sourceMapUrl = template.resolvedTemplateUrl;
    } else {
      const resolvedTemplate = evaluator.evaluate(template.expression);

      // The identifier used for @Component.template cannot be resolved in local compilation mode. An error specific to this situation is generated.
      assertLocalCompilationUnresolvedConst(
        compilationMode,
        resolvedTemplate,
        template.expression,
        'Unresolved identifier found for @Component.template field! ' +
          'Did you import this identifier from a file outside of the compilation unit? ' +
          'This is not allowed when Angular compiler runs in local mode. ' +
          'Possible solutions: 1) Move the declaration into a file within the ' +
          'compilation unit, 2) Inline the template, 3) Move the template into ' +
          'a separate .html file and include it using @Component.templateUrl',
      );

      if (typeof resolvedTemplate !== 'string') {
        throw createValueHasWrongTypeError(
          template.expression,
          resolvedTemplate,
          'template must be a string',
        );
      }
      // We do not parse the template directly from the source file using a lexer range, so
      // the template source and content are set to the statically resolved template.
      sourceStr = resolvedTemplate;
      templateContent = resolvedTemplate;
      sourceMapping = {
        type: 'indirect',
        node: template.expression,
        componentClass: node,
        template: templateContent,
      };

      // Indirect templates cannot be mapped to a particular byte range of any input file, since
      // they're computed by expressions that may span many files. Don't attempt to map them back
      // to a given file.
      sourceMapUrl = null;
    }

    return {
      ...parseExtractedTemplate(
        template,
        sourceStr,
        sourceParseRange,
        escapedString,
        sourceMapUrl,
        options,
      ),
      content: templateContent,
      sourceMapping,
      declaration: template,
    };
  } else {
    const templateContent = resourceLoader.load(template.resolvedTemplateUrl);
    if (depTracker !== null) {
      depTracker.addResourceDependency(
        node.getSourceFile(),
        absoluteFrom(template.resolvedTemplateUrl),
      );
    }

    return {
      ...parseExtractedTemplate(
        template,
        /* sourceStr */ templateContent,
        /* sourceParseRange */ null,
        /* escapedString */ false,
        /* sourceMapUrl */ template.resolvedTemplateUrl,
        options,
      ),
      content: templateContent,
      sourceMapping: {
        type: 'external',
        componentClass: node,
        node: template.templateUrlExpression,
        template: templateContent,
        templateUrl: template.resolvedTemplateUrl,
      },
      declaration: template,
    };
  }
}

export function createEmptyTemplate(
  componentClass: ClassDeclaration,
  component: Map<string, ts.Expression>,
  containingFile: string,
): ParsedTemplateWithSource {
  const templateUrl = component.get('templateUrl');
  const template = component.get('template');

  return {
    content: '',
    diagNodes: [],
    nodes: [],
    errors: null,
    styles: [],
    styleUrls: [],
    ngContentSelectors: [],
    file: new ParseSourceFile('', ''),
    sourceMapping: templateUrl
      ? {type: 'direct', node: template as ts.StringLiteral}
      : {
          type: 'external',
          componentClass,
          node: templateUrl!,
          template: '',
          templateUrl: 'missing.ng.html',
        },
    declaration: templateUrl
      ? {
          isInline: false,
          preserveWhitespaces: false,
          templateUrlExpression: templateUrl,
          templateUrl: 'missing.ng.html',
          resolvedTemplateUrl: '/missing.ng.html',
        }
      : {
          isInline: true,
          preserveWhitespaces: false,
          expression: template!,
          templateUrl: containingFile,
          resolvedTemplateUrl: containingFile,
        },
  };
}

function parseExtractedTemplate(
  template: TemplateDeclaration,
  sourceStr: string,
  sourceParseRange: LexerRange | null,
  escapedString: boolean,
  sourceMapUrl: string | null,
  options: ExtractTemplateOptions,
): ParsedComponentTemplate {
  // We always normalize line endings if the template has been escaped (i.e. is inline).
  const i18nNormalizeLineEndingsInICUs = escapedString || options.i18nNormalizeLineEndingsInICUs;
  const commonParseOptions: ParseTemplateOptions = {
    range: sourceParseRange ?? undefined,
    enableI18nLegacyMessageIdFormat: options.enableI18nLegacyMessageIdFormat,
    i18nNormalizeLineEndingsInICUs,
    alwaysAttemptHtmlToR3AstConversion: options.usePoisonedData,
    escapedString,
    enableBlockSyntax: options.enableBlockSyntax,
    enableLetSyntax: options.enableLetSyntax,
    enableSelectorless: options.enableSelectorless,
  };

  const parsedTemplate = parseTemplate(sourceStr, sourceMapUrl ?? '', {
    ...commonParseOptions,
    preserveWhitespaces: template.preserveWhitespaces,
    preserveSignificantWhitespace: options.preserveSignificantWhitespace,
  });

  // Unfortunately, the primary parse of the template above may not contain accurate source map
  // information. If used directly, it would result in incorrect code locations in template
  // errors, etc. There are three main problems:
  //
  // 1. `preserveWhitespaces: false` or `preserveSignificantWhitespace: false` annihilates the
  //    correctness of template source mapping, as the whitespace transformation changes the
  //    contents of HTML text nodes before they're parsed into Angular expressions.
  // 2. `preserveLineEndings: false` causes growing misalignments in templates that use '\r\n'
  //    line endings, by normalizing them to '\n'.
  // 3. By default, the template parser strips leading trivia characters (like spaces, tabs, and
  //    newlines). This also destroys source mapping information.
  //
  // In order to guarantee the correctness of diagnostics, templates are parsed a second time
  // with the above options set to preserve source mappings.

  const {nodes: diagNodes} = parseTemplate(sourceStr, sourceMapUrl ?? '', {
    ...commonParseOptions,
    preserveWhitespaces: true,
    preserveLineEndings: true,
    preserveSignificantWhitespace: true,
    leadingTriviaChars: [],
  });

  return {
    ...parsedTemplate,
    diagNodes,
    file: new ParseSourceFile(sourceStr, sourceMapUrl ?? ''),
  };
}

export function parseTemplateDeclaration(
  node: ClassDeclaration,
  decorator: Decorator,
  component: Map<string, ts.Expression>,
  containingFile: string,
  evaluator: PartialEvaluator,
  depTracker: DependencyTracker | null,
  resourceLoader: ResourceLoader,
  defaultPreserveWhitespaces: boolean,
): TemplateDeclaration {
  let preserveWhitespaces: boolean = defaultPreserveWhitespaces;
  if (component.has('preserveWhitespaces')) {
    const expr = component.get('preserveWhitespaces')!;
    const value = evaluator.evaluate(expr);
    if (typeof value !== 'boolean') {
      throw createValueHasWrongTypeError(expr, value, 'preserveWhitespaces must be a boolean');
    }
    preserveWhitespaces = value;
  }

  if (component.has('interpolation')) {
    const expr = component.get('interpolation')!;
    const value = evaluator.evaluate(expr);
    if (
      !Array.isArray(value) ||
      value.length !== 2 ||
      !value.every((element) => typeof element === 'string')
    ) {
      throw createValueHasWrongTypeError(
        expr,
        value,
        'interpolation must be an array with 2 elements of string type',
      );
    }
  }

  if (component.has('templateUrl')) {
    const templateUrlExpr = component.get('templateUrl')!;
    const templateUrl = evaluator.evaluate(templateUrlExpr);
    if (typeof templateUrl !== 'string') {
      throw createValueHasWrongTypeError(
        templateUrlExpr,
        templateUrl,
        'templateUrl must be a string',
      );
    }
    try {
      const resourceUrl = resourceLoader.resolve(templateUrl, containingFile);
      return {
        isInline: false,
        preserveWhitespaces,
        templateUrl,
        templateUrlExpression: templateUrlExpr,
        resolvedTemplateUrl: resourceUrl,
      };
    } catch (e) {
      if (depTracker !== null) {
        // The analysis of this file cannot be re-used if the template URL could
        // not be resolved. Future builds should re-analyze and re-attempt resolution.
        depTracker.recordDependencyAnalysisFailure(node.getSourceFile());
      }

      throw makeResourceNotFoundError(
        templateUrl,
        templateUrlExpr,
        ResourceTypeForDiagnostics.Template,
      );
    }
  } else if (component.has('template')) {
    return {
      isInline: true,
      preserveWhitespaces,
      expression: component.get('template')!,
      templateUrl: containingFile,
      resolvedTemplateUrl: containingFile,
    };
  } else {
    throw new FatalDiagnosticError(
      ErrorCode.COMPONENT_MISSING_TEMPLATE,
      decorator.node,
      '@Component is missing a template. Add either a `template` or `templateUrl`',
    );
  }
}

export function preloadAndParseTemplate(
  evaluator: PartialEvaluator,
  resourceLoader: ResourceLoader,
  depTracker: DependencyTracker | null,
  preanalyzeTemplateCache: Map<DeclarationNode, ParsedTemplateWithSource>,
  node: ClassDeclaration,
  decorator: Decorator,
  component: Map<string, ts.Expression>,
  containingFile: string,
  defaultPreserveWhitespaces: boolean,
  options: ExtractTemplateOptions,
  compilationMode: CompilationMode,
): Promise<ParsedTemplateWithSource | null> {
  if (component.has('templateUrl')) {
    // Extract the templateUrl and preload it.
    const templateUrlExpr = component.get('templateUrl')!;
    const templateUrl = evaluator.evaluate(templateUrlExpr);
    if (typeof templateUrl !== 'string') {
      throw createValueHasWrongTypeError(
        templateUrlExpr,
        templateUrl,
        'templateUrl must be a string',
      );
    }
    try {
      const resourceUrl = resourceLoader.resolve(templateUrl, containingFile);
      const templatePromise = resourceLoader.preload(resourceUrl, {
        type: 'template',
        containingFile,
        className: node.name.text,
      });

      // If the preload worked, then actually load and parse the template, and wait for any
      // style URLs to resolve.
      if (templatePromise !== undefined) {
        return templatePromise.then(() => {
          const templateDecl = parseTemplateDeclaration(
            node,
            decorator,
            component,
            containingFile,
            evaluator,
            depTracker,
            resourceLoader,
            defaultPreserveWhitespaces,
          );
          const template = extractTemplate(
            node,
            templateDecl,
            evaluator,
            depTracker,
            resourceLoader,
            options,
            compilationMode,
          );
          preanalyzeTemplateCache.set(node, template);
          return template;
        });
      } else {
        return Promise.resolve(null);
      }
    } catch (e) {
      if (depTracker !== null) {
        // The analysis of this file cannot be re-used if the template URL could
        // not be resolved. Future builds should re-analyze and re-attempt resolution.
        depTracker.recordDependencyAnalysisFailure(node.getSourceFile());
      }

      throw makeResourceNotFoundError(
        templateUrl,
        templateUrlExpr,
        ResourceTypeForDiagnostics.Template,
      );
    }
  } else {
    const templateDecl = parseTemplateDeclaration(
      node,
      decorator,
      component,
      containingFile,
      evaluator,
      depTracker,
      resourceLoader,
      defaultPreserveWhitespaces,
    );
    const template = extractTemplate(
      node,
      templateDecl,
      evaluator,
      depTracker,
      resourceLoader,
      options,
      compilationMode,
    );
    preanalyzeTemplateCache.set(node, template);
    return Promise.resolve(template);
  }
}

function getTemplateRange(templateExpr: ts.Expression) {
  const startPos = templateExpr.getStart() + 1;
  const {line, character} = ts.getLineAndCharacterOfPosition(
    templateExpr.getSourceFile(),
    startPos,
  );
  return {
    startPos,
    startLine: line,
    startCol: character,
    endPos: templateExpr.getEnd() - 1,
  };
}

export function extractComponentStyleUrls(
  evaluator: PartialEvaluator,
  component: Map<string, ts.Expression>,
): StyleUrlMeta[] {
  return extractDirectiveStyleUrls(evaluator, component, '@Component');
}

export function _extractTemplateStyleUrls(template: ParsedTemplateWithSource): StyleUrlMeta[] {
  if (template.styleUrls === null) {
    return [];
  }

  const expression = getTemplateDeclarationNodeForError(template.declaration);
  return template.styleUrls.map((url) => ({
    url,
    source: ResourceTypeForDiagnostics.StylesheetFromTemplate,
    expression,
  }));
}
