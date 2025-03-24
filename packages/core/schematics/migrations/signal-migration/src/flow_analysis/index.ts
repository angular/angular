/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {getControlFlowContainer, isControlFlowBoundary} from './flow_containers';
import {getFlowNode, traverseFlowForInterestingNodes} from './flow_node_traversal';
import {unwrapParent} from '../utils/unwrap_parent';
import assert from 'assert';

/**
 * Type describing an index of a node inside a control flow
 * container.
 */
export type ControlFlowNodeIndex = number;

/**
 * Possible common ancestors for a set of references at
 * which level a temporary variable can be inserted.
 */
export type InsertionCommonAncestor =
  | ts.ArrowFunction
  | ts.Block
  | ts.SourceFile
  | ts.ClassLikeDeclaration;

/**
 * Representation of a reference inside a control flow
 * container.
 *
 * This node structure is used to link multiple nodes together
 * that may be narrowed, as an example.
 */
export interface ControlFlowAnalysisNode {
  /** Unique id of the node inside the container. */
  id: number;
  /** Original TypeScript node of the reference in the container. */
  originalNode: ts.Identifier;
  /**
   * Recommended node for the reference in the container. For example:
   *   - may be "preserve" to indicate it's not narrowed.
   *   - may point to a different flow node. This means they will share for narrowing.
   *   - may point to a block, source file, arrow function or other insertion ancestor types
   *     to indicate at what level this node may be shared. I.e. a location where we generate
   *     the temporary variable for subsequent sharing.
   */
  recommendedNode: ControlFlowNodeIndex | 'preserve' | InsertionCommonAncestor;
  /** Flow container this reference is part of. */
  flowContainer: ts.Node;
}

/** Type describing a map from reference to its flow information. */
type ReferenceMetadata = Map<
  ts.Identifier,
  {
    resultIndex: number;
    flowContainer: ts.Node;
  }
>;

/**
 * Analyzes the control flow of a list of references and returns
 * information about which nodes can be shared via a temporary variable
 * to enable narrowing.
 *
 * E.g. consider the following snippet:
 *
 * ```ts
 * someMethod() {
 *   if (this.bla) {
 *     this.bla.charAt(0);
 *   }
 * }
 * ```
 *
 * The analysis would inform the caller that `this.bla.charAt` can
 * be shared with the `this.bla` of the `if` condition.
 *
 * This is useful for the signal migration as it allows us to efficiently,
 * and minimally transform references into shared variables where needed.
 * Needed because signals are not narrowable by default, as they are functions.
 */
export function analyzeControlFlow(
  entries: ts.Identifier[],
  checker: ts.TypeChecker,
): ControlFlowAnalysisNode[] {
  const result: ControlFlowAnalysisNode[] = [];
  const referenceToMetadata: ReferenceMetadata = new Map();

  // Prepare easy lookups for reference nodes to flow info.
  for (const [idx, entry] of entries.entries()) {
    const flowContainer = getControlFlowContainer(entry);
    referenceToMetadata.set(entry, {
      flowContainer,
      resultIndex: idx,
    });

    result.push({
      flowContainer,
      id: idx,
      originalNode: entry,
      recommendedNode: 'preserve',
    });
  }

  for (const entry of entries) {
    const {flowContainer, resultIndex} = referenceToMetadata.get(entry)!;
    const flowPathInterestingNodes = traverseFlowForInterestingNodes(getFlowNode(entry)!);

    assert(
      flowContainer !== null && flowPathInterestingNodes !== null,
      'Expected a flow container to exist.',
    );

    const narrowPartners = getAllMatchingReferencesInFlowPath(
      flowPathInterestingNodes,
      entry,
      referenceToMetadata,
      flowContainer,
      checker,
    );

    if (narrowPartners.length !== 0) {
      connectSharedReferences(result, narrowPartners, resultIndex);
    }
  }

  return result;
}

/**
 * Iterates through all partner flow nodes and connects them so that
 * the first node will act as the share partner, while all subsequent
 * nodes will point to the share node.
 */
function connectSharedReferences(
  result: ControlFlowAnalysisNode[],
  flowPartners: number[],
  refId: number,
) {
  const refFlowContainer = result[refId].flowContainer;

  // Inside the list of flow partners (i.e. references to the same target),
  // find the node that is the first one in the flow container (via its start pos).
  let earliestPartner: ts.Node | null = null;
  let earliestPartnerId: number | null = null;
  for (const partnerId of flowPartners) {
    if (
      earliestPartner === null ||
      result[partnerId].originalNode.getStart() < earliestPartner.getStart()
    ) {
      earliestPartner = result[partnerId].originalNode;
      earliestPartnerId = partnerId;
    }
  }

  assert(earliestPartner !== null, 'Expected an earliest partner to be found.');
  assert(earliestPartnerId !== null, 'Expected an earliest partner to be found.');

  // Earliest partner ID could be higher than `refId` in cyclic
  // situations like `loop` flow nodes. We need to find the minimum
  // and maximum to iterate through partners in between.
  const min = Math.min(earliestPartnerId, refId);
  const max = Math.max(earliestPartnerId, refId);

  // Then, incorporate all similar references (or flow nodes) in between
  // the reference and the earliest partner. References in between can also
  // use the shared flow node and not preserve their original reference— as
  // this would be rather unreadable and inefficient.
  const seenBlocks = new Set<InsertionCommonAncestor>();
  let highestBlock: InsertionCommonAncestor | null = null;
  for (let i = min; i <= max; i++) {
    // Different flow container captured sequentially in result. Ignore.
    if (result[i].flowContainer !== refFlowContainer) {
      continue;
    }

    // Iterate up the block, find the highest block within the flow container.
    let current: ts.Node = result[i].originalNode.parent;
    while (current !== undefined) {
      if (isPotentialInsertionAncestor(current)) {
        // If we saw this block already, it is a common ancestor from another
        // partner. Check if it would be higher than the current highest block;
        // and choose it accordingly.
        if (seenBlocks.has(current)) {
          if (highestBlock === null || current.getStart() < highestBlock.getStart()) {
            highestBlock = current;
          }
          break;
        }

        seenBlocks.add(current);
      }

      current = current.parent;
    }

    if (i !== earliestPartnerId) {
      result[i].recommendedNode = earliestPartnerId;
    }
  }

  if (!highestBlock) {
    console.error(earliestPartnerId, refId, refFlowContainer.getText(), seenBlocks);
  }

  assert(highestBlock, 'Expected a block anchor to be found');
  result[earliestPartnerId].recommendedNode = highestBlock;
}

function isPotentialInsertionAncestor(
  node: ts.Node,
): node is ts.ArrowFunction | ts.Block | ts.SourceFile | ts.ClassLikeDeclaration {
  // Note: Arrow functions may not have a block, but instead use an expression
  // directly. This still signifies a "block" as we can convert the concise body
  // to a block.
  return (
    ts.isSourceFile(node) || ts.isBlock(node) || ts.isArrowFunction(node) || ts.isClassLike(node)
  );
}

/**
 * Looks through the flow path and interesting nodes to determine which
 * of the potential "interesting" nodes point to the same reference.
 *
 * These nodes are then considered "partners" and will be returned via
 * their IDs (or practically their result indices).
 */
function getAllMatchingReferencesInFlowPath(
  flowPathInterestingNodes: ts.Node[],
  reference: ts.Identifier,
  referenceToMetadata: ReferenceMetadata,
  restrainingFlowContainer: ts.Node,
  checker: ts.TypeChecker,
): number[] {
  const partners: number[] = [];

  for (const flowNode of flowPathInterestingNodes) {
    // quick naive perf-optimized check to see if the flow node has a potential
    // similar reference.
    if (!flowNode.getText().includes(reference.getText())) {
      continue;
    }

    const similarRefNodeId = findSimilarReferenceNode(
      flowNode,
      reference,
      referenceToMetadata,
      restrainingFlowContainer,
      checker,
    );

    if (similarRefNodeId !== null) {
      partners.push(similarRefNodeId);
    }
  }
  return partners;
}

/**
 * Checks if the given node contains an identifier that
 * matches the given reference. If so, returns its flow ID.
 */
function findSimilarReferenceNode(
  start: ts.Node,
  reference: ts.Identifier,
  referenceToMetadata: ReferenceMetadata,
  restrainingFlowContainer: ts.Node,
  checker: ts.TypeChecker,
): number | null {
  return (
    ts.forEachChild<{idx: number}>(start, function visitChild(node: ts.Node) {
      // do not descend into control flow boundaries.
      // only references sharing the same container are relevant.
      // This is a performance optimization.
      if (isControlFlowBoundary(node)) {
        return;
      }
      // If this is not a potential matching identifier, check its children.
      if (
        !ts.isIdentifier(node) ||
        referenceToMetadata.get(node)?.flowContainer !== restrainingFlowContainer
      ) {
        return ts.forEachChild<{idx: number}>(node, visitChild);
      }
      // If this refers to a different instantiation of the input reference,
      // continue looking.
      if (!isLexicalSameReference(checker, node, reference)) {
        return;
      }
      return {idx: referenceToMetadata.get(node)!.resultIndex};
    })?.idx ?? null
  );
}

/**
 * Checks whether a given identifier is lexically equivalent.
 * e.g. checks that they have similar property receiver accesses.
 */
function isLexicalSameReference(
  checker: ts.TypeChecker,
  sharePartner: ts.Identifier,
  reference: ts.Identifier,
): boolean {
  const aParent = unwrapParent(reference.parent);
  // If the reference is not part a property access, return true. The references
  // are guaranteed symbol matches.
  if (!ts.isPropertyAccessExpression(aParent) && !ts.isElementAccessExpression(aParent)) {
    return sharePartner.text === reference.text;
  }
  // If reference parent is part of a property expression, but the share
  // partner not, then this cannot be shared.
  const bParent = unwrapParent(sharePartner.parent);
  if (aParent.kind !== bParent.kind) {
    return false;
  }

  const aParentExprSymbol = checker.getSymbolAtLocation(aParent.expression);
  const bParentExprSymbol = checker.getSymbolAtLocation(
    (bParent as ts.PropertyAccessExpression | ts.ElementAccessExpression).expression,
  );

  return aParentExprSymbol === bParentExprSymbol;
}
