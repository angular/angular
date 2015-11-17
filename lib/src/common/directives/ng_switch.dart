library angular2.src.common.directives.ng_switch;

import "package:angular2/src/core/metadata.dart" show Directive;
import "package:angular2/src/core/di.dart" show Host;
import "package:angular2/src/core/linker.dart"
    show ViewContainerRef, TemplateRef;
import "package:angular2/src/facade/lang.dart" show isPresent, isBlank;
import "package:angular2/src/facade/collection.dart" show ListWrapper, Map;

const _WHEN_DEFAULT = const Object();

class SwitchView {
  ViewContainerRef _viewContainerRef;
  TemplateRef _templateRef;
  SwitchView(this._viewContainerRef, this._templateRef) {}
  void create() {
    this._viewContainerRef.createEmbeddedView(this._templateRef);
  }

  void destroy() {
    this._viewContainerRef.clear();
  }
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
 * **`[ng-switch]="..."` attribute**), define any inner elements inside of the directive and
 * place a `[ng-switch-when]` attribute per element.
 *
 * The `ng-switch-when` property is used to inform `NgSwitch` which element to display when the
 * expression is evaluated. If a matching expression is not found via a `ng-switch-when` property
 * then an element with the `ng-switch-default` attribute is displayed.
 *
 * ### Example ([live demo](http://plnkr.co/edit/DQMTII95CbuqWrl3lYAs?p=preview))
 *
 * ```typescript
 * @Component({selector: 'app'})
 * @View({
 *   template: `
 *     <p>Value = {{value}}</p>
 *     <button (click)="inc()">Increment</button>
 *
 *     <div [ng-switch]="value">
 *       <p *ng-switch-when="'init'">increment to start</p>
 *       <p *ng-switch-when="0">0, increment again</p>
 *       <p *ng-switch-when="1">1, increment again</p>
 *       <p *ng-switch-when="2">2, stop incrementing</p>
 *       <p *ng-switch-default>&gt; 2, STOP!</p>
 *     </div>
 *
 *     <!-- alternate syntax -->
 *
 *     <p [ng-switch]="value">
 *       <template ng-switch-when="init">increment to start</template>
 *       <template [ng-switch-when]="0">0, increment again</template>
 *       <template [ng-switch-when]="1">1, increment again</template>
 *       <template [ng-switch-when]="2">2, stop incrementing</template>
 *       <template ng-switch-default>&gt; 2, STOP!</template>
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
@Directive(selector: "[ng-switch]", inputs: const ["ngSwitch"])
class NgSwitch {
  dynamic _switchValue;
  bool _useDefault = false;
  var _valueViews = new Map<dynamic, List<SwitchView>>();
  List<SwitchView> _activeViews = [];
  set ngSwitch(value) {
    // Empty the currently active ViewContainers
    this._emptyAllActiveViews();
    // Add the ViewContainers matching the value (with a fallback to default)
    this._useDefault = false;
    var views = this._valueViews[value];
    if (isBlank(views)) {
      this._useDefault = true;
      views = this._valueViews[_WHEN_DEFAULT];
    }
    this._activateViews(views);
    this._switchValue = value;
  }

  /** @internal */
  void _onWhenValueChanged(oldWhen, newWhen, SwitchView view) {
    this._deregisterView(oldWhen, view);
    this._registerView(newWhen, view);
    if (identical(oldWhen, this._switchValue)) {
      view.destroy();
      ListWrapper.remove(this._activeViews, view);
    } else if (identical(newWhen, this._switchValue)) {
      if (this._useDefault) {
        this._useDefault = false;
        this._emptyAllActiveViews();
      }
      view.create();
      this._activeViews.add(view);
    }
    // Switch to default when there is no more active ViewContainers
    if (identical(this._activeViews.length, 0) && !this._useDefault) {
      this._useDefault = true;
      this._activateViews(this._valueViews[_WHEN_DEFAULT]);
    }
  }

  /** @internal */
  void _emptyAllActiveViews() {
    var activeContainers = this._activeViews;
    for (var i = 0; i < activeContainers.length; i++) {
      activeContainers[i].destroy();
    }
    this._activeViews = [];
  }

  /** @internal */
  void _activateViews(List<SwitchView> views) {
    // TODO(vicb): assert(this._activeViews.length === 0);
    if (isPresent(views)) {
      for (var i = 0; i < views.length; i++) {
        views[i].create();
      }
      this._activeViews = views;
    }
  }

  /** @internal */
  void _registerView(value, SwitchView view) {
    var views = this._valueViews[value];
    if (isBlank(views)) {
      views = [];
      this._valueViews[value] = views;
    }
    views.add(view);
  }

  /** @internal */
  void _deregisterView(value, SwitchView view) {
    // `_WHEN_DEFAULT` is used a marker for non-registered whens
    if (identical(value, _WHEN_DEFAULT)) return;
    var views = this._valueViews[value];
    if (views.length == 1) {
      (this._valueViews.containsKey(value) &&
          (this._valueViews.remove(value) != null || true));
    } else {
      ListWrapper.remove(views, view);
    }
  }
}

/**
 * Insert the sub-tree when the `ng-switch-when` expression evaluates to the same value as the
 * enclosing switch expression.
 *
 * If multiple match expression match the switch expression value, all of them are displayed.
 *
 * See [NgSwitch] for more details and example.
 */
@Directive(selector: "[ng-switch-when]", inputs: const ["ngSwitchWhen"])
class NgSwitchWhen {
  // `_WHEN_DEFAULT` is used as a marker for a not yet initialized value

  /** @internal */
  dynamic _value = _WHEN_DEFAULT;
  /** @internal */
  SwitchView _view;
  NgSwitch _switch;
  NgSwitchWhen(ViewContainerRef viewContainer, TemplateRef templateRef,
      @Host() NgSwitch ngSwitch) {
    this._switch = ngSwitch;
    this._view = new SwitchView(viewContainer, templateRef);
  }
  set ngSwitchWhen(value) {
    this._switch._onWhenValueChanged(this._value, value, this._view);
    this._value = value;
  }
}

/**
 * Default case statements are displayed when no match expression matches the switch expression
 * value.
 *
 * See [NgSwitch] for more details and example.
 */
@Directive(selector: "[ng-switch-default]")
class NgSwitchDefault {
  NgSwitchDefault(ViewContainerRef viewContainer, TemplateRef templateRef,
      @Host() NgSwitch sswitch) {
    sswitch._registerView(
        _WHEN_DEFAULT, new SwitchView(viewContainer, templateRef));
  }
}
