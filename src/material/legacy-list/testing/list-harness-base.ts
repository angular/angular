/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
  parallel,
} from '@angular/cdk/testing';
import {DividerHarnessFilters, MatDividerHarness} from '@angular/material/divider/testing';
import {
  LegacyBaseListItemHarnessFilters,
  LegacySubheaderHarnessFilters,
} from './list-harness-filters';
import {MatLegacySubheaderHarness} from './list-item-harness-base';

/** Represents a section of a list falling under a specific header. */
export interface ListSection<I> {
  /** The heading for this list section. `undefined` if there is no heading. */
  heading?: string;

  /** The items in this list section. */
  items: I[];
}

/**
 * Shared behavior among the harnesses for the various `MatList` flavors.
 * @template T A constructor type for a list item harness type used by this list harness.
 * @template C The list item harness type that `T` constructs.
 * @template F The filter type used filter list item harness of type `C`.
 * @docs-private
 */
export abstract class MatLegacyListHarnessBase<
  T extends ComponentHarnessConstructor<C> & {with: (options?: F) => HarnessPredicate<C>},
  C extends ComponentHarness,
  F extends LegacyBaseListItemHarnessFilters,
> extends ComponentHarness {
  protected _itemHarness: T;

  /**
   * Gets a list of harnesses representing the items in this list.
   * @param filters Optional filters used to narrow which harnesses are included
   * @return The list of items matching the given filters.
   */
  async getItems(filters?: F): Promise<C[]> {
    return this.locatorForAll(this._itemHarness.with(filters))();
  }

  /**
   * Gets a list of `ListSection` representing the list items grouped by subheaders. If the list has
   * no subheaders it is represented as a single `ListSection` with an undefined `heading` property.
   * @param filters Optional filters used to narrow which list item harnesses are included
   * @return The list of items matching the given filters, grouped into sections by subheader.
   */
  async getItemsGroupedBySubheader(filters?: F): Promise<ListSection<C>[]> {
    type Section = {items: C[]; heading?: Promise<string>};
    const listSections: Section[] = [];
    let currentSection: Section = {items: []};
    const itemsAndSubheaders = await this.getItemsWithSubheadersAndDividers({
      item: filters,
      divider: false,
    });
    for (const itemOrSubheader of itemsAndSubheaders) {
      if (itemOrSubheader instanceof MatLegacySubheaderHarness) {
        if (currentSection.heading !== undefined || currentSection.items.length) {
          listSections.push(currentSection);
        }
        currentSection = {heading: itemOrSubheader.getText(), items: []};
      } else {
        currentSection.items.push(itemOrSubheader);
      }
    }
    if (
      currentSection.heading !== undefined ||
      currentSection.items.length ||
      !listSections.length
    ) {
      listSections.push(currentSection);
    }

    // Concurrently wait for all sections to resolve their heading if present.
    return parallel(() =>
      listSections.map(async s => ({items: s.items, heading: await s.heading})),
    );
  }

  /**
   * Gets a list of sub-lists representing the list items grouped by dividers. If the list has no
   * dividers it is represented as a list with a single sub-list.
   * @param filters Optional filters used to narrow which list item harnesses are included
   * @return The list of items matching the given filters, grouped into sub-lists by divider.
   */
  async getItemsGroupedByDividers(filters?: F): Promise<C[][]> {
    const listSections: C[][] = [[]];
    const itemsAndDividers = await this.getItemsWithSubheadersAndDividers({
      item: filters,
      subheader: false,
    });
    for (const itemOrDivider of itemsAndDividers) {
      if (itemOrDivider instanceof MatDividerHarness) {
        listSections.push([]);
      } else {
        listSections[listSections.length - 1].push(itemOrDivider);
      }
    }
    return listSections;
  }

  /**
   * Gets a list of harnesses representing all of the items, subheaders, and dividers
   * (in the order they appear in the list). Use `instanceof` to check which type of harness a given
   * item is.
   * @param filters Optional filters used to narrow which list items, subheaders, and dividers are
   *     included. A value of `false` for the `item`, `subheader`, or `divider` properties indicates
   *     that the respective harness type should be omitted completely.
   * @return The list of harnesses representing the items, subheaders, and dividers matching the
   *     given filters.
   */
  getItemsWithSubheadersAndDividers(filters: {
    item: false;
    subheader: false;
    divider: false;
  }): Promise<[]>;
  getItemsWithSubheadersAndDividers(filters: {
    item?: F | false;
    subheader: false;
    divider: false;
  }): Promise<C[]>;
  getItemsWithSubheadersAndDividers(filters: {
    item: false;
    subheader?: LegacySubheaderHarnessFilters | false;
    divider: false;
  }): Promise<MatLegacySubheaderHarness[]>;
  getItemsWithSubheadersAndDividers(filters: {
    item: false;
    subheader: false;
    divider?: DividerHarnessFilters | false;
  }): Promise<MatDividerHarness[]>;
  getItemsWithSubheadersAndDividers(filters: {
    item?: F | false;
    subheader?: LegacySubheaderHarnessFilters | false;
    divider: false;
  }): Promise<(C | MatLegacySubheaderHarness)[]>;
  getItemsWithSubheadersAndDividers(filters: {
    item?: F | false;
    subheader: false;
    divider?: false | DividerHarnessFilters;
  }): Promise<(C | MatDividerHarness)[]>;
  getItemsWithSubheadersAndDividers(filters: {
    item: false;
    subheader?: false | LegacySubheaderHarnessFilters;
    divider?: false | DividerHarnessFilters;
  }): Promise<(MatLegacySubheaderHarness | MatDividerHarness)[]>;
  getItemsWithSubheadersAndDividers(filters?: {
    item?: F | false;
    subheader?: LegacySubheaderHarnessFilters | false;
    divider?: DividerHarnessFilters | false;
  }): Promise<(C | MatLegacySubheaderHarness | MatDividerHarness)[]>;
  async getItemsWithSubheadersAndDividers(
    filters: {
      item?: F | false;
      subheader?: LegacySubheaderHarnessFilters | false;
      divider?: DividerHarnessFilters | false;
    } = {},
  ): Promise<(C | MatLegacySubheaderHarness | MatDividerHarness)[]> {
    const query = [];
    if (filters.item !== false) {
      query.push(this._itemHarness.with(filters.item || ({} as F)));
    }
    if (filters.subheader !== false) {
      query.push(MatLegacySubheaderHarness.with(filters.subheader));
    }
    if (filters.divider !== false) {
      query.push(MatDividerHarness.with(filters.divider));
    }
    return this.locatorForAll(...query)();
  }
}
