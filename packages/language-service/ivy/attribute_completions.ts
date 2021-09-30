/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CssSelector, SelectorMatcher, TmplAstElement, TmplAstTemplate} from '@angular/compiler';
import {DirectiveInScope, ElementSymbol, TemplateSymbol, TemplateTypeChecker, TypeCheckableDirectiveMeta} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript';

import {DisplayInfoKind, unsafeCastDisplayInfoKindToScriptElementKind} from './display_parts';
import {makeElementSelector} from './utils';

/**
 * Differentiates different kinds of `AttributeCompletion`s.
 */
export enum AttributeCompletionKind {
  /**
   * Completion of an attribute from the HTML schema.
   *
   * Attributes often have a corresponding DOM property of the same name.
   */
  DomAttribute,

  /**
   * Completion of a property from the DOM schema.
   *
   * `DomProperty` completions are generated only for properties which don't share their name with
   * an HTML attribute.
   */
  DomProperty,

  /**
   * Completion of an attribute that results in a new directive being matched on an element.
   */
  DirectiveAttribute,

  /**
   * Completion of an attribute that results in a new structural directive being matched on an
   * element.
   */
  StructuralDirectiveAttribute,

  /**
   * Completion of an input from a directive which is either present on the element, or becomes
   * present after the addition of this attribute.
   */
  DirectiveInput,

  /**
   * Completion of an output from a directive which is either present on the element, or becomes
   * present after the addition of this attribute.
   */
  DirectiveOutput,
}

/**
 * Completion of an attribute from the DOM schema.
 */
export interface DomAttributeCompletion {
  kind: AttributeCompletionKind.DomAttribute;

  /**
   * Name of the HTML attribute (not to be confused with the corresponding DOM property name).
   */
  attribute: string;

  /**
   * Whether this attribute is also a DOM property. Note that this is required to be `true` because
   * we only want to provide DOM attributes when there is an Angular syntax associated with them
   * (`[propertyName]=""`).
   */
  isAlsoProperty: true;
}

/**
 * Completion of a DOM property of an element that's distinct from an HTML attribute.
 */
export interface DomPropertyCompletion {
  kind: AttributeCompletionKind.DomProperty;

  /**
   * Name of the DOM property
   */
  property: string;
}

/**
 * Completion of an attribute which results in a new directive being matched on an element.
 */
export interface DirectiveAttributeCompletion {
  kind: AttributeCompletionKind.DirectiveAttribute|
      AttributeCompletionKind.StructuralDirectiveAttribute;

  /**
   * Name of the attribute whose addition causes this directive to match the element.
   */
  attribute: string;

  /**
   * The directive whose selector gave rise to this completion.
   */
  directive: DirectiveInScope;
}

/**
 * Completion of an input of a directive which may either be present on the element, or become
 * present when a binding to this input is added.
 */
export interface DirectiveInputCompletion {
  kind: AttributeCompletionKind.DirectiveInput;

  /**
   * The public property name of the input (the name which would be used in any binding to that
   * input).
   */
  propertyName: string;

  /**
   * The directive which has this input.
   */
  directive: DirectiveInScope;

  /**
   * The field name on the directive class which corresponds to this input.
   *
   * Currently, in the case where a single property name corresponds to multiple input fields, only
   * the first such field is represented here. In the future multiple results may be warranted.
   */
  classPropertyName: string;

  /**
   * Whether this input can be used with two-way binding (that is, whether a corresponding change
   * output exists on the directive).
   */
  twoWayBindingSupported: boolean;
}

export interface DirectiveOutputCompletion {
  kind: AttributeCompletionKind.DirectiveOutput;

  /**
   * The public event name of the output (the name which would be used in any binding to that
   * output).
   */
  eventName: string;

  /**
   *The directive which has this output.
   */
  directive: DirectiveInScope;

  /**
   * The field name on the directive class which corresponds to this output.
   */
  classPropertyName: string;
}

/**
 * Any named attribute which is available for completion on a given element.
 *
 * Disambiguated by the `kind` property into various types of completions.
 */
export type AttributeCompletion = DomAttributeCompletion|DomPropertyCompletion|
    DirectiveAttributeCompletion|DirectiveInputCompletion|DirectiveOutputCompletion;

/**
 * Given an element and its context, produce a `Map` of all possible attribute completions.
 *
 * 3 kinds of attributes are considered for completion, from highest to lowest priority:
 *
 * 1. Inputs/outputs of directives present on the element already.
 * 2. Inputs/outputs of directives that are not present on the element, but which would become
 *    present if such a binding is added.
 * 3. Attributes from the DOM schema for the element.
 *
 * The priority of these options determines which completions are added to the `Map`. If a directive
 * input shares the same name as a DOM attribute, the `Map` will reflect the directive input
 * completion, not the DOM completion for that name.
 */
export function buildAttributeCompletionTable(
    component: ts.ClassDeclaration, element: TmplAstElement|TmplAstTemplate,
    checker: TemplateTypeChecker): Map<string, AttributeCompletion> {
  const table = new Map<string, AttributeCompletion>();

  // Use the `ElementSymbol` or `TemplateSymbol` to iterate over directives present on the node, and
  // their inputs/outputs. These have the highest priority of completion results.
  const symbol: ElementSymbol|TemplateSymbol =
      checker.getSymbolOfNode(element, component) as ElementSymbol | TemplateSymbol;
  const presentDirectives = new Set<ts.ClassDeclaration>();
  if (symbol !== null) {
    // An `ElementSymbol` was available. This means inputs and outputs for directives on the
    // element can be added to the completion table.
    for (const dirSymbol of symbol.directives) {
      const directive = dirSymbol.tsSymbol.valueDeclaration;
      if (!ts.isClassDeclaration(directive)) {
        continue;
      }
      presentDirectives.add(directive);

      const meta = checker.getDirectiveMetadata(directive);
      if (meta === null) {
        continue;
      }

      for (const [classPropertyName, propertyName] of meta.inputs) {
        if (table.has(propertyName)) {
          continue;
        }

        table.set(propertyName, {
          kind: AttributeCompletionKind.DirectiveInput,
          propertyName,
          directive: dirSymbol,
          classPropertyName,
          twoWayBindingSupported: meta.outputs.hasBindingPropertyName(propertyName + 'Change'),
        });
      }

      for (const [classPropertyName, propertyName] of meta.outputs) {
        if (table.has(propertyName)) {
          continue;
        }

        table.set(propertyName, {
          kind: AttributeCompletionKind.DirectiveOutput,
          eventName: propertyName,
          directive: dirSymbol,
          classPropertyName,
        });
      }
    }
  }

  // Next, explore hypothetical directives and determine if the addition of any single attributes
  // can cause the directive to match the element.
  const directivesInScope = checker.getDirectivesInScope(component);
  if (directivesInScope !== null) {
    const elementSelector = makeElementSelector(element);

    for (const dirInScope of directivesInScope) {
      const directive = dirInScope.tsSymbol.valueDeclaration;
      // Skip directives that are present on the element.
      if (!ts.isClassDeclaration(directive) || presentDirectives.has(directive)) {
        continue;
      }

      const meta = checker.getDirectiveMetadata(directive);
      if (meta === null || meta.selector === null) {
        continue;
      }

      if (!meta.isStructural) {
        // For non-structural directives, the directive's attribute selector(s) are matched against
        // a hypothetical version of the element with those attributes. A match indicates that
        // adding that attribute/input/output binding would cause the directive to become present,
        // meaning that such a binding is a valid completion.
        const selectors = CssSelector.parse(meta.selector);
        const matcher = new SelectorMatcher();
        matcher.addSelectables(selectors);

        for (const selector of selectors) {
          for (const [attrName, attrValue] of selectorAttributes(selector)) {
            if (attrValue !== '') {
              // This attribute selector requires a value, which is not supported in completion.
              continue;
            }

            if (table.has(attrName)) {
              // Skip this attribute as there's already a binding for it.
              continue;
            }

            // Check whether adding this attribute would cause the directive to start matching.
            const newElementSelector = elementSelector + `[${attrName}]`;
            if (!matcher.match(CssSelector.parse(newElementSelector)[0], null)) {
              // Nope, move on with our lives.
              continue;
            }

            // Adding this attribute causes a new directive to be matched. Decide how to categorize
            // it based on the directive's inputs and outputs.
            if (meta.inputs.hasBindingPropertyName(attrName)) {
              // This attribute corresponds to an input binding.
              table.set(attrName, {
                kind: AttributeCompletionKind.DirectiveInput,
                directive: dirInScope,
                propertyName: attrName,
                classPropertyName:
                    meta.inputs.getByBindingPropertyName(attrName)![0].classPropertyName,
                twoWayBindingSupported: meta.outputs.hasBindingPropertyName(attrName + 'Change'),
              });
            } else if (meta.outputs.hasBindingPropertyName(attrName)) {
              // This attribute corresponds to an output binding.
              table.set(attrName, {
                kind: AttributeCompletionKind.DirectiveOutput,
                directive: dirInScope,
                eventName: attrName,
                classPropertyName:
                    meta.outputs.getByBindingPropertyName(attrName)![0].classPropertyName,
              });
            } else {
              // This attribute causes a new directive to be matched, but does not also correspond
              // to an input or output binding.
              table.set(attrName, {
                kind: AttributeCompletionKind.DirectiveAttribute,
                attribute: attrName,
                directive: dirInScope,
              });
            }
          }
        }
      } else {
        // Hypothetically matching a structural directive is a litle different than a plain
        // directive. Use of the '*' structural directive syntactic sugar means that the actual
        // directive is applied to a plain <ng-template> node, not the existing element with any
        // other attributes it might already have.
        // Additionally, more than one attribute/input might need to be present in order for the
        // directive to match (e.g. `ngFor` has a selector of `[ngFor][ngForOf]`). This gets a
        // little tricky.

        const structuralAttributes = getStructuralAttributes(meta);
        for (const attrName of structuralAttributes) {
          table.set(attrName, {
            kind: AttributeCompletionKind.StructuralDirectiveAttribute,
            attribute: attrName,
            directive: dirInScope,
          });
        }
      }
    }
  }

  // Finally, add any DOM attributes not already covered by inputs.
  if (element instanceof TmplAstElement) {
    for (const {attribute, property} of checker.getPotentialDomBindings(element.name)) {
      const isAlsoProperty = attribute === property;
      if (!table.has(attribute) && isAlsoProperty) {
        table.set(attribute, {
          kind: AttributeCompletionKind.DomAttribute,
          attribute,
          isAlsoProperty,
        });
      }
    }
  }

  return table;
}

/**
 * Given an `AttributeCompletion`, add any available completions to a `ts.CompletionEntry` array of
 * results.
 *
 * The kind of completions generated depends on whether the current context is an attribute context
 * or not. For example, completing on `<element attr|>` will generate two results: `attribute` and
 * `[attribute]` - either a static attribute can be generated, or a property binding. However,
 * `<element [attr|]>` is not an attribute context, and so only the property completion `attribute`
 * is generated. Note that this completion does not have the `[]` property binding sugar as its
 * implicitly present in a property binding context (we're already completing within an `[attr|]`
 * expression).
 */
export function addAttributeCompletionEntries(
    entries: ts.CompletionEntry[], completion: AttributeCompletion, isAttributeContext: boolean,
    isElementContext: boolean, replacementSpan: ts.TextSpan|undefined): void {
  switch (completion.kind) {
    case AttributeCompletionKind.DirectiveAttribute: {
      entries.push({
        kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
        name: completion.attribute,
        sortText: completion.attribute,
        replacementSpan,
      });
      break;
    }
    case AttributeCompletionKind.StructuralDirectiveAttribute: {
      // In an element, the completion is offered with a leading '*' to activate the structural
      // directive. Once present, the structural attribute will be parsed as a template and not an
      // element, and the prefix is no longer necessary.
      const prefix = isElementContext ? '*' : '';
      entries.push({
        kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
        name: prefix + completion.attribute,
        sortText: prefix + completion.attribute,
        replacementSpan,
      });
      break;
    }
    case AttributeCompletionKind.DirectiveInput: {
      if (isAttributeContext) {
        // Offer a completion of a property binding.
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
          name: `[${completion.propertyName}]`,
          sortText: completion.propertyName,
          replacementSpan,
        });
        // If the directive supports banana-in-a-box for this input, offer that as well.
        if (completion.twoWayBindingSupported) {
          entries.push({
            kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            name: `[(${completion.propertyName})]`,
            // This completion should sort after the property binding.
            sortText: completion.propertyName + '_1',
            replacementSpan,
          });
        }
        // Offer a completion of the input binding as an attribute.
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
          name: completion.propertyName,
          // This completion should sort after both property binding options (one-way and two-way).
          sortText: completion.propertyName + '_2',
          replacementSpan,
        });
      } else {
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
          name: completion.propertyName,
          sortText: completion.propertyName,
          replacementSpan,
        });
      }
      break;
    }
    case AttributeCompletionKind.DirectiveOutput: {
      if (isAttributeContext) {
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
          name: `(${completion.eventName})`,
          sortText: completion.eventName,
          replacementSpan,
        });
      } else {
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
          name: completion.eventName,
          sortText: completion.eventName,
          replacementSpan,
        });
      }
      break;
    }
    case AttributeCompletionKind.DomAttribute: {
      if (isAttributeContext && completion.isAlsoProperty) {
        // Offer a completion of a property binding to the DOM property.
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
          name: `[${completion.attribute}]`,
          // In the case of DOM attributes, the property binding should sort after the attribute
          // binding.
          sortText: completion.attribute + '_1',
          replacementSpan,
        });
      }
      break;
    }
    case AttributeCompletionKind.DomProperty: {
      if (!isAttributeContext) {
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
          name: completion.property,
          sortText: completion.property,
          replacementSpan,
        });
      }
    }
  }
}

export function getAttributeCompletionSymbol(
    completion: AttributeCompletion, checker: ts.TypeChecker): ts.Symbol|null {
  switch (completion.kind) {
    case AttributeCompletionKind.DomAttribute:
    case AttributeCompletionKind.DomProperty:
      return null;
    case AttributeCompletionKind.DirectiveAttribute:
    case AttributeCompletionKind.StructuralDirectiveAttribute:
      return completion.directive.tsSymbol;
    case AttributeCompletionKind.DirectiveInput:
    case AttributeCompletionKind.DirectiveOutput:
      return checker.getDeclaredTypeOfSymbol(completion.directive.tsSymbol)
                 .getProperty(completion.classPropertyName) ??
          null;
  }
}

/**
 * Iterates over `CssSelector` attributes, which are internally represented in a zipped array style
 * which is not conducive to straightforward iteration.
 */
function* selectorAttributes(selector: CssSelector): Iterable<[string, string]> {
  for (let i = 0; i < selector.attrs.length; i += 2) {
    yield [selector.attrs[0], selector.attrs[1]];
  }
}

function getStructuralAttributes(meta: TypeCheckableDirectiveMeta): string[] {
  if (meta.selector === null) {
    return [];
  }

  const structuralAttributes: string[] = [];
  const selectors = CssSelector.parse(meta.selector);
  for (const selector of selectors) {
    if (selector.element !== null && selector.element !== 'ng-template') {
      // This particular selector does not apply under structural directive syntax.
      continue;
    }

    // Every attribute of this selector must be name-only - no required values.
    const attributeSelectors = Array.from(selectorAttributes(selector));
    if (!attributeSelectors.every(([_, attrValue]) => attrValue === '')) {
      continue;
    }

    // Get every named selector.
    const attributes = attributeSelectors.map(([attrName, _]) => attrName);

    // Find the shortest attribute. This is the structural directive "base", and all potential
    // input bindings must begin with the base. E.g. in `*ngFor="let a of b"`, `ngFor` is the
    // base attribute, and the `of` binding key corresponds to an input of `ngForOf`.
    const baseAttr = attributes.reduce(
        (prev, curr) => prev === null || curr.length < prev.length ? curr : prev,
        null as string | null);
    if (baseAttr === null) {
      // No attributes in this selector?
      continue;
    }

    // Validate that the attributes are compatible with use as a structural directive.
    const isValid = (attr: string): boolean => {
      // The base attribute is valid by default.
      if (attr === baseAttr) {
        return true;
      }

      // Non-base attributes must all be prefixed with the base attribute.
      if (!attr.startsWith(baseAttr)) {
        return false;
      }

      // Non-base attributes must also correspond to directive inputs.
      if (!meta.inputs.hasBindingPropertyName(attr)) {
        return false;
      }

      // This attribute is compatible.
      return true;
    };

    if (!attributes.every(isValid)) {
      continue;
    }

    // This attribute is valid as a structural attribute for this directive.
    structuralAttributes.push(baseAttr);
  }

  return structuralAttributes;
}
