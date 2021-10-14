/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarnessConstructor,
  ContentContainerComponentHarness,
  HarnessPredicate,
} from '@angular/cdk/testing';
import {TreeNodeHarnessFilters} from './tree-harness-filters';
import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';

/** Harness for interacting with a standard Angular Material tree node. */
export class MatTreeNodeHarness extends ContentContainerComponentHarness<string> {
  /** The selector of the host element of a `MatTreeNode` instance. */
  static hostSelector = '.mat-tree-node, .mat-nested-tree-node';

  _toggle = this.locatorForOptional('[matTreeNodeToggle]');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tree node with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TreeNodeHarnessFilters = {}): HarnessPredicate<MatTreeNodeHarness> {
    return getNodePredicate(MatTreeNodeHarness, options);
  }

  /** Whether the tree node is expanded. */
  async isExpanded(): Promise<boolean> {
    return coerceBooleanProperty(await (await this.host()).getAttribute('aria-expanded'));
  }

  /** Whether the tree node is disabled. */
  async isDisabled(): Promise<boolean> {
    return coerceBooleanProperty(await (await this.host()).getProperty('aria-disabled'));
  }

  /** Gets the level of the tree node. Note that this gets the aria-level and is 1 indexed. */
  async getLevel(): Promise<number> {
    return coerceNumberProperty(await (await this.host()).getAttribute('aria-level'));
  }

  /** Gets the tree node's text. */
  async getText(): Promise<string> {
    return (await this.host()).text({exclude: '.mat-tree-node, .mat-nested-tree-node, button'});
  }

  /** Toggles node between expanded/collapsed. Only works when node is not disabled. */
  async toggle(): Promise<void> {
    const toggle = await this._toggle();
    if (toggle) {
      return toggle.click();
    }
  }

  /** Expands the node if it is collapsed. Only works when node is not disabled. */
  async expand(): Promise<void> {
    if (!(await this.isExpanded())) {
      await this.toggle();
    }
  }

  /** Collapses the node if it is expanded. Only works when node is not disabled. */
  async collapse(): Promise<void> {
    if (await this.isExpanded()) {
      await this.toggle();
    }
  }
}

function getNodePredicate<T extends MatTreeNodeHarness>(
  type: ComponentHarnessConstructor<T>,
  options: TreeNodeHarnessFilters,
): HarnessPredicate<T> {
  return new HarnessPredicate(type, options)
    .addOption('text', options.text, (harness, text) =>
      HarnessPredicate.stringMatches(harness.getText(), text),
    )
    .addOption(
      'disabled',
      options.disabled,
      async (harness, disabled) => (await harness.isDisabled()) === disabled,
    )
    .addOption(
      'expanded',
      options.expanded,
      async (harness, expanded) => (await harness.isExpanded()) === expanded,
    )
    .addOption(
      'level',
      options.level,
      async (harness, level) => (await harness.getLevel()) === level,
    );
}
