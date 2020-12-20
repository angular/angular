/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileReflector, ExternalReference, getUrlScheme, Identifiers, syntaxError} from '@angular/compiler';
import {ANALYZE_FOR_ENTRY_COMPONENTS, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, Injector, LOCALE_ID, NgModuleFactory, NgModuleRef, QueryList, Renderer2, SecurityContext, TemplateRef, TRANSLATIONS_FORMAT, ViewContainerRef, ViewEncapsulation, ɵand, ɵccf, ɵcmf, ɵCodegenComponentFactoryResolver, ɵcrt, ɵdid, ɵeld, ɵEMPTY_ARRAY, ɵEMPTY_MAP, ɵinlineInterpolate, ɵinterpolate, ɵmod, ɵmpd, ɵncd, ɵnov, ɵpad, ɵpid, ɵpod, ɵppd, ɵprd, ɵqud, ɵReflectionCapabilities as ReflectionCapabilities, ɵregisterModuleFactory, ɵstringify as stringify, ɵted, ɵunv, ɵvid} from '@angular/core';

export const MODULE_SUFFIX = '';
const builtinExternalReferences = createBuiltinExternalReferencesMap();

export class JitReflector implements CompileReflector {
  private reflectionCapabilities = new ReflectionCapabilities();

  componentModuleUrl(type: any, cmpMetadata: Component): string {
    const moduleId = cmpMetadata.moduleId;

    if (typeof moduleId === 'string') {
      const scheme = getUrlScheme(moduleId);
      return scheme ? moduleId : `package:${moduleId}${MODULE_SUFFIX}`;
    } else if (moduleId !== null && moduleId !== void 0) {
      throw syntaxError(
          `moduleId should be a string in "${
              stringify(type)}". See https://goo.gl/wIDDiL for more information.\n` +
          `If you're using Webpack you should inline the template and the styles, see https://goo.gl/X2J8zc.`);
    }

    return `./${stringify(type)}`;
  }
  parameters(typeOrFunc: /*Type*/ any): any[][] {
    return this.reflectionCapabilities.parameters(typeOrFunc);
  }
  tryAnnotations(typeOrFunc: /*Type*/ any): any[] {
    return this.annotations(typeOrFunc);
  }
  annotations(typeOrFunc: /*Type*/ any): any[] {
    return this.reflectionCapabilities.annotations(typeOrFunc);
  }
  shallowAnnotations(typeOrFunc: /*Type*/ any): any[] {
    throw new Error('Not supported in JIT mode');
  }
  propMetadata(typeOrFunc: /*Type*/ any): {[key: string]: any[]} {
    return this.reflectionCapabilities.propMetadata(typeOrFunc);
  }
  hasLifecycleHook(type: any, lcProperty: string): boolean {
    return this.reflectionCapabilities.hasLifecycleHook(type, lcProperty);
  }
  guards(type: any): {[key: string]: any} {
    return this.reflectionCapabilities.guards(type);
  }
  resolveExternalReference(ref: ExternalReference): any {
    return builtinExternalReferences.get(ref) || ref.runtime;
  }
}


function createBuiltinExternalReferencesMap() {
  const map = new Map<ExternalReference, any>();
  map.set(Identifiers.ANALYZE_FOR_ENTRY_COMPONENTS, ANALYZE_FOR_ENTRY_COMPONENTS);
  map.set(Identifiers.ElementRef, ElementRef);
  map.set(Identifiers.NgModuleRef, NgModuleRef);
  map.set(Identifiers.ViewContainerRef, ViewContainerRef);
  map.set(Identifiers.ChangeDetectorRef, ChangeDetectorRef);
  map.set(Identifiers.Renderer2, Renderer2);
  map.set(Identifiers.QueryList, QueryList);
  map.set(Identifiers.TemplateRef, TemplateRef);
  map.set(Identifiers.CodegenComponentFactoryResolver, ɵCodegenComponentFactoryResolver);
  map.set(Identifiers.ComponentFactoryResolver, ComponentFactoryResolver);
  map.set(Identifiers.ComponentFactory, ComponentFactory);
  map.set(Identifiers.ComponentRef, ComponentRef);
  map.set(Identifiers.NgModuleFactory, NgModuleFactory);
  map.set(Identifiers.createModuleFactory, ɵcmf);
  map.set(Identifiers.moduleDef, ɵmod);
  map.set(Identifiers.moduleProviderDef, ɵmpd);
  map.set(Identifiers.RegisterModuleFactoryFn, ɵregisterModuleFactory);
  map.set(Identifiers.Injector, Injector);
  map.set(Identifiers.ViewEncapsulation, ViewEncapsulation);
  map.set(Identifiers.ChangeDetectionStrategy, ChangeDetectionStrategy);
  map.set(Identifiers.SecurityContext, SecurityContext);
  map.set(Identifiers.LOCALE_ID, LOCALE_ID);
  map.set(Identifiers.TRANSLATIONS_FORMAT, TRANSLATIONS_FORMAT);
  map.set(Identifiers.inlineInterpolate, ɵinlineInterpolate);
  map.set(Identifiers.interpolate, ɵinterpolate);
  map.set(Identifiers.EMPTY_ARRAY, ɵEMPTY_ARRAY);
  map.set(Identifiers.EMPTY_MAP, ɵEMPTY_MAP);
  map.set(Identifiers.viewDef, ɵvid);
  map.set(Identifiers.elementDef, ɵeld);
  map.set(Identifiers.anchorDef, ɵand);
  map.set(Identifiers.textDef, ɵted);
  map.set(Identifiers.directiveDef, ɵdid);
  map.set(Identifiers.providerDef, ɵprd);
  map.set(Identifiers.queryDef, ɵqud);
  map.set(Identifiers.pureArrayDef, ɵpad);
  map.set(Identifiers.pureObjectDef, ɵpod);
  map.set(Identifiers.purePipeDef, ɵppd);
  map.set(Identifiers.pipeDef, ɵpid);
  map.set(Identifiers.nodeValue, ɵnov);
  map.set(Identifiers.ngContentDef, ɵncd);
  map.set(Identifiers.unwrapValue, ɵunv);
  map.set(Identifiers.createRendererType2, ɵcrt);
  map.set(Identifiers.createComponentFactory, ɵccf);
  return map;
}
