/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {DirectiveResolver} from '@angular/compiler';
import {AnimationEntryMetadata, Compiler, Component, Directive, Injectable, Injector, Provider, Type, resolveForwardRef} from '@angular/core';

import {isPresent} from './facade/lang';
import {ViewMetadata} from './private_import_core';



/**
 * An implementation of {@link DirectiveResolver} that allows overriding
 * various properties of directives.
 */
@Injectable()
export class MockDirectiveResolver extends DirectiveResolver {
  private _directives = new Map<Type<any>, Directive>();
  private _providerOverrides = new Map<Type<any>, any[]>();
  private _viewProviderOverrides = new Map<Type<any>, any[]>();
  private _views = new Map<Type<any>, ViewMetadata>();
  private _inlineTemplates = new Map<Type<any>, string>();
  private _animations = new Map<Type<any>, AnimationEntryMetadata[]>();

  constructor(private _injector: Injector) { super(); }

  private get _compiler(): Compiler { return this._injector.get(Compiler); }

  private _clearCacheFor(component: Type<any>) { this._compiler.clearCacheFor(component); }

  resolve(type: Type<any>, throwIfNotFound = true): Directive {
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
      const originalViewProviders: Provider[] =
          isPresent(metadata.providers) ? metadata.providers : [];
      providers = originalViewProviders.concat(providerOverrides);
    }

    if (metadata instanceof Component) {
      let viewProviders = metadata.viewProviders;
      if (isPresent(viewProviderOverrides)) {
        const originalViewProviders: Provider[] =
            isPresent(metadata.viewProviders) ? metadata.viewProviders : [];
        viewProviders = originalViewProviders.concat(viewProviderOverrides);
      }

      let view = this._views.get(type);
      if (!view) {
        view = <any>metadata;
      }

      let animations = view.animations;
      let templateUrl = view.templateUrl;

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

      return new Component({
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
        animations: animations,
        styles: view.styles,
        styleUrls: view.styleUrls,
        encapsulation: view.encapsulation,
        interpolation: view.interpolation
      });
    }

    return new Directive({
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
   * Overrides the {@link Directive} for a directive.
   */
  setDirective(type: Type<any>, metadata: Directive): void {
    this._directives.set(type, metadata);
    this._clearCacheFor(type);
  }

  setProvidersOverride(type: Type<any>, providers: Provider[]): void {
    this._providerOverrides.set(type, providers);
    this._clearCacheFor(type);
  }

  setViewProvidersOverride(type: Type<any>, viewProviders: Provider[]): void {
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
}

function flattenArray(tree: any[], out: Array<Type<any>|any[]>): void {
  if (!isPresent(tree)) return;
  for (var i = 0; i < tree.length; i++) {
    var item = resolveForwardRef(tree[i]);
    if (Array.isArray(item)) {
      flattenArray(item, out);
    } else {
      out.push(item);
    }
  }
}
