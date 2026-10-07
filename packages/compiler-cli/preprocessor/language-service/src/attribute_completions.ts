/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  CssSelector,
  DomElementSchemaRegistry,
  MatchSource,
  SelectorMatcher,
  TmplAstElement,
  TmplAstTemplate,
  BoundTarget,
  TcbDirectiveMetadata,
  TcbInputMapping,
  ClassPropertyMapping,
} from '@angular/compiler';
import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  Range,
  TextEdit,
} from 'vscode-languageserver';

import {makeElementSelector} from './utils.js';
import {createInputPropertyMapping, createOutputPropertyMapping} from '../../src/tcb_adapter.js';

const REGISTRY = new DomElementSchemaRegistry();

/**
 * Differentiates different kinds of `AttributeCompletion`s.
 */
export enum AttributeCompletionKind {
  DomAttribute,
  DomProperty,
  DomEvent,
  DirectiveAttribute,
  StructuralDirectiveAttribute,
  DirectiveInput,
  DirectiveOutput,
}

export interface DomAttributeCompletion {
  kind: AttributeCompletionKind.DomAttribute;
  attribute: string;
  isAlsoProperty: true;
}

export interface DomPropertyCompletion {
  kind: AttributeCompletionKind.DomProperty;
  property: string;
}

export interface DomEventCompletion {
  kind: AttributeCompletionKind.DomEvent;
  eventName: string;
}

export interface DirectiveAttributeCompletion {
  kind:
    | AttributeCompletionKind.DirectiveAttribute
    | AttributeCompletionKind.StructuralDirectiveAttribute;
  attribute: string;
  directive: any;
}

export interface DirectiveInputCompletion {
  kind: AttributeCompletionKind.DirectiveInput;
  propertyName: string;
  directive: any;
  classPropertyName: string;
  twoWayBindingSupported: boolean;
}

export interface DirectiveOutputCompletion {
  kind: AttributeCompletionKind.DirectiveOutput;
  eventName: string;
  directive: any;
  classPropertyName: string;
}

export type AttributeCompletion =
  | DomAttributeCompletion
  | DomPropertyCompletion
  | DirectiveAttributeCompletion
  | DirectiveInputCompletion
  | DirectiveOutputCompletion
  | DomEventCompletion;

export enum AsciiSortPriority {
  First = '!',
  Second = '"',
}

function* selectorAttributes(selector: CssSelector): Iterable<[string, string]> {
  for (let i = 0; i < selector.attrs.length; i += 2) {
    yield [selector.attrs[i], selector.attrs[i + 1]];
  }
}

export function getStructuralAttributes(meta: {
  selector?: string | null;
  inputs?: ClassPropertyMapping;
}): string[] {
  if (!meta.selector) {
    return [];
  }

  const structuralAttributes: string[] = [];
  const selectors = CssSelector.parse(meta.selector);
  for (const selector of selectors) {
    if (selector.element !== null && selector.element !== 'ng-template') {
      continue;
    }

    const attributeSelectors = Array.from(selectorAttributes(selector));
    if (!attributeSelectors.every(([_, attrValue]) => attrValue === '')) {
      continue;
    }

    const attributes = attributeSelectors.map(([attrName, _]) => attrName);
    const baseAttr = attributes.reduce(
      (prev, curr) => (prev === null || curr.length < prev.length ? curr : prev),
      null as string | null,
    );
    if (baseAttr === null) {
      continue;
    }

    const isValid = (attr: string): boolean => {
      if (attr === baseAttr) {
        return true;
      }
      if (!attr.startsWith(baseAttr)) {
        return false;
      }
      if (meta.inputs && !meta.inputs.hasBindingPropertyName(attr)) {
        return false;
      }
      return true;
    };

    if (!attributes.every(isValid)) {
      continue;
    }

    structuralAttributes.push(baseAttr);
  }

  return structuralAttributes;
}

function extractInputsAndOutputs(decl: any): {
  inputs: ClassPropertyMapping<TcbInputMapping>;
  outputs: ClassPropertyMapping<any>;
} {
  if (!decl) {
    return {
      inputs: createInputPropertyMapping([]),
      outputs: createOutputPropertyMapping([]),
    };
  }
  if (decl.inputs instanceof ClassPropertyMapping && decl.outputs instanceof ClassPropertyMapping) {
    return {
      inputs: decl.inputs,
      outputs: decl.outputs,
    };
  }
  const inputsList: any[] = [];
  const outputsList: any[] = [];

  const dInputs = decl.inputs ?? decl.directive?.inputs ?? decl.component?.inputs;
  if (Array.isArray(dInputs)) {
    inputsList.push(...dInputs);
  }
  const dOutputs = decl.outputs ?? decl.directive?.outputs ?? decl.component?.outputs;
  if (Array.isArray(dOutputs)) {
    outputsList.push(...dOutputs);
  }
  const fields =
    decl.flattenedFields ?? decl.fields ?? decl.directive?.fields ?? decl.component?.fields ?? [];
  for (const f of fields) {
    if (f.kind === 'input' && f.input) {
      inputsList.push(f.input);
    } else if (f.kind === 'output' && f.output) {
      outputsList.push(f.output);
    }
  }

  return {
    inputs: createInputPropertyMapping(inputsList),
    outputs: createOutputPropertyMapping(outputsList),
  };
}

export function buildAttributeCompletionTable(
  element: TmplAstElement | TmplAstTemplate,
  meta: any,
  target: BoundTarget<any> | null,
): Map<string, AttributeCompletion> {
  const table = new Map<string, AttributeCompletion>();

  let matcher = new SelectorMatcher<TcbDirectiveMetadata[]>();
  const rawDirectives: any[] = [
    ...(meta?.resolvedDeclarations || []),
    ...(meta?.allDeclarations?.filter((d: any) => d.className !== meta.className) || []),
  ];
  const seenClasses = new Set<string>();
  const directives: any[] = [];
  for (const d of rawDirectives) {
    const key = d.className || d.name;
    if (key && seenClasses.has(key)) continue;
    if (key) seenClasses.add(key);
    const selector = d.selector ?? d.directive?.selector ?? d.component?.selector;
    if (selector || d.isComponent) {
      directives.push({
        ...d,
        selector: selector || d.selector,
      });
    }
  }

  for (const dir of directives) {
    if (!dir.selector) continue;
    const selectors = CssSelector.parse(dir.selector);
    matcher.addSelectables(selectors, [dir]);
  }

  const elementSelector = makeElementSelector(element);
  const matchedDirectives: any[] = [];
  const parsedElementSelector = CssSelector.parse(elementSelector)[0];
  if (parsedElementSelector) {
    matcher.match(parsedElementSelector, (_selector, results) => {
      matchedDirectives.push(...results);
    });
  }

  const activeDirectives: any[] = target?.getDirectivesOfNode(element) || matchedDirectives;
  const presentDirectives = new Set<string>();

  for (const presentDir of activeDirectives) {
    const key = presentDir.name || presentDir.className;
    if (key) presentDirectives.add(key);

    const {inputs, outputs} = extractInputsAndOutputs(presentDir);

    for (const {classPropertyName, bindingPropertyName} of inputs) {
      if (table.has(bindingPropertyName)) continue;
      const twoWaySupported =
        outputs.hasBindingPropertyName(bindingPropertyName + 'Change') ||
        outputs.hasBindingPropertyName(bindingPropertyName);
      table.set(bindingPropertyName, {
        kind: AttributeCompletionKind.DirectiveInput,
        propertyName: bindingPropertyName,
        directive: presentDir,
        classPropertyName,
        twoWayBindingSupported: twoWaySupported,
      });
    }

    for (const {classPropertyName, bindingPropertyName} of outputs) {
      if (table.has(bindingPropertyName)) continue;
      table.set(bindingPropertyName, {
        kind: AttributeCompletionKind.DirectiveOutput,
        eventName: bindingPropertyName,
        directive: presentDir,
        classPropertyName,
      });
    }
  }

  for (const currentDir of directives) {
    const dirKey = currentDir.name || currentDir.className;
    if (dirKey && presentDirectives.has(dirKey)) continue;

    const {inputs, outputs} = extractInputsAndOutputs(currentDir);
    const isStructural = Boolean(
      currentDir.isStructural ||
      (currentDir.selector &&
        (currentDir.selector.includes('ngFor') || currentDir.selector.includes('ngIf'))),
    );

    if (!isStructural) {
      if (currentDir.selector) {
        const selectors = CssSelector.parse(currentDir.selector);
        for (const selector of selectors) {
          for (const [attrName, attrValue] of selectorAttributes(selector)) {
            if (attrValue !== '' || attrName === '') continue;
            if (table.has(attrName)) continue;

            const newElementSelector = elementSelector + `[${attrName}]`;
            const parsedNewSelector = CssSelector.parse(newElementSelector)[0];
            if (!parsedNewSelector || !matcher.match(parsedNewSelector, () => {})) {
              continue;
            }

            if (inputs.hasBindingPropertyName(attrName)) {
              const classProp = inputs.getByBindingPropertyName(attrName)![0].classPropertyName;
              table.set(attrName, {
                kind: AttributeCompletionKind.DirectiveInput,
                directive: currentDir,
                propertyName: attrName,
                classPropertyName: classProp,
                twoWayBindingSupported: outputs.hasBindingPropertyName(attrName + 'Change'),
              });
            } else if (outputs.hasBindingPropertyName(attrName)) {
              const classProp = outputs.getByBindingPropertyName(attrName)![0].classPropertyName;
              table.set(attrName, {
                kind: AttributeCompletionKind.DirectiveOutput,
                directive: currentDir,
                eventName: attrName,
                classPropertyName: classProp,
              });
            } else {
              table.set(attrName, {
                kind: AttributeCompletionKind.DirectiveAttribute,
                attribute: attrName,
                directive: currentDir,
              });
            }
          }
        }
      }
    } else {
      const structuralAttributes = getStructuralAttributes({
        selector: currentDir.selector,
        inputs,
      });
      for (const attrName of structuralAttributes) {
        table.set(attrName, {
          kind: AttributeCompletionKind.StructuralDirectiveAttribute,
          attribute: attrName,
          directive: currentDir,
        });
      }
    }
  }

  if (element instanceof TmplAstElement) {
    for (const attribute of REGISTRY.allKnownAttributesOfElement(element.name)) {
      const property = REGISTRY.getMappedPropName(attribute);
      const isAlsoProperty = attribute === property;
      if (!table.has(attribute) && isAlsoProperty) {
        table.set(attribute, {
          kind: AttributeCompletionKind.DomAttribute,
          attribute,
          isAlsoProperty,
        });
      }
    }
    for (const event of REGISTRY.allKnownEventsOfElement(element.name)) {
      if (!table.has(event)) {
        table.set(event, {
          kind: AttributeCompletionKind.DomEvent,
          eventName: event,
        });
      }
    }
  }

  return table;
}

function buildSnippet(insertSnippet: true | undefined, text: string): string | undefined {
  return insertSnippet ? `${text.replace(/\$/gi, '\\$')}="$1"` : undefined;
}

function createItem(
  label: string,
  kind: CompletionItemKind,
  sortText: string,
  insertSnippet: true | undefined,
  snippetText?: string,
  replacementRange?: Range,
): CompletionItem {
  const insertText = insertSnippet && snippetText ? snippetText : undefined;
  return {
    label,
    kind,
    sortText,
    insertText,
    insertTextFormat: insertSnippet ? InsertTextFormat.Snippet : InsertTextFormat.PlainText,
    textEdit: replacementRange
      ? TextEdit.replace(replacementRange, insertText ?? label)
      : undefined,
  };
}

export function addAttributeCompletionEntries(
  entries: CompletionItem[],
  completion: AttributeCompletion,
  isAttributeContext: boolean,
  isElementContext: boolean,
  replacementRange: Range | undefined,
  insertSnippet: true | undefined,
): void {
  switch (completion.kind) {
    case AttributeCompletionKind.DirectiveAttribute: {
      entries.push(
        createItem(
          completion.attribute,
          CompletionItemKind.Class,
          AsciiSortPriority.Second + completion.attribute,
          undefined,
          undefined,
          replacementRange,
        ),
      );
      break;
    }
    case AttributeCompletionKind.StructuralDirectiveAttribute: {
      const prefix = isElementContext ? '*' : '';
      const name = prefix + completion.attribute;
      entries.push(
        createItem(
          name,
          CompletionItemKind.Class,
          AsciiSortPriority.Second + name,
          insertSnippet,
          buildSnippet(insertSnippet, name),
          replacementRange,
        ),
      );
      break;
    }
    case AttributeCompletionKind.DirectiveInput: {
      if (isAttributeContext) {
        entries.push(
          createItem(
            `[${completion.propertyName}]`,
            CompletionItemKind.Property,
            AsciiSortPriority.First + completion.propertyName,
            insertSnippet,
            buildSnippet(insertSnippet, `[${completion.propertyName}]`),
            replacementRange,
          ),
        );
        if (completion.twoWayBindingSupported) {
          entries.push(
            createItem(
              `[(${completion.propertyName})]`,
              CompletionItemKind.Property,
              AsciiSortPriority.First + completion.propertyName + '_1',
              insertSnippet,
              buildSnippet(insertSnippet, `[(${completion.propertyName})]`),
              replacementRange,
            ),
          );
        }
        entries.push(
          createItem(
            completion.propertyName,
            CompletionItemKind.Field,
            AsciiSortPriority.First + completion.propertyName + '_2',
            insertSnippet,
            buildSnippet(insertSnippet, completion.propertyName),
            replacementRange,
          ),
        );
      } else {
        entries.push(
          createItem(
            completion.propertyName,
            CompletionItemKind.Property,
            AsciiSortPriority.First + completion.propertyName,
            insertSnippet,
            buildSnippet(insertSnippet, completion.propertyName),
            replacementRange,
          ),
        );
        if (insertSnippet) {
          entries.push(
            createItem(
              `[${completion.propertyName}]`,
              CompletionItemKind.Property,
              AsciiSortPriority.First + completion.propertyName + '_1',
              insertSnippet,
              buildSnippet(insertSnippet, `[${completion.propertyName}]`),
              replacementRange,
            ),
          );
          if (completion.twoWayBindingSupported) {
            entries.push(
              createItem(
                `[(${completion.propertyName})]`,
                CompletionItemKind.Property,
                AsciiSortPriority.First + completion.propertyName + '_2',
                insertSnippet,
                buildSnippet(insertSnippet, `[(${completion.propertyName})]`),
                replacementRange,
              ),
            );
          }
        }
      }
      break;
    }
    case AttributeCompletionKind.DirectiveOutput: {
      if (isAttributeContext) {
        entries.push(
          createItem(
            `(${completion.eventName})`,
            CompletionItemKind.Event,
            AsciiSortPriority.First + completion.eventName,
            insertSnippet,
            buildSnippet(insertSnippet, `(${completion.eventName})`),
            replacementRange,
          ),
        );
      } else {
        entries.push(
          createItem(
            completion.eventName,
            CompletionItemKind.Event,
            AsciiSortPriority.First + completion.eventName,
            insertSnippet,
            buildSnippet(insertSnippet, completion.eventName),
            replacementRange,
          ),
        );
        if (insertSnippet) {
          entries.push(
            createItem(
              `(${completion.eventName})`,
              CompletionItemKind.Event,
              AsciiSortPriority.First + completion.eventName + '_1',
              insertSnippet,
              buildSnippet(insertSnippet, `(${completion.eventName})`),
              replacementRange,
            ),
          );
        }
      }
      break;
    }
    case AttributeCompletionKind.DomAttribute: {
      if (isAttributeContext && completion.isAlsoProperty) {
        entries.push(
          createItem(
            `[${completion.attribute}]`,
            CompletionItemKind.Property,
            completion.attribute + '_1',
            insertSnippet,
            buildSnippet(insertSnippet, `[${completion.attribute}]`),
            replacementRange,
          ),
        );
      } else if (!isAttributeContext && completion.isAlsoProperty) {
        entries.push(
          createItem(
            completion.attribute,
            CompletionItemKind.Property,
            completion.attribute,
            insertSnippet,
            buildSnippet(insertSnippet, completion.attribute),
            replacementRange,
          ),
        );
        if (insertSnippet) {
          entries.push(
            createItem(
              `[${completion.attribute}]`,
              CompletionItemKind.Property,
              completion.attribute + '_1',
              insertSnippet,
              buildSnippet(insertSnippet, `[${completion.attribute}]`),
              replacementRange,
            ),
          );
        }
      }
      break;
    }
    case AttributeCompletionKind.DomProperty: {
      if (!isAttributeContext) {
        entries.push(
          createItem(
            completion.property,
            CompletionItemKind.Property,
            completion.property,
            insertSnippet,
            buildSnippet(insertSnippet, completion.property),
            replacementRange,
          ),
        );
        if (insertSnippet) {
          entries.push(
            createItem(
              `[${completion.property}]`,
              CompletionItemKind.Property,
              completion.property + '_1',
              insertSnippet,
              buildSnippet(insertSnippet, `[${completion.property}]`),
              replacementRange,
            ),
          );
        }
      }
      break;
    }
    case AttributeCompletionKind.DomEvent: {
      if (isAttributeContext) {
        entries.push(
          createItem(
            `(${completion.eventName})`,
            CompletionItemKind.Event,
            completion.eventName,
            insertSnippet,
            buildSnippet(insertSnippet, `(${completion.eventName})`),
            replacementRange,
          ),
        );
      } else {
        entries.push(
          createItem(
            completion.eventName,
            CompletionItemKind.Event,
            completion.eventName,
            insertSnippet,
            buildSnippet(insertSnippet, completion.eventName),
            replacementRange,
          ),
        );
        if (insertSnippet) {
          entries.push(
            createItem(
              `(${completion.eventName})`,
              CompletionItemKind.Event,
              completion.eventName + '_1',
              insertSnippet,
              buildSnippet(insertSnippet, `(${completion.eventName})`),
              replacementRange,
            ),
          );
        }
      }
      break;
    }
  }
}

export function buildAnimationCompletionEntries(
  animations: string[],
  replacementRange: Range | undefined,
  kind: CompletionItemKind = CompletionItemKind.Value,
): CompletionItem[] {
  return animations.map((animation) => ({
    label: animation,
    kind,
    sortText: animation,
    textEdit: replacementRange ? TextEdit.replace(replacementRange, animation) : undefined,
  }));
}
