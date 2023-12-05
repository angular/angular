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
import * as ir from '../../ir';
import {ComponentCompilationJob, HostBindingCompilationJob, type CompilationJob} from '../compilation';
import {literalOrArrayLiteral} from '../conversion';

/**
 * Converts the semantic attributes of element-like operations (elements, templates) into constant
 * array expressions, and lifts them into the overall component `consts`.
 */
export function collectElementConsts(job: CompilationJob): void {
  // Collect all extracted attributes.
  const allElementAttributes = new Map<ir.XrefId, ElementAttributes>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.ExtractedAttribute) {
        const attributes = allElementAttributes.get(op.target) || new ElementAttributes();
        allElementAttributes.set(op.target, attributes);
        attributes.add(op.bindingKind, op.name, op.expression);
        ir.OpList.remove<ir.CreateOp>(op);
      }
    }
  }

  // Serialize the extracted attributes into the const array.
  if (job instanceof ComponentCompilationJob) {
    for (const unit of job.units) {
      for (const op of unit.create) {
        if (ir.isElementOrContainerOp(op)) {
          const attributes = allElementAttributes.get(op.xref);
          if (attributes !== undefined) {
            const attrArray = serializeAttributes(attributes);
            if (attrArray.entries.length > 0) {
              op.attributes = job.addConst(attrArray);
            }
          }
        }
      }
    }
  } else if (job instanceof HostBindingCompilationJob) {
    // TODO: If the host binding case further diverges, we may want to split it into its own
    // phase.
    for (const [xref, attributes] of allElementAttributes.entries()) {
      if (xref !== job.root.xref) {
        throw new Error(
            `An attribute would be const collected into the host binding's template function, but is not associated with the root xref.`);
      }
      const attrArray = serializeAttributes(attributes);
      if (attrArray.entries.length > 0) {
        job.root.attributes = attrArray;
      }
    }
  }
}

/**
 * Shared instance of an empty array to avoid unnecessary array allocations.
 */
const FLYWEIGHT_ARRAY: ReadonlyArray<o.Expression> = Object.freeze<o.Expression[]>([]);

/**
 * Container for all of the various kinds of attributes which are applied on an element.
 */
class ElementAttributes {
  private known = new Set<string>();
  private byKind = new Map<ir.BindingKind, o.Expression[]>;

  projectAs: string|null = null;

  get attributes(): ReadonlyArray<o.Expression> {
    return this.byKind.get(ir.BindingKind.Attribute) ?? FLYWEIGHT_ARRAY;
  }

  get classes(): ReadonlyArray<o.Expression> {
    return this.byKind.get(ir.BindingKind.ClassName) ?? FLYWEIGHT_ARRAY;
  }

  get styles(): ReadonlyArray<o.Expression> {
    return this.byKind.get(ir.BindingKind.StyleProperty) ?? FLYWEIGHT_ARRAY;
  }

  get bindings(): ReadonlyArray<o.Expression> {
    return this.byKind.get(ir.BindingKind.Property) ?? FLYWEIGHT_ARRAY;
  }

  get template(): ReadonlyArray<o.Expression> {
    return this.byKind.get(ir.BindingKind.Template) ?? FLYWEIGHT_ARRAY;
  }

  get i18n(): ReadonlyArray<o.Expression> {
    return this.byKind.get(ir.BindingKind.I18n) ?? FLYWEIGHT_ARRAY;
  }

  add(kind: ir.BindingKind, name: string, value: o.Expression|null): void {
    if (this.known.has(name)) {
      return;
    }
    this.known.add(name);
    if (name === 'ngProjectAs') {
      if (value === null || !(value instanceof o.LiteralExpr) || (value.value == null) ||
          (typeof value.value?.toString() !== 'string')) {
        throw Error('ngProjectAs must have a string literal value');
      }
      this.projectAs = value.value.toString();
      // TODO: TemplateDefinitionBuilder allows `ngProjectAs` to also be assigned as a literal
      // attribute. Is this sane?
    }


    const array = this.arrayFor(kind);
    array.push(...getAttributeNameLiterals(name));
    if (kind === ir.BindingKind.Attribute || kind === ir.BindingKind.StyleProperty) {
      if (value === null) {
        throw Error('Attribute, i18n attribute, & style element attributes must have a value');
      }
      array.push(value);
    }
  }

  private arrayFor(kind: ir.BindingKind): o.Expression[] {
    if (!this.byKind.has(kind)) {
      this.byKind.set(kind, []);
    }
    return this.byKind.get(kind)!;
  }
}

/**
 * Gets an array of literal expressions representing the attribute's namespaced name.
 */
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

/**
 * Serializes an ElementAttributes object into an array expression.
 */
function serializeAttributes({attributes, bindings, classes, i18n, projectAs, styles, template}:
                                 ElementAttributes): o.LiteralArrayExpr {
  const attrArray = [...attributes];

  if (projectAs !== null) {
    // Parse the attribute value into a CssSelectorList. Note that we only take the
    // first selector, because we don't support multiple selectors in ngProjectAs.
    const parsedR3Selector = core.parseSelectorToR3Selector(projectAs)[0];
    attrArray.push(
        o.literal(core.AttributeMarker.ProjectAs), literalOrArrayLiteral(parsedR3Selector));
  }
  if (classes.length > 0) {
    attrArray.push(o.literal(core.AttributeMarker.Classes), ...classes);
  }
  if (styles.length > 0) {
    attrArray.push(o.literal(core.AttributeMarker.Styles), ...styles);
  }
  if (bindings.length > 0) {
    attrArray.push(o.literal(core.AttributeMarker.Bindings), ...bindings);
  }
  if (template.length > 0) {
    attrArray.push(o.literal(core.AttributeMarker.Template), ...template);
  }
  if (i18n.length > 0) {
    attrArray.push(o.literal(core.AttributeMarker.I18n), ...i18n);
  }
  return o.literalArr(attrArray);
}
