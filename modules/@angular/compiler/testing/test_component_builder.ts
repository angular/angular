/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEntryMetadata, Compiler, ComponentFactory, Inject, Injectable, Injector, NgZone, ViewMetadata} from '@angular/core';
import {ComponentFixture, ComponentFixtureNoNgZone, TestComponentBuilder, TestInjector} from '@angular/core/testing';

import {DirectiveResolver, ViewResolver} from '../index';
import {MapWrapper} from '../src/facade/collection';
import {ConcreteType, IS_DART, Type, isPresent} from '../src/facade/lang';

/**
 * A TestComponentBuilder that allows overriding based on the compiler.
 */
@Injectable()
export class OverridingTestComponentBuilder extends TestComponentBuilder {
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

  constructor(@Inject(TestInjector) injector: Injector) { super(injector); }

  /** @internal */
  _clone(): OverridingTestComponentBuilder {
    let clone = new OverridingTestComponentBuilder(this._injector);
    clone._viewOverrides = MapWrapper.clone(this._viewOverrides);
    clone._directiveOverrides = MapWrapper.clone(this._directiveOverrides);
    clone._templateOverrides = MapWrapper.clone(this._templateOverrides);
    clone._bindingsOverrides = MapWrapper.clone(this._bindingsOverrides);
    clone._viewBindingsOverrides = MapWrapper.clone(this._viewBindingsOverrides);
    return clone;
  }

  overrideTemplate(componentType: Type, template: string): OverridingTestComponentBuilder {
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

  overrideView(componentType: Type, view: ViewMetadata): OverridingTestComponentBuilder {
    let clone = this._clone();
    clone._viewOverrides.set(componentType, view);
    return clone;
  }

  overrideDirective(componentType: Type, from: Type, to: Type): OverridingTestComponentBuilder {
    let clone = this._clone();
    let overridesForComponent = clone._directiveOverrides.get(componentType);
    if (!isPresent(overridesForComponent)) {
      clone._directiveOverrides.set(componentType, new Map<Type, Type>());
      overridesForComponent = clone._directiveOverrides.get(componentType);
    }
    overridesForComponent.set(from, to);
    return clone;
  }

  overrideProviders(type: Type, providers: any[]): OverridingTestComponentBuilder {
    let clone = this._clone();
    clone._bindingsOverrides.set(type, providers);
    return clone;
  }

  overrideViewProviders(type: Type, providers: any[]): OverridingTestComponentBuilder {
    let clone = this._clone();
    clone._viewBindingsOverrides.set(type, providers);
    return clone;
  }

  createAsync<T>(rootComponentType: ConcreteType<T>): Promise<ComponentFixture<T>> {
    this._applyMetadataOverrides();
    return super.createAsync(rootComponentType);
  }

  createSync<T>(rootComponentType: ConcreteType<T>): ComponentFixture<T> {
    this._applyMetadataOverrides();
    return super.createSync(rootComponentType);
  }

  private _applyMetadataOverrides() {
    let mockDirectiveResolver = this._injector.get(DirectiveResolver);
    let mockViewResolver = this._injector.get(ViewResolver);
    this._viewOverrides.forEach((view, type) => { mockViewResolver.setView(type, view); });
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
  }
}
