/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, HostBinding, HostListener, Input, Output, Query, Type, resolveForwardRef, ɵReflectorReader, ɵreflector, ɵstringify as stringify} from '@angular/core';
import {CompilerInjectable} from './injectable';
import {splitAtColon} from './util';


/*
 * Resolve a `Type` for {@link Directive}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
@CompilerInjectable()
export class DirectiveResolver {
  constructor(private _reflector: ɵReflectorReader = ɵreflector) {}

  isDirective(type: Type<any>) {
    const typeMetadata = this._reflector.annotations(resolveForwardRef(type));
    return typeMetadata && typeMetadata.some(isDirectiveMetadata);
  }

  /**
   * Return {@link Directive} for a given `Type`.
   */
  resolve(type: Type<any>): Directive;
  resolve(type: Type<any>, throwIfNotFound: true): Directive;
  resolve(type: Type<any>, throwIfNotFound: boolean): Directive|null;
  resolve(type: Type<any>, throwIfNotFound = true): Directive|null {
    const typeMetadata = this._reflector.annotations(resolveForwardRef(type));
    if (typeMetadata) {
      const metadata = findLast(typeMetadata, isDirectiveMetadata);
      if (metadata) {
        const propertyMetadata = this._reflector.propMetadata(type);
        return this._mergeWithPropertyMetadata(metadata, propertyMetadata, type);
      }
    }

    if (throwIfNotFound) {
      throw new Error(`No Directive annotation found on ${stringify(type)}`);
    }

    return null;
  }

  private _mergeWithPropertyMetadata(
      dm: Directive, propertyMetadata: {[key: string]: any[]},
      directiveType: Type<any>): Directive {
    const inputs: string[] = [];
    const outputs: string[] = [];
    const host: {[key: string]: string} = {};
    const queries: {[key: string]: any} = {};

    Object.keys(propertyMetadata).forEach((propName: string) => {
      const input = findLast(propertyMetadata[propName], (a) => a instanceof Input);
      if (input) {
        if (input.bindingPropertyName) {
          inputs.push(`${propName}: ${input.bindingPropertyName}`);
        } else {
          inputs.push(propName);
        }
      }
      const output = findLast(propertyMetadata[propName], (a) => a instanceof Output);
      if (output) {
        if (output.bindingPropertyName) {
          outputs.push(`${propName}: ${output.bindingPropertyName}`);
        } else {
          outputs.push(propName);
        }
      }
      const hostBindings = propertyMetadata[propName].filter(a => a && a instanceof HostBinding);
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
      const hostListeners = propertyMetadata[propName].filter(a => a && a instanceof HostListener);
      hostListeners.forEach(hostListener => {
        const args = hostListener.args || [];
        host[`(${hostListener.eventName})`] = `${propName}(${args.join(',')})`;
      });
      const query = findLast(propertyMetadata[propName], (a) => a instanceof Query);
      if (query) {
        queries[propName] = query;
      }
    });
    return this._merge(dm, inputs, outputs, host, queries, directiveType);
  }

  private _extractPublicName(def: string) { return splitAtColon(def, [null !, def])[1].trim(); }

  private _dedupeBindings(bindings: string[]): string[] {
    const names = new Set<string>();
    const reversedResult: string[] = [];
    // go last to first to allow later entries to overwrite previous entries
    for (let i = bindings.length - 1; i >= 0; i--) {
      const binding = bindings[i];
      const name = this._extractPublicName(binding);
      if (!names.has(name)) {
        names.add(name);
        reversedResult.push(binding);
      }
    }
    return reversedResult.reverse();
  }

  private _merge(
      directive: Directive, inputs: string[], outputs: string[], host: {[key: string]: string},
      queries: {[key: string]: any}, directiveType: Type<any>): Directive {
    const mergedInputs =
        this._dedupeBindings(directive.inputs ? directive.inputs.concat(inputs) : inputs);
    const mergedOutputs =
        this._dedupeBindings(directive.outputs ? directive.outputs.concat(outputs) : outputs);
    const mergedHost = directive.host ? {...directive.host, ...host} : host;
    const mergedQueries = directive.queries ? {...directive.queries, ...queries} : queries;

    if (directive instanceof Component) {
      return new Component({
        selector: directive.selector,
        inputs: mergedInputs,
        outputs: mergedOutputs,
        host: mergedHost,
        exportAs: directive.exportAs,
        moduleId: directive.moduleId,
        queries: mergedQueries,
        changeDetection: directive.changeDetection,
        providers: directive.providers,
        viewProviders: directive.viewProviders,
        entryComponents: directive.entryComponents,
        template: directive.template,
        templateUrl: directive.templateUrl,
        styles: directive.styles,
        styleUrls: directive.styleUrls,
        encapsulation: directive.encapsulation,
        animations: directive.animations,
        interpolation: directive.interpolation
      });
    } else {
      return new Directive({
        selector: directive.selector,
        inputs: mergedInputs,
        outputs: mergedOutputs,
        host: mergedHost,
        exportAs: directive.exportAs,
        queries: mergedQueries,
        providers: directive.providers
      });
    }
  }
}

function isDirectiveMetadata(type: any): type is Directive {
  return type instanceof Directive;
}

export function findLast<T>(arr: T[], condition: (value: T) => boolean): T|null {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (condition(arr[i])) {
      return arr[i];
    }
  }
  return null;
}
