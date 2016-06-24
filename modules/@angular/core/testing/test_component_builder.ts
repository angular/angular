/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEntryMetadata, Compiler, ComponentFactory, Injectable, Injector, NgZone, OpaqueToken, ViewMetadata} from '../index';
import {PromiseWrapper} from '../src/facade/async';
import {ConcreteType, IS_DART, Type, isPresent} from '../src/facade/lang';

import {ComponentFixture} from './component_fixture';
import {tick} from './fake_async';



/**
 * An abstract class for inserting the root test component element in a platform independent way.
 *
 * @experimental
 */
export class TestComponentRenderer {
  insertRootElement(rootElementId: string) {}
}

/**
 * @experimental
 */
export var ComponentFixtureAutoDetect = new OpaqueToken('ComponentFixtureAutoDetect');

/**
 * @experimental
 */
export var ComponentFixtureNoNgZone = new OpaqueToken('ComponentFixtureNoNgZone');

var _nextRootElementId = 0;

/**
 * Builds a ComponentFixture for use in component level tests.
 * @stable
 */
@Injectable()
export class TestComponentBuilder {
  constructor(protected _injector: Injector) {}

  /**
   * Overrides only the html of a {@link ComponentMetadata}.
   * All the other properties of the component's {@link ViewMetadata} are preserved.
   */
  overrideTemplate(componentType: Type, template: string): TestComponentBuilder {
    throw new Error(
        'overrideTemplate is not supported in this implementation of TestComponentBuilder.');
  }

  /**
   * Overrides a component's {@link ViewMetadata}.
   */
  overrideView(componentType: Type, view: ViewMetadata): TestComponentBuilder {
    throw new Error(
        'overrideView is not supported in this implementation of TestComponentBuilder.');
  }

  /**
   * Overrides the directives from the component {@link ViewMetadata}.
   */
  overrideDirective(componentType: Type, from: Type, to: Type): TestComponentBuilder {
    throw new Error(
        'overrideDirective is not supported in this implementation of TestComponentBuilder.');
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
    throw new Error(
        'overrideProviders is not supported in this implementation of TestComponentBuilder.');
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
    throw new Error(
        'overrideViewProviders is not supported in this implementation of TestComponentBuilder.');
  }

  overrideAnimations(componentType: Type, animations: AnimationEntryMetadata[]):
      TestComponentBuilder {
    throw new Error(
        'overrideAnimations is not supported in this implementation of TestComponentBuilder.');
  }

  protected createFromFactory<C>(ngZone: NgZone, componentFactory: ComponentFactory<C>):
      ComponentFixture<C> {
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
  createAsync<T>(rootComponentType: ConcreteType<T>): Promise<ComponentFixture<T>> {
    let noNgZone = IS_DART || this._injector.get(ComponentFixtureNoNgZone, false);
    let ngZone: NgZone = noNgZone ? null : this._injector.get(NgZone, null);
    let compiler: Compiler = this._injector.get(Compiler);

    let initComponent = () => {
      let promise: Promise<ComponentFactory<any>> =
          compiler.compileComponentAsync(rootComponentType);
      return promise.then(componentFactory => this.createFromFactory(ngZone, componentFactory));
    };

    return ngZone == null ? initComponent() : ngZone.run(initComponent);
  }

  createFakeAsync<T>(rootComponentType: ConcreteType<T>): ComponentFixture<T> {
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

  createSync<T>(rootComponentType: ConcreteType<T>): ComponentFixture<T> {
    let noNgZone = IS_DART || this._injector.get(ComponentFixtureNoNgZone, false);
    let ngZone: NgZone = noNgZone ? null : this._injector.get(NgZone, null);
    let compiler: Compiler = this._injector.get(Compiler);

    let initComponent = () => {
      return this.createFromFactory(
          ngZone, this._injector.get(Compiler).compileComponentSync(rootComponentType));
    };

    return ngZone == null ? initComponent() : ngZone.run(initComponent);
  }
}
