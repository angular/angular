/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * The goal here is to make sure that the browser DOM API is the Renderer.
 * We do this by defining a subset of DOM API to be the renderer and then
 * use that at runtime for rendering.
 *
 * At runtime we can then use the DOM api directly, in server or web-worker
 * it will be easy to implement such API.
 */

import {Renderer2, RendererFactory2} from '../../render';

// TODO: cleanup once the code is merged in angular/angular
export enum RendererStyleFlags3 {
  Important = 1 << 0,
  DashCase = 1 << 1
}

export type Renderer3 = Renderer2;

export type GlobalTargetName = 'document'|'window'|'body';

export type GlobalTargetResolver = (element: any) => EventTarget;


export type RendererFactory3 = RendererFactory2;

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
