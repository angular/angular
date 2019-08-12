/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOf as NgForOfDef, NgIf as NgIfDef, NgTemplateOutlet as NgTemplateOutletDef} from '@angular/common';
import {IterableDiffers, TemplateRef, ViewContainerRef} from '@angular/core';

import {DirectiveType, ɵɵNgOnChangesFeature, ɵɵdefineDirective, ɵɵdirectiveInject} from '../../src/render3/index';

export const NgForOf: DirectiveType<NgForOfDef<any>> = NgForOfDef as any;
export const NgIf: DirectiveType<NgIfDef> = NgIfDef as any;
export const NgTemplateOutlet: DirectiveType<NgTemplateOutletDef> = NgTemplateOutletDef as any;

NgForOf.ngDirectiveDef = ɵɵdefineDirective({
  type: NgForOfDef,
  selectors: [['', 'ngForOf', '']],
  inputs: {
    ngForOf: 'ngForOf',
    ngForTrackBy: 'ngForTrackBy',
    ngForTemplate: 'ngForTemplate',
  }
});

NgForOf.ngFactoryFn = () => new NgForOfDef(
    ɵɵdirectiveInject(ViewContainerRef as any), ɵɵdirectiveInject(TemplateRef as any),
    ɵɵdirectiveInject(IterableDiffers));

NgIf.ngDirectiveDef = ɵɵdefineDirective({
  type: NgIfDef,
  selectors: [['', 'ngIf', '']],
  inputs: {ngIf: 'ngIf', ngIfThen: 'ngIfThen', ngIfElse: 'ngIfElse'}
});

NgIf.ngFactoryFn = () =>
    new NgIfDef(ɵɵdirectiveInject(ViewContainerRef as any), ɵɵdirectiveInject(TemplateRef as any));

NgTemplateOutlet.ngDirectiveDef = ɵɵdefineDirective({
  type: NgTemplateOutletDef,
  selectors: [['', 'ngTemplateOutlet', '']],
  features: [ɵɵNgOnChangesFeature()],
  inputs:
      {ngTemplateOutlet: 'ngTemplateOutlet', ngTemplateOutletContext: 'ngTemplateOutletContext'}
});

NgTemplateOutlet.ngFactoryFn = () =>
    new NgTemplateOutletDef(ɵɵdirectiveInject(ViewContainerRef as any));
