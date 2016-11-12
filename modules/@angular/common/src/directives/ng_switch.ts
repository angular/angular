/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, DoCheck, Host, Input, TemplateRef, ViewContainerRef} from '@angular/core';

export class SwitchView {
  private _created = false;

  constructor(
      private _viewContainerRef: ViewContainerRef, private _templateRef: TemplateRef<Object>) {}

  create(): void {
    this._created = true;
    this._viewContainerRef.createEmbeddedView(this._templateRef);
  }

  destroy(): void {
    this._created = false;
    this._viewContainerRef.clear();
  }

  enforceState(created: boolean) {
    if (created && !this._created) {
      this.create();
    } else if (!created && this._created) {
      this.destroy();
    }
  }
}

/**
 * @ngModule CommonModule
 *
 * @whatItDoes Adds / removes DOM sub-trees when the nest match expressions matches the switch
 *             expression.
 *
 * @howToUse
 * ```
 *     <container-element [ngSwitch]="switch_expression">
 *       <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *       <some-element *ngSwitchCase="match_expression_2">...</some-element>
 *       <some-other-element *ngSwitchCase="match_expression_3">...</some-other-element>
 *       <ng-container *ngSwitchCase="match_expression_3">
 *         <!-- use a ng-container to group multiple root nodes -->
 *         <inner-element></inner-element>
 *         <inner-other-element></inner-other-element>
 *       </ng-container>
 *       <some-element *ngSwitchDefault>...</some-element>
 *     </container-element>
 * ```
 * @description
 *
 * `NgSwitch` stamps out nested views when their match expression value matches the value of the
 * switch expression.
 *
 * In other words:
 * - you define a container element (where you place the directive with a switch expression on the
 * `[ngSwitch]="..."` attribute)
 * - you define inner views inside the `NgSwitch` and place a `*ngSwitchCase` attribute on the view
 * root elements.
 *
 * Elements within `NgSwitch` but outside of a `NgSwitchCase` or `NgSwitchDefault` directives will
 * be preserved at the location.
 *
 * The `ngSwitchCase` directive informs the parent `NgSwitch` of which view to display when the
 * expression is evaluated.
 * When no matching expression is found on a `ngSwitchCase` view, the `ngSwitchDefault` view is
 * stamped out.
 *
 * @stable
 */
@Directive({selector: '[ngSwitch]'})
export class NgSwitch {
  private _defaultViews: SwitchView[];
  private _defaultUsed = false;
  private _caseCount = 0;
  private _lastCaseCheckIndex = 0;
  private _lastCasesMatched = false;
  private _ngSwitch: any;

  @Input()
  set ngSwitch(newValue: any) {
    this._ngSwitch = newValue;
    if (this._caseCount === 0) {
      this._updateDefaultCases(true);
    }
  }

  /** @internal */
  _addCase(): number { return this._caseCount++; }

  /** @internal */
  _addDefault(view: SwitchView) {
    if (!this._defaultViews) {
      this._defaultViews = [];
    }
    this._defaultViews.push(view);
  }

  /** @internal */
  _matchCase(value: any): boolean {
    const matched = value == this._ngSwitch;
    this._lastCasesMatched = this._lastCasesMatched || matched;
    this._lastCaseCheckIndex++;
    if (this._lastCaseCheckIndex === this._caseCount) {
      this._updateDefaultCases(!this._lastCasesMatched);
      this._lastCaseCheckIndex = 0;
      this._lastCasesMatched = false;
    }
    return matched;
  }

  private _updateDefaultCases(useDefault: boolean) {
    if (this._defaultViews && useDefault !== this._defaultUsed) {
      this._defaultUsed = useDefault;
      for (let i = 0; i < this._defaultViews.length; i++) {
        const defaultView = this._defaultViews[i];
        defaultView.enforceState(useDefault);
      }
    }
  }
}

/**
 * @ngModule CommonModule
 *
 * @whatItDoes Creates a view that will be added/removed from the parent {@link NgSwitch} when the
 *             given expression evaluate to respectively the same/different value as the switch
 *             expression.
 *
 * @howToUse
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 * </container-element>
 *```
 * @description
 *
 * Insert the sub-tree when the expression evaluates to the same value as the enclosing switch
 * expression.
 *
 * If multiple match expressions match the switch expression value, all of them are displayed.
 *
 * See {@link NgSwitch} for more details and example.
 *
 * @stable
 */
@Directive({selector: '[ngSwitchCase]'})
export class NgSwitchCase implements DoCheck {
  private _view: SwitchView;

  @Input()
  ngSwitchCase: any;

  constructor(
      viewContainer: ViewContainerRef, templateRef: TemplateRef<Object>,
      @Host() private ngSwitch: NgSwitch) {
    ngSwitch._addCase();
    this._view = new SwitchView(viewContainer, templateRef);
  }

  ngDoCheck() { this._view.enforceState(this.ngSwitch._matchCase(this.ngSwitchCase)); }
}

/**
 * @ngModule CommonModule
 * @whatItDoes Creates a view that is added to the parent {@link NgSwitch} when no case expressions
 * match the
 *             switch expression.
 *
 * @howToUse
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *   <some-other-element *ngSwitchDefault>...</some-other-element>
 * </container-element>
 * ```
 *
 * @description
 *
 * Insert the sub-tree when no case expressions evaluate to the same value as the enclosing switch
 * expression.
 *
 * See {@link NgSwitch} for more details and example.
 *
 * @stable
 */
@Directive({selector: '[ngSwitchDefault]'})
export class NgSwitchDefault {
  constructor(
      viewContainer: ViewContainerRef, templateRef: TemplateRef<Object>,
      @Host() ngSwitch: NgSwitch) {
    ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
  }
}
