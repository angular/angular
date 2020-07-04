/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOf as NgForOfDef, NgIf as NgIfDef, NgTemplateOutlet as NgTemplateOutletDef} from '@angular/common';
import {IterableDiffers, NgIterable, TemplateRef, ViewContainerRef} from '@angular/core';

import {DirectiveType, ɵɵdefineDirective, ɵɵdirectiveInject, ɵɵNgOnChangesFeature} from '../../src/render3/index';

export const NgForOf: DirectiveType<NgForOfDef<any, NgIterable<any>>> = NgForOfDef as any;
export const NgIf: DirectiveType<NgIfDef<any>> = NgIfDef as any;
export const NgTemplateOutlet: DirectiveType<NgTemplateOutletDef> = NgTemplateOutletDef as any;

NgForOf.ɵdir = ɵɵdefineDirective({
  type: NgForOfDef,
  selectors: [['', 'ngForOf', '']],
  inputs: {
    ngForOf: 'ngForOf',
    ngForTrackBy: 'ngForTrackBy',
    ngForTemplate: 'ngForTemplate',
  }
});

NgForOf.ɵfac = () => new NgForOfDef(
    ɵɵdirectiveInject(ViewContainerRef as any), ɵɵdirectiveInject(TemplateRef as any),
    ɵɵdirectiveInject(IterableDiffers));

NgIf.ɵdir = ɵɵdefineDirective({
  type: NgIfDef,
  selectors: [['', 'ngIf', '']],
  inputs: {ngIf: 'ngIf', ngIfThen: 'ngIfThen', ngIfElse: 'ngIfElse'}
});

NgIf.ɵfac = () =>
    new NgIfDef(ɵɵdirectiveInject(ViewContainerRef as any), ɵɵdirectiveInject(TemplateRef as any));

NgTemplateOutlet.ɵdir = ɵɵdefineDirective({
  type: NgTemplateOutletDef,
  selectors: [['', 'ngTemplateOutlet', '']],
  features: [ɵɵNgOnChangesFeature],
  inputs: {ngTemplateOutlet: 'ngTemplateOutlet', ngTemplateOutletContext: 'ngTemplateOutletContext'}
});

NgTemplateOutlet.ɵfac = () => new NgTemplateOutletDef(ɵɵdirectiveInject(ViewContainerRef as any));
