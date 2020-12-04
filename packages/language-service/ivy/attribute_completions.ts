/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CssSelector, SelectorMatcher, TmplAstElement} from '@angular/compiler';
import {DirectiveInScope, TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
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
   * Whether this attribute is also a DOM property.
   */
  isAlsoProperty: boolean;
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
  kind: AttributeCompletionKind.DirectiveAttribute;

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
    component: ts.ClassDeclaration, element: TmplAstElement,
    checker: TemplateTypeChecker): Map<string, AttributeCompletion> {
  const table = new Map<string, AttributeCompletion>();

  // Use the `ElementSymbol` to iterate over directives present on the element, and their
  // inputs/outputs. These have the highest priority of completion results.
  const symbol = checker.getSymbolOfNode(element, component);
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

      for (const [propertyName, classPropertyName] of meta.inputs) {
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

      for (const [propertyName, classPropertyName] of meta.outputs) {
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
            // This attribute causes a new directive to be matched, but does not also correspond to
            // an input or output binding.
            table.set(attrName, {
              kind: AttributeCompletionKind.DirectiveAttribute,
              attribute: attrName,
              directive: dirInScope,
            });
          }
        }
      }
    }
  }

  // Finally, add any DOM attributes not already covered by inputs.
  for (const {attribute, property} of checker.getPotentialDomBindings(element.name)) {
    const isAlsoProperty = attribute === property;
    if (!table.has(attribute)) {
      table.set(attribute, {
        kind: AttributeCompletionKind.DomAttribute,
        attribute,
        isAlsoProperty,
      });
    }
    if (!isAlsoProperty && !table.has(property)) {
      table.set(property, {
        kind: AttributeCompletionKind.DomProperty,
        property,
      });
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
    replacementSpan: ts.TextSpan|undefined): void {
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
      if (isAttributeContext) {
        // Offer a completion of an attribute binding.
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
          name: completion.attribute,
          sortText: completion.attribute,
          replacementSpan,
        });
        if (completion.isAlsoProperty) {
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
      } else if (completion.isAlsoProperty) {
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
          name: completion.attribute,
          sortText: completion.attribute,
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
