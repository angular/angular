/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directive, DoCheck, Input, ɵRenderFlags, ɵɵdefineDirective, ɵɵstyleMap, ɵɵstyling, ɵɵstylingApply} from '@angular/core';

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

// used when the VE is not present (note the directive will
// never be instantiated normally because it is apart of a
// base class)
export const ngStyleDirectiveDef__POST_R3__ = ɵɵdefineDirective({
  type: function() {} as any,
  selectors: null as any,
  factory: () => {},
  hostBindings: function(rf: ɵRenderFlags, ctx: any, elIndex: number) {
    if (rf & ɵRenderFlags.Create) {
      ɵɵstyling();
    }
    if (rf & ɵRenderFlags.Update) {
      ɵɵstyleMap(ctx.getValue());
      ɵɵstylingApply();
    }
  }
});

export const ngStyleDirectiveDef = ngStyleDirectiveDef__PRE_R3__;

/**
 * Serves as the base non-VE container for NgStyle.
 *
 * While this is a base class that NgStyle extends from, the
 * class itself acts as a container for non-VE code to setup
 * a link to the `[style]` host binding (via the static
 * `ngDirectiveDef` property on the class).
 *
 * Note that the `ngDirectiveDef` property's code is switched
 * depending if VE is present or not (this allows for the
 * binding code to be set only for newer versions of Angular).
 *
 * @publicApi
 */
export class NgStyleBase {
  static ngDirectiveDef: any = ngStyleDirectiveDef;

  constructor(protected _delegate: NgStyleImpl) {}

  getValue() { return this._delegate.getValue(); }
}

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
export class NgStyle extends NgStyleBase implements DoCheck {
  constructor(delegate: NgStyleImpl) { super(delegate); }

  @Input('ngStyle')
  set ngStyle(value: {[klass: string]: any}|null) { this._delegate.setNgStyle(value); }

  ngDoCheck() { this._delegate.applyChanges(); }
}
