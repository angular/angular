/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵCONTAINER_HEADER_OFFSET as CONTAINER_HEADER_OFFSET,
  ɵDeferBlockDetails as DeferBlockDetails,
  ɵDeferBlockState as DeferBlockState,
  ɵgetDeferBlocks as getDeferBlocks,
  ɵrenderDeferBlockState as renderDeferBlockState,
  ɵtriggerResourceLoading as triggerResourceLoading,
} from '../../src/core';

import type {ComponentFixture} from './component_fixture';

/**
 * Represents an individual defer block for testing purposes.
 *
 * @publicApi
 */
export class DeferBlockFixture {
  /** @docs-private */
  constructor(
    private block: DeferBlockDetails,
    private componentFixture: ComponentFixture<unknown>,
  ) {}

  /**
   * Renders the specified state of the defer fixture.
   * @param state the defer state to render
   */
  async render(state: DeferBlockState): Promise<void> {
    if (!hasStateTemplate(state, this.block)) {
      const stateAsString = getDeferBlockStateNameFromEnum(state);
      throw new Error(
        `Tried to render this defer block in the \`${stateAsString}\` state, ` +
          `but there was no @${stateAsString.toLowerCase()} block defined in a template.`,
      );
    }
    if (state === DeferBlockState.Complete) {
      await triggerResourceLoading(this.block.tDetails, this.block.lView, this.block.tNode);
    }
    // If the `render` method is used explicitly - skip timer-based scheduling for
    // `@placeholder` and `@loading` blocks and render them immediately.
    const skipTimerScheduling = true;
    renderDeferBlockState(state, this.block.tNode, this.block.lContainer, skipTimerScheduling);
    this.componentFixture.detectChanges();
  }

  /**
   * Retrieves all nested child defer block fixtures
   * in a given defer block.
   */
  getDeferBlocks(): Promise<DeferBlockFixture[]> {
    const deferBlocks: DeferBlockDetails[] = [];
    // An LContainer that represents a defer block has at most 1 view, which is
    // located right after an LContainer header. Get a hold of that view and inspect
    // it for nested defer blocks.
    const deferBlockFixtures = [];
    if (this.block.lContainer.length >= CONTAINER_HEADER_OFFSET) {
      const lView = this.block.lContainer[CONTAINER_HEADER_OFFSET];
      getDeferBlocks(lView, deferBlocks);
      for (const block of deferBlocks) {
        deferBlockFixtures.push(new DeferBlockFixture(block, this.componentFixture));
      }
    }
    return Promise.resolve(deferBlockFixtures);
  }
}

function hasStateTemplate(state: DeferBlockState, block: DeferBlockDetails) {
  switch (state) {
    case DeferBlockState.Placeholder:
      return block.tDetails.placeholderTmplIndex !== null;
    case DeferBlockState.Loading:
      return block.tDetails.loadingTmplIndex !== null;
    case DeferBlockState.Error:
      return block.tDetails.errorTmplIndex !== null;
    case DeferBlockState.Complete:
      return true;
    default:
      return false;
  }
}

function getDeferBlockStateNameFromEnum(state: DeferBlockState) {
  switch (state) {
    case DeferBlockState.Placeholder:
      return 'Placeholder';
    case DeferBlockState.Loading:
      return 'Loading';
    case DeferBlockState.Error:
      return 'Error';
    default:
      return 'Main';
  }
}
