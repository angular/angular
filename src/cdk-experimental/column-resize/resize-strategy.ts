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

import {ColumnResize} from './column-resize';

/**
 * Provides an implementation for resizing a column.
 * The details of how resizing works for tables for flex mat-tables are quite different.
 */
@Injectable()
export abstract class ResizeStrategy {
  abstract applyColumnSize(
      cssFriendlyColumnName: string,
      columnHeader: HTMLElement,
      sizeInPx: number): void;

  abstract applyMinColumnSize(
      cssFriendlyColumnName: string,
      columnHeader: HTMLElement,
      minSizeInPx: number): void;

  abstract applyMaxColumnSize(
      cssFriendlyColumnName: string,
      columnHeader: HTMLElement,
      minSizeInPx: number): void;
}

/**
 * The optimially performing resize strategy for &lt;table&gt; elements with table-layout: fixed.
 * Tested against and outperformed:
 *   CSS selector
 *   CSS selector w/ CSS variable
 *   Updating all cell nodes
 */
@Injectable()
export class TableLayoutFixedResizeStrategy extends ResizeStrategy {
  applyColumnSize(_: string, columnHeader: HTMLElement, sizeInPx: number): void {
    columnHeader.style.width = coerceCssPixelValue(sizeInPx);
  }

  applyMinColumnSize(_: string, columnHeader: HTMLElement, sizeInPx: number): void {
    columnHeader.style.minWidth = coerceCssPixelValue(sizeInPx);
  }

  applyMaxColumnSize(): void {
    // Intentionally omitted as max-width causes strange rendering issues in Chrome.
    // Max size will still apply when the user is resizing this column.
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
      private readonly _columnResize: ColumnResize,
      @Inject(DOCUMENT) document: any) {
    super();
    this._document = document;
  }

  applyColumnSize(cssFriendlyColumnName: string, _: HTMLElement, sizeInPx: number): void {
    const cssSize = coerceCssPixelValue(sizeInPx);

    this._applyProperty(cssFriendlyColumnName, 'flex', `0 0.01 ${cssSize}`);
  }

  applyMinColumnSize(cssFriendlyColumnName: string, _: HTMLElement, sizeInPx: number): void {
    const cssSize = coerceCssPixelValue(sizeInPx);

    this._applyProperty(cssFriendlyColumnName, 'min-width', cssSize,
        sizeInPx !== this.defaultMinSize);
  }

  applyMaxColumnSize(cssFriendlyColumnName: string, _: HTMLElement, sizeInPx: number): void {
    const cssSize = coerceCssPixelValue(sizeInPx);

    this._applyProperty(cssFriendlyColumnName, 'max-width', cssSize,
        sizeInPx !== this.defaultMaxSize);
  }

  protected getColumnCssClass(cssFriendlyColumnName: string): string {
    return `cdk-column-${cssFriendlyColumnName}`;
  }

  ngOnDestroy() {
    // TODO: Use remove() once we're off IE11.
    if (this._styleElement && this._styleElement.parentNode) {
      this._styleElement.parentNode.removeChild(this._styleElement);
      this._styleElement = undefined;
    }
  }

  private _applyProperty(
      cssFriendlyColumnName: string,
      key: string,
      value: string,
      enable = true): void {
    const properties = this._getColumnPropertiesMap(cssFriendlyColumnName);

    if (enable) {
      properties.set(key, value);
    } else {
      properties.delete(key);
    }
    this._applySizeCss(cssFriendlyColumnName);
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
    const tableClassName = this._columnResize.getUniqueCssClass();

    const selector = `.${tableClassName} .${columnClassName}`;
    const body = propertyKeys.map(key => `${key}:${properties.get(key)}`).join(';');

    this._getStyleSheet().insertRule(`${selector} {${body}}`, index!);
  }
}

export const TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER: Provider = {
  provide: ResizeStrategy,
  useClass: TableLayoutFixedResizeStrategy,
};
export const FLEX_RESIZE_STRATEGY_PROVIDER: Provider = {
  provide: ResizeStrategy,
  useClass: CdkFlexTableResizeStrategy,
};
