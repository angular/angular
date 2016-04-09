import {Directive, Host, ViewContainerRef, TemplateRef} from 'angular2/core';
import {isPresent, isBlank, normalizeBlank, CONST_EXPR} from 'angular2/src/facade/lang';
import {ListWrapper, Map} from 'angular2/src/facade/collection';

const _WHEN_DEFAULT = CONST_EXPR(new Object());

export class SwitchView {
  constructor(private _viewContainerRef: ViewContainerRef, private _templateRef: TemplateRef) {}

  create(): void { this._viewContainerRef.createEmbeddedView(this._templateRef); }

  destroy(): void { this._viewContainerRef.clear(); }
}

/**
 * Adds or removes DOM sub-trees when their match expressions match the switch expression.
 *
 * Elements within `NgSwitch` but without `NgSwitchWhen` or `NgSwitchDefault` directives will be
 * preserved at the location as specified in the template.
 *
 * `NgSwitch` simply inserts nested elements based on which match expression matches the value
 * obtained from the evaluated switch expression. In other words, you define a container element
 * (where you place the directive with a switch expression on the
 * `[ngSwitch]="..."` attribute), define any inner elements inside of the directive and
 * place a `[ngSwitchWhen]` attribute per element.
 *
 * The `ngSwitchWhen` property is used to inform `NgSwitch` which element to display when the
 * expression is evaluated. If a matching expression is not found via a `ngSwitchWhen` property
 * then an element with the `ngSwitchDefault` attribute is displayed.
 *
 * ### Example ([live demo](http://plnkr.co/edit/DQMTII95CbuqWrl3lYAs?p=preview))
 *
 * ```typescript
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <p>Value = {{value}}</p>
 *     <button (click)="inc()">Increment</button>
 *
 *     <div [ngSwitch]="value">
 *       <p *ngSwitchWhen="'init'">increment to start</p>
 *       <p *ngSwitchWhen="0">0, increment again</p>
 *       <p *ngSwitchWhen="1">1, increment again</p>
 *       <p *ngSwitchWhen="2">2, stop incrementing</p>
 *       <p *ngSwitchDefault>&gt; 2, STOP!</p>
 *     </div>
 *
 *     <!-- alternate syntax -->
 *
 *     <p [ngSwitch]="value">
 *       <template ngSwitchWhen="init">increment to start</template>
 *       <template [ngSwitchWhen]="0">0, increment again</template>
 *       <template [ngSwitchWhen]="1">1, increment again</template>
 *       <template [ngSwitchWhen]="2">2, stop incrementing</template>
 *       <template ngSwitchDefault>&gt; 2, STOP!</template>
 *     </p>
 *   `,
 *   directives: [NgSwitch, NgSwitchWhen, NgSwitchDefault]
 * })
 * export class App {
 *   value = 'init';
 *
 *   inc() {
 *     this.value = this.value === 'init' ? 0 : this.value + 1;
 *   }
 * }
 *
 * bootstrap(App).catch(err => console.error(err));
 * ```
 */
@Directive({selector: '[ngSwitch]', inputs: ['ngSwitch']})
export class NgSwitch {
  private _switchValue: any;
  private _useDefault: boolean = false;
  private _valueViews = new Map<any, SwitchView[]>();
  private _activeViews: SwitchView[] = [];

  set ngSwitch(value: any) {
    // Empty the currently active ViewContainers
    this._emptyAllActiveViews();

    // Add the ViewContainers matching the value (with a fallback to default)
    this._useDefault = false;
    var views = this._valueViews.get(value);
    if (isBlank(views)) {
      this._useDefault = true;
      views = normalizeBlank(this._valueViews.get(_WHEN_DEFAULT));
    }
    this._activateViews(views);

    this._switchValue = value;
  }

  /** @internal */
  _onWhenValueChanged(oldWhen: any, newWhen: any, view: SwitchView): void {
    this._deregisterView(oldWhen, view);
    this._registerView(newWhen, view);

    if (oldWhen === this._switchValue) {
      view.destroy();
      ListWrapper.remove(this._activeViews, view);
    } else if (newWhen === this._switchValue) {
      if (this._useDefault) {
        this._useDefault = false;
        this._emptyAllActiveViews();
      }
      view.create();
      this._activeViews.push(view);
    }

    // Switch to default when there is no more active ViewContainers
    if (this._activeViews.length === 0 && !this._useDefault) {
      this._useDefault = true;
      this._activateViews(this._valueViews.get(_WHEN_DEFAULT));
    }
  }

  /** @internal */
  _emptyAllActiveViews(): void {
    var activeContainers = this._activeViews;
    for (var i = 0; i < activeContainers.length; i++) {
      activeContainers[i].destroy();
    }
    this._activeViews = [];
  }

  /** @internal */
  _activateViews(views: SwitchView[]): void {
    // TODO(vicb): assert(this._activeViews.length === 0);
    if (isPresent(views)) {
      for (var i = 0; i < views.length; i++) {
        views[i].create();
      }
      this._activeViews = views;
    }
  }

  /** @internal */
  _registerView(value: any, view: SwitchView): void {
    var views = this._valueViews.get(value);
    if (isBlank(views)) {
      views = [];
      this._valueViews.set(value, views);
    }
    views.push(view);
  }

  /** @internal */
  _deregisterView(value: any, view: SwitchView): void {
    // `_WHEN_DEFAULT` is used a marker for non-registered whens
    if (value === _WHEN_DEFAULT) return;
    var views = this._valueViews.get(value);
    if (views.length == 1) {
      this._valueViews.delete(value);
    } else {
      ListWrapper.remove(views, view);
    }
  }
}

/**
 * Insert the sub-tree when the `ngSwitchWhen` expression evaluates to the same value as the
 * enclosing switch expression.
 *
 * If multiple match expression match the switch expression value, all of them are displayed.
 *
 * See {@link NgSwitch} for more details and example.
 */
@Directive({selector: '[ngSwitchWhen]', inputs: ['ngSwitchWhen']})
export class NgSwitchWhen {
  // `_WHEN_DEFAULT` is used as a marker for a not yet initialized value
  /** @internal */
  _value: any = _WHEN_DEFAULT;
  /** @internal */
  _view: SwitchView;
  private _switch: NgSwitch;

  constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef,
              @Host() ngSwitch: NgSwitch) {
    this._switch = ngSwitch;
    this._view = new SwitchView(viewContainer, templateRef);
  }

  set ngSwitchWhen(value: any) {
    this._switch._onWhenValueChanged(this._value, value, this._view);
    this._value = value;
  }
}

/**
 * Default case statements are displayed when no match expression matches the switch expression
 * value.
 *
 * See {@link NgSwitch} for more details and example.
 */
@Directive({selector: '[ngSwitchDefault]'})
export class NgSwitchDefault {
  constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef,
              @Host() sswitch: NgSwitch) {
    sswitch._registerView(_WHEN_DEFAULT, new SwitchView(viewContainer, templateRef));
  }
}
