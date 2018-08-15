/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileReflector} from './compile_reflector';
import {Component, createComponent, createContentChild, createContentChildren, createDirective, createHostBinding, createHostListener, createInput, createOutput, createViewChild, createViewChildren, Directive, Type} from './core';
import {resolveForwardRef, splitAtColon, stringify} from './util';

const QUERY_METADATA_IDENTIFIERS = [
  createViewChild,
  createViewChildren,
  createContentChild,
  createContentChildren,
];

/*
 * Resolve a `Type` for {@link Directive}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export class DirectiveResolver {
  constructor(private _reflector: CompileReflector) {}

  isDirective(type: Type) {
    const typeMetadata = this._reflector.annotations(resolveForwardRef(type));
    return typeMetadata && typeMetadata.some(isDirectiveMetadata);
  }

  /**
   * Return {@link Directive} for a given `Type`.
   */
  resolve(type: Type): Directive;
  resolve(type: Type, throwIfNotFound: true): Directive;
  resolve(type: Type, throwIfNotFound: boolean): Directive|null;
  resolve(type: Type, throwIfNotFound = true): Directive|null {
    const typeMetadata = this._reflector.annotations(resolveForwardRef(type));
    if (typeMetadata) {
      const metadata = findLast(typeMetadata, isDirectiveMetadata);
      if (metadata) {
        const propertyMetadata = this._reflector.propMetadata(type);
        const guards = this._reflector.guards(type);
        return this._mergeWithPropertyMetadata(metadata, propertyMetadata, guards, type);
      }
    }

    if (throwIfNotFound) {
      throw new Error(`No Directive annotation found on ${stringify(type)}`);
    }

    return null;
  }

  private _mergeWithPropertyMetadata(
      dm: Directive, propertyMetadata: {[key: string]: any[]}, guards: {[key: string]: any},
      directiveType: Type): Directive {
    const inputs: string[] = [];
    const outputs: string[] = [];
    const host: {[key: string]: string} = {};
    const queries: {[key: string]: any} = {};
    Object.keys(propertyMetadata).forEach((propName: string) => {
      const input = findLast(propertyMetadata[propName], (a) => createInput.isTypeOf(a));
      if (input) {
        if (input.bindingPropertyName) {
          inputs.push(`${propName}: ${input.bindingPropertyName}`);
        } else {
          inputs.push(propName);
        }
      }
      const output = findLast(propertyMetadata[propName], (a) => createOutput.isTypeOf(a));
      if (output) {
        if (output.bindingPropertyName) {
          outputs.push(`${propName}: ${output.bindingPropertyName}`);
        } else {
          outputs.push(propName);
        }
      }
      const hostBindings = propertyMetadata[propName].filter(a => createHostBinding.isTypeOf(a));
      hostBindings.forEach(hostBinding => {
        if (hostBinding.hostPropertyName) {
          const startWith = hostBinding.hostPropertyName[0];
          if (startWith === '(') {
            throw new Error(`@HostBinding can not bind to events. Use @HostListener instead.`);
          } else if (startWith === '[') {
            throw new Error(
                `@HostBinding parameter should be a property name, 'class.<name>', or 'attr.<name>'.`);
          }
          host[`[${hostBinding.hostPropertyName}]`] = propName;
        } else {
          host[`[${propName}]`] = propName;
        }
      });
      const hostListeners = propertyMetadata[propName].filter(a => createHostListener.isTypeOf(a));
      hostListeners.forEach(hostListener => {
        const args = hostListener.args || [];
        host[`(${hostListener.eventName})`] = `${propName}(${args.join(',')})`;
      });
      const query = findLast(
          propertyMetadata[propName], (a) => QUERY_METADATA_IDENTIFIERS.some(i => i.isTypeOf(a)));
      if (query) {
        queries[propName] = query;
      }
    });
    return this._merge(dm, inputs, outputs, host, queries, guards, directiveType);
  }

  private _extractPublicName(def: string) {
    return splitAtColon(def, [null!, def])[1].trim();
  }

  private _dedupeBindings(bindings: string[]): string[] {
    const names = new Set<string>();
    const publicNames = new Set<string>();
    const reversedResult: string[] = [];
    // go last to first to allow later entries to overwrite previous entries
    for (let i = bindings.length - 1; i >= 0; i--) {
      const binding = bindings[i];
      const name = this._extractPublicName(binding);
      publicNames.add(name);
      if (!names.has(name)) {
        names.add(name);
        reversedResult.push(binding);
      }
    }
    return reversedResult.reverse();
  }

  private _merge(
      directive: Directive, inputs: string[], outputs: string[], host: {[key: string]: string},
      queries: {[key: string]: any}, guards: {[key: string]: any}, directiveType: Type): Directive {
    const mergedInputs =
        this._dedupeBindings(directive.inputs ? directive.inputs.concat(inputs) : inputs);
    const mergedOutputs =
        this._dedupeBindings(directive.outputs ? directive.outputs.concat(outputs) : outputs);
    const mergedHost = directive.host ? {...directive.host, ...host} : host;
    const mergedQueries = directive.queries ? {...directive.queries, ...queries} : queries;
    if (createComponent.isTypeOf(directive)) {
      const comp = directive as Component;
      return createComponent({
        selector: comp.selector,
        inputs: mergedInputs,
        outputs: mergedOutputs,
        host: mergedHost,
        exportAs: comp.exportAs,
        moduleId: comp.moduleId,
        queries: mergedQueries,
        changeDetection: comp.changeDetection,
        providers: comp.providers,
        viewProviders: comp.viewProviders,
        entryComponents: comp.entryComponents,
        template: comp.template,
        templateUrl: comp.templateUrl,
        styles: comp.styles,
        styleUrls: comp.styleUrls,
        encapsulation: comp.encapsulation,
        animations: comp.animations,
        interpolation: comp.interpolation,
        preserveWhitespaces: directive.preserveWhitespaces,
      });
    } else {
      return createDirective({
        selector: directive.selector,
        inputs: mergedInputs,
        outputs: mergedOutputs,
        host: mergedHost,
        exportAs: directive.exportAs,
        queries: mergedQueries,
        providers: directive.providers,
        guards
      });
    }
  }
}

function isDirectiveMetadata(type: any): type is Directive {
  return createDirective.isTypeOf(type) || createComponent.isTypeOf(type);
}

export function findLast<T>(arr: T[], condition: (value: T) => boolean): T|null {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (condition(arr[i])) {
      return arr[i];
    }
  }
  return null;
}
