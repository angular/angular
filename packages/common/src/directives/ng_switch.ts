/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  DoCheck,
  Host,
  Input,
  Optional,
  ɵRuntimeError as RuntimeError,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import {RuntimeErrorCode} from '../errors';

export class SwitchView {
  private _created = false;

  constructor(
    private _viewContainerRef: ViewContainerRef,
    private _templateRef: TemplateRef<Object>,
  ) {}

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
 * @description
 * The `[ngSwitch]` directive on a container specifies an expression to match against.
 * The expressions to match are provided by `ngSwitchCase` directives on views within the container.
 * - Every view that matches is rendered.
 * - If there are no matches, a view with the `ngSwitchDefault` directive is rendered.
 * - Elements within the `[NgSwitch]` statement but outside of any `NgSwitchCase`
 * or `ngSwitchDefault` directive are preserved at the location.
 *
 * @usageNotes
 * Define a container element for the directive, and specify the switch expression
 * to match against as an attribute:
 *
 * ```html
 * <container-element [ngSwitch]="switch_expression">
 * ```
 *
 * Within the container, `*ngSwitchCase` statements specify the match expressions
 * as attributes. Include `*ngSwitchDefault` as the final case.
 *
 * ```html
 * <container-element [ngSwitch]="switch_expression">
 *    <some-element *ngSwitchCase="match_expression_1">...</some-element>
 * ...
 *    <some-element *ngSwitchDefault>...</some-element>
 * </container-element>
 * ```
 *
 * ### Usage Examples
 *
 * The following example shows how to use more than one case to display the same view:
 *
 * ```html
 * <container-element [ngSwitch]="switch_expression">
 *   <!-- the same view can be shown in more than one case -->
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *   <some-element *ngSwitchCase="match_expression_2">...</some-element>
 *   <some-other-element *ngSwitchCase="match_expression_3">...</some-other-element>
 *   <!--default case when there are no matches -->
 *   <some-element *ngSwitchDefault>...</some-element>
 * </container-element>
 * ```
 *
 * The following example shows how cases can be nested:
 * ```html
 * <container-element [ngSwitch]="switch_expression">
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
 *
 * @publicApi
 * @see {@link NgSwitchCase}
 * @see {@link NgSwitchDefault}
 * @see [Structural Directives](guide/directives/structural-directives)
 *
 * @deprecated 20.0
 * Use the @switch block instead. Intent to remove in v22
 */
@Directive({
  selector: '[ngSwitch]',
})
export class NgSwitch {
  private _defaultViews: SwitchView[] = [];
  private _defaultUsed = false;
  private _caseCount = 0;
  private _lastCaseCheckIndex = 0;
  private _lastCasesMatched = false;
  private _ngSwitch: any;

  /** @deprecated Use the @switch block instead. Intent to remove in v22 */
  @Input()
  set ngSwitch(newValue: any) {
    this._ngSwitch = newValue;
    if (this._caseCount === 0) {
      this._updateDefaultCases(true);
    }
  }

  /** @internal */
  _addCase(): number {
    return this._caseCount++;
  }

  /** @internal */
  _addDefault(view: SwitchView) {
    this._defaultViews.push(view);
  }

  /** @internal */
  _matchCase(value: any): boolean {
    const matched = value === this._ngSwitch;
    this._lastCasesMatched ||= matched;
    this._lastCaseCheckIndex++;
    if (this._lastCaseCheckIndex === this._caseCount) {
      this._updateDefaultCases(!this._lastCasesMatched);
      this._lastCaseCheckIndex = 0;
      this._lastCasesMatched = false;
    }
    return matched;
  }

  private _updateDefaultCases(useDefault: boolean) {
    if (this._defaultViews.length > 0 && useDefault !== this._defaultUsed) {
      this._defaultUsed = useDefault;
      for (const defaultView of this._defaultViews) {
        defaultView.enforceState(useDefault);
      }
    }
  }
}

/**
 * @ngModule CommonModule
 *
 * @description
 * Provides a switch case expression to match against an enclosing `ngSwitch` expression.
 * When the expressions match, the given `NgSwitchCase` template is rendered.
 * If multiple match expressions match the switch expression value, all of them are displayed.
 *
 * @usageNotes
 *
 * Within a switch container, `*ngSwitchCase` statements specify the match expressions
 * as attributes. Include `*ngSwitchDefault` as the final case.
 *
 * ```html
 * <container-element [ngSwitch]="switch_expression">
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *   ...
 *   <some-element *ngSwitchDefault>...</some-element>
 * </container-element>
 * ```
 *
 * Each switch-case statement contains an in-line HTML template or template reference
 * that defines the subtree to be selected if the value of the match expression
 * matches the value of the switch expression.
 *
 * As of Angular v17 the NgSwitch directive uses strict equality comparison (`===`) instead of
 * loose equality (`==`) to match different cases.
 *
 * @publicApi
 * @see {@link NgSwitch}
 * @see {@link NgSwitchDefault}
 *
 * @deprecated 20.0
 * Use the @case block within a @switch block instead. Intent to remove in v22
 */
@Directive({
  selector: '[ngSwitchCase]',
})
export class NgSwitchCase implements DoCheck {
  private _view: SwitchView;
  /**
   * Stores the HTML template to be selected on match.
   * @deprecated Use the @case block within a @switch block instead. Intent to remove in v22
   */
  @Input() ngSwitchCase: any;

  constructor(
    viewContainer: ViewContainerRef,
    templateRef: TemplateRef<Object>,
    @Optional() @Host() private ngSwitch: NgSwitch,
  ) {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !ngSwitch) {
      throwNgSwitchProviderNotFoundError('ngSwitchCase', 'NgSwitchCase');
    }

    ngSwitch._addCase();
    this._view = new SwitchView(viewContainer, templateRef);
  }

  /**
   * Performs case matching. For internal use only.
   * @docs-private
   */
  ngDoCheck() {
    this._view.enforceState(this.ngSwitch._matchCase(this.ngSwitchCase));
  }
}

/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Creates a view that is rendered when no `NgSwitchCase` expressions
 * match the `NgSwitch` expression.
 * This statement should be the final case in an `NgSwitch`.
 *
 * @publicApi
 * @see {@link NgSwitch}
 * @see {@link NgSwitchCase}
 *
 * @deprecated 20.0
 * Use the @default block within a @switch block instead. Intent to remove in v22
 */
@Directive({
  selector: '[ngSwitchDefault]',
})
export class NgSwitchDefault {
  constructor(
    viewContainer: ViewContainerRef,
    templateRef: TemplateRef<Object>,
    @Optional() @Host() ngSwitch: NgSwitch,
  ) {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !ngSwitch) {
      throwNgSwitchProviderNotFoundError('ngSwitchDefault', 'NgSwitchDefault');
    }

    ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
  }
}

function throwNgSwitchProviderNotFoundError(attrName: string, directiveName: string): never {
  throw new RuntimeError(
    RuntimeErrorCode.PARENT_NG_SWITCH_NOT_FOUND,
    `An element with the "${attrName}" attribute ` +
      `(matching the "${directiveName}" directive) must be located inside an element with the "ngSwitch" attribute ` +
      `(matching "NgSwitch" directive)`,
  );
}
