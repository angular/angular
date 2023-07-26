/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as core from '../../../../core';
import {splitNsName} from '../../../../ml_parser/tags';
import * as o from '../../../../output/output_ast';

/**
 * Enumeration of the types of attributes which can be applied to an element.
 */
export enum BindingKind {
  /**
   * Static attributes.
   */
  Attribute,

  /**
   * Class bindings.
   */
  ClassName,

  /**
   * Style bindings.
   */
  StyleProperty,

  /**
   * Dynamic property bindings.
   */
  Property,

  /**
   * Property or attribute bindings on a template.
   */
  Template,

  /**
   * Internationalized attributes.
   */
  I18n,

  /**
   * TODO: Consider how Animations are handled, and if they should be a distinct BindingKind.
   */
  Animation,
}

const FLYWEIGHT_ARRAY: ReadonlyArray<o.Expression> = Object.freeze<o.Expression[]>([]);

/**
 * Container for all of the various kinds of attributes which are applied on an element.
 */
export class ElementAttributes {
  private known = new Set<string>();
  private byKind = new Map<BindingKind, o.Expression[]>;

  projectAs: string|null = null;

  get attributes(): ReadonlyArray<o.Expression> {
    return this.byKind.get(BindingKind.Attribute) ?? FLYWEIGHT_ARRAY;
  }

  get classes(): ReadonlyArray<o.Expression> {
    return this.byKind.get(BindingKind.ClassName) ?? FLYWEIGHT_ARRAY;
  }

  get styles(): ReadonlyArray<o.Expression> {
    return this.byKind.get(BindingKind.StyleProperty) ?? FLYWEIGHT_ARRAY;
  }

  get bindings(): ReadonlyArray<o.Expression> {
    return this.byKind.get(BindingKind.Property) ?? FLYWEIGHT_ARRAY;
  }

  get template(): ReadonlyArray<o.Expression> {
    return this.byKind.get(BindingKind.Template) ?? FLYWEIGHT_ARRAY;
  }

  get i18n(): ReadonlyArray<o.Expression> {
    return this.byKind.get(BindingKind.I18n) ?? FLYWEIGHT_ARRAY;
  }

  add(kind: BindingKind, name: string, value: o.Expression|null): void {
    if (this.known.has(name)) {
      return;
    }
    this.known.add(name);
    const array = this.arrayFor(kind);
    array.push(...getAttributeNameLiterals(name));
    if (kind === BindingKind.Attribute || kind === BindingKind.StyleProperty) {
      if (value === null) {
        throw Error('Attribute & style element attributes must have a value');
      }
      array.push(value);
    }
  }

  private arrayFor(kind: BindingKind): o.Expression[] {
    if (!this.byKind.has(kind)) {
      this.byKind.set(kind, []);
    }
    return this.byKind.get(kind)!;
  }
}

function getAttributeNameLiterals(name: string): o.LiteralExpr[] {
  const [attributeNamespace, attributeName] = splitNsName(name);
  const nameLiteral = o.literal(attributeName);

  if (attributeNamespace) {
    return [
      o.literal(core.AttributeMarker.NamespaceURI), o.literal(attributeNamespace), nameLiteral
    ];
  }

  return [nameLiteral];
}

export function assertIsElementAttributes(attrs: any): asserts attrs is ElementAttributes {
  if (!(attrs instanceof ElementAttributes)) {
    throw new Error(
        `AssertionError: ElementAttributes has already been coalesced into the view constants`);
  }
}
