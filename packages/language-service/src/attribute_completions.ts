/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  CssSelector,
  MatchSource,
  SelectorMatcher,
  TmplAstElement,
  TmplAstTemplate,
} from '@angular/compiler';
import {
  ElementSymbol,
  PotentialDirective,
  TemplateSymbol,
  TemplateTypeChecker,
  TypeCheckableDirectiveMeta,
} from '@angular/compiler-cli';
import ts from 'typescript';

import {DisplayInfoKind, unsafeCastDisplayInfoKindToScriptElementKind} from './utils/display_parts';
import {makeElementSelector} from './utils';
import {getClassDeclarationFromSymbolReference} from './utils/ts_utils';

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
   * Completion of an event from the DOM schema.
   */
  DomEvent,

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
 * Documentation-oriented metadata of a Custom Elements Manifest property or event entry, used
 * to enrich completions and hovers for manifest-declared custom elements.
 */
export interface CustomElementsManifestEntryInfo {
  /** Whether the entry is deprecated; a string carries the manifest's stated reason. */
  deprecated?: true | string;

  /** Markdown documentation from the manifest. */
  description?: string;

  /** Original CEM type text, for display and literal completion guidance. */
  typeText?: string;

  /** The manifest's serialized default value, when present. */
  default?: string;
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
  isAlsoProperty: boolean;

  /** Whether this attribute was explicitly declared by a Custom Elements Manifest. */
  isCustomElementsManifestAttribute?: boolean;

  /** Documentation for the HTML attribute declared by a Custom Elements Manifest. */
  attributeManifestInfo?: CustomElementsManifestEntryInfo;

  /** Documentation for the same-named property declared by a Custom Elements Manifest. */
  propertyManifestInfo?: CustomElementsManifestEntryInfo;
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

  /** Present when the property comes from a Custom Elements Manifest and carries docs. */
  manifestInfo?: CustomElementsManifestEntryInfo;
}

export interface DomEventCompletion {
  kind: AttributeCompletionKind.DomEvent;

  /**
   * Name of the DOM event
   */
  eventName: string;

  /** Present when the event comes from a Custom Elements Manifest and carries docs. */
  manifestInfo?: CustomElementsManifestEntryInfo;
}

/**
 * Completion of an attribute which results in a new directive being matched on an element.
 */
export interface DirectiveAttributeCompletion {
  kind:
    | AttributeCompletionKind.DirectiveAttribute
    | AttributeCompletionKind.StructuralDirectiveAttribute;

  /**
   * Name of the attribute whose addition causes this directive to match the element.
   */
  attribute: string;

  /**
   * The directive whose selector gave rise to this completion.
   */
  directive: PotentialDirective;
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
  directive: PotentialDirective;

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
  directive: PotentialDirective;

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
export type AttributeCompletion =
  | DomAttributeCompletion
  | DomPropertyCompletion
  | DirectiveAttributeCompletion
  | DirectiveInputCompletion
  | DirectiveOutputCompletion
  | DomEventCompletion;

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
  component: ts.ClassDeclaration,
  element: TmplAstElement | TmplAstTemplate,
  checker: TemplateTypeChecker,
  ls: ts.LanguageService,
  includeExternalModule: boolean | undefined,
): Map<string, AttributeCompletion> {
  const table = new Map<string, AttributeCompletion>();

  // Use the `ElementSymbol` or `TemplateSymbol` to iterate over directives present on the node, and
  // their inputs/outputs. These have the highest priority of completion results.
  const symbol: ElementSymbol | TemplateSymbol = checker.getSymbolOfNode(element, component) as
    | ElementSymbol
    | TemplateSymbol;
  const presentDirectives = new Set<ts.ClassDeclaration>();
  if (symbol !== null) {
    // An `ElementSymbol` was available. This means inputs and outputs for directives on the
    // element can be added to the completion table.
    for (const dirSymbol of symbol.directives) {
      const directive = getClassDeclarationFromSymbolReference(ls, dirSymbol.ref);

      if (!directive || !ts.isClassDeclaration(directive)) {
        continue;
      }
      presentDirectives.add(directive);

      const meta = checker.getDirectiveMetadata(directive);
      if (meta === null) {
        continue;
      }

      for (const {classPropertyName, bindingPropertyName} of meta.inputs) {
        let propertyName: string;

        if (dirSymbol.matchSource === MatchSource.HostDirective) {
          if (!dirSymbol.exposedInputs?.hasOwnProperty(bindingPropertyName)) {
            continue;
          }
          propertyName = dirSymbol.exposedInputs[bindingPropertyName];
        } else {
          propertyName = bindingPropertyName;
        }

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

      for (const {classPropertyName, bindingPropertyName} of meta.outputs) {
        let propertyName: string;

        if (dirSymbol.matchSource === MatchSource.HostDirective) {
          if (!dirSymbol.exposedOutputs?.hasOwnProperty(bindingPropertyName)) {
            continue;
          }
          propertyName = dirSymbol.exposedOutputs[bindingPropertyName];
        } else {
          propertyName = bindingPropertyName;
        }

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
  const potentialDirectives = checker.getPotentialTemplateDirectives(component, ls, {
    includeExternalModule: includeExternalModule ?? false,
  });
  if (potentialDirectives !== null) {
    const elementSelector = makeElementSelector(element);

    for (const currentDir of potentialDirectives) {
      const directive = getClassDeclarationFromSymbolReference(ls, currentDir.ref);

      // Skip directives that are present on the element.
      if (!directive || !ts.isClassDeclaration(directive) || presentDirectives.has(directive)) {
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
                directive: currentDir,
                propertyName: attrName,
                classPropertyName:
                  meta.inputs.getByBindingPropertyName(attrName)![0].classPropertyName,
                twoWayBindingSupported: meta.outputs.hasBindingPropertyName(attrName + 'Change'),
              });
            } else if (meta.outputs.hasBindingPropertyName(attrName)) {
              // This attribute corresponds to an output binding.
              table.set(attrName, {
                kind: AttributeCompletionKind.DirectiveOutput,
                directive: currentDir,
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
                directive: currentDir,
              });
            }
          }
        }
      } else {
        // Hypothetically matching a structural directive is a little different than a plain
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
            directive: currentDir,
          });
        }
      }
    }
  }

  // Finally, add any DOM attributes not already covered by inputs.
  if (element instanceof TmplAstElement) {
    // For elements declared in a Custom Elements Manifest, enrich the DOM completions with the
    // manifest's documentation and deprecation metadata.
    const manifestSchema = checker.getCustomElementsManifestSchema(element.name);
    const manifestProperties = new Map(manifestSchema?.properties.map((p) => [p.name, p]) ?? []);
    const manifestAttributes = new Map(manifestSchema?.attributes?.map((a) => [a.name, a]) ?? []);
    const manifestEvents = new Map(manifestSchema?.events.map((e) => [e.name, e]) ?? []);

    for (const {attribute, property} of checker.getPotentialDomBindings(element.name)) {
      const isAlsoProperty = attribute === property;
      if (!table.has(attribute) && isAlsoProperty) {
        table.set(attribute, {
          kind: AttributeCompletionKind.DomAttribute,
          attribute,
          isAlsoProperty,
          propertyManifestInfo: toManifestEntryInfo(manifestProperties.get(property)),
        });
      }
    }
    for (const [attribute, manifestAttribute] of manifestAttributes) {
      const existing = table.get(attribute);
      if (existing !== undefined && existing.kind !== AttributeCompletionKind.DomAttribute) {
        // Angular directive inputs/outputs and selector attributes take precedence over manifest
        // metadata on the same spelling.
        continue;
      }
      // Attribute declarations never imply properties, but a separately declared property with
      // the same binding name should retain its property completion and metadata.
      const isAlsoProperty = manifestProperties.has(attribute);
      table.set(attribute, {
        kind: AttributeCompletionKind.DomAttribute,
        attribute,
        isAlsoProperty,
        isCustomElementsManifestAttribute: true,
        attributeManifestInfo: toManifestEntryInfo(manifestAttribute),
        propertyManifestInfo: toManifestEntryInfo(manifestProperties.get(attribute)),
      });
    }
    for (const event of checker.getPotentialDomEvents(element.name)) {
      const manifestEvent = manifestEvents.get(event);
      table.set(event, {
        kind: AttributeCompletionKind.DomEvent,
        eventName: event,
        manifestInfo: toManifestEntryInfo(manifestEvent),
      });
    }
  }
  return table;
}

/** Extracts a `CustomElementsManifestEntryInfo` from a manifest entry, when it carries docs. */
function toManifestEntryInfo(
  entry:
    | {deprecated?: true | string; description?: string; typeText?: string; default?: string}
    | undefined,
): CustomElementsManifestEntryInfo | undefined {
  if (
    entry === undefined ||
    (entry.deprecated === undefined &&
      entry.description === undefined &&
      entry.typeText === undefined &&
      entry.default === undefined)
  ) {
    return undefined;
  }
  return {
    deprecated: entry.deprecated,
    description: entry.description,
    typeText: entry.typeText,
    default: entry.default,
  };
}

/**
 * Converts Custom Elements Manifest docs into the documentation and JSDoc tags shape used by
 * completion details and quick info.
 */
export function getCustomElementsManifestDisplayInfo(
  info: CustomElementsManifestEntryInfo | undefined,
): {documentation?: ts.SymbolDisplayPart[]; tags?: ts.JSDocTagInfo[]} {
  if (info === undefined) {
    return {};
  }
  const documentation: ts.SymbolDisplayPart[] = [];
  if (info.description !== undefined) {
    documentation.push({kind: 'text', text: info.description});
  }
  if (info.default !== undefined) {
    if (documentation.length > 0) {
      documentation.push({kind: 'lineBreak', text: '\n\n'});
    }
    documentation.push({kind: 'text', text: `Default: ${info.default}`});
  }
  return {
    documentation: documentation.length > 0 ? documentation : undefined,
    tags:
      info.deprecated !== undefined
        ? [
            {
              name: 'deprecated',
              text:
                typeof info.deprecated === 'string'
                  ? [{kind: 'text', text: info.deprecated}]
                  : undefined,
            },
          ]
        : undefined,
  };
}

function buildSnippet(insertSnippet: true | undefined, text: string): string | undefined {
  return insertSnippet ? `${text.replace(/\$/gi, '\\$')}="$1"` : undefined;
}

/** The completion entry kind modifiers for an entry with manifest docs, if any. */
function manifestKindModifiers(
  info: CustomElementsManifestEntryInfo | undefined,
): string | undefined {
  return info?.deprecated !== undefined
    ? ts.ScriptElementKindModifier.deprecatedModifier
    : undefined;
}

/**
 * Used to ensure Angular completions appear before DOM completions. Inputs and Outputs are
 * prioritized first while attributes which would match an additional directive are prioritized
 * second.
 *
 * This sort priority is based on the ASCII table. Other than `space`, the `!` is the first
 * printable character in the ASCII ordering.
 */
export enum AsciiSortPriority {
  First = '!',
  Second = '"',
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
 *
 * If the `insertSnippet` is `true`, the completion entries should includes the property or event
 * binding sugar in some case. For Example `<div (my¦) />`, the `replacementSpan` is `(my)`, and the
 * `insertText` is `(myOutput)="$0"`.
 */
export function addAttributeCompletionEntries(
  entries: ts.CompletionEntry[],
  completion: AttributeCompletion,
  isAttributeContext: boolean,
  isElementContext: boolean,
  replacementSpan: ts.TextSpan | undefined,
  insertSnippet: true | undefined,
): void {
  const directive = 'directive' in completion ? completion.directive : null;
  const tsEntryData = directive?.tsCompletionEntryInfos?.[0]?.tsCompletionEntryData;

  switch (completion.kind) {
    case AttributeCompletionKind.DirectiveAttribute: {
      entries.push({
        kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
        name: completion.attribute,
        sortText: AsciiSortPriority.Second + completion.attribute,
        replacementSpan,
        data: tsEntryData,
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
        insertText: buildSnippet(insertSnippet, prefix + completion.attribute),
        isSnippet: insertSnippet,
        sortText: AsciiSortPriority.Second + prefix + completion.attribute,
        replacementSpan,
        data: tsEntryData,
      });
      break;
    }
    case AttributeCompletionKind.DirectiveInput: {
      if (isAttributeContext || insertSnippet) {
        // Offer a completion of a property binding.
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
          name: `[${completion.propertyName}]`,
          insertText: buildSnippet(insertSnippet, `[${completion.propertyName}]`),
          isSnippet: insertSnippet,
          sortText: AsciiSortPriority.First + completion.propertyName,
          replacementSpan,
          data: tsEntryData,
        });
        // If the directive supports banana-in-a-box for this input, offer that as well.
        if (completion.twoWayBindingSupported) {
          entries.push({
            kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            name: `[(${completion.propertyName})]`,
            insertText: buildSnippet(insertSnippet, `[(${completion.propertyName})]`),
            isSnippet: insertSnippet,
            // This completion should sort after the property binding.
            sortText: AsciiSortPriority.First + completion.propertyName + '_1',
            replacementSpan,
            data: tsEntryData,
          });
        }
        // Offer a completion of the input binding as an attribute.
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
          name: completion.propertyName,
          insertText: buildSnippet(insertSnippet, completion.propertyName),
          isSnippet: insertSnippet,
          // This completion should sort after both property binding options (one-way and two-way).
          sortText: AsciiSortPriority.First + completion.propertyName + '_2',
          replacementSpan,
          data: tsEntryData,
        });
      } else {
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
          name: completion.propertyName,
          insertText: buildSnippet(insertSnippet, completion.propertyName),
          isSnippet: insertSnippet,
          sortText: AsciiSortPriority.First + completion.propertyName,
          replacementSpan,
          data: tsEntryData,
        });
      }
      break;
    }
    case AttributeCompletionKind.DirectiveOutput: {
      if (isAttributeContext || insertSnippet) {
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
          name: `(${completion.eventName})`,
          insertText: buildSnippet(insertSnippet, `(${completion.eventName})`),
          isSnippet: insertSnippet,
          sortText: AsciiSortPriority.First + completion.eventName,
          replacementSpan,
          data: tsEntryData,
        });
      } else {
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
          name: completion.eventName,
          insertText: buildSnippet(insertSnippet, completion.eventName),
          isSnippet: insertSnippet,
          sortText: AsciiSortPriority.First + completion.eventName,
          replacementSpan,
          data: tsEntryData,
        });
      }
      break;
    }
    case AttributeCompletionKind.DomAttribute: {
      if (isAttributeContext && completion.isCustomElementsManifestAttribute) {
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
          name: completion.attribute,
          insertText: buildSnippet(insertSnippet, completion.attribute),
          isSnippet: insertSnippet,
          sortText: completion.attribute,
          replacementSpan,
          kindModifiers: manifestKindModifiers(completion.attributeManifestInfo),
        });
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
          name: `[attr.${completion.attribute}]`,
          insertText: buildSnippet(insertSnippet, `[attr.${completion.attribute}]`),
          isSnippet: insertSnippet,
          sortText: completion.attribute + '_1',
          replacementSpan,
          kindModifiers: manifestKindModifiers(completion.attributeManifestInfo),
        });
      }
      if ((isAttributeContext || insertSnippet) && completion.isAlsoProperty) {
        // Offer a completion of a property binding to the DOM property.
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
          name: `[${completion.attribute}]`,
          insertText: buildSnippet(insertSnippet, `[${completion.attribute}]`),
          isSnippet: insertSnippet,
          // In the case of DOM attributes, the property binding should sort after the attribute
          // binding.
          sortText: completion.attribute + '_2',
          replacementSpan,
          kindModifiers: manifestKindModifiers(completion.propertyManifestInfo),
        });
      }
      break;
    }
    case AttributeCompletionKind.DomProperty: {
      if (!isAttributeContext) {
        entries.push({
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
          name: completion.property,
          insertText: buildSnippet(insertSnippet, completion.property),
          isSnippet: insertSnippet,
          sortText: completion.property,
          replacementSpan,
          kindModifiers: manifestKindModifiers(completion.manifestInfo),
        });
      }
      break;
    }
    case AttributeCompletionKind.DomEvent: {
      entries.push({
        kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
        name: `(${completion.eventName})`,
        insertText: buildSnippet(insertSnippet, `(${completion.eventName})`),
        isSnippet: insertSnippet,
        sortText: completion.eventName,
        replacementSpan,
        kindModifiers: manifestKindModifiers(completion.manifestInfo),
      });
      break;
    }
  }
}

function getDirectiveSymbol(
  directive: PotentialDirective,
  checker: ts.TypeChecker,
  ls?: ts.LanguageService,
): ts.Symbol | null {
  if (!ls) return null;
  const classDecl = getClassDeclarationFromSymbolReference(ls, directive.ref);
  if (!classDecl || !classDecl.name) return null;
  return checker.getSymbolAtLocation(classDecl.name) ?? null;
}

export function getAttributeCompletionSymbol(
  attrKind: AttributeCompletionKind,
  directive: PotentialDirective | null,
  classPropertyName: string | null,
  checker: ts.TypeChecker,
  ls?: ts.LanguageService,
): ts.Symbol | null {
  switch (attrKind) {
    case AttributeCompletionKind.DomAttribute:
    case AttributeCompletionKind.DomEvent:
    case AttributeCompletionKind.DomProperty:
      return null;
    case AttributeCompletionKind.DirectiveAttribute:
    case AttributeCompletionKind.StructuralDirectiveAttribute:
      return directive ? getDirectiveSymbol(directive, checker, ls) : null;
    case AttributeCompletionKind.DirectiveInput:
    case AttributeCompletionKind.DirectiveOutput:
      if (directive === null || classPropertyName === null) {
        return null;
      }

      const dirSymbol = getDirectiveSymbol(directive, checker, ls);
      if (!dirSymbol) return null;
      return checker.getDeclaredTypeOfSymbol(dirSymbol).getProperty(classPropertyName) ?? null;
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
      (prev, curr) => (prev === null || curr.length < prev.length ? curr : prev),
      null as string | null,
    );
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

export function buildAnimationCompletionEntries(
  animations: string[],
  replacementSpan: ts.TextSpan,
  kind: DisplayInfoKind,
): ts.CompletionEntry[] {
  return animations.map((animation) => {
    return {
      kind: unsafeCastDisplayInfoKindToScriptElementKind(kind),
      name: animation,
      sortText: animation,
      replacementSpan,
    };
  });
}
