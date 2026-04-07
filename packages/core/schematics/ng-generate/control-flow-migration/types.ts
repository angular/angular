/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Attribute, Block, Element, LetDeclaration, RecursiveVisitor, Text} from '@angular/compiler';
import ts from 'typescript';

import {lookupIdentifiersInSourceFile} from './identifier-lookup';

export const ngtemplate = 'ng-template';
export const boundngifelse = '[ngIfElse]';
export const boundngifthenelse = '[ngIfThenElse]';
export const boundngifthen = '[ngIfThen]';
export const nakedngfor = 'ngFor';

export const startMarker = '◬';
export const endMarker = '✢';

export const startI18nMarker = '⚈';
export const endI18nMarker = '⚉';

export const importRemovals = [
  'NgIf',
  'NgIfElse',
  'NgIfThenElse',
  'NgFor',
  'NgForOf',
  'NgForTrackBy',
  'NgSwitch',
  'NgSwitchCase',
  'NgSwitchDefault',
];

export const importWithCommonRemovals = [...importRemovals, 'CommonModule'];

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
]);

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

/**
 * Represents a range of text within a file. Omitting the end
 * means that it's until the end of the file.
 */
type Range = {
  start: number;
  end?: number;
  node: ts.Node;
  type: string;
  remove: boolean;
};

export type Offsets = {
  pre: number;
  post: number;
};

export type Result = {
  tmpl: string;
  offsets: Offsets;
};

export interface ForAttributes {
  forOf: string;
  trackBy: string;
}

export interface AliasAttributes {
  item: string;
  aliases: Map<string, string>;
}

export type {MigrateError} from '../../utils/parse_html';

/**
 * Represents an element with a migratable attribute
 */
export class ElementToMigrate {
  el: Element;
  attr: Attribute;
  elseAttr: Attribute | undefined;
  thenAttr: Attribute | undefined;
  forAttrs: ForAttributes | undefined;
  aliasAttrs: AliasAttributes | undefined;
  nestCount = 0;
  hasLineBreaks = false;

  constructor(
    el: Element,
    attr: Attribute,
    elseAttr: Attribute | undefined = undefined,
    thenAttr: Attribute | undefined = undefined,
    forAttrs: ForAttributes | undefined = undefined,
    aliasAttrs: AliasAttributes | undefined = undefined,
  ) {
    this.el = el;
    this.attr = attr;
    this.elseAttr = elseAttr;
    this.thenAttr = thenAttr;
    this.forAttrs = forAttrs;
    this.aliasAttrs = aliasAttrs;
  }

  normalizeConditionString(value: string): string {
    value = this.insertSemicolon(value, value.indexOf(' else '));
    value = this.insertSemicolon(value, value.indexOf(' then '));
    value = this.insertSemicolon(value, value.indexOf(' let '));
    return value.replace(';;', ';');
  }

  insertSemicolon(str: string, ix: number): string {
    return ix > -1 ? `${str.slice(0, ix)};${str.slice(ix)}` : str;
  }

  getCondition(): string {
    const chunks = this.normalizeConditionString(this.attr.value).split(';');
    let condition = chunks[0];

    // checks for case of no usage of `;` in if else / if then else
    const elseIx = condition.indexOf(' else ');
    const thenIx = condition.indexOf(' then ');
    if (thenIx > -1) {
      condition = condition.slice(0, thenIx);
    } else if (elseIx > -1) {
      condition = condition.slice(0, elseIx);
    }

    let letVar = chunks.find((c) => c.search(/\s*let\s/) > -1);
    return condition + (letVar ? ';' + letVar : '');
  }

  getTemplateName(targetStr: string, secondStr?: string): string {
    const targetLocation = this.attr.value.indexOf(targetStr);
    const secondTargetLocation = secondStr ? this.attr.value.indexOf(secondStr) : undefined;
    let templateName = this.attr.value.slice(
      targetLocation + targetStr.length,
      secondTargetLocation,
    );
    if (templateName.startsWith(':')) {
      templateName = templateName.slice(1).trim();
    }
    return templateName.split(';')[0].trim();
  }

  getValueEnd(offset: number): number {
    return (
      (this.attr.valueSpan ? this.attr.valueSpan.end.offset + 1 : this.attr.keySpan!.end.offset) -
      offset
    );
  }

  hasChildren(): boolean {
    return this.el.children.length > 0;
  }

  getChildSpan(offset: number): {childStart: number; childEnd: number} {
    const childStart = this.el.children[0].sourceSpan.start.offset - offset;
    const childEnd = this.el.children[this.el.children.length - 1].sourceSpan.end.offset - offset;
    return {childStart, childEnd};
  }

  shouldRemoveElseAttr(): boolean {
    return (
      (this.el.name === 'ng-template' || this.el.name === 'ng-container') &&
      this.elseAttr !== undefined
    );
  }

  getElseAttrStr(): string {
    if (this.elseAttr !== undefined) {
      const elseValStr = this.elseAttr.value !== '' ? `="${this.elseAttr.value}"` : '';
      return `${this.elseAttr.name}${elseValStr}`;
    }
    return '';
  }

  start(offset: number): number {
    return this.el.sourceSpan?.start.offset - offset;
  }

  end(offset: number): number {
    return this.el.sourceSpan?.end.offset - offset;
  }

  length(): number {
    return this.el.sourceSpan?.end.offset - this.el.sourceSpan?.start.offset;
  }
}

/**
 * Represents an ng-template inside a template being migrated to new control flow
 */
export class Template {
  el: Element;
  name: string;
  count: number = 0;
  contents: string = '';
  children: string = '';
  i18n: Attribute | null = null;
  attributes: Attribute[];

  constructor(el: Element, name: string, i18n: Attribute | null) {
    this.el = el;
    this.name = name;
    this.attributes = el.attrs;
    this.i18n = i18n;
  }

  get isNgTemplateOutlet() {
    return this.attributes.find((attr) => attr.name === '*ngTemplateOutlet') !== undefined;
  }

  get outletContext() {
    const letVar = this.attributes.find((attr) => attr.name.startsWith('let-'));
    return letVar ? `; context: {$implicit: ${letVar.name.split('-')[1]}}` : '';
  }

  generateTemplateOutlet() {
    const attr = this.attributes.find((attr) => attr.name === '*ngTemplateOutlet');
    const outletValue = attr?.value ?? this.name.slice(1);
    return `<ng-container *ngTemplateOutlet="${outletValue}${this.outletContext}"></ng-container>`;
  }

  generateContents(tmpl: string) {
    this.contents = tmpl.slice(this.el.sourceSpan.start.offset, this.el.sourceSpan.end.offset);
    this.children = '';
    if (this.el.children.length > 0) {
      this.children = tmpl.slice(
        this.el.children[0].sourceSpan.start.offset,
        this.el.children[this.el.children.length - 1].sourceSpan.end.offset,
      );
    }
  }
}

/** Represents a file that was analyzed by the migration. */
export class AnalyzedFile {
  private ranges: Range[] = [];
  removeCommonModule = false;
  canRemoveImports = false;
  sourceFile: ts.SourceFile;
  importRanges: Range[] = [];
  templateRanges: Range[] = [];

  constructor(sourceFile: ts.SourceFile) {
    this.sourceFile = sourceFile;
  }

  /** Returns the ranges in the order in which they should be migrated. */
  getSortedRanges(): Range[] {
    // templates first for checking on whether certain imports can be safely removed
    this.templateRanges = this.ranges
      .slice()
      .filter((x) => x.type === 'template' || x.type === 'templateUrl')
      .sort((aStart, bStart) => bStart.start - aStart.start);
    this.importRanges = this.ranges
      .slice()
      .filter((x) => x.type === 'importDecorator' || x.type === 'importDeclaration')
      .sort((aStart, bStart) => bStart.start - aStart.start);
    return [...this.templateRanges, ...this.importRanges];
  }

  /**
   * Adds a text range to an `AnalyzedFile`.
   * @param path Path of the file.
   * @param analyzedFiles Map keeping track of all the analyzed files.
   * @param range Range to be added.
   */
  static addRange(
    path: string,
    sourceFile: ts.SourceFile,
    analyzedFiles: Map<string, AnalyzedFile>,
    range: Range,
  ): void {
    let analysis = analyzedFiles.get(path);

    if (!analysis) {
      analysis = new AnalyzedFile(sourceFile);
      analyzedFiles.set(path, analysis);
    }

    const duplicate = analysis.ranges.find(
      (current) => current.start === range.start && current.end === range.end,
    );

    if (!duplicate) {
      analysis.ranges.push(range);
    }
  }

  /**
   * This verifies whether a component class is safe to remove module imports.
   * It is only run on .ts files.
   */
  verifyCanRemoveImports() {
    const importDeclaration = this.importRanges.find((r) => r.type === 'importDeclaration');
    const instances = lookupIdentifiersInSourceFile(this.sourceFile, importWithCommonRemovals);
    let foundImportDeclaration = false;
    let count = 0;
    for (let range of this.importRanges) {
      for (let instance of instances) {
        if (instance.getStart() >= range.start && instance.getEnd() <= range.end!) {
          if (range === importDeclaration) {
            foundImportDeclaration = true;
          }
          count++;
        }
      }
    }
    if (instances.size !== count && importDeclaration !== undefined && foundImportDeclaration) {
      importDeclaration.remove = false;
    }
  }
}

/** Finds all non-control flow elements from common module. */
export class CommonCollector extends RecursiveVisitor {
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

/** Finds all elements that represent i18n blocks. */
export class i18nCollector extends RecursiveVisitor {
  readonly elements: Element[] = [];

  override visitElement(el: Element): void {
    if (el.attrs.find((a) => a.name === 'i18n') !== undefined) {
      this.elements.push(el);
    }
    super.visitElement(el, null);
  }
}

/** Finds all elements with ngif structural directives. */
export class ElementCollector extends RecursiveVisitor {
  readonly elements: ElementToMigrate[] = [];

  constructor(private _attributes: string[] = []) {
    super();
  }

  override visitElement(el: Element): void {
    if (el.attrs.length > 0) {
      for (const attr of el.attrs) {
        if (this._attributes.includes(attr.name)) {
          const elseAttr = el.attrs.find((x) => x.name === boundngifelse);
          const thenAttr = el.attrs.find(
            (x) => x.name === boundngifthenelse || x.name === boundngifthen,
          );
          const forAttrs = attr.name === nakedngfor ? this.getForAttrs(el) : undefined;
          const aliasAttrs = this.getAliasAttrs(el);
          this.elements.push(
            new ElementToMigrate(el, attr, elseAttr, thenAttr, forAttrs, aliasAttrs),
          );
        }
      }
    }
    super.visitElement(el, null);
  }

  private getForAttrs(el: Element): ForAttributes {
    let trackBy = '';
    let forOf = '';
    for (const attr of el.attrs) {
      if (attr.name === '[ngForTrackBy]') {
        trackBy = attr.value;
      }
      if (attr.name === '[ngForOf]') {
        forOf = attr.value;
      }
    }
    return {forOf, trackBy};
  }

  private getAliasAttrs(el: Element): AliasAttributes {
    const aliases = new Map<string, string>();
    let item = '';
    for (const attr of el.attrs) {
      if (attr.name.startsWith('let-')) {
        if (attr.value === '') {
          // item
          item = attr.name.replace('let-', '');
        } else {
          // alias
          aliases.set(attr.name.replace('let-', ''), attr.value);
        }
      }
    }
    return {item, aliases};
  }
}

/** Finds all elements with ngif structural directives. */
export class TemplateCollector extends RecursiveVisitor {
  readonly elements: ElementToMigrate[] = [];
  readonly templates: Map<string, Template> = new Map();

  override visitElement(el: Element): void {
    if (el.name === ngtemplate) {
      let i18n = null;
      let templateAttr = null;
      for (const attr of el.attrs) {
        if (attr.name === 'i18n') {
          i18n = attr;
        }
        if (attr.name.startsWith('#')) {
          templateAttr = attr;
        }
      }
      if (templateAttr !== null && !this.templates.has(templateAttr.name)) {
        this.templates.set(templateAttr.name, new Template(el, templateAttr.name, i18n));
        this.elements.push(new ElementToMigrate(el, templateAttr));
      } else if (templateAttr !== null) {
        throw new Error(
          `A duplicate ng-template name "${templateAttr.name}" was found. ` +
            `The control flow migration requires unique ng-template names within a component.`,
        );
      }
    }
    super.visitElement(el, null);
  }
}
