/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ReactiveNode, COMPUTED_NODE, ComputedNode, Version} from '../../../../primitives/signals';

export interface DeepSignalNode extends ComputedNode<unknown> {
  rawDirty: boolean;
  propertyNode: ReactiveNode | undefined;
  parentNode: ReactiveNode;
  lastProperty: PropertyKey | undefined;
  lastPropertyValueVersion: Version;
}

export const DEEP_SIGNAL_NODE: Omit<DeepSignalNode, 'computation' | 'parentNode'> =
  /* @__PURE__ */ (() => {
    return {
      ...COMPUTED_NODE,
      kind: 'deepSignal',
      propertyNode: undefined,
      lastProperty: undefined,
      rawDirty: false,
      get dirty(): boolean {
        if (isSafeToShortCircuitNotifications(this as DeepSignalNode)) {
          // Short-circuit notifications by reporting ourself as already dirty.
          return true;
        }

        return this.rawDirty;
      },
      set dirty(value: boolean) {
        this.rawDirty = value;
      },
      lastPropertyValueVersion: 0 as Version,
    };
  })();

/**
 * Determines whether `node` is definitely not affected by whatever write is currently ongoing and
 * generating signal graph notifications.
 */
function isSafeToShortCircuitNotifications(node: DeepSignalNode): boolean {
  // If the current write path doesn't involve any deep signal writes, then we're potentially affected.
  if (deepSignalWriter === null) {
    return false;
  }

  // `deepParentNode` is the most recent deep signal being written. If this node isn't also a child
  // of that parent, then we can't guarantee we're not impacted by the write.
  if (deepSignalWriter.parentNode !== node.parentNode) {
    return false;
  }

  // Check whether the property signal we're interested in has potentially changed since we last
  // read it. If it's dirty, or its version has been updated since our last read, then there's a
  // chance our property of interest has changed. Since we need to know for sure which property
  // we're interested in to check if we're affected, we have to assume we are.
  if (
    node.propertyNode !== undefined &&
    (node.propertyNode.dirty || node.propertyNode.version !== node.lastPropertyValueVersion)
  ) {
    return false;
  }

  // We know for sure that `node.lastProperty` is the property we care about. If the same property
  // got changed in our parent, though, we might still be affected.
  if (deepSignalWriter.lastProperty === node.lastProperty) {
    return false;
  }

  // We've proven that:
  //  * another deep signal is changing a specific property of our parent signal
  //  * it's not the property that we're reading
  //
  // There is the chance that our property signal changed since `lastProperty` was computed. If
  // that were the case, we'd already be dirty from that notification, so it's safe to assume that
  // under this circumstance, we're not affected.
  return true;
}

export function setDeepSignalWriter(node: DeepSignalNode | null): DeepSignalNode | null {
  const prev = deepSignalWriter;
  deepSignalWriter = node;
  return prev;
}

let deepSignalWriter: DeepSignalNode | null = null;
