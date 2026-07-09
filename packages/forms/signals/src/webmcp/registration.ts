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
  options: {name: string; description: string},
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
      execute: async (args: Record<string, unknown>) => {
        // Populate the form with changes from the agent.
        node.value.set(args);

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
