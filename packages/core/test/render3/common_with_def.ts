/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOf as NgForOfDef, NgIf as NgIfDef} from '@angular/common';
import {InjectFlags, IterableDiffers} from '@angular/core';

import {defaultIterableDiffers} from '../../src/change_detection/change_detection';
import {DirectiveType, NgOnChangesFeature, defineDirective, directiveInject, injectTemplateRef, injectViewContainerRef} from '../../src/render3/index';

export const NgForOf: DirectiveType<NgForOfDef<any>> = NgForOfDef as any;
export const NgIf: DirectiveType<NgIfDef> = NgIfDef as any;

NgForOf.ngDirectiveDef = defineDirective({
  type: NgForOfDef,
  selectors: [['', 'ngForOf', '']],
  factory: () => new NgForOfDef(
               injectViewContainerRef(), injectTemplateRef(), directiveInject(IterableDiffers)),
  features: [NgOnChangesFeature()],
  inputs: {
    ngForOf: 'ngForOf',
    ngForTrackBy: 'ngForTrackBy',
    ngForTemplate: 'ngForTemplate',
  }
});

(NgIf as any).ngDirectiveDef = defineDirective({
  type: NgIfDef,
  selectors: [['', 'ngIf', '']],
  factory: () => new NgIfDef(injectViewContainerRef(), injectTemplateRef()),
  inputs: {ngIf: 'ngIf', ngIfThen: 'ngIfThen', ngIfElse: 'ngIfElse'}
});
