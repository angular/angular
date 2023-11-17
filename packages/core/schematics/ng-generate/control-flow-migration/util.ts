/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, HtmlParser, ParseTreeResult, visitAll} from '@angular/compiler';
import {dirname, join} from 'path';
import ts from 'typescript';

import {AnalyzedFile, CommonCollector, ElementCollector, ElementToMigrate, Template, TemplateCollector} from './types';

const importRemovals = [
  'NgIf', 'NgIfElse', 'NgIfThenElse', 'NgFor', 'NgForOf', 'NgForTrackBy', 'NgSwitch',
  'NgSwitchCase', 'NgSwitchDefault'
];
const importWithCommonRemovals = [...importRemovals, 'CommonModule'];

/**
 * Analyzes a source file to find file that need to be migrated and the text ranges within them.
 * @param sourceFile File to be analyzed.
 * @param analyzedFiles Map in which to store the results.
 */
export function analyze(sourceFile: ts.SourceFile, analyzedFiles: Map<string, AnalyzedFile>) {
  forEachClass(sourceFile, node => {
    if (ts.isClassDeclaration(node)) {
      analyzeDecorators(node, sourceFile, analyzedFiles);
    } else {
      analyzeImportDeclarations(node, sourceFile, analyzedFiles);
    }
  });
}

function checkIfShouldChange(decl: ts.ImportDeclaration, removeCommonModule: boolean) {
  // should change if you can remove the common module
  // if it's not safe to remove the common module
  // and that's the only thing there, we should do nothing.
  const clause = decl.getChildAt(1) as ts.ImportClause;
  return !(
      !removeCommonModule && clause.namedBindings && ts.isNamedImports(clause.namedBindings) &&
      clause.namedBindings.elements.length === 1 &&
      clause.namedBindings.elements[0].getText() === 'CommonModule');
}

function updateImportDeclaration(decl: ts.ImportDeclaration, removeCommonModule: boolean): string {
  const clause = decl.getChildAt(1) as ts.ImportClause;
  const updatedClause = updateImportClause(clause, removeCommonModule);
  if (updatedClause === null) {
    return '';
  }
  // removeComments is set to true to prevent duplication of comments
  // when the import declaration is at the top of the file, but right after a comment
  // without this, the comment gets duplicated when the declaration is updated.
  // the typescript AST includes that preceding comment as part of the import declaration full text.
  const printer = ts.createPrinter({
    removeComments: true,
  });
  const updated = ts.factory.updateImportDeclaration(
      decl, decl.modifiers, updatedClause, decl.moduleSpecifier, undefined);
  return printer.printNode(ts.EmitHint.Unspecified, updated, clause.getSourceFile());
}

function updateImportClause(clause: ts.ImportClause, removeCommonModule: boolean): ts.ImportClause|
    null {
  if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
    const removals = removeCommonModule ? importWithCommonRemovals : importRemovals;
    const elements = clause.namedBindings.elements.filter(el => !removals.includes(el.getText()));
    if (elements.length === 0) {
      return null;
    }
    clause = ts.factory.updateImportClause(
        clause, clause.isTypeOnly, clause.name, ts.factory.createNamedImports(elements));
  }
  return clause;
}

function updateClassImports(
    propAssignment: ts.PropertyAssignment, removeCommonModule: boolean): string {
  const printer = ts.createPrinter();
  const importList = propAssignment.initializer as ts.ArrayLiteralExpression;
  const removals = removeCommonModule ? importWithCommonRemovals : importRemovals;
  const elements = importList.elements.filter(el => !removals.includes(el.getText()));
  const updatedElements = ts.factory.updateArrayLiteralExpression(importList, elements);
  const updatedAssignment =
      ts.factory.updatePropertyAssignment(propAssignment, propAssignment.name, updatedElements);
  return printer.printNode(
      ts.EmitHint.Unspecified, updatedAssignment, updatedAssignment.getSourceFile());
}

function analyzeImportDeclarations(
    node: ts.ImportDeclaration, sourceFile: ts.SourceFile,
    analyzedFiles: Map<string, AnalyzedFile>) {
  if (node.getText().indexOf('@angular/common') === -1) {
    return;
  }
  const clause = node.getChildAt(1) as ts.ImportClause;
  if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
    const elements =
        clause.namedBindings.elements.filter(el => importWithCommonRemovals.includes(el.getText()));
    if (elements.length > 0) {
      AnalyzedFile.addRange(
          sourceFile.fileName, analyzedFiles,
          {start: node.getStart(), end: node.getEnd(), node, type: 'import'});
    }
  }
}

function analyzeDecorators(
    node: ts.ClassDeclaration, sourceFile: ts.SourceFile,
    analyzedFiles: Map<string, AnalyzedFile>) {
  // Note: we have a utility to resolve the Angular decorators from a class declaration already.
  // We don't use it here, because it requires access to the type checker which makes it more
  // time-consuming to run internally.
  const decorator = ts.getDecorators(node)?.find(dec => {
    return ts.isCallExpression(dec.expression) && ts.isIdentifier(dec.expression.expression) &&
        dec.expression.expression.text === 'Component';
  }) as (ts.Decorator & {expression: ts.CallExpression}) |
      undefined;

  const metadata = decorator && decorator.expression.arguments.length > 0 &&
          ts.isObjectLiteralExpression(decorator.expression.arguments[0]) ?
      decorator.expression.arguments[0] :
      null;

  if (!metadata) {
    return;
  }

  for (const prop of metadata.properties) {
    // All the properties we care about should have static
    // names and be initialized to a static string.
    if (!ts.isPropertyAssignment(prop) ||
        (!ts.isIdentifier(prop.name) && !ts.isStringLiteralLike(prop.name))) {
      continue;
    }

    switch (prop.name.text) {
      case 'template':
        // +1/-1 to exclude the opening/closing characters from the range.
        AnalyzedFile.addRange(sourceFile.fileName, analyzedFiles, {
          start: prop.initializer.getStart() + 1,
          end: prop.initializer.getEnd() - 1,
          node: prop,
          type: 'template'
        });
        break;

      case 'imports':
        AnalyzedFile.addRange(sourceFile.fileName, analyzedFiles, {
          start: prop.name.getStart(),
          end: prop.initializer.getEnd(),
          node: prop,
          type: 'import'
        });
        break;

      case 'templateUrl':
        // Leave the end as undefined which means that the range is until the end of the file.
        if (ts.isStringLiteralLike(prop.initializer)) {
          const path = join(dirname(sourceFile.fileName), prop.initializer.text);
          AnalyzedFile.addRange(path, analyzedFiles, {start: 0, node: prop, type: 'template'});
        }
        break;
    }
  }
}

/**
 * returns the level deep a migratable element is nested
 */
function getNestedCount(etm: ElementToMigrate, aggregator: number[]) {
  if (aggregator.length === 0) {
    return 0;
  }
  if (etm.el.sourceSpan.start.offset < aggregator[aggregator.length - 1] &&
      etm.el.sourceSpan.end.offset !== aggregator[aggregator.length - 1]) {
    // element is nested
    aggregator.push(etm.el.sourceSpan.end.offset);
    return aggregator.length - 1;
  } else {
    // not nested
    aggregator.pop()!;
    return getNestedCount(etm, aggregator);
  }
}

/**
 * parses the template string into the Html AST
 */
export function parseTemplate(template: string): ParseTreeResult|null {
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
      return null;
    }
  } catch {
    return null;
  }
  return parsed;
}

/**
 * calculates the level of nesting of the items in the collector
 */
export function calculateNesting(
    visitor: ElementCollector|TemplateCollector, hasLineBreaks: boolean): void {
  // start from top of template
  // loop through each element
  let nestedQueue: number[] = [];

  for (let i = 0; i < visitor.elements.length; i++) {
    let currEl = visitor.elements[i];
    if (i === 0) {
      nestedQueue.push(currEl.el.sourceSpan.end.offset);
      currEl.hasLineBreaks = hasLineBreaks;
      continue;
    }
    currEl.hasLineBreaks = hasLineBreaks;
    currEl.nestCount = getNestedCount(currEl, nestedQueue);
    if (currEl.el.sourceSpan.end.offset !== nestedQueue[nestedQueue.length - 1]) {
      nestedQueue.push(currEl.el.sourceSpan.end.offset);
    }
  }
}

function escapeRegExp(val: string) {
  return val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  // $& means the whole matched string
}

/**
 * determines if a given template string contains line breaks
 */
export function hasLineBreaks(template: string): boolean {
  return /\r|\n/.test(template);
}

/**
 * properly adjusts template offsets based on current nesting levels
 */
export function reduceNestingOffset(
    el: ElementToMigrate, nestLevel: number, offset: number, postOffsets: number[]): number {
  if (el.nestCount <= nestLevel) {
    const count = nestLevel - el.nestCount;
    // reduced nesting, add postoffset
    for (let i = 0; i <= count; i++) {
      offset += postOffsets.pop() ?? 0;
    }
  }
  return offset;
}

/**
 * Replaces structural directive control flow instances with block control flow equivalents.
 * Returns null if the migration failed (e.g. there was a syntax error).
 */
export function countTemplateUsage(template: string): Map<string, Template> {
  const parsed = parseTemplate(template);
  if (parsed !== null) {
    const visitor = new TemplateCollector();
    visitAll(visitor, parsed.rootNodes);

    // count usages of each ng-template
    for (let [key, tmpl] of visitor.templates) {
      const escapeKey = escapeRegExp(key.slice(1));
      const regex = new RegExp(`[^a-zA-Z0-9-<]${escapeKey}\\W`, 'gm');
      const matches = template.match(regex);
      tmpl.count = matches?.length ?? 0;
      tmpl.generateContents(template);
    }

    return visitor.templates;
  }
  return new Map<string, Template>();
}

function wrapIntoI18nContainer(i18nAttr: Attribute, content: string) {
  const i18n = i18nAttr.value === '' ? 'i18n' : `i18n="${i18nAttr.value}"`;
  return `<ng-container ${i18n}>${content}</ng-container>`;
}

/**
 * Counts, replaces, and removes any necessary ng-templates post control flow migration
 */
export function processNgTemplates(template: string): string {
  // count usage
  const templates = countTemplateUsage(template);

  // swap placeholders and remove
  for (const [name, t] of templates) {
    const replaceRegex = new RegExp(`${name}\\|`, 'g');
    const matches = [...template.matchAll(replaceRegex)];
    if (matches.length > 0) {
      if (t.i18n !== null) {
        const container = wrapIntoI18nContainer(t.i18n, t.children);
        template = template.replace(replaceRegex, container);
      } else {
        template = template.replace(replaceRegex, t.children);
      }

      // the +1 accounts for the t.count's counting of the original template
      if (t.count === matches.length + 1) {
        template = template.replace(t.contents, '');
      }
    }
  }
  return template;
}

/**
 * determines if the CommonModule can be safely removed from imports
 */
export function canRemoveCommonModule(template: string): boolean {
  const parsed = parseTemplate(template);
  let removeCommonModule = false;
  if (parsed !== null) {
    const visitor = new CommonCollector();
    visitAll(visitor, parsed.rootNodes);
    removeCommonModule = visitor.count === 0;
  }
  return removeCommonModule;
}

/**
 * removes imports from template imports and import declarations
 */
export function removeImports(
    template: string, node: ts.Node, removeCommonModule: boolean): string {
  if (template.startsWith('imports') && ts.isPropertyAssignment(node)) {
    return updateClassImports(node, removeCommonModule);
  } else if (ts.isImportDeclaration(node) && checkIfShouldChange(node, removeCommonModule)) {
    return updateImportDeclaration(node, removeCommonModule);
  }
  return template;
}

/**
 * retrieves the original block of text in the template for length comparison during migration
 * processing
 */
export function getOriginals(etm: ElementToMigrate, tmpl: string, offset: number):
    {start: string, end: string, childLength: number} {
  // original opening block
  if (etm.el.children.length > 0) {
    const childStart = etm.el.children[0].sourceSpan.start.offset - offset;
    const childEnd = etm.el.children[etm.el.children.length - 1].sourceSpan.end.offset - offset;
    const start = tmpl.slice(
        etm.el.sourceSpan.start.offset - offset,
        etm.el.children[0].sourceSpan.start.offset - offset);
    // original closing block
    const end = tmpl.slice(
        etm.el.children[etm.el.children.length - 1].sourceSpan.end.offset - offset,
        etm.el.sourceSpan.end.offset - offset);
    const childLength = childEnd - childStart;
    return {start, end, childLength};
  }
  // self closing or no children
  const start =
      tmpl.slice(etm.el.sourceSpan.start.offset - offset, etm.el.sourceSpan.end.offset - offset);
  // original closing block
  return {start, end: '', childLength: 0};
}

function isI18nTemplate(etm: ElementToMigrate, i18nAttr: Attribute|undefined): boolean {
  return etm.el.name === 'ng-template' && i18nAttr !== undefined &&
      (etm.el.attrs.length === 2 || (etm.el.attrs.length === 3 && etm.elseAttr !== undefined));
}

function isRemovableContainer(etm: ElementToMigrate): boolean {
  return (etm.el.name === 'ng-container' || etm.el.name === 'ng-template') &&
      (etm.el.attrs.length === 1 || etm.forAttrs !== undefined ||
       (etm.el.attrs.length === 2 && etm.elseAttr !== undefined) ||
       (etm.el.attrs.length === 3 && etm.elseAttr !== undefined && etm.thenAttr !== undefined));
}

/**
 * builds the proper contents of what goes inside a given control flow block after migration
 */
export function getMainBlock(etm: ElementToMigrate, tmpl: string, offset: number):
    {start: string, middle: string, end: string} {
  const i18nAttr = etm.el.attrs.find(x => x.name === 'i18n');
  if (isRemovableContainer(etm)) {
    // this is the case where we're migrating and there's no need to keep the ng-container
    const childStart = etm.el.children[0].sourceSpan.start.offset - offset;
    const childEnd = etm.el.children[etm.el.children.length - 1].sourceSpan.end.offset - offset;
    const middle = tmpl.slice(childStart, childEnd);
    return {start: '', middle, end: ''};
  } else if (isI18nTemplate(etm, i18nAttr)) {
    const childStart = etm.el.children[0].sourceSpan.start.offset - offset;
    const childEnd = etm.el.children[etm.el.children.length - 1].sourceSpan.end.offset - offset;
    const middle = wrapIntoI18nContainer(i18nAttr!, tmpl.slice(childStart, childEnd));
    return {start: '', middle, end: ''};
  }

  const attrStart = etm.attr.keySpan!.start.offset - 1 - offset;
  const valEnd =
      (etm.attr.valueSpan ? (etm.attr.valueSpan.end.offset + 1) : etm.attr.keySpan!.end.offset) -
      offset;

  let childStart = valEnd;
  let childEnd = valEnd;

  if (etm.el.children.length > 0) {
    childStart = etm.el.children[0].sourceSpan.start.offset - offset;
    childEnd = etm.el.children[etm.el.children.length - 1].sourceSpan.end.offset - offset;
  }

  let start = tmpl.slice(etm.start(offset), attrStart);
  start += tmpl.slice(valEnd, childStart);

  const middle = tmpl.slice(childStart, childEnd);
  const end = tmpl.slice(childEnd, etm.end(offset));

  return {start, middle, end};
}

/**
 * re-indents all the lines in the template properly post migration
 */
export function formatTemplate(tmpl: string): string {
  if (tmpl.indexOf('\n') > -1) {
    // match any type of control flow block as start of string ignoring whitespace
    // @if | @switch | @case | @default | @for | } @else
    const openBlockRegex = /^\s*\@(if|switch|case|default|for)|^\s*\}\s\@else/;

    // regex for matching an html element opening
    // <div thing="stuff" [binding]="true"> || <div thing="stuff" [binding]="true"
    const openElRegex = /^\s*<([a-z0-9]+)(?![^>]*\/>)[^>]*>?/;

    // match closing block or else block
    // } | } @else
    const closeBlockRegex = /^\s*\}\s*$|^\s*\}\s\@else/;

    // matches closing of an html element
    // </element>
    const closeElRegex = /\s*<\/([a-z0-9\-]+)*>/;

    // matches closing of a self closing html element when the element is on multiple lines
    // [binding]="value" />
    const closeMultiLineElRegex = /^\s*([a-z0-9\-\[\]]+)?=?"?([^”<]+)?"?\s?\/>$/;

    // matches an open and close of an html element on a single line with no breaks
    // <div>blah</div>
    const singleLineElRegex = /^\s*<([a-z0-9]+)(?![^>]*\/>)[^>]*>.*<\/([a-z0-9\-]+)*>/;
    const lines = tmpl.split('\n');
    const formatted = [];
    let indent = '';
    for (let [index, line] of lines.entries()) {
      if (line.trim() === '' && index !== 0 && index !== lines.length - 1) {
        // skip blank lines except if it's the first line or last line
        continue;
      }
      if ((closeBlockRegex.test(line) ||
           (closeElRegex.test(line) &&
            (!singleLineElRegex.test(line) && !closeMultiLineElRegex.test(line)))) &&
          indent !== '') {
        // close block, reduce indent
        indent = indent.slice(2);
      }
      formatted.push(indent + line.trim());
      if (closeMultiLineElRegex.test(line)) {
        // multi line self closing tag
        indent = indent.slice(2);
      }
      if ((openBlockRegex.test(line) || openElRegex.test(line)) && !singleLineElRegex.test(line)) {
        // open block, increase indent
        indent += '  ';
      }
    }
    tmpl = formatted.join('\n');
  }
  return tmpl;
}

/** Executes a callback on each class declaration in a file. */
function forEachClass(
    sourceFile: ts.SourceFile, callback: (node: ts.ClassDeclaration|ts.ImportDeclaration) => void) {
  sourceFile.forEachChild(function walk(node) {
    if (ts.isClassDeclaration(node) || ts.isImportDeclaration(node)) {
      callback(node);
    }
    node.forEachChild(walk);
  });
}
