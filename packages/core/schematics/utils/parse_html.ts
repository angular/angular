/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Block,
  Element,
  HtmlParser,
  LetDeclaration,
  ParseTreeResult,
  RecursiveVisitor,
  Text,
  TmplAstNode,
  visitAll,
} from '@angular/compiler';

export interface ParseResult {
  tree: ParseTreeResult | undefined;
  errors: MigrateError[];
}

/**
 * Represents an error that happened during migration
 */
export type MigrateError = {
  type: string;
  error: unknown;
};

/**
 * Parses the given HTML content using the Angular compiler. In case the parsing
 * fails, null is being returned.
 */
export function parseHtmlGracefully(
  htmlContent: string,
  filePath: string,
  compilerModule: typeof import('@angular/compiler'),
): TmplAstNode[] | null {
  try {
    return compilerModule.parseTemplate(htmlContent, filePath).nodes;
  } catch {
    // Do nothing if the template couldn't be parsed. We don't want to throw any
    // exception if a template is syntactically not valid. e.g. template could be
    // using preprocessor syntax.
    return null;
  }
}

/**
 * parses the template string into the Html AST
 */
export function parseTemplate(template: string): ParseResult {
  let parsed: ParseTreeResult;
  try {
    // Note: we use the HtmlParser here, instead of the `parseTemplate` function, because the
    // latter returns an Ivy AST, not an HTML AST. The HTML AST has the advantage of preserving
    // interpolated text as text nodes containing a mixture of interpolation tokens and text tokens,
    // rather than turning them into `BoundText` nodes like the Ivy AST does. This allows us to
    // easily get the text-only ranges without having to reconstruct the original text.
    parsed = new HtmlParser().parse(template, '', {
      // Allows for ICUs to be parsed.
      tokenizeExpansionForms: true,
      // Explicitly disable blocks so that their characters are treated as plain text.
      tokenizeBlocks: true,
      preserveLineEndings: true,
    });

    // Don't migrate invalid templates.
    if (parsed.errors && parsed.errors.length > 0) {
      const errors = parsed.errors.map((e) => ({type: 'parse', error: e}));
      return {tree: undefined, errors};
    }
  } catch (e: any) {
    return {tree: undefined, errors: [{type: 'parse', error: e}]};
  }
  return {tree: parsed, errors: []};
}

function pipeMatchRegExpFor(name: string): RegExp {
  return new RegExp(`\\|\\s*${name}`);
}

const commonModulePipes = [
  'date',
  'async',
  'currency',
  'number',
  'i18nPlural',
  'i18nSelect',
  'json',
  'keyvalue',
  'slice',
  'lowercase',
  'uppercase',
  'titlecase',
  'percent',
].map((name) => pipeMatchRegExpFor(name));

function allFormsOf(selector: string): string[] {
  return [selector, `*${selector}`, `[${selector}]`];
}

const commonModuleDirectives = new Set([
  ...allFormsOf('ngComponentOutlet'),
  ...allFormsOf('ngTemplateOutlet'),
  ...allFormsOf('ngClass'),
  ...allFormsOf('ngPlural'),
  ...allFormsOf('ngPluralCase'),
  ...allFormsOf('ngStyle'),
  ...allFormsOf('ngTemplateOutlet'),
  ...allFormsOf('ngComponentOutlet'),
  '[NgForOf]',
  '[NgForTrackBy]',
  '[ngIfElse]',
  '[ngIfThenElse]',
  '*ngIf',
  '*ngSwitch',
  '*ngFor',
]);

/**
 * determines if the CommonModule can be safely removed from imports
 */
export function canRemoveCommonModule(template: string): boolean {
  const parsed = parseTemplate(template);
  let removeCommonModule = false;
  if (parsed.tree !== undefined) {
    const visitor = new CommonCollector();
    visitAll(visitor, parsed.tree.rootNodes);
    removeCommonModule = visitor.count === 0;
  }
  return removeCommonModule;
}

/** Finds all non-control flow elements from common module. */
class CommonCollector extends RecursiveVisitor {
  count = 0;

  override visitElement(el: Element): void {
    if (el.attrs.length > 0) {
      for (const attr of el.attrs) {
        if (this.hasDirectives(attr.name) || this.hasPipes(attr.value)) {
          this.count++;
        }
      }
    }
    super.visitElement(el, null);
  }

  override visitBlock(ast: Block): void {
    for (const blockParam of ast.parameters) {
      if (this.hasPipes(blockParam.expression)) {
        this.count++;
      }
    }
    super.visitBlock(ast, null);
  }

  override visitText(ast: Text) {
    if (this.hasPipes(ast.value)) {
      this.count++;
    }
  }

  override visitLetDeclaration(decl: LetDeclaration): void {
    if (this.hasPipes(decl.value)) {
      this.count++;
    }
    super.visitLetDeclaration(decl, null);
  }

  private hasDirectives(input: string): boolean {
    return commonModuleDirectives.has(input);
  }

  private hasPipes(input: string): boolean {
    return commonModulePipes.some((regexp) => regexp.test(input));
  }
}
