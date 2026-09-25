/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  declareExperimentalWebMcpTool,
  effect,
  EnvironmentProviders,
  inject,
  Injector,
  makeEnvironmentProviders,
  untracked,
} from '@angular/core';
import type {JsonSchemaForInference} from '@mcp-b/webmcp-types';
import {submit} from '../api/structure';
import {FieldTree} from '../api/types';
import {FieldNode} from '../field/node';
import {REGISTER_WEBMCP_FORM, RegisterWebMcpForm} from './tokens';

const registerWebMcpForm: RegisterWebMcpForm = (formTree, options) => {
  const injector = inject(Injector);

  // we want to defer the registration until the context is fully initialized,
  // This is especially useful if the form model is a derivation of a required input
  return new Promise<void>((resolve, reject) => {
    effect(() => {
      untracked(() => {
        initWebMcpForm(formTree, options, injector).then(resolve, reject);
      });
    });
  });
};

async function initWebMcpForm(
  formTree: FieldTree<unknown>,
  options: {name: string; description: string; annotations?: {consequentialHint?: boolean}},
  injector: Injector,
) {
  const node = formTree() as FieldNode;
  const inputSchema = inferSchemaFromFieldNode(node);

  if (!inputSchema) {
    throw new Error(
      `Could not accurately infer WebMCP schema for form "${options.name}". ` +
        `Ensure that the form model does not contain null, undefined, empty arrays, or unsupported types.`,
    );
  }

  await declareExperimentalWebMcpTool(
    {
      name: options.name,
      description: options.description,
      inputSchema,
      annotations: {
        ...options.annotations,

        // Forms are assumed to implicitly mutate the DOM (otherwise how would a user interact with them?)
        // and therefore are _never_ read-only.
        readOnlyHint: false,

        // Response text is currently hard-coded by the framework and trusted or derived from application
        // errors which are considered trusted.
        untrustedContentHint: false,
      },
      execute: async (args: Record<string, unknown> | unknown[]) => {
        // Populate the form with changes from the agent, discarding writes to any field the
        // user could not have edited themselves.
        node.value.set(applyAgentValue(node, args));

        // Trigger form submission.
        const success = await submit(formTree);

        // Report the result to the agent.
        if (success) {
          return {content: [{type: 'text', text: 'Form submitted successfully.'}]};
        } else {
          const errorMessages = node
            .errorSummary()
            .map((err) => {
              const fieldName = (err.fieldTree() as FieldNode).structure.pathKeys().join('.');
              return `${fieldName ? `${fieldName}: ` : ''}${err.message || err.kind}`;
            })
            .join('\n');
          return {content: [{type: 'text', text: `Form submission failed:\n${errorMessages}`}]};
        }
      },
    },
    injector,
  );
}

/**
 * Whether an agent is allowed to write to a given field.
 *
 * Hidden, disabled, and readonly fields cannot be edited through the UI, so an agent must not
 * be able to edit them either. Validation is also skipped for such fields, meaning any value
 * an agent wrote to one would reach submission without ever being validated.
 */
function isAgentWritable(node: FieldNode): boolean {
  return !node.hidden() && !node.disabled() && !node.readonly();
}

/**
 * Merges the values provided by an agent into the form's current value, preserving the current
 * value of every field the agent is not allowed to write.
 */
function applyAgentValue(node: FieldNode, incoming: unknown): unknown {
  const current = node.value();

  if (!isAgentWritable(node)) return current;

  // The agent left this field out, so keep whatever the application already had.
  if (incoming === undefined) return current;

  // Objects are merged key by key so that non-writable children retain their current value.
  if (isPlainObject(current) && isPlainObject(incoming)) {
    const merged: Record<string, unknown> = {...current};
    for (const child of node.structure.children()) {
      const key = child.keyInParent();
      merged[key] = applyAgentValue(child, incoming[key]);
    }
    return merged;
  }

  // Array elements are matched up by index, which is how the field tree itself tracks them.
  // Elements the agent appends have no existing field whose state needs preserving.
  if (Array.isArray(current) && Array.isArray(incoming)) {
    return incoming.map((item, index) => {
      const child = node.structure.getChild(String(index));
      return child ? applyAgentValue(child, item) : item;
    });
  }

  // The agent sent a value whose shape doesn't match the field. Reject it rather than let it
  // replace a subtree which may contain fields the agent is not allowed to write.
  if (isPlainObject(current) || Array.isArray(current)) return current;

  return incoming;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Infers the JSON schema from a specific form field. */
function inferSchemaFromFieldNode(node: FieldNode): JsonSchemaForInference | undefined {
  const value = node.value();

  // Primitive types.
  if (typeof value === 'string') return {type: 'string'};
  if (typeof value === 'number') return {type: 'number'};
  if (typeof value === 'boolean') return {type: 'boolean'};

  // `null` or `undefined` does not hint at the underlying type.
  if (value === null || value === undefined) return undefined;

  // Use the type of the first value of an array.
  if (Array.isArray(value)) {
    if (value.length === 0) return undefined;

    const firstChild = node.structure.getChild('0');
    if (!firstChild) return undefined;

    const itemSchema = inferSchemaFromFieldNode(firstChild);
    if (!itemSchema) return undefined;

    return {
      type: 'array',
      items: itemSchema,
    };
  }

  // Recursively infer the types of all object properties.
  if (typeof value === 'object') {
    const properties: Record<string, JsonSchemaForInference> = {};
    const required: string[] = [];
    const children = node.structure.children();
    for (const child of children) {
      const key = child.keyInParent();
      const childSchema = inferSchemaFromFieldNode(child);
      if (!childSchema) return undefined;

      properties[key] = childSchema;

      if (child.required()) required.push(key.toString());
    }

    return {
      type: 'object',
      properties,
      required,
      additionalProperties: false,
    };
  }

  return undefined; // Unknown type.
}

/**
 * Creates a provider that configures all signal forms with `experimentalWebMcpTool`
 * to be registered as WebMCP tools.
 *
 * @see [Implicit tools in Signal Forms](ai/webmcp#implicit-tools-in-signal-forms)
 *
 * @experimental
 */
export function provideExperimentalWebMcpForms(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: REGISTER_WEBMCP_FORM,
      useValue: registerWebMcpForm,
    },
  ]);
}
