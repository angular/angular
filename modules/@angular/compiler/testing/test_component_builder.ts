/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEntryMetadata, ChangeDetectorRef, ComponentFactory, ComponentRef, ComponentResolver, DebugElement, ElementRef, Injectable, Injector, NgZone, NgZoneError, OpaqueToken, ViewMetadata, getDebugNode} from '@angular/core';
import {ComponentFixture, tick} from '@angular/core/testing';

import {DirectiveResolver, ViewResolver} from '../index';
import {ObservableWrapper, PromiseCompleter, PromiseWrapper} from '../src/facade/async';
import {ListWrapper, MapWrapper} from '../src/facade/collection';
import {BaseException} from '../src/facade/exceptions';
import {IS_DART, Type, isBlank, isPresent, scheduleMicroTask} from '../src/facade/lang';

/**
 *  @deprecated
 *  Import ComponentFixture from @angular/core/testing instead.
 */
export {ComponentFixture} from '@angular/core/testing';
/**
 * An abstract class for inserting the root test component element in a platform independent way.
 */
export class TestComponentRenderer {
  insertRootElement(rootElementId: string) {}
}

export var ComponentFixtureAutoDetect = new OpaqueToken('ComponentFixtureAutoDetect');
export var ComponentFixtureNoNgZone = new OpaqueToken('ComponentFixtureNoNgZone');

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
  _animationOverrides = new Map<Type, AnimationEntryMetadata[]>();
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
   */
  overrideTemplate(componentType: Type, template: string): TestComponentBuilder {
    let clone = this._clone();
    clone._templateOverrides.set(componentType, template);
    return clone;
  }

  overrideAnimations(componentType: Type, animations: AnimationEntryMetadata[]):
      TestComponentBuilder {
    var clone = this._clone();
    clone._animationOverrides.set(componentType, animations);
    return clone;
  }

  /**
   * Overrides a component's {@link ViewMetadata}.
   */
  overrideView(componentType: Type, view: ViewMetadata): TestComponentBuilder {
    let clone = this._clone();
    clone._viewOverrides.set(componentType, view);
    return clone;
  }

  /**
   * Overrides the directives from the component {@link ViewMetadata}.
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

  private _create<C>(ngZone: NgZone, componentFactory: ComponentFactory<C>): ComponentFixture<C> {
    let rootElId = `root${_nextRootElementId++}`;
    var testComponentRenderer: TestComponentRenderer = this._injector.get(TestComponentRenderer);
    testComponentRenderer.insertRootElement(rootElId);

    var componentRef = componentFactory.create(this._injector, [], `#${rootElId}`);
    let autoDetect: boolean = this._injector.get(ComponentFixtureAutoDetect, false);
    return new ComponentFixture<any /*C*/>(componentRef, ngZone, autoDetect);
  }

  /**
   * Builds and returns a ComponentFixture.
   */
  createAsync(rootComponentType: Type): Promise<ComponentFixture<any>> {
    let noNgZone = IS_DART || this._injector.get(ComponentFixtureNoNgZone, false);
    let ngZone: NgZone = noNgZone ? null : this._injector.get(NgZone, null);

    let initComponent = () => {
      let mockDirectiveResolver = this._injector.get(DirectiveResolver);
      let mockViewResolver = this._injector.get(ViewResolver);
      this._viewOverrides.forEach((view, type) => mockViewResolver.setView(type, view));
      this._templateOverrides.forEach(
          (template, type) => mockViewResolver.setInlineTemplate(type, template));
      this._animationOverrides.forEach(
          (animationsEntry, type) => mockViewResolver.setAnimations(type, animationsEntry));
      this._directiveOverrides.forEach((overrides, component) => {
        overrides.forEach(
            (to, from) => { mockViewResolver.overrideViewDirective(component, from, to); });
      });
      this._bindingsOverrides.forEach(
          (bindings, type) => mockDirectiveResolver.setProvidersOverride(type, bindings));
      this._viewBindingsOverrides.forEach(
          (bindings, type) => mockDirectiveResolver.setViewProvidersOverride(type, bindings));

      let promise: Promise<ComponentFactory<any>> =
          this._injector.get(ComponentResolver).resolveComponent(rootComponentType);
      return promise.then(componentFactory => this._create(ngZone, componentFactory));
    };

    return ngZone == null ? initComponent() : ngZone.run(initComponent);
  }

  createFakeAsync(rootComponentType: Type): ComponentFixture<any> {
    let result: any /** TODO #9100 */;
    let error: any /** TODO #9100 */;
    PromiseWrapper.then(
        this.createAsync(rootComponentType), (_result) => { result = _result; },
        (_error) => { error = _error; });
    tick();
    if (isPresent(error)) {
      throw error;
    }
    return result;
  }

  createSync<C>(componentFactory: ComponentFactory<C>): ComponentFixture<C> {
    let noNgZone = IS_DART || this._injector.get(ComponentFixtureNoNgZone, false);
    let ngZone: NgZone = noNgZone ? null : this._injector.get(NgZone, null);

    let initComponent = () => this._create(ngZone, componentFactory);
    return ngZone == null ? initComponent() : ngZone.run(initComponent);
  }
}
