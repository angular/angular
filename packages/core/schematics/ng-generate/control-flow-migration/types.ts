/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, Element, RecursiveVisitor} from '@angular/compiler';

export const ngtemplate = 'ng-template';

/**
 * Represents a range of text within a file. Omitting the end
 * means that it's until the end of the file.
 */
type Range = [start: number, end?: number];

export type Offsets = {
  pre: number,
  post: number,
};

export type Result = {
  tmpl: string,
  offsets: Offsets,
};

/**
 * Represents an error that happened during migration
 */
export type MigrateError = {
  type: string,
  error: unknown,
};

/**
 * Represents an element with a migratable attribute
 */
export class ElementToMigrate {
  el: Element;
  attr: Attribute;
  nestCount = 0;
  hasLineBreaks = false;

  constructor(el: Element, attr: Attribute) {
    this.el = el;
    this.attr = attr;
  }

  getCondition(targetStr: string): string {
    const targetLocation = this.attr.value.indexOf(targetStr);
    return this.attr.value.slice(0, targetLocation);
  }

  getTemplateName(targetStr: string, secondStr?: string): string {
    const targetLocation = this.attr.value.indexOf(targetStr);
    if (secondStr) {
      const secondTargetLocation = this.attr.value.indexOf(secondStr);
      return this.attr.value.slice(targetLocation + targetStr.length, secondTargetLocation).trim();
    }
    return this.attr.value.slice(targetLocation + targetStr.length).trim();
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
  count: number = 0;
  contents: string = '';
  children: string = '';
  i18n: Attribute|null = null;

  constructor(el: Element, i18n: Attribute|null) {
    this.el = el;
    this.i18n = i18n;
  }

  generateContents(tmpl: string) {
    this.contents = tmpl.slice(this.el.sourceSpan.start.offset, this.el.sourceSpan.end.offset + 1);
    this.children = '';
    if (this.el.children.length > 0) {
      this.children = tmpl.slice(
          this.el.children[0].sourceSpan.start.offset,
          this.el.children[this.el.children.length - 1].sourceSpan.end.offset);
    }
  }
}

/** Represents a file that was analyzed by the migration. */
export class AnalyzedFile {
  private ranges: Range[] = [];

  /** Returns the ranges in the order in which they should be migrated. */
  getSortedRanges(): Range[] {
    return this.ranges.slice().sort(([aStart], [bStart]) => bStart - aStart);
  }

  /**
   * Adds a text range to an `AnalyzedFile`.
   * @param path Path of the file.
   * @param analyzedFiles Map keeping track of all the analyzed files.
   * @param range Range to be added.
   */
  static addRange(path: string, analyzedFiles: Map<string, AnalyzedFile>, range: Range): void {
    let analysis = analyzedFiles.get(path);

    if (!analysis) {
      analysis = new AnalyzedFile();
      analyzedFiles.set(path, analysis);
    }

    const duplicate =
        analysis.ranges.find(current => current[0] === range[0] && current[1] === range[1]);

    if (!duplicate) {
      analysis.ranges.push(range);
    }
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
          this.elements.push(new ElementToMigrate(el, attr));
        }
      }
    }
    super.visitElement(el, null);
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
      if (templateAttr !== null) {
        this.elements.push(new ElementToMigrate(el, templateAttr));
        this.templates.set(templateAttr.name, new Template(el, i18n));
      }
    }
    super.visitElement(el, null);
  }
}
