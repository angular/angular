/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NullInjector} from '../../di/null_injector';
import {getInjector} from '../../render3/util/discovery_utils';
import {DebugSignalGraph, getSignalGraph} from '../../render3/util/signal_debug';
import {ToolDefinition} from './tool_definitions';

// Omit `debuggableFn` and `id` from returned signal graph to AI agent.
type AiSignalGraph = Omit<DebugSignalGraph, 'nodes'> & {
  nodes: Array<Omit<DebugSignalGraph['nodes'][number], 'debuggableFn' | 'id'>>;
};

/**
 * Tool that exposes Angular's signal dependency graph to AI agents.
 */
export const signalGraphTool: ToolDefinition<{target: HTMLElement}, AiSignalGraph> = {
  name: 'angular:signal_graph',
  // tslint:disable-next-line:no-toplevel-property-access
  description: `
Exposes the Angular signal dependency graph for a given DOM element.

This tool extracts the reactive dependency graph (signals, computeds, and effects) that
are transitive dependencies of the effects of that element. It will include signals
authored in other components/services and depended upon by the target component, but
will *not* include signals only used in descendant components effects.

Params:
- \`target\`: The element to get the signal graph for. Must be the host element of an
  Angular component.

Returns:
- \`nodes\`: An array of reactive nodes discovered in the context. Each node contains:
  - \`kind\`: The type of reactive node ('signal', 'computed', 'effect', or 'template'
    for component template effects).
  - \`value\`: The current evaluated value of the node (if applicable).
  - \`label\`: The symbol name of the associated signal if available (ex.
    \`const foo = signal(0);\` has \`label: 'foo'\`).
  - \`epoch\`: The internal version number of the node's value.
- \`edges\`: An array of dependency links representing which nodes read from which other
  nodes.
  - \`consumer\`: The index in the \`nodes\` array of the node that depends on the value.
  - \`producer\`: The index in the \`nodes\` array of the node that provides the value.

Example: An edge with \`{consumer: 2, producer: 0}\` means that \`nodes[2]\` (e.g. an
\`effect\`) reads the value of \`nodes[0]\` (e.g. a \`signal\`).
  `.trim(),
  inputSchema: {
    type: 'object',
    properties: {
      target: {
        type: 'object',
        description: 'The element to get the signal graph for.',
        'x-mcp-type': 'HTMLElement',
      },
    },
    required: ['target'],
  },
  execute: async ({target}: {target: HTMLElement}) => {
    if (!(target instanceof HTMLElement)) {
      throw new Error('Invalid input: "target" must be an HTMLElement.');
    }

    const injector = getInjector(target);
    if (injector instanceof NullInjector) {
      throw new Error('Invalid input: "target" is not the host element of an Angular component.');
    }

    const graph = getSignalGraph(injector);
    return {
      // Filter out unneeded data.
      nodes: graph.nodes.map(({id, debuggableFn, ...node}) => node),
      edges: graph.edges,
    };
  },
};
