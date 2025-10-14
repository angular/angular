/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as core from '../../../../core';
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {ComponentCompilationJob, HostBindingCompilationJob} from '../compilation';
import {literalOrArrayLiteral} from '../conversion';
/**
 * Converts the semantic attributes of element-like operations (elements, templates) into constant
 * array expressions, and lifts them into the overall component `consts`.
 */
export function collectElementConsts(job) {
  // Collect all extracted attributes.
  const allElementAttributes = new Map();
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.ExtractedAttribute) {
        const attributes =
          allElementAttributes.get(op.target) || new ElementAttributes(job.compatibility);
        allElementAttributes.set(op.target, attributes);
        attributes.add(op.bindingKind, op.name, op.expression, op.namespace, op.trustedValueFn);
        ir.OpList.remove(op);
      }
    }
  }
  // Serialize the extracted attributes into the const array.
  if (job instanceof ComponentCompilationJob) {
    for (const unit of job.units) {
      for (const op of unit.create) {
        // TODO: Simplify and combine these cases.
        if (op.kind == ir.OpKind.Projection) {
          const attributes = allElementAttributes.get(op.xref);
          if (attributes !== undefined) {
            const attrArray = serializeAttributes(attributes);
            if (attrArray.entries.length > 0) {
              op.attributes = attrArray;
            }
          }
        } else if (ir.isElementOrContainerOp(op)) {
          op.attributes = getConstIndex(job, allElementAttributes, op.xref);
          // TODO(dylhunn): `@for` loops with `@empty` blocks need to be special-cased here,
          // because the slot consumer trait currently only supports one slot per consumer and we
          // need two. This should be revisited when making the refactors mentioned in:
          // https://github.com/angular/angular/pull/53620#discussion_r1430918822
          if (op.kind === ir.OpKind.RepeaterCreate && op.emptyView !== null) {
            op.emptyAttributes = getConstIndex(job, allElementAttributes, op.emptyView);
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
          `An attribute would be const collected into the host binding's template function, but is not associated with the root xref.`,
        );
      }
      const attrArray = serializeAttributes(attributes);
      if (attrArray.entries.length > 0) {
        job.root.attributes = attrArray;
      }
    }
  }
}
function getConstIndex(job, allElementAttributes, xref) {
  const attributes = allElementAttributes.get(xref);
  if (attributes !== undefined) {
    const attrArray = serializeAttributes(attributes);
    if (attrArray.entries.length > 0) {
      return job.addConst(attrArray);
    }
  }
  return null;
}
/**
 * Shared instance of an empty array to avoid unnecessary array allocations.
 */
const FLYWEIGHT_ARRAY = Object.freeze([]);
/**
 * Container for all of the various kinds of attributes which are applied on an element.
 */
class ElementAttributes {
  compatibility;
  known = new Map();
  byKind = new Map();
  propertyBindings = null;
  projectAs = null;
  get attributes() {
    return this.byKind.get(ir.BindingKind.Attribute) ?? FLYWEIGHT_ARRAY;
  }
  get classes() {
    return this.byKind.get(ir.BindingKind.ClassName) ?? FLYWEIGHT_ARRAY;
  }
  get styles() {
    return this.byKind.get(ir.BindingKind.StyleProperty) ?? FLYWEIGHT_ARRAY;
  }
  get bindings() {
    return this.propertyBindings ?? FLYWEIGHT_ARRAY;
  }
  get template() {
    return this.byKind.get(ir.BindingKind.Template) ?? FLYWEIGHT_ARRAY;
  }
  get i18n() {
    return this.byKind.get(ir.BindingKind.I18n) ?? FLYWEIGHT_ARRAY;
  }
  constructor(compatibility) {
    this.compatibility = compatibility;
  }
  isKnown(kind, name) {
    const nameToValue = this.known.get(kind) ?? new Set();
    this.known.set(kind, nameToValue);
    if (nameToValue.has(name)) {
      return true;
    }
    nameToValue.add(name);
    return false;
  }
  add(kind, name, value, namespace, trustedValueFn) {
    // TemplateDefinitionBuilder puts duplicate attribute, class, and style values into the consts
    // array. This seems inefficient, we can probably keep just the first one or the last value
    // (whichever actually gets applied when multiple values are listed for the same attribute).
    const allowDuplicates =
      this.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder &&
      (kind === ir.BindingKind.Attribute ||
        kind === ir.BindingKind.ClassName ||
        kind === ir.BindingKind.StyleProperty);
    if (!allowDuplicates && this.isKnown(kind, name)) {
      return;
    }
    // TODO: Can this be its own phase
    if (name === 'ngProjectAs') {
      if (
        value === null ||
        !(value instanceof o.LiteralExpr) ||
        value.value == null ||
        typeof value.value?.toString() !== 'string'
      ) {
        throw Error('ngProjectAs must have a string literal value');
      }
      this.projectAs = value.value.toString();
      // TODO: TemplateDefinitionBuilder allows `ngProjectAs` to also be assigned as a literal
      // attribute. Is this sane?
    }
    const array = this.arrayFor(kind);
    array.push(...getAttributeNameLiterals(namespace, name));
    if (kind === ir.BindingKind.Attribute || kind === ir.BindingKind.StyleProperty) {
      if (value === null) {
        throw Error('Attribute, i18n attribute, & style element attributes must have a value');
      }
      if (trustedValueFn !== null) {
        if (!ir.isStringLiteral(value)) {
          throw Error('AssertionError: extracted attribute value should be string literal');
        }
        array.push(
          o.taggedTemplate(
            trustedValueFn,
            new o.TemplateLiteralExpr([new o.TemplateLiteralElementExpr(value.value)], []),
            undefined,
            value.sourceSpan,
          ),
        );
      } else {
        array.push(value);
      }
    }
  }
  arrayFor(kind) {
    if (kind === ir.BindingKind.Property || kind === ir.BindingKind.TwoWayProperty) {
      this.propertyBindings ??= [];
      return this.propertyBindings;
    } else {
      if (!this.byKind.has(kind)) {
        this.byKind.set(kind, []);
      }
      return this.byKind.get(kind);
    }
  }
}
/**
 * Gets an array of literal expressions representing the attribute's namespaced name.
 */
function getAttributeNameLiterals(namespace, name) {
  const nameLiteral = o.literal(name);
  if (namespace) {
    return [
      o.literal(0 /* core.AttributeMarker.NamespaceURI */),
      o.literal(namespace),
      nameLiteral,
    ];
  }
  return [nameLiteral];
}
/**
 * Serializes an ElementAttributes object into an array expression.
 */
function serializeAttributes({attributes, bindings, classes, i18n, projectAs, styles, template}) {
  const attrArray = [...attributes];
  if (projectAs !== null) {
    // Parse the attribute value into a CssSelectorList. Note that we only take the
    // first selector, because we don't support multiple selectors in ngProjectAs.
    const parsedR3Selector = core.parseSelectorToR3Selector(projectAs)[0];
    attrArray.push(
      o.literal(5 /* core.AttributeMarker.ProjectAs */),
      literalOrArrayLiteral(parsedR3Selector),
    );
  }
  if (classes.length > 0) {
    attrArray.push(o.literal(1 /* core.AttributeMarker.Classes */), ...classes);
  }
  if (styles.length > 0) {
    attrArray.push(o.literal(2 /* core.AttributeMarker.Styles */), ...styles);
  }
  if (bindings.length > 0) {
    attrArray.push(o.literal(3 /* core.AttributeMarker.Bindings */), ...bindings);
  }
  if (template.length > 0) {
    attrArray.push(o.literal(4 /* core.AttributeMarker.Template */), ...template);
  }
  if (i18n.length > 0) {
    attrArray.push(o.literal(6 /* core.AttributeMarker.I18n */), ...i18n);
  }
  return o.literalArr(attrArray);
}
//# sourceMappingURL=const_collection.js.map
