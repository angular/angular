/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';
import {Resizable} from '@angular/cdk-experimental/column-resize';
import {MatColumnResizeOverlayHandle} from '../overlay-handle';

export abstract class AbstractMatResizable extends Resizable<MatColumnResizeOverlayHandle> {
  minWidthPxInternal = 32;

  protected getInlineHandleCssClassName(): string {
    return 'mat-resizable-handle';
  }

  protected getOverlayHandleComponentType(): Type<MatColumnResizeOverlayHandle> {
    return MatColumnResizeOverlayHandle;
  }
}

export const RESIZABLE_HOST_BINDINGS = {
  'class': 'mat-resizable',
};

export const RESIZABLE_INPUTS = [
  'minWidthPx: matResizableMinWidthPx',
  'maxWidthPx: matResizableMaxWidthPx',
];
