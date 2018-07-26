/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defineInjectable, defineInjector,} from '../../di/defs';
import {inject} from '../../di/injector';
import * as r3 from '../index';
import * as sanitization from '../../sanitization/sanitization';


/**
 * A mapping of the @angular/core API surface used in generated expressions to the actual symbols.
 *
 * This should be kept up to date with the public exports of @angular/core.
 */
export const angularCoreEnv: {[name: string]: Function} = {
  'ɵdefineComponent': r3.defineComponent,
  'ɵdefineDirective': r3.defineDirective,
  'defineInjectable': defineInjectable,
  'defineInjector': defineInjector,
  'ɵdefineNgModule': r3.defineNgModule,
  'ɵdefinePipe': r3.definePipe,
  'ɵdirectiveInject': r3.directiveInject,
  'inject': inject,
  'ɵinjectAttribute': r3.injectAttribute,
  'ɵinjectChangeDetectorRef': r3.injectChangeDetectorRef,
  'ɵinjectElementRef': r3.injectElementRef,
  'ɵinjectTemplateRef': r3.injectTemplateRef,
  'ɵinjectViewContainerRef': r3.injectViewContainerRef,
  'ɵNgOnChangesFeature': r3.NgOnChangesFeature,
  'ɵInheritDefinitionFeature': r3.InheritDefinitionFeature,
  'ɵa': r3.a,
  'ɵb': r3.b,
  'ɵC': r3.C,
  'ɵx': r3.x,
  'ɵcR': r3.cR,
  'ɵcr': r3.cr,
  'ɵd': r3.d,
  'ɵql': r3.ql,
  'ɵNH': r3.NH,
  'ɵNM': r3.NM,
  'ɵNS': r3.NS,
  'ɵE': r3.E,
  'ɵe': r3.e,
  'ɵEe': r3.Ee,
  'ɵf0': r3.f0,
  'ɵf1': r3.f1,
  'ɵf2': r3.f2,
  'ɵf3': r3.f3,
  'ɵf4': r3.f4,
  'ɵf5': r3.f5,
  'ɵf6': r3.f6,
  'ɵf7': r3.f7,
  'ɵf8': r3.f8,
  'ɵfV': r3.fV,
  'ɵi1': r3.i1,
  'ɵi2': r3.i2,
  'ɵi3': r3.i3,
  'ɵi4': r3.i4,
  'ɵi5': r3.i5,
  'ɵi6': r3.i6,
  'ɵi7': r3.i7,
  'ɵi8': r3.i8,
  'ɵiV': r3.iV,
  'ɵcp': r3.cp,
  'ɵL': r3.L,
  'ɵld': r3.ld,
  'ɵP': r3.P,
  'ɵp': r3.p,
  'ɵpb1': r3.pb1,
  'ɵpb2': r3.pb2,
  'ɵpb3': r3.pb3,
  'ɵpb4': r3.pb4,
  'ɵpbV': r3.pbV,
  'ɵpD': r3.pD,
  'ɵPp': r3.Pp,
  'ɵQ': r3.Q,
  'ɵqR': r3.qR,
  'ɵQr': r3.Qr,
  'ɵrS': r3.rS,
  'ɵr': r3.r,
  'ɵs': r3.s,
  'ɵsm': r3.sm,
  'ɵsp': r3.sp,
  'ɵsa': r3.sa,
  'ɵT': r3.T,
  'ɵt': r3.t,
  'ɵV': r3.V,
  'ɵv': r3.v,

  'ɵzh': sanitization.sanitizeHtml,
  'ɵzs': sanitization.sanitizeStyle,
  'ɵzss': sanitization.defaultStyleSanitizer,
  'ɵzr': sanitization.sanitizeResourceUrl,
  'ɵzc': sanitization.sanitizeScript,
  'ɵzu': sanitization.sanitizeUrl
};
