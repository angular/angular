/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEntryMetadata, Compiler, ComponentMetadata, DirectiveMetadata, Injectable, Injector, Type, ViewMetadata, resolveForwardRef} from '@angular/core';

import {DirectiveResolver} from '../src/directive_resolver';
import {Map} from '../src/facade/collection';
import {BaseException} from '../src/facade/exceptions';
import {isArray, isPresent, stringify} from '../src/facade/lang';



/**
 * An implementation of {@link DirectiveResolver} that allows overriding
 * various properties of directives.
 */
@Injectable()
export class MockDirectiveResolver extends DirectiveResolver {
  private _directives = new Map<Type<any>, DirectiveMetadata>();
  private _providerOverrides = new Map<Type<any>, any[]>();
  private _viewProviderOverrides = new Map<Type<any>, any[]>();
  private _views = new Map<Type<any>, ViewMetadata>();
  private _inlineTemplates = new Map<Type<any>, string>();
  private _animations = new Map<Type<any>, AnimationEntryMetadata[]>();
  private _directiveOverrides = new Map<Type<any>, Map<Type<any>, Type<any>>>();

  constructor(private _injector: Injector) { super(); }

  private get _compiler(): Compiler { return this._injector.get(Compiler); }

  private _clearCacheFor(component: Type<any>) { this._compiler.clearCacheFor(component); }

  resolve(type: Type<any>, throwIfNotFound = true): DirectiveMetadata {
    let metadata = this._directives.get(type);
    if (!metadata) {
      metadata = super.resolve(type, throwIfNotFound);
    }
    if (!metadata) {
      return null;
    }

    const providerOverrides = this._providerOverrides.get(type);
    const viewProviderOverrides = this._viewProviderOverrides.get(type);

    let providers = metadata.providers;
    if (isPresent(providerOverrides)) {
      const originalViewProviders: any[] = isPresent(metadata.providers) ? metadata.providers : [];
      providers = originalViewProviders.concat(providerOverrides);
    }

    if (metadata instanceof ComponentMetadata) {
      let viewProviders = metadata.viewProviders;
      if (isPresent(viewProviderOverrides)) {
        const originalViewProviders: any[] =
            isPresent(metadata.viewProviders) ? metadata.viewProviders : [];
        viewProviders = originalViewProviders.concat(viewProviderOverrides);
      }

      let view = this._views.get(type);
      if (!view) {
        view = metadata;
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
        selector: metadata.selector,
        inputs: metadata.inputs,
        outputs: metadata.outputs,
        host: metadata.host,
        exportAs: metadata.exportAs,
        moduleId: metadata.moduleId,
        queries: metadata.queries,
        changeDetection: metadata.changeDetection,
        providers: providers,
        viewProviders: viewProviders,
        entryComponents: metadata.entryComponents,
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
      selector: metadata.selector,
      inputs: metadata.inputs,
      outputs: metadata.outputs,
      host: metadata.host,
      providers: providers,
      exportAs: metadata.exportAs,
      queries: metadata.queries
    });
  }

  /**
   * Overrides the {@link DirectiveMetadata} for a directive.
   */
  setDirective(type: Type<any>, metadata: DirectiveMetadata): void {
    this._directives.set(type, metadata);
    this._clearCacheFor(type);
  }

  setProvidersOverride(type: Type<any>, providers: any[]): void {
    this._providerOverrides.set(type, providers);
    this._clearCacheFor(type);
  }

  setViewProvidersOverride(type: Type<any>, viewProviders: any[]): void {
    this._viewProviderOverrides.set(type, viewProviders);
    this._clearCacheFor(type);
  }

  /**
   * Overrides the {@link ViewMetadata} for a component.
   */
  setView(component: Type<any>, view: ViewMetadata): void {
    this._views.set(component, view);
    this._clearCacheFor(component);
  }
  /**
   * Overrides the inline template for a component - other configuration remains unchanged.
   */
  setInlineTemplate(component: Type<any>, template: string): void {
    this._inlineTemplates.set(component, template);
    this._clearCacheFor(component);
  }

  setAnimations(component: Type<any>, animations: AnimationEntryMetadata[]): void {
    this._animations.set(component, animations);
    this._clearCacheFor(component);
  }

  /**
   * Overrides a directive from the component {@link ViewMetadata}.
   */
  overrideViewDirective(component: Type<any>, from: Type<any>, to: Type<any>): void {
    var overrides = this._directiveOverrides.get(component);

    if (!overrides) {
      overrides = new Map<Type<any>, Type<any>>();
      this._directiveOverrides.set(component, overrides);
    }

    overrides.set(from, to);
    this._clearCacheFor(component);
  }
}

function flattenArray(tree: any[], out: Array<Type<any>|any[]>): void {
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
