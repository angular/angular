/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directive, DoCheck, Input, ɵRenderFlags, ɵɵallocHostVars, ɵɵclassMap, ɵɵdefineDirective, ɵɵstyling, ɵɵstylingApply} from '@angular/core';

import {NgClassImpl, NgClassImplProvider} from './ng_class_impl';



/*
 * NgClass (as well as NgStyle) behaves differently when loaded in the VE and when not.
 *
 * If the VE is present (which is for older versions of Angular) then NgClass will inject
 * the legacy diffing algorithm as a service and delegate all styling changes to that.
 *
 * If the VE is not present then NgStyle will normalize (through the injected service) and
 * then write all styling changes to the `[style]` binding directly (through a host binding).
 * Then Angular will notice the host binding change and treat the changes as styling
 * changes and apply them via the core styling instructions that exist within Angular.
 */

// used when the VE is present
export const ngClassDirectiveDef__PRE_R3__ = undefined;

// used when the VE is not present (note the directive will
// never be instantiated normally because it is apart of a
// base class)
export const ngClassDirectiveDef__POST_R3__ = ɵɵdefineDirective({
  type: function() {} as any,
  selectors: null as any,
  factory: () => {},
  hostBindings: function(rf: ɵRenderFlags, ctx: any, elIndex: number) {
    if (rf & ɵRenderFlags.Create) {
      ɵɵallocHostVars(1);
      ɵɵstyling();
    }
    if (rf & ɵRenderFlags.Update) {
      ɵɵclassMap(ctx.getValue());
      ɵɵstylingApply();
    }
  }
});

export const ngClassDirectiveDef = ngClassDirectiveDef__PRE_R3__;

/**
 * Serves as the base non-VE container for NgClass.
 *
 * While this is a base class that NgClass extends from, the
 * class itself acts as a container for non-VE code to setup
 * a link to the `[class]` host binding (via the static
 * `ngDirectiveDef` property on the class).
 *
 * Note that the `ngDirectiveDef` property's code is switched
 * depending if VE is present or not (this allows for the
 * binding code to be set only for newer versions of Angular).
 *
 * @publicApi
 */
export class NgClassBase {
  static ngDirectiveDef: any = ngClassDirectiveDef;

  constructor(protected _delegate: NgClassImpl) {}

  getValue() { return this._delegate.getValue(); }
}

/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```
 *     <some-element [ngClass]="'first second'">...</some-element>
 *
 *     <some-element [ngClass]="['first', 'second']">...</some-element>
 *
 *     <some-element [ngClass]="{'first': true, 'second': true, 'third': false}">...</some-element>
 *
 *     <some-element [ngClass]="stringExp|arrayExp|objExp">...</some-element>
 *
 *     <some-element [ngClass]="{'class1 class2 class3' : true}">...</some-element>
 * ```
 *
 * @description
 *
 * Adds and removes CSS classes on an HTML element.
 *
 * The CSS classes are updated as follows, depending on the type of the expression evaluation:
 * - `string` - the CSS classes listed in the string (space delimited) are added,
 * - `Array` - the CSS classes declared as Array elements are added,
 * - `Object` - keys are CSS classes that get added when the expression given in the value
 *              evaluates to a truthy value, otherwise they are removed.
 *
 * @publicApi
 */
@Directive({selector: '[ngClass]', providers: [NgClassImplProvider]})
export class NgClass extends NgClassBase implements DoCheck {
  constructor(delegate: NgClassImpl) { super(delegate); }

  @Input('class')
  set klass(value: string) { this._delegate.setClass(value); }

  @Input('ngClass')
  set ngClass(value: string|string[]|Set<string>|{[klass: string]: any}) {
    this._delegate.setNgClass(value);
  }

  ngDoCheck() { this._delegate.applyChanges(); }
}
