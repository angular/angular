/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DomElementSchemaRegistry,
  Element,
  RecursiveVisitor,
  Text,
  visitAll,
} from '@angular/compiler';
import {parseTemplate} from './util';

export function migrateTemplateToSelfClosingTags(template: string): {
  replacementCount: number;
  migrated: string;
  changed: boolean;
} {
  let parsed = parseTemplate(template);
  if (parsed.tree === undefined) {
    return {migrated: template, changed: false, replacementCount: 0};
  }

  const visitor = new AngularElementCollector();
  visitAll(visitor, parsed.tree.rootNodes);

  let newTemplate = template;
  let changedOffset = 0;
  let replacementCount = 0;

  for (let element of visitor.elements) {
    const {start, end, tagName} = element;

    const currentLength = newTemplate.length;
    const templatePart = newTemplate.slice(start + changedOffset, end + changedOffset);

    const convertedTemplate = replaceWithSelfClosingTag(templatePart, tagName);

    // if the template has changed, replace the original template with the new one
    if (convertedTemplate.length !== templatePart.length) {
      newTemplate = replaceTemplate(newTemplate, convertedTemplate, start, end, changedOffset);
      changedOffset += newTemplate.length - currentLength;
      replacementCount++;
    }
  }

  return {migrated: newTemplate, changed: changedOffset !== 0, replacementCount};
}

function replaceWithSelfClosingTag(html: string, tagName: string) {
  const pattern = new RegExp(
    `<\\s*${tagName}\\s*([^>]*?(?:"[^"]*"|'[^']*'|[^'">])*)\\s*>([\\s\\S]*?)<\\s*/\\s*${tagName}\\s*>`,
    'gi',
  );
  return html.replace(pattern, (_, content) => `<${tagName}${content ? ` ${content}` : ''} />`);
}

/**
 * Replace the value in the template with the new value based on the start and end position + offset
 */
function replaceTemplate(
  template: string,
  replaceValue: string,
  start: number,
  end: number,
  offset: number,
) {
  return template.slice(0, start + offset) + replaceValue + template.slice(end + offset);
}

interface ElementToMigrate {
  tagName: string;
  start: number;
  end: number;
}

const ALL_HTML_TAGS = new DomElementSchemaRegistry().allKnownElementNames();

export class AngularElementCollector extends RecursiveVisitor {
  readonly elements: ElementToMigrate[] = [];

  constructor() {
    super();
  }

  override visitElement(element: Element) {
    if (
      !element.isSelfClosing &&
      !ALL_HTML_TAGS.includes(element.name) &&
      this.elementHasNoContent(element)
    ) {
      this.elements.push({
        tagName: element.name,
        start: element.sourceSpan.start.offset,
        end: element.sourceSpan.end.offset,
      });
    }

    return super.visitElement(element, null);
  }

  private elementHasNoContent(element: Element) {
    if (!element.children?.length) {
      return true;
    }
    if (element.children.length === 1) {
      const child = element.children[0];
      return child instanceof Text && /^\s*$/.test(child.value);
    }
    return false;
  }
}
