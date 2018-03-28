/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOf as NgForOfDef} from '@angular/common';
import {IterableDiffers} from '@angular/core';

import {defaultIterableDiffers} from '../../src/change_detection/change_detection';
import {DirectiveType, InjectFlags, NgOnChangesFeature, defineDirective, directiveInject, injectTemplateRef, injectViewContainerRef} from '../../src/render3/index';

export const NgForOf: DirectiveType<NgForOfDef<any>> = NgForOfDef as any;

NgForOf.ngDirectiveDef = defineDirective({
  type: NgForOfDef,
  selector: [[['', 'ngForOf', ''], null]],
  factory: () => new NgForOfDef(
               injectViewContainerRef(), injectTemplateRef(),
               directiveInject(IterableDiffers, InjectFlags.Default, defaultIterableDiffers)),
  features: [NgOnChangesFeature()],
  inputs: {
    ngForOf: 'ngForOf',
    ngForTrackBy: 'ngForTrackBy',
    ngForTemplate: 'ngForTemplate',
  }
});
