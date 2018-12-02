/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, NgModule, Pipe, Type, ɵNG_COMPONENT_DEF as NG_COMPONENT_DEF, ɵNG_DIRECTIVE_DEF as NG_DIRECTIVE_DEF, ɵNG_MODULE_DEF as NG_MODULE_DEF, ɵNG_PIPE_DEF as NG_PIPE_DEF, ɵReflectionCapabilities as ReflectionCapabilities, ɵcompileComponent as compileComponent, ɵcompileDirective as compileDirective, ɵcompileNgModule as compileNgModule, ɵcompilePipe as compilePipe, ɵsetScopeOnDeclaredComponents as setScopeOnDeclaredComponents,} from '@angular/core';

import {MetadataOverride} from './metadata_override';
import {MetadataOverrider} from './metadata_overrider';
import {getComponentDef, getNgModuleDef} from '@angular/core/src/render3/definition';

const reflection = new ReflectionCapabilities();
const overrider = new MetadataOverrider();

function getDecorator<T>(decoratorType: Type<T>, type: Type<T>): T {
  const decorator = reflection.annotations(type).find(a => a instanceof decoratorType) || null;
  if (decorator === null) {
    throw new Error(`${type.name} does not have an @${decoratorType.name} decorator`);
  }
  return decorator;
}

function overrideProperty(target: any, prop: string): PropertyDescriptor|undefined {
  const descriptor = Object.getOwnPropertyDescriptor(target, prop);
  if (descriptor) {
    delete target[prop];
  }
  return descriptor;
}

function restoreProperty(
    target: any, prop: string, descriptor: PropertyDescriptor | undefined): void {
  if (descriptor === undefined) {
    delete target[prop];
  } else {
    Object.defineProperty(target, prop, descriptor);
  }
}

export class DefinitionOverrides {
  private overrides: DefinitionOverride[] = [];
  private moduleOverrides: DefinitionOverride[] = [];

  register(override: DefinitionOverride): void {
    if (override instanceof NgModuleOverride) {
      this.moduleOverrides.push(override);
    } else {
      this.overrides.push(override);
    }
  }

  apply(): boolean {
    this.overrides.forEach(override => override.apply());
    this.moduleOverrides.forEach(override => override.apply());
    return this.overrides.length + this.moduleOverrides.length > 0;
  }

  restore(): void {
    this.overrides.forEach(override => override.restore());
    this.overrides.length = 0;

    this.moduleOverrides.forEach(override => override.restore());
    this.moduleOverrides.length = 0;
  }
}

export interface DefinitionOverride {
  apply(): void;
  restore(): void;
}

export class NgModuleOverride implements DefinitionOverride {
  private overriddenProp: PropertyDescriptor|undefined;

  constructor(private ngModule: Type<any>, private override: MetadataOverride<NgModule>) {}

  apply(): void {
    this.overriddenProp = overrideProperty(this.ngModule, NG_MODULE_DEF);

    const oldMetadata = getDecorator(NgModule, this.ngModule);
    const metadata = overrider.overrideMetadata(NgModule, oldMetadata, this.override);
    compileNgModule(this.ngModule, metadata);
  }

  restore(): void { restoreProperty(this.ngModule, NG_MODULE_DEF, this.overriddenProp); }
}

export class DirectiveOverride implements DefinitionOverride {
  private overriddenProp: PropertyDescriptor|undefined;

  constructor(private directive: Type<any>, private override: MetadataOverride<Directive>) {}

  apply(): void {
    this.overriddenProp = overrideProperty(this.directive, NG_DIRECTIVE_DEF);

    const oldMetadata = getDecorator(Directive, this.directive);
    const metadata = overrider.overrideMetadata(Directive, oldMetadata, this.override);
    compileDirective(this.directive, metadata);
  }

  restore(): void { restoreProperty(this.directive, NG_DIRECTIVE_DEF, this.overriddenProp); }
}

export class ComponentOverride implements DefinitionOverride {
  private overriddenProp: PropertyDescriptor|undefined;

  constructor(private component: Type<any>, private override: MetadataOverride<Component>) {}

  apply(): void {
    this.overriddenProp = overrideProperty(this.component, NG_COMPONENT_DEF);

    const oldMetadata = getDecorator(Component, this.component);
    const metadata = overrider.overrideMetadata(Component, oldMetadata, this.override);
    compileComponent(this.component, metadata);
  }

  restore(): void { restoreProperty(this.component, NG_COMPONENT_DEF, this.overriddenProp); }
}

export class PipeOverride implements DefinitionOverride {
  private overriddenProp: PropertyDescriptor|undefined;

  constructor(private pipe: Type<any>, private override: MetadataOverride<Pipe>) {}

  apply(): void {
    this.overriddenProp = overrideProperty(this.pipe, NG_PIPE_DEF);

    const oldMetadata = getDecorator(Pipe, this.pipe);
    const metadata = overrider.overrideMetadata(Pipe, oldMetadata, this.override);
    compilePipe(this.pipe, metadata);
  }

  restore(): void { restoreProperty(this.pipe, NG_PIPE_DEF, this.overriddenProp); }
}

/**
 * When the TestBed is configured with metadata overrides, the Ivy definition field
 * is cleared and recompiled according to the overridden metadata. Doing so invalidates
 * any references to the previously known defs, so we must ensure that any references
 * are cleared out and recomputed for the recompiled definitions.
 */
export function invalidateModuleScope(moduleType: Type<any>): void {
  const ngModuleDef = getNgModuleDef(moduleType);
  if (ngModuleDef === null) {
    throw new Error(`${moduleType.name} does not have an ngModuleDef`);
  }

  // Reset internal `TView` cache of components, as it stores references to directive
  // and pipe definitions that are reachable from the component.
  ngModuleDef.declarations.forEach(declaration => {
    const componentDef = getComponentDef(declaration);
    if (componentDef !== null) {
      componentDef.template.ngPrivateData = undefined;
    }
  });

  // Reassign module scopes to ensure that overridden components get access to their module scopes.
  setScopeOnDeclaredComponents(moduleType);

  ngModuleDef.imports.forEach(invalidateModuleScope);
  ngModuleDef.exports.forEach(exported => {
    if (getNgModuleDef(exported)) {
      invalidateModuleScope(exported);
    }
  });
}
