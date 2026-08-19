/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '../di';
import {
  getComponent,
  getDirectiveMetadata,
  getDirectives,
  getHostElement,
} from '../render3/util/discovery_utils';
import {isSignal} from '../render3/reactivity/api';
import {declareExperimentalWebMcpTool} from './declare_tool';

/**
 * Options for configuring the WebMCP component inspector tools.
 *
 * @experimental
 */
export interface WebMcpComponentInspectorOptions {
  /**
   * Maximum depth of the component tree to traverse when building the response
   * for `angular.get_component_tree`. Defaults to `5`.
   *
   * Increasing this value can produce very large responses which may exceed
   * the context window of the connected agent.
   */
  maxDepth?: number;
}

/** Serializable representation of a single rendered Angular component node. */
interface ComponentNode {
  /** The class name of the component (e.g. `"ProductCardComponent"`). */
  componentName: string;
  /** The CSS selector that matches this component's host element (e.g. `"app-product-card"`). */
  selector: string;
  /**
   * Public `@Input` property names for this component, as declared in the component class.
   * Values are omitted intentionally — the agent should call `angular.get_component_state`
   * for specific values of a component of interest.
   */
  inputs: string[];
  /** Public `@Output` event names for this component. */
  outputs: string[];
  /** Immediate child components rendered inside this component's view. */
  children: ComponentNode[];
}

/** Serializable representation of the state of a specific Angular component. */
interface ComponentState {
  /** The class name of the component. */
  componentName: string;
  /** Current values of all public `@Input` properties that hold a serializable value. */
  inputValues: Record<string, unknown>;
  /** Names of the registered `@Output` event emitters. */
  outputs: string[];
}

/**
 * Recursively builds a `ComponentNode` tree by walking child elements.
 *
 * The traversal intentionally stays within the rendered DOM — it never reads
 * Angular's internal route config or any framework data not visible to the user.
 */
function buildComponentNode(
  element: Element,
  depth: number,
  maxDepth: number,
): ComponentNode | null {
  if (depth > maxDepth) return null;

  const instance = getComponent<Record<string, unknown>>(element);
  if (!instance) return null;

  const metadata = getDirectiveMetadata(instance);
  const inputs: string[] = metadata ? Object.keys(metadata.inputs) : [];
  const outputs: string[] = metadata ? Object.keys(metadata.outputs) : [];

  const children: ComponentNode[] = [];
  const childElements = Array.from(element.querySelectorAll('*'));
  for (const child of childElements) {
    // Only recurse into direct-child component host elements (skip deep descendants
    // that are already children of an intermediate component).
    const childInstance = getComponent(child);
    if (childInstance && childInstance !== instance) {
      const childNode = buildComponentNode(child as Element, depth + 1, maxDepth);
      if (childNode) {
        children.push(childNode);
      }
    }
  }

  // De-duplicate children: a single component may appear via multiple `querySelectorAll` hits.
  const seen = new Set<string>();
  const uniqueChildren = children.filter((c) => {
    if (seen.has(c.componentName + c.selector)) return false;
    seen.add(c.componentName + c.selector);
    return true;
  });

  return {
    componentName: instance.constructor.name ?? 'UnknownComponent',
    selector: element.tagName.toLowerCase(),
    inputs,
    outputs,
    children: uniqueChildren,
  };
}

/**
 * Reads serializable input values from a component instance.
 *
 * Only primitive values (`string`, `number`, `boolean`, `null`) and plain objects
 * are included. Non-serializable values (functions, class instances, Promises, …)
 * are replaced with `"<non-serializable>"` to keep the response safe and compact.
 */
function serializeValue(value: unknown, depth = 0): unknown {
  if (depth > 3) return '<truncated>';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) {
    const sliced = value.slice(0, 10).map((item) => serializeValue(item, depth + 1));
    if (value.length > 10) sliced.push(`<truncated: ${value.length - 10} more items>`);
    return sliced;
  }
  if (typeof value === 'object') {
    try {
      // Reject class instances (anything other than plain objects).
      if (value.constructor !== Object) return '<non-serializable>';
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        result[k] = serializeValue(v, depth + 1);
      }
      return result;
    } catch {
      return '<non-serializable>';
    }
  }
  return '<non-serializable>';
}

/**
 * Provides two experimental WebMCP tools that expose Angular's rendered component
 * tree to browser-side AI agents.
 *
 * ### `angular.get_component_tree`
 * Returns the tree of Angular components currently rendered on the page, starting
 * from the document body or a narrower CSS selector. Each node includes the
 * component's class name, host element selector, and the names of its `@Input`
 * and `@Output` properties.
 *
 * ### `angular.get_component_state`
 * Returns the current serialized `@Input` values and output names for a specific
 * Angular component identified by a CSS selector.
 *
 * ### Why this is unique compared to generic browser APIs
 * No standard browser API (e.g. `querySelectorAll`, Navigation API) can identify
 * Angular component boundaries, class names, or input/output contracts. This
 * information is intrinsic to the Angular framework and is otherwise only
 * accessible to the Angular DevTools browser extension.
 *
 * ### Security
 * The tools are registered only when this provider is explicitly included in
 * `bootstrapApplication`. They are never activated by default. Non-serializable
 * values (functions, class instances) are omitted from responses.
 *
 * @param options Configuration options for the inspector tools.
 * @returns An {@link EnvironmentProviders} that can be used in `bootstrapApplication`.
 * @experimental
 *
 * @usageNotes
 *
 * ### Example
 *
 * ```typescript
 * // main.ts
 * import {bootstrapApplication} from '@angular/platform-browser';
 * import {withExperimentalWebMcpComponentInspector} from '@angular/core';
 * import {AppComponent} from './app.component';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     withExperimentalWebMcpComponentInspector(),
 *   ],
 * });
 * ```
 *
 * When a browser agent connects, it can immediately call:
 *
 * ```
 * angular.get_component_tree({ rootSelector: "app-root" })
 * ```
 *
 * And receive:
 * ```json
 * {
 *   "componentName": "AppComponent",
 *   "selector": "app-root",
 *   "inputs": [],
 *   "outputs": [],
 *   "children": [
 *     {
 *       "componentName": "ProductCardComponent",
 *       "selector": "app-product-card",
 *       "inputs": ["product", "isLoading"],
 *       "outputs": ["addToCart"],
 *       "children": []
 *     }
 *   ]
 * }
 * ```
 *
 * The agent then queries the specific component's state:
 *
 * ```
 * angular.get_component_state({ selector: "app-product-card" })
 * ```
 *
 * And receives:
 * ```json
 * {
 *   "componentName": "ProductCardComponent",
 *   "inputValues": { "product": { "id": 42, "name": "Keyboard" }, "isLoading": false },
 *   "outputs": ["addToCart"]
 * }
 * ```
 */
export function withExperimentalWebMcpComponentInspector(
  options: WebMcpComponentInspectorOptions = {},
): EnvironmentProviders {
  const maxDepth = options.maxDepth ?? 5;

  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      // Register the `angular.get_component_tree` tool.
      declareExperimentalWebMcpTool({
        name: 'angular.get_component_tree',
        description:
          'Returns the tree of Angular components currently rendered on the page. ' +
          'Each node includes the component class name, its host element CSS selector, ' +
          'and the names of its @Input and @Output properties. ' +
          'Use this tool first to understand the structure of the page before ' +
          'calling angular.get_component_state for specific values.',
        inputSchema: {
          type: 'object',
          properties: {
            rootSelector: {
              type: 'string',
              description:
                'Optional CSS selector to use as the root of the tree walk. ' +
                'Defaults to `body`. Narrow this to reduce response size ' +
                'when only a sub-tree is relevant.',
            },
          },
          additionalProperties: false,
        },
        execute: async ({rootSelector}: {rootSelector?: string}) => {
          let root: Element | null = null;
          try {
            root = rootSelector ? document.querySelector(rootSelector) : document.body;
          } catch {
            return {
              content: [
                {type: 'text', text: `Error: Invalid CSS selector provided "${rootSelector}".`},
              ],
            };
          }

          if (!root) {
            return {
              content: [{type: 'text', text: `No element found for selector "${rootSelector}".`}],
            };
          }

          // Walk all descendant elements and find Angular component roots.
          const topLevelComponents: ComponentNode[] = [];
          const allElements = Array.from(root.querySelectorAll('*'));

          for (const el of allElements) {
            const instance = getComponent(el);
            if (!instance) continue;

            // Only include top-level components within the root (not children of
            // already-found components — they will appear as `children` in the tree).
            const owningEl = getHostElement(instance);
            const isDirectChildOfRoot =
              owningEl.parentElement === root ||
              !allElements.some((ancestor) => {
                if (ancestor === el) return false;
                const ancestorInstance = getComponent(ancestor);
                return ancestorInstance && ancestor.contains(el) && ancestor !== el;
              });

            if (isDirectChildOfRoot) {
              const node = buildComponentNode(el, 0, maxDepth);
              if (node) topLevelComponents.push(node);
            }
          }

          // Also check if the root element itself is a component.
          if (root !== document.body) {
            const rootInstance = getComponent(root as Element);
            if (rootInstance) {
              const rootNode = buildComponentNode(root as Element, 0, maxDepth);
              if (rootNode)
                return {content: [{type: 'text', text: JSON.stringify(rootNode, null, 2)}]};
            }
          }

          return {
            content: [{type: 'text', text: JSON.stringify(topLevelComponents, null, 2)}],
          };
        },
      });

      // Register the `angular.get_component_state` tool.
      declareExperimentalWebMcpTool({
        name: 'angular.get_component_state',
        description:
          'Returns the current @Input values and @Output names for a specific Angular ' +
          'component identified by a CSS selector. ' +
          'Call angular.get_component_tree first to discover available component selectors.',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector for the component host element (e.g. "app-product-card").',
            },
          },
          required: ['selector'],
          additionalProperties: false,
        },
        execute: async ({selector}: {selector: string}) => {
          let element: Element | null = null;
          try {
            element = document.querySelector(selector);
          } catch {
            return {
              content: [
                {type: 'text', text: `Error: Invalid CSS selector provided "${selector}".`},
              ],
            };
          }
          if (!element) {
            return {
              content: [{type: 'text', text: `No element found for selector "${selector}".`}],
            };
          }

          const instance = getComponent<Record<string, unknown>>(element);
          if (!instance) {
            return {
              content: [
                {
                  type: 'text',
                  text: `The element "${selector}" exists but is not an Angular component host.`,
                },
              ],
            };
          }

          const metadata = getDirectiveMetadata(instance);
          const inputNames = metadata ? Object.keys(metadata.inputs) : [];
          const outputs = metadata ? Object.keys(metadata.outputs) : [];

          const inputValues: Record<string, unknown> = {};
          for (const inputName of inputNames) {
            try {
              let val = instance[inputName];
              if (isSignal(val)) {
                val = val();
              }
              inputValues[inputName] = serializeValue(val);
            } catch {
              inputValues[inputName] = '<evaluation-error>';
            }
          }

          // Also surface any directives on the same host element.
          const directives = getDirectives(element);
          const directiveNames = directives
            .map((d) => d.constructor?.name)
            .filter((name): name is string => !!name && name !== instance.constructor.name);

          const state: ComponentState & {directives?: string[]} = {
            componentName: instance.constructor.name ?? 'UnknownComponent',
            inputValues,
            outputs,
          };

          if (directiveNames.length > 0) {
            state['directives'] = directiveNames;
          }

          return {content: [{type: 'text', text: JSON.stringify(state, null, 2)}]};
        },
      });
    }),
  ]);
}
