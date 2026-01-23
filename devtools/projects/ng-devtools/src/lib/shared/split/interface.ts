/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SplitAreaDirective} from './splitArea.directive';

export type Direction = 'vertical' | 'horizontal';
export type Unit = 'percent' | 'pixel';

export interface IPoint {
  x: number;
  y: number;
}

export interface IArea {
  component: SplitAreaDirective;
  order: number;
  size: number | null;
  minSize: number | null;
  maxSize: number | null;
}

// CREATED ON DRAG START

export interface ISplitSnapshot {
  gutterNum: number;
  allAreasSizePixel: number;
  allInvolvedAreasSizePercent: number;
  lastSteppedOffset: number;
  areasBeforeGutter: Array<IAreaSnapshot>;
  areasAfterGutter: Array<IAreaSnapshot>;
}

export interface IAreaSnapshot {
  area: IArea;
  sizePixelAtStart: number;
  sizePercentAtStart: number;
}

// CREATED ON DRAG PROGRESS

export interface ISplitSideAbsorptionCapacity {
  remain: number;
  list: Array<IAreaAbsorptionCapacity>;
}

export interface IAreaAbsorptionCapacity {
  areaSnapshot: IAreaSnapshot;
  pixelAbsorb: number;
  percentAfterAbsorption: number;
  pixelRemain: number;
}

// CREATED TO SEND OUTSIDE

export interface IOutputData {
  gutterNum: number;
  sizes: IOutputAreaSizes;
}

export interface IOutputAreaSizes extends Array<number | '*'> {}
