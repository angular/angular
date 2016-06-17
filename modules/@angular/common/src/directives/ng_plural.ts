/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterContentInit, Attribute, ContentChildren, Directive, Input, QueryList, TemplateRef, ViewContainerRef} from '@angular/core';
import {isPresent} from '../facade/lang';
import {NgLocalization, getPluralCategory} from '../localization';
import {SwitchView} from './ng_switch';

/**
 * `ngPlural` is an i18n directive that displays DOM sub-trees that match the switch expression
 * value, or failing that, DOM sub-trees that match the switch expression's pluralization category.
 *
 * To use this directive, you must provide an extension of `NgLocalization` that maps values to
 * category names. You then define a container element that sets the `[ngPlural]` attribute to a
 * switch expression.
 *    - Inner elements defined with an `[ngPluralCase]` attribute will display based on their
 * expression.
 *    - If `[ngPluralCase]` is set to a value starting with `=`, it will only display if the value
 * matches the switch expression exactly.
 *    - Otherwise, the view will be treated as a "category match", and will only display if exact
 * value matches aren't found and the value maps to its category using the `getPluralCategory`
 * function provided.
 *
 * ```typescript
 * class MyLocalization extends NgLocalization {
 *    getPluralCategory(value: any) {
 *       if(value < 5) {
 *          return 'few';
 *       }
 *    }
 * }
 *
 * @Component({
 *    selector: 'app',
 *    providers: [{provide: NgLocalization, useClass: MyLocalization}]
 * })
 * @View({
 *   template: `
 *     <p>Value = {{value}}</p>
 *     <button (click)="inc()">Increment</button>
 *
 *     <div [ngPlural]="value">
 *       <template ngPluralCase="=0">there is nothing</template>
 *       <template ngPluralCase="=1">there is one</template>
 *       <template ngPluralCase="few">there are a few</template>
 *       <template ngPluralCase="other">there is some number</template>
 *     </div>
 *   `,
 *   directives: [NgPlural, NgPluralCase]
 * })
 * export class App {
 *   value = 'init';
 *
 *   inc() {
 *     this.value = this.value === 'init' ? 0 : this.value + 1;
 *   }
 * }
 *
 * ```
 * @experimental
 */

@Directive({selector: '[ngPluralCase]'})
export class NgPluralCase {
  /** @internal */
  _view: SwitchView;
  constructor(
      @Attribute('ngPluralCase') public value: string, template: TemplateRef<Object>,
      viewContainer: ViewContainerRef) {
    this._view = new SwitchView(viewContainer, template);
  }
}

/**
 * @experimental
 */
@Directive({selector: '[ngPlural]'})
export class NgPlural implements AfterContentInit {
  private _switchValue: number;
  private _activeView: SwitchView;
  private _caseViews: {[k: string]: SwitchView} = {};
  @ContentChildren(NgPluralCase) cases: QueryList<NgPluralCase> = null;

  constructor(private _localization: NgLocalization) {}

  @Input()
  set ngPlural(value: number) {
    this._switchValue = value;
    this._updateView();
  }

  ngAfterContentInit() {
    this.cases.forEach((pluralCase: NgPluralCase): void => {
      this._caseViews[pluralCase.value] = pluralCase._view;
    });
    this._updateView();
  }

  /** @internal */
  _updateView(): void {
    this._clearViews();

    var key = getPluralCategory(
        this._switchValue, Object.getOwnPropertyNames(this._caseViews), this._localization);
    this._activateView(this._caseViews[key]);
  }

  /** @internal */
  _clearViews() {
    if (isPresent(this._activeView)) this._activeView.destroy();
  }

  /** @internal */
  _activateView(view: SwitchView) {
    if (!isPresent(view)) return;
    this._activeView = view;
    this._activeView.create();
  }
}
