/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ModelContextTool, ModelContext} from '@angular/core/third_party/webmcp-types';

/**
 * A `WebMCP.ModelContext` mock with partially implemented API.
 */
export class ModelContextMock implements Pick<
  ModelContext,
  'registerTool' | 'getTools' | 'executeTool'
> {
  private readonly tools = new Map<
    string,
    Omit<ModelContextTool, 'execute'> & {
      execute: (inputObject: never, options: any) => unknown;
    }
  >();

  async registerTool<
    const TInputSchema extends object = object,
    const TOutputSchema extends object = object,
  >(
    tool: WebMCP.ModelContextToolFromSchema<TInputSchema, TOutputSchema>,
    options?: WebMCP.ModelContextRegisterToolOptions,
  ): Promise<void> {
    if (this.tools.has(tool.name)) {
      throw new DOMException(
        `A tool named ${tool.name} is already registered`,
        'InvalidStateError',
      );
    }
    this.tools.set(tool.name, tool);
    options?.signal?.addEventListener('abort', () => this.tools.delete(tool.name));
  }

  async getTools(): ReturnType<ModelContext['getTools']> {
    return Array.from(this.tools.values()).map(
      ({name, title = '', description, inputSchema, annotations}) => ({
        name,
        title,
        description,
        inputSchema,
        annotations,
        origin: location.origin,
        window,
      }),
    );
  }

  async executeTool(tool: {name: string}, input: Record<string, unknown> = {}): Promise<string> {
    const registeredTool = this.tools.get(tool.name)!;
    const output = await registeredTool.execute(input as never, {
      signal: new AbortController().signal,
    });

    return JSON.stringify(output);
  }
}

/**
 * Installs a WebMCP mock on the document (document.modelContext).
 *
 * @returns The mock instance.
 */
export function installWebMcpMock(): ModelContextMock {
  const mock = new ModelContextMock();
  Object.defineProperty(document, 'modelContext', {value: mock, configurable: true});

  return mock;
}

/**
 * Uninstalls the current WebMCP mock from the document.
 */
export function uninstallWebMcpMock() {
  const doc = document as {modelContext?: unknown};

  if (doc.modelContext instanceof ModelContextMock) {
    delete doc.modelContext;
  }
}
