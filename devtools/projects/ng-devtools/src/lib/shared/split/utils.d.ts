/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementRef } from '@angular/core';
import { IArea, IAreaAbsorptionCapacity, IAreaSnapshot, IPoint, ISplitSideAbsorptionCapacity } from './interface';
export declare function getPointFromEvent(event: MouseEvent | TouchEvent): IPoint | null;
export declare function getElementPixelSize(elRef: ElementRef, direction: 'horizontal' | 'vertical'): number;
export declare function getInputBoolean(v: any): boolean;
export declare function getInputPositiveNumber<T>(v: any, defaultValue: T): number | T;
export declare function isUserSizesValid(unit: 'percent' | 'pixel', sizes: Array<number | null>): boolean | undefined | void;
export declare function getAreaMinSize(a: IArea): null | number;
export declare function getAreaMaxSize(a: IArea): null | number;
export declare function getGutterSideAbsorptionCapacity(unit: 'percent' | 'pixel', sideAreas: Array<IAreaSnapshot>, pixels: number, allAreasSizePixel: number): ISplitSideAbsorptionCapacity;
export declare function updateAreaSize(unit: 'percent' | 'pixel', item: IAreaAbsorptionCapacity): void;
