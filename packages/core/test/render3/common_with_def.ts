/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOf as NgForOfDef, NgIf as NgIfDef, NgTemplateOutlet as NgTemplateOutletDef} from '@angular/common';
import {IterableDiffers} from '@angular/core';

import {DirectiveType, NgOnChangesFeature, defineDirective, directiveInject, injectTemplateRef, injectViewContainerRef} from '../../src/render3/index';

export const NgForOf: DirectiveType<NgForOfDef<any>> = NgForOfDef as any;
export const NgIf: DirectiveType<NgIfDef> = NgIfDef as any;
export const NgTemplateOutlet: DirectiveType<NgTemplateOutletDef> = NgTemplateOutletDef as any;

NgForOf.ngDirectiveDef = defineDirective({
  type: NgForOfDef,
  selectors: [['', 'ngForOf', '']],
  factory: () => new NgForOfDef(
               injectViewContainerRef(), injectTemplateRef(), directiveInject(IterableDiffers)),
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

(NgTemplateOutlet as any).ngDirectiveDef = defineDirective({
  type: NgTemplateOutletDef,
  selectors: [['', 'ngTemplateOutlet', '']],
  factory: () => new NgTemplateOutletDef(injectViewContainerRef()),
  features: [NgOnChangesFeature],
  inputs:
      {ngTemplateOutlet: 'ngTemplateOutlet', ngTemplateOutletContext: 'ngTemplateOutletContext'}
});
