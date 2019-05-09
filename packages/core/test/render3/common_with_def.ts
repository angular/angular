/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOf as NgForOfDef, NgIf as NgIfDef, NgTemplateOutlet as NgTemplateOutletDef} from '@angular/common';
import {IterableDiffers, TemplateRef, ViewContainerRef} from '@angular/core';

import {DirectiveType, ΔNgOnChangesFeature, ΔdefineDirective, ΔdirectiveInject} from '../../src/render3/index';

export const NgForOf: DirectiveType<NgForOfDef<any>> = NgForOfDef as any;
export const NgIf: DirectiveType<NgIfDef> = NgIfDef as any;
export const NgTemplateOutlet: DirectiveType<NgTemplateOutletDef> = NgTemplateOutletDef as any;

NgForOf.ngDirectiveDef = ΔdefineDirective({
  type: NgForOfDef,
  selectors: [['', 'ngForOf', '']],
  factory: () => new NgForOfDef(
               ΔdirectiveInject(ViewContainerRef as any), ΔdirectiveInject(TemplateRef as any),
               ΔdirectiveInject(IterableDiffers)),
  inputs: {
    ngForOf: 'ngForOf',
    ngForTrackBy: 'ngForTrackBy',
    ngForTemplate: 'ngForTemplate',
  }
});

(NgIf as any).ngDirectiveDef = ΔdefineDirective({
  type: NgIfDef,
  selectors: [['', 'ngIf', '']],
  factory: () => new NgIfDef(
               ΔdirectiveInject(ViewContainerRef as any), ΔdirectiveInject(TemplateRef as any)),
  inputs: {ngIf: 'ngIf', ngIfThen: 'ngIfThen', ngIfElse: 'ngIfElse'}
});

(NgTemplateOutlet as any).ngDirectiveDef = ΔdefineDirective({
  type: NgTemplateOutletDef,
  selectors: [['', 'ngTemplateOutlet', '']],
  factory: () => new NgTemplateOutletDef(ΔdirectiveInject(ViewContainerRef as any)),
  features: [ΔNgOnChangesFeature()],
  inputs:
      {ngTemplateOutlet: 'ngTemplateOutlet', ngTemplateOutletContext: 'ngTemplateOutletContext'}
});
