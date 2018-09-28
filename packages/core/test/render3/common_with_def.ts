/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOf as NgForOfDef, NgIf as NgIfDef, NgTemplateOutlet as NgTemplateOutletDef} from '@angular/common';
import {IterableDiffers, TemplateRef, ViewContainerRef} from '@angular/core';

import {DirectiveType, NgOnChangesFeature, defineDirective, directiveInject} from '../../src/render3/index';

export const NgForOf: DirectiveType<NgForOfDef<any>> = NgForOfDef as any;
export const NgIf: DirectiveType<NgIfDef> = NgIfDef as any;
export const NgTemplateOutlet: DirectiveType<NgTemplateOutletDef> = NgTemplateOutletDef as any;

NgForOf.ngDirectiveDef = defineDirective({
  type: NgForOfDef,
  selectors: [['', 'ngForOf', '']],
  factory: () => new NgForOfDef(
               directiveInject(ViewContainerRef as any), directiveInject(TemplateRef as any),
               directiveInject(IterableDiffers)),
  inputs: {
    ngForOf: 'ngForOf',
    ngForTrackBy: 'ngForTrackBy',
    ngForTemplate: 'ngForTemplate',
  }
});

(NgIf as any).ngDirectiveDef = defineDirective({
  type: NgIfDef,
  selectors: [['', 'ngIf', '']],
  factory: () => new NgIfDef(
               directiveInject(ViewContainerRef as any), directiveInject(TemplateRef as any)),
  inputs: {ngIf: 'ngIf', ngIfThen: 'ngIfThen', ngIfElse: 'ngIfElse'}
});

(NgTemplateOutlet as any).ngDirectiveDef = defineDirective({
  type: NgTemplateOutletDef,
  selectors: [['', 'ngTemplateOutlet', '']],
  factory: () => new NgTemplateOutletDef(directiveInject(ViewContainerRef as any)),
  features: [NgOnChangesFeature],
  inputs:
      {ngTemplateOutlet: 'ngTemplateOutlet', ngTemplateOutletContext: 'ngTemplateOutletContext'}
});
