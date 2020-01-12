/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directive, DoCheck, Input, ɵRenderFlags, ɵɵallocHostVars, ɵɵdefineDirective, ɵɵstyleMap} from '@angular/core';

import {NgStyleImpl, NgStyleImplProvider} from './ng_style_impl';



/*
 * NgStyle (as well as NgClass) behaves differently when loaded in the VE and when not.
 *
 * If the VE is present (which is for older versions of Angular) then NgStyle will inject
 * the legacy diffing algorithm as a service and delegate all styling changes to that.
 *
 * If the VE is not present then NgStyle will normalize (through the injected service) and
 * then write all styling changes to the `[style]` binding directly (through a host binding).
 * Then Angular will notice the host binding change and treat the changes as styling
 * changes and apply them via the core styling instructions that exist within Angular.
 */

// used when the VE is present
export const ngStyleDirectiveDef__PRE_R3__ = undefined;
export const ngStyleFactoryDef__PRE_R3__ = undefined;

// used when the VE is not present (note the directive will
// never be instantiated normally because it is apart of a
// base class)
export const ngStyleDirectiveDef__POST_R3__ = ɵɵdefineDirective({
  type: function() {} as any,
  selectors: null as any,
  hostBindings: function(rf: ɵRenderFlags, ctx: any, elIndex: number) {
    if (rf & ɵRenderFlags.Create) {
      ɵɵallocHostVars(2);
    }
    if (rf & ɵRenderFlags.Update) {
      ɵɵstyleMap(ctx.getValue());
    }
  }
});

export const ngStyleFactoryDef__POST_R3__ = function() {};

export const ngStyleDirectiveDef = ngStyleDirectiveDef__PRE_R3__;
export const ngStyleFactoryDef = ngStyleDirectiveDef__PRE_R3__;


/**
 * @ngModule CommonModule
 *
 * @usageNotes
 *
 * Set the font of the containing element to the result of an expression.
 *
 * ```
 * <some-element [ngStyle]="{'font-style': styleExp}">...</some-element>
 * ```
 *
 * Set the width of the containing element to a pixel value returned by an expression.
 *
 * ```
 * <some-element [ngStyle]="{'max-width.px': widthExp}">...</some-element>
 * ```
 *
 * Set a collection of style values using an expression that returns key-value pairs.
 *
 * ```
 * <some-element [ngStyle]="objExp">...</some-element>
 * ```
 *
 * @description
 *
 * An attribute directive that updates styles for the containing HTML element.
 * Sets one or more style properties, specified as colon-separated key-value pairs.
 * The key is a style name, with an optional `.<unit>` suffix
 * (such as 'top.px', 'font-style.em').
 * The value is an expression to be evaluated.
 * The resulting non-null value, expressed in the given unit,
 * is assigned to the given style property.
 * If the result of evaluation is null, the corresponding style is removed.
 *
 * @publicApi
 */
@Directive({selector: '[ngStyle]', providers: [NgStyleImplProvider]})
export class NgStyle implements DoCheck {
  static ɵdir: never = ngStyleDirectiveDef as never;
  static ɵfac: never = ngStyleFactoryDef as never;

  constructor(private _delegate: NgStyleImpl) {}

  @Input('ngStyle')
  set ngStyle(value: {[klass: string]: any}|null) { this._delegate.setNgStyle(value); }

  ngDoCheck() { this._delegate.applyChanges(); }

  getValue() { return this._delegate.getValue(); }
}
