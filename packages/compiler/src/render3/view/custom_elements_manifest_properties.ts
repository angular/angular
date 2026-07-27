/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BindingType} from '../../expression_parser/ast';
import {
  CustomElementsManifestIndex,
  normalizeCustomElementTagName,
} from '../../schema/custom_elements_manifest_schema';
import {Element, Node, RecursiveVisitor, visitAll} from '../r3_ast';
import {DOM_PROPERTY_REMAPPING} from '../util';

/**
 * Collects manifest property bindings that would change under Angular's HTML name mappings,
 * keyed by lowercase tag name. These names must reach the DOM unchanged, such as `readonly`
 * when the manifest declares it as a JavaScript property. Other names need no extra metadata.
 * Returns `null` when no bindings need this handling.
 */
export function getCustomElementsManifestExactPropertyNames(
  template: Node[],
  index: CustomElementsManifestIndex | null,
): ReadonlyMap<string, ReadonlySet<string>> | null {
  if (index === null || index.tagNames.size === 0) {
    return null;
  }
  const visitor = new ExactPropertyNameVisitor(index);
  visitAll(visitor, template);
  return visitor.propertyNames.size === 0 ? null : visitor.propertyNames;
}

class ExactPropertyNameVisitor extends RecursiveVisitor {
  readonly propertyNames = new Map<string, Set<string>>();

  constructor(private readonly index: CustomElementsManifestIndex) {
    super();
  }

  override visitElement(element: Element): void {
    for (const input of element.inputs) {
      if (
        (input.type === BindingType.Property || input.type === BindingType.TwoWay) &&
        DOM_PROPERTY_REMAPPING.has(input.name) &&
        this.index.hasProperty(element.name, input.name)
      ) {
        const tagName = normalizeCustomElementTagName(element.name);
        let names = this.propertyNames.get(tagName);
        if (names === undefined) {
          names = new Set();
          this.propertyNames.set(tagName, names);
        }
        names.add(input.name);
      }
    }
    super.visitElement(element);
  }
}
