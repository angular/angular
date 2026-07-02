/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {
  FlowArrayMutation,
  FlowAssignment,
  FlowCall,
  FlowCondition,
  FlowFlags,
  FlowLabel,
  FlowNode,
  FlowReduceLabel,
  FlowSwitchClause,
} from './flow_node_internals';

/**
 * Traverses the graph of the TypeScript flow nodes, exploring all possible branches
 * and keeps track of interesting nodes that may contribute to "narrowing".
 *
 * This allows us to figure out which nodes may be narrowed or not, and need
 * temporary variables in the migration to allowing narrowing to continue working.
 *
 * Some resources on flow nodes by TypeScript:
 * https://effectivetypescript.com/2024/03/24/flownodes/.
 */
export function traverseFlowForInterestingNodes(flow: FlowNode): ts.Node[] | null {
  let flowDepth = 0;
  let interestingNodes: ts.Node[] = [];

  const queue = new Set<FlowNode>([flow]);

  // Queue is evolved during iteration, and new items will be added
  // to the end of the iteration. Effectively implementing a queue
  // with deduping out of the box.
  for (const flow of queue) {
    if (++flowDepth === 2000) {
      // We have made 2000 recursive invocations. To avoid overflowing the call stack we report an
      // error and disable further control flow analysis in the containing function or module body.
      return interestingNodes;
    }

    const flags = flow.flags;
    if (flags & FlowFlags.Assignment) {
      const assignment = flow as FlowAssignment;
      queue.add(assignment.antecedent);

      if (ts.isVariableDeclaration(assignment.node)) {
        interestingNodes.push(assignment.node.name);
      } else if (ts.isBindingElement(assignment.node)) {
        interestingNodes.push(assignment.node.name);
      } else {
        interestingNodes.push(assignment.node);
      }
    } else if (flags & FlowFlags.Call) {
      queue.add((flow as FlowCall).antecedent);
      // Arguments can be narrowed using `FlowCall`s.
      // See: node_modules/typescript/stable/src/compiler/checker.ts;l=28786-28810
      interestingNodes.push(...(flow as FlowCall).node.arguments);
    } else if (flags & FlowFlags.Condition) {
      queue.add((flow as FlowCondition).antecedent);
      interestingNodes.push((flow as FlowCondition).node);
    } else if (flags & FlowFlags.SwitchClause) {
      queue.add((flow as FlowSwitchClause).antecedent);
      // The switch expression can be narrowed, so it's an interesting node.
      interestingNodes.push((flow as FlowSwitchClause).node.switchStatement.expression);
    } else if (flags & FlowFlags.Label) {
      // simple label, a single ancestor.
      if ((flow as FlowLabel).antecedent?.length === 1) {
        queue.add((flow as FlowLabel).antecedent![0]);
        continue;
      }

      if (flags & FlowFlags.BranchLabel) {
        // Normal branches. e.g. switch.
        for (const f of (flow as FlowLabel).antecedent ?? []) {
          queue.add(f);
        }
      } else {
        // Branch for loops.
        // The first antecedent always points to the flow node before the loop
        // was entered. All other narrowing expressions, if present, are direct
        // antecedents of the starting flow node, so we only need to look at the first.
        // See: node_modules/typescript/stable/src/compiler/checker.ts;l=28108-28109
        queue.add((flow as FlowLabel).antecedent![0]);
      }
    } else if (flags & FlowFlags.ArrayMutation) {
      queue.add((flow as FlowArrayMutation).antecedent);
      // Array mutations are never interesting for inputs, as we cannot migrate
      // assignments to inputs.
    } else if (flags & FlowFlags.ReduceLabel) {
      // reduce label is a try/catch re-routing.
      // visit all possible branches.
      // TODO: explore this more.

      // See: node_modules/typescript/stable/src/compiler/binder.ts;l=1636-1649.
      queue.add((flow as FlowReduceLabel).antecedent);
      for (const f of (flow as FlowReduceLabel).node.antecedents) {
        queue.add(f);
      }
    } else if (flags & FlowFlags.Start) {
      // Note: TS itself only ever continues with parent control flows, if the pre-determined `flowContainer`
      // of the referenced is different. E.g. narrowing might decide to choose a higher flow container if we
      // reference a constant. In which case, TS allows escaping the flow container for narrowing. See:
      // http://google3/third_party/javascript/node_modules/typescript/stable/src/compiler/checker.ts;l=29399-29414;rcl=623599846.
      // and TypeScript's `narrowedConstInMethod` baseline test.
      // --> We don't need this as an input cannot be a constant!
      return interestingNodes;
    } else {
      break;
    }
  }

  return null;
}

/** Gets the flow node for the given node. */
export function getFlowNode(node: ts.FlowContainer & {flowNode?: FlowNode}): FlowNode | null {
  return node.flowNode ?? null;
}
