/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, OnDestroy, Provider} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {coerceCssPixelValue} from '@angular/cdk/coercion';
import {CdkTable, _CoalescedStyleScheduler, _COALESCED_STYLE_SCHEDULER} from '@angular/cdk/table';

import {ColumnResize} from './column-resize';

/**
 * Provides an implementation for resizing a column.
 * The details of how resizing works for tables for flex mat-tables are quite different.
 */
@Injectable()
export abstract class ResizeStrategy {
  protected abstract readonly columnResize: ColumnResize;
  protected abstract readonly styleScheduler: _CoalescedStyleScheduler;
  protected abstract readonly table: CdkTable<unknown>;

  private _pendingResizeDelta: number | null = null;

  /** Updates the width of the specified column. */
  abstract applyColumnSize(
    cssFriendlyColumnName: string,
    columnHeader: HTMLElement,
    sizeInPx: number,
    previousSizeInPx?: number,
  ): void;

  /** Applies a minimum width to the specified column, updating its current width as needed. */
  abstract applyMinColumnSize(
    cssFriendlyColumnName: string,
    columnHeader: HTMLElement,
    minSizeInPx: number,
  ): void;

  /** Applies a maximum width to the specified column, updating its current width as needed. */
  abstract applyMaxColumnSize(
    cssFriendlyColumnName: string,
    columnHeader: HTMLElement,
    minSizeInPx: number,
  ): void;

  /** Adjusts the width of the table element by the specified delta. */
  protected updateTableWidthAndStickyColumns(delta: number): void {
    if (this._pendingResizeDelta === null) {
      const tableElement = this.columnResize.elementRef.nativeElement;
      const tableWidth = getElementWidth(tableElement);

      this.styleScheduler.schedule(() => {
        tableElement.style.width = coerceCssPixelValue(tableWidth + this._pendingResizeDelta!);

        this._pendingResizeDelta = null;
      });

      this.styleScheduler.scheduleEnd(() => {
        this.table.updateStickyColumnStyles();
      });
    }

    this._pendingResizeDelta = (this._pendingResizeDelta ?? 0) + delta;
  }
}

/**
 * The optimally performing resize strategy for &lt;table&gt; elements with table-layout: fixed.
 * Tested against and outperformed:
 *   CSS selector
 *   CSS selector w/ CSS variable
 *   Updating all cell nodes
 */
@Injectable()
export class TableLayoutFixedResizeStrategy extends ResizeStrategy {
  constructor(
    protected readonly columnResize: ColumnResize,
    @Inject(_COALESCED_STYLE_SCHEDULER)
    protected readonly styleScheduler: _CoalescedStyleScheduler,
    protected readonly table: CdkTable<unknown>,
  ) {
    super();
  }

  applyColumnSize(
    _: string,
    columnHeader: HTMLElement,
    sizeInPx: number,
    previousSizeInPx?: number,
  ): void {
    const delta = sizeInPx - (previousSizeInPx ?? getElementWidth(columnHeader));

    if (delta === 0) {
      return;
    }

    this.styleScheduler.schedule(() => {
      columnHeader.style.width = coerceCssPixelValue(sizeInPx);
    });

    this.updateTableWidthAndStickyColumns(delta);
  }

  applyMinColumnSize(_: string, columnHeader: HTMLElement, sizeInPx: number): void {
    const currentWidth = getElementWidth(columnHeader);
    const newWidth = Math.max(currentWidth, sizeInPx);

    this.applyColumnSize(_, columnHeader, newWidth, currentWidth);
  }

  applyMaxColumnSize(_: string, columnHeader: HTMLElement, sizeInPx: number): void {
    const currentWidth = getElementWidth(columnHeader);
    const newWidth = Math.min(currentWidth, sizeInPx);

    this.applyColumnSize(_, columnHeader, newWidth, currentWidth);
  }
}

/**
 * The optimally performing resize strategy for flex mat-tables.
 * Tested against and outperformed:
 *   CSS selector w/ CSS variable
 *   Updating all mat-cell nodes
 */
@Injectable()
export class CdkFlexTableResizeStrategy extends ResizeStrategy implements OnDestroy {
  private readonly _document: Document;
  private readonly _columnIndexes = new Map<string, number>();
  private readonly _columnProperties = new Map<string, Map<string, string>>();

  private _styleElement?: HTMLStyleElement;
  private _indexSequence = 0;

  protected readonly defaultMinSize = 0;
  protected readonly defaultMaxSize = Number.MAX_SAFE_INTEGER;

  constructor(
    protected readonly columnResize: ColumnResize,
    @Inject(_COALESCED_STYLE_SCHEDULER)
    protected readonly styleScheduler: _CoalescedStyleScheduler,
    protected readonly table: CdkTable<unknown>,
    @Inject(DOCUMENT) document: any,
  ) {
    super();
    this._document = document;
  }

  applyColumnSize(
    cssFriendlyColumnName: string,
    columnHeader: HTMLElement,
    sizeInPx: number,
    previousSizeInPx?: number,
  ): void {
    // Optimization: Check applied width first as we probably set it already before reading
    // offsetWidth which triggers layout.
    const delta =
      sizeInPx -
      (previousSizeInPx ??
        (this._getAppliedWidth(cssFriendlyColumnName) || columnHeader.offsetWidth));

    if (delta === 0) {
      return;
    }

    const cssSize = coerceCssPixelValue(sizeInPx);

    this._applyProperty(cssFriendlyColumnName, 'flex', `0 0.01 ${cssSize}`);
    this.updateTableWidthAndStickyColumns(delta);
  }

  applyMinColumnSize(cssFriendlyColumnName: string, _: HTMLElement, sizeInPx: number): void {
    const cssSize = coerceCssPixelValue(sizeInPx);

    this._applyProperty(
      cssFriendlyColumnName,
      'min-width',
      cssSize,
      sizeInPx !== this.defaultMinSize,
    );
    this.updateTableWidthAndStickyColumns(0);
  }

  applyMaxColumnSize(cssFriendlyColumnName: string, _: HTMLElement, sizeInPx: number): void {
    const cssSize = coerceCssPixelValue(sizeInPx);

    this._applyProperty(
      cssFriendlyColumnName,
      'max-width',
      cssSize,
      sizeInPx !== this.defaultMaxSize,
    );
    this.updateTableWidthAndStickyColumns(0);
  }

  protected getColumnCssClass(cssFriendlyColumnName: string): string {
    return `cdk-column-${cssFriendlyColumnName}`;
  }

  ngOnDestroy(): void {
    this._styleElement?.remove();
    this._styleElement = undefined;
  }

  private _getPropertyValue(cssFriendlyColumnName: string, key: string): string | undefined {
    const properties = this._getColumnPropertiesMap(cssFriendlyColumnName);
    return properties.get(key);
  }

  private _getAppliedWidth(cssFriendslyColumnName: string): number {
    return coercePixelsFromFlexValue(this._getPropertyValue(cssFriendslyColumnName, 'flex'));
  }

  private _applyProperty(
    cssFriendlyColumnName: string,
    key: string,
    value: string,
    enable = true,
  ): void {
    const properties = this._getColumnPropertiesMap(cssFriendlyColumnName);

    this.styleScheduler.schedule(() => {
      if (enable) {
        properties.set(key, value);
      } else {
        properties.delete(key);
      }
      this._applySizeCss(cssFriendlyColumnName);
    });
  }

  private _getStyleSheet(): CSSStyleSheet {
    if (!this._styleElement) {
      this._styleElement = this._document.createElement('style');
      this._styleElement.appendChild(this._document.createTextNode(''));
      this._document.head.appendChild(this._styleElement);
    }

    return this._styleElement.sheet as CSSStyleSheet;
  }

  private _getColumnPropertiesMap(cssFriendlyColumnName: string): Map<string, string> {
    let properties = this._columnProperties.get(cssFriendlyColumnName);
    if (properties === undefined) {
      properties = new Map<string, string>();
      this._columnProperties.set(cssFriendlyColumnName, properties);
    }
    return properties;
  }

  private _applySizeCss(cssFriendlyColumnName: string) {
    const properties = this._getColumnPropertiesMap(cssFriendlyColumnName);
    const propertyKeys = Array.from(properties.keys());

    let index = this._columnIndexes.get(cssFriendlyColumnName);
    if (index === undefined) {
      if (!propertyKeys.length) {
        // Nothing to set or unset.
        return;
      }

      index = this._indexSequence++;
      this._columnIndexes.set(cssFriendlyColumnName, index);
    } else {
      this._getStyleSheet().deleteRule(index);
    }

    const columnClassName = this.getColumnCssClass(cssFriendlyColumnName);
    const tableClassName = this.columnResize.getUniqueCssClass();

    const selector = `.${tableClassName} .${columnClassName}`;
    const body = propertyKeys.map(key => `${key}:${properties.get(key)}`).join(';');

    this._getStyleSheet().insertRule(`${selector} {${body}}`, index!);
  }
}

/** Converts CSS pixel values to numbers, eg "123px" to 123. Returns NaN for non pixel values. */
function coercePixelsFromCssValue(cssValue: string): number {
  return Number(cssValue.match(/(\d+)px/)?.[1]);
}

/** Gets the style.width pixels on the specified element if present, otherwise its offsetWidth. */
function getElementWidth(element: HTMLElement) {
  // Optimization: Check style.width first as we probably set it already before reading
  // offsetWidth which triggers layout.
  return coercePixelsFromCssValue(element.style.width) || element.offsetWidth;
}

/**
 * Converts CSS flex values as set in CdkFlexTableResizeStrategy to numbers,
 * eg "0 0.01 123px" to 123.
 */
function coercePixelsFromFlexValue(flexValue: string | undefined): number {
  return Number(flexValue?.match(/0 0\.01 (\d+)px/)?.[1]);
}

export const TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER: Provider = {
  provide: ResizeStrategy,
  useClass: TableLayoutFixedResizeStrategy,
};
export const FLEX_RESIZE_STRATEGY_PROVIDER: Provider = {
  provide: ResizeStrategy,
  useClass: CdkFlexTableResizeStrategy,
};
