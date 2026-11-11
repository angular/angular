/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ModelContextTool, ModelContext} from '../../third_party/webmcp-types';

export class ModelContextMock implements Pick<
  ModelContext,
  'registerTool' | 'getTools' | 'executeTool'
> {
  private readonly tools = new Map<string, ModelContextTool>();

  async registerTool(tool: ModelContextTool, {signal}: {signal?: AbortSignal} = {}) {
    if (this.tools.has(tool.name)) {
      throw new DOMException(
        `A tool named ${tool.name} is already registered`,
        'InvalidStateError',
      );
    }
    this.tools.set(tool.name, tool);
    signal?.addEventListener('abort', () => this.tools.delete(tool.name));
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

  async executeTool({name}: {name: string}, input: Record<string, unknown> = {}): Promise<string> {
    const tool = this.tools.get(name)!;
    const output = await tool.execute(input, {signal: new AbortController().signal});

    return JSON.stringify(output);
  }
}

export function installWebMcpMock(): ModelContextMock {
  const mock = new ModelContextMock();
  Object.defineProperty(document, 'modelContext', {value: mock, configurable: true});

  return mock;
}

export function uninstallWebMcpMock() {
  delete (document as {modelContext?: unknown}).modelContext;
}
