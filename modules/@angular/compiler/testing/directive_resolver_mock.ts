/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEntryMetadata, Compiler, ComponentMetadata, DirectiveMetadata, Injectable, Injector, ViewMetadata, resolveForwardRef} from '@angular/core';

import {DirectiveResolver} from '../src/directive_resolver';
import {Map} from '../src/facade/collection';
import {BaseException} from '../src/facade/exceptions';
import {Type, isArray, isPresent, stringify} from '../src/facade/lang';


/**
 * An implementation of {@link DirectiveResolver} that allows overriding
 * various properties of directives.
 */
@Injectable()
export class MockDirectiveResolver extends DirectiveResolver {
  private _providerOverrides = new Map<Type, any[]>();
  private viewProviderOverrides = new Map<Type, any[]>();
  private _views = new Map<Type, ViewMetadata>();
  private _inlineTemplates = new Map<Type, string>();
  private _animations = new Map<Type, AnimationEntryMetadata[]>();
  private _directiveOverrides = new Map<Type, Map<Type, Type>>();

  constructor(private _injector: Injector) { super(); }

  private get _compiler(): Compiler { return this._injector.get(Compiler); }

  private _clearCacheFor(component: Type) { this._compiler.clearCacheFor(component); }

  resolve(type: Type, throwIfNotFound = true): DirectiveMetadata {
    const dm = super.resolve(type, throwIfNotFound);
    if (!dm) {
      return null;
    }

    const providerOverrides = this._providerOverrides.get(type);
    const viewProviderOverrides = this.viewProviderOverrides.get(type);

    let providers = dm.providers;
    if (isPresent(providerOverrides)) {
      const originalViewProviders: any[] = isPresent(dm.providers) ? dm.providers : [];
      providers = originalViewProviders.concat(providerOverrides);
    }

    if (dm instanceof ComponentMetadata) {
      let viewProviders = dm.viewProviders;
      if (isPresent(viewProviderOverrides)) {
        const originalViewProviders: any[] = isPresent(dm.viewProviders) ? dm.viewProviders : [];
        viewProviders = originalViewProviders.concat(viewProviderOverrides);
      }

      let view = this._views.get(type);
      if (!view) {
        view = dm;
      }

      const directives: any[] = [];
      if (isPresent(view.directives)) {
        flattenArray(view.directives, directives);
      }
      let animations = view.animations;
      let templateUrl = view.templateUrl;
      const directiveOverrides = this._directiveOverrides.get(type);

      const inlineAnimations = this._animations.get(type);
      if (isPresent(inlineAnimations)) {
        animations = inlineAnimations;
      }

      let inlineTemplate = this._inlineTemplates.get(type);
      if (isPresent(inlineTemplate)) {
        templateUrl = null;
      } else {
        inlineTemplate = view.template;
      }

      if (isPresent(directiveOverrides) && isPresent(view.directives)) {
        directiveOverrides.forEach((to, from) => {
          var srcIndex = directives.indexOf(from);
          if (srcIndex == -1) {
            throw new BaseException(
                `Overriden directive ${stringify(from)} not found in the template of ${stringify(type)}`);
          }
          directives[srcIndex] = to;
        });
      }

      return new ComponentMetadata({
        selector: dm.selector,
        inputs: dm.inputs,
        outputs: dm.outputs,
        host: dm.host,
        exportAs: dm.exportAs,
        moduleId: dm.moduleId,
        queries: dm.queries,
        changeDetection: dm.changeDetection,
        providers: providers,
        viewProviders: viewProviders,
        entryComponents: dm.entryComponents,
        template: inlineTemplate,
        templateUrl: templateUrl,
        directives: directives.length > 0 ? directives : null,
        animations: animations,
        styles: view.styles,
        styleUrls: view.styleUrls,
        pipes: view.pipes,
        encapsulation: view.encapsulation,
        interpolation: view.interpolation
      });
    }

    return new DirectiveMetadata({
      selector: dm.selector,
      inputs: dm.inputs,
      outputs: dm.outputs,
      host: dm.host,
      providers: providers,
      exportAs: dm.exportAs,
      queries: dm.queries
    });
  }

  setProvidersOverride(type: Type, providers: any[]): void {
    this._providerOverrides.set(type, providers);
    this._clearCacheFor(type);
  }

  setViewProvidersOverride(type: Type, viewProviders: any[]): void {
    this.viewProviderOverrides.set(type, viewProviders);
    this._clearCacheFor(type);
  }

  /**
   * Overrides the {@link ViewMetadata} for a component.
   */
  setView(component: Type, view: ViewMetadata): void {
    this._views.set(component, view);
    this._clearCacheFor(component);
  }
  /**
   * Overrides the inline template for a component - other configuration remains unchanged.
   */
  setInlineTemplate(component: Type, template: string): void {
    this._inlineTemplates.set(component, template);
    this._clearCacheFor(component);
  }

  setAnimations(component: Type, animations: AnimationEntryMetadata[]): void {
    this._animations.set(component, animations);
    this._clearCacheFor(component);
  }

  /**
   * Overrides a directive from the component {@link ViewMetadata}.
   */
  overrideViewDirective(component: Type, from: Type, to: Type): void {
    var overrides = this._directiveOverrides.get(component);

    if (!overrides) {
      overrides = new Map<Type, Type>();
      this._directiveOverrides.set(component, overrides);
    }

    overrides.set(from, to);
    this._clearCacheFor(component);
  }
}

function flattenArray(tree: any[], out: Array<Type|any[]>): void {
  if (!isPresent(tree)) return;
  for (var i = 0; i < tree.length; i++) {
    var item = resolveForwardRef(tree[i]);
    if (isArray(item)) {
      flattenArray(item, out);
    } else {
      out.push(item);
    }
  }
}
