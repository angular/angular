import {
  OpaqueToken,
  ComponentRef,
  DynamicComponentLoader,
  Injector,
  Injectable,
  ViewMetadata,
  ElementRef,
  EmbeddedViewRef,
  ChangeDetectorRef,
  provide,
  NgZone,
  NgZoneError
} from 'angular2/core';
import {DirectiveResolver, ViewResolver} from 'angular2/compiler';

import {BaseException} from 'angular2/src/facade/exceptions';
import {Type, isPresent, isBlank, IS_DART} from 'angular2/src/facade/lang';
import {PromiseWrapper, ObservableWrapper, PromiseCompleter} from 'angular2/src/facade/async';
import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';

import {el} from './utils';

import {DOCUMENT} from 'angular2/src/platform/dom/dom_tokens';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';

import {DebugNode, DebugElement, getDebugNode} from 'angular2/src/core/debug/debug_node';

import {tick} from './fake_async';

export var ComponentFixtureAutoDetect = new OpaqueToken("ComponentFixtureAutoDetect");
export var ComponentFixtureNoNgZone = new OpaqueToken("ComponentFixtureNoNgZone");

/**
 * Fixture for debugging and testing a component.
 */
export class ComponentFixture {
  /**
   * The DebugElement associated with the root element of this component.
   */
  debugElement: DebugElement;

  /**
   * The instance of the root component class.
   */
  componentInstance: any;

  /**
   * The native element at the root of the component.
   */
  nativeElement: any;

  /**
   * The ElementRef for the element at the root of the component.
   */
  elementRef: ElementRef;

  /**
   * The ComponentRef for the component
   */
  componentRef: ComponentRef;

  /**
   * The ChangeDetectorRef for the component
   */
  changeDetectorRef: ChangeDetectorRef;

  /**
   * The NgZone in which this component was instantiated.
   */
  ngZone: NgZone;

  private _autoDetect: boolean;

  private _isStable: boolean = true;
  private _completer: PromiseCompleter<any> = null;
  private _onUnstableSubscription = null;
  private _onStableSubscription = null;
  private _onMicrotaskEmptySubscription = null;
  private _onErrorSubscription = null;

  constructor(componentRef: ComponentRef, ngZone: NgZone, autoDetect: boolean) {
    this.changeDetectorRef = componentRef.changeDetectorRef;
    this.elementRef = componentRef.location;
    this.debugElement = <DebugElement>getDebugNode(this.elementRef.nativeElement);
    this.componentInstance = componentRef.instance;
    this.nativeElement = this.elementRef.nativeElement;
    this.componentRef = componentRef;
    this.ngZone = ngZone;
    this._autoDetect = autoDetect;

    if (ngZone != null) {
      this._onUnstableSubscription =
          ObservableWrapper.subscribe(ngZone.onUnstable, (_) => { this._isStable = false; });
      this._onMicrotaskEmptySubscription =
          ObservableWrapper.subscribe(ngZone.onMicrotaskEmpty, (_) => {
            if (this._autoDetect) {
              // Do a change detection run with checkNoChanges set to true to check
              // there are no changes on the second run.
              this.detectChanges(true);
            }
          });
      this._onStableSubscription = ObservableWrapper.subscribe(ngZone.onStable, (_) => {
        this._isStable = true;
        if (this._completer != null) {
          this._completer.resolve(true);
          this._completer = null;
        }
      });

      this._onErrorSubscription = ObservableWrapper.subscribe(
          ngZone.onError, (error: NgZoneError) => { throw error.error; });
    }
  }

  private _tick(checkNoChanges: boolean) {
    this.changeDetectorRef.detectChanges();
    if (checkNoChanges) {
      this.checkNoChanges();
    }
  }

  /**
   * Trigger a change detection cycle for the component.
   */
  detectChanges(checkNoChanges: boolean = true): void {
    if (this.ngZone != null) {
      // Run the change detection inside the NgZone so that any async tasks as part of the change
      // detection are captured by the zone and can be waited for in isStable.
      this.ngZone.run(() => { this._tick(checkNoChanges); });
    } else {
      // Running without zone. Just do the change detection.
      this._tick(checkNoChanges);
    }
  }

  /**
   * Do a change detection run to make sure there were no changes.
   */
  checkNoChanges(): void { this.changeDetectorRef.checkNoChanges(); }

  /**
   * Set whether the fixture should autodetect changes.
   *
   * Also runs detectChanges once so that any existing change is detected.
   */
  autoDetectChanges(autoDetect: boolean = true) {
    if (this.ngZone == null) {
      throw new BaseException('Cannot call autoDetectChanges when ComponentFixtureNoNgZone is set');
    }
    this._autoDetect = autoDetect;
    this.detectChanges();
  }

  /**
   * Return whether the fixture is currently stable or has async tasks that have not been completed
   * yet.
   */
  isStable(): boolean { return this._isStable; }

  /**
   * Get a promise that resolves when the fixture is stable.
   *
   * This can be used to resume testing after events have triggered asynchronous activity or
   * asynchronous change detection.
   */
  whenStable(): Promise<any> {
    if (this._isStable) {
      return PromiseWrapper.resolve(false);
    } else {
      this._completer = new PromiseCompleter<any>();
      return this._completer.promise;
    }
  }

  /**
   * Trigger component destruction.
   */
  destroy(): void {
    this.componentRef.destroy();
    if (this._onUnstableSubscription != null) {
      ObservableWrapper.dispose(this._onUnstableSubscription);
      this._onUnstableSubscription = null;
    }
    if (this._onStableSubscription != null) {
      ObservableWrapper.dispose(this._onStableSubscription);
      this._onStableSubscription = null;
    }
    if (this._onMicrotaskEmptySubscription != null) {
      ObservableWrapper.dispose(this._onMicrotaskEmptySubscription);
      this._onMicrotaskEmptySubscription = null;
    }
    if (this._onErrorSubscription != null) {
      ObservableWrapper.dispose(this._onErrorSubscription);
      this._onErrorSubscription = null;
    }
  }
}

var _nextRootElementId = 0;

/**
 * Builds a ComponentFixture for use in component level tests.
 */
@Injectable()
export class TestComponentBuilder {
  /** @internal */
  _bindingsOverrides = new Map<Type, any[]>();
  /** @internal */
  _directiveOverrides = new Map<Type, Map<Type, Type>>();
  /** @internal */
  _templateOverrides = new Map<Type, string>();
  /** @internal */
  _viewBindingsOverrides = new Map<Type, any[]>();
  /** @internal */
  _viewOverrides = new Map<Type, ViewMetadata>();


  constructor(private _injector: Injector) {}

  /** @internal */
  _clone(): TestComponentBuilder {
    let clone = new TestComponentBuilder(this._injector);
    clone._viewOverrides = MapWrapper.clone(this._viewOverrides);
    clone._directiveOverrides = MapWrapper.clone(this._directiveOverrides);
    clone._templateOverrides = MapWrapper.clone(this._templateOverrides);
    clone._bindingsOverrides = MapWrapper.clone(this._bindingsOverrides);
    clone._viewBindingsOverrides = MapWrapper.clone(this._viewBindingsOverrides);
    return clone;
  }

  /**
   * Overrides only the html of a {@link ComponentMetadata}.
   * All the other properties of the component's {@link ViewMetadata} are preserved.
   *
   * @param {Type} component
   * @param {string} html
   *
   * @return {TestComponentBuilder}
   */
  overrideTemplate(componentType: Type, template: string): TestComponentBuilder {
    let clone = this._clone();
    clone._templateOverrides.set(componentType, template);
    return clone;
  }

  /**
   * Overrides a component's {@link ViewMetadata}.
   *
   * @param {Type} component
   * @param {view} View
   *
   * @return {TestComponentBuilder}
   */
  overrideView(componentType: Type, view: ViewMetadata): TestComponentBuilder {
    let clone = this._clone();
    clone._viewOverrides.set(componentType, view);
    return clone;
  }

  /**
   * Overrides the directives from the component {@link ViewMetadata}.
   *
   * @param {Type} component
   * @param {Type} from
   * @param {Type} to
   *
   * @return {TestComponentBuilder}
   */
  overrideDirective(componentType: Type, from: Type, to: Type): TestComponentBuilder {
    let clone = this._clone();
    let overridesForComponent = clone._directiveOverrides.get(componentType);
    if (!isPresent(overridesForComponent)) {
      clone._directiveOverrides.set(componentType, new Map<Type, Type>());
      overridesForComponent = clone._directiveOverrides.get(componentType);
    }
    overridesForComponent.set(from, to);
    return clone;
  }

  /**
   * Overrides one or more injectables configured via `providers` metadata property of a directive
   * or
   * component.
   * Very useful when certain providers need to be mocked out.
   *
   * The providers specified via this method are appended to the existing `providers` causing the
   * duplicated providers to
   * be overridden.
   *
   * @param {Type} component
   * @param {any[]} providers
   *
   * @return {TestComponentBuilder}
   */
  overrideProviders(type: Type, providers: any[]): TestComponentBuilder {
    let clone = this._clone();
    clone._bindingsOverrides.set(type, providers);
    return clone;
  }

  /**
   * @deprecated
   */
  overrideBindings(type: Type, providers: any[]): TestComponentBuilder {
    return this.overrideProviders(type, providers);
  }

  /**
   * Overrides one or more injectables configured via `providers` metadata property of a directive
   * or
   * component.
   * Very useful when certain providers need to be mocked out.
   *
   * The providers specified via this method are appended to the existing `providers` causing the
   * duplicated providers to
   * be overridden.
   *
   * @param {Type} component
   * @param {any[]} providers
   *
   * @return {TestComponentBuilder}
   */
  overrideViewProviders(type: Type, providers: any[]): TestComponentBuilder {
    let clone = this._clone();
    clone._viewBindingsOverrides.set(type, providers);
    return clone;
  }

  /**
   * @deprecated
   */
  overrideViewBindings(type: Type, providers: any[]): TestComponentBuilder {
    return this.overrideViewProviders(type, providers);
  }

  /**
   * Builds and returns a ComponentFixture.
   *
   * @return {Promise<ComponentFixture>}
   */
  createAsync(rootComponentType: Type): Promise<ComponentFixture> {
    let noNgZone = IS_DART || this._injector.get(ComponentFixtureNoNgZone, false);
    let ngZone: NgZone = noNgZone ? null : this._injector.get(NgZone, null);
    let autoDetect: boolean = this._injector.get(ComponentFixtureAutoDetect, false);

    let initComponent = () => {
      let mockDirectiveResolver = this._injector.get(DirectiveResolver);
      let mockViewResolver = this._injector.get(ViewResolver);
      this._viewOverrides.forEach((view, type) => mockViewResolver.setView(type, view));
      this._templateOverrides.forEach((template, type) =>
                                          mockViewResolver.setInlineTemplate(type, template));
      this._directiveOverrides.forEach((overrides, component) => {
        overrides.forEach(
            (to, from) => { mockViewResolver.overrideViewDirective(component, from, to); });
      });
      this._bindingsOverrides.forEach(
          (bindings, type) => mockDirectiveResolver.setBindingsOverride(type, bindings));
      this._viewBindingsOverrides.forEach(
          (bindings, type) => mockDirectiveResolver.setViewBindingsOverride(type, bindings));

      let rootElId = `root${_nextRootElementId++}`;
      let rootEl = el(`<div id="${rootElId}"></div>`);
      let doc = this._injector.get(DOCUMENT);

      // TODO(juliemr): can/should this be optional?
      let oldRoots = DOM.querySelectorAll(doc, '[id^=root]');
      for (let i = 0; i < oldRoots.length; i++) {
        DOM.remove(oldRoots[i]);
      }
      DOM.appendChild(doc.body, rootEl);

      let promise: Promise<ComponentRef> =
          this._injector.get(DynamicComponentLoader)
              .loadAsRoot(rootComponentType, `#${rootElId}`, this._injector);
      return promise.then(
          (componentRef) => { return new ComponentFixture(componentRef, ngZone, autoDetect); });
    };

    return ngZone == null ? initComponent() : ngZone.run(initComponent);
  }

  createFakeAsync(rootComponentType: Type): ComponentFixture {
    let result;
    let error;
    PromiseWrapper.then(this.createAsync(rootComponentType), (_result) => { result = _result; },
                        (_error) => { error = _error; });
    tick();
    if (isPresent(error)) {
      throw error;
    }
    return result;
  }
}
