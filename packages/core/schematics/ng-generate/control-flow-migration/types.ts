/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, Element, RecursiveVisitor} from '@angular/compiler';

export const ngif = '*ngIf';
export const ngfor = '*ngFor';
export const ngswitch = '[ngSwitch]';

const attributesToMigrate = [
  ngif,
  ngfor,
  ngswitch,
];

const casesToMigrate = [
  '*ngSwitchCase',
  '*ngSwitchDefault',
];

/**
 * Represents a range of text within a file. Omitting the end
 * means that it's until the end of the file.
 */
type Range = [start: number, end?: number];

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
    return this.el.sourceSpan?.start.offset - this.nestCount - offset;
  }

  end(offset: number): number {
    return this.el.sourceSpan?.end.offset - this.nestCount - offset;
  }

  length(): number {
    return this.el.sourceSpan?.end.offset - this.el.sourceSpan?.start.offset;
  }

  openLength(): number {
    return this.el.children[0]?.sourceSpan.start.offset - this.el.sourceSpan?.start.offset;
  }

  closeLength(): number {
    return this.el.sourceSpan?.end.offset - this.el.children[0]?.sourceSpan.end.offset;
  }

  preOffset(newOffset: number): number {
    return newOffset - this.openLength() + 1;
  }

  postOffset(newOffset: number): number {
    return newOffset - this.closeLength();
  }
}

export class Template {
  el: Element;
  count: number = 0;
  contents: string = '';
  children: string = '';

  constructor(el: Element) {
    this.el = el;
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

/** Finds all elements with control flow structural directives. */
export class ElementCollector extends RecursiveVisitor {
  readonly elements: ElementToMigrate[] = [];
  readonly templates: Map<string, Template> = new Map();

  override visitElement(el: Element): void {
    if (el.attrs.length > 0) {
      for (const attr of el.attrs) {
        if (attributesToMigrate.includes(attr.name)) {
          this.elements.push(new ElementToMigrate(el, attr));
        }
      }
    }
    if (el.name === 'ng-template') {
      for (const attr of el.attrs) {
        if (attr.name.startsWith('#')) {
          this.elements.push(new ElementToMigrate(el, attr));
          this.templates.set(attr.name, new Template(el));
        }
      }
    }
    super.visitElement(el, null);
  }
}

export class CaseCollector extends RecursiveVisitor {
  readonly elements: ElementToMigrate[] = [];

  override visitElement(el: Element): void {
    if (el.attrs.length > 0) {
      for (const attr of el.attrs) {
        if (casesToMigrate.includes(attr.name)) {
          this.elements.push(new ElementToMigrate(el, attr));
        }
      }
    }

    super.visitElement(el, null);
  }
}
