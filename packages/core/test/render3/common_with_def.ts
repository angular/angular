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
