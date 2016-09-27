/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, HostBinding, HostListener, Injectable, Input, Output, Query, Type, resolveForwardRef} from '@angular/core';

import {StringMapWrapper} from './facade/collection';
import {stringify} from './facade/lang';
import {ReflectorReader, reflector} from './private_import_core';
import {splitAtColon} from './util';

/*
 * Resolve a `Type` for {@link Directive}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
@Injectable()
export class DirectiveResolver {
  constructor(private _reflector: ReflectorReader = reflector) {}

  /**
   * Return {@link Directive} for a given `Type`.
   */
  resolve(type: Type<any>, throwIfNotFound = true): Directive {
    const typeMetadata = this._reflector.annotations(resolveForwardRef(type));
    if (typeMetadata) {
      const metadata = typeMetadata.find(isDirectiveMetadata);
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

      propertyMetadata[propName].forEach(a => {
        if (a instanceof Input) {
          if (a.bindingPropertyName) {
            inputs.push(`${propName}: ${a.bindingPropertyName}`);
          } else {
            inputs.push(propName);
          }
        } else if (a instanceof Output) {
          const output: Output = a;
          if (output.bindingPropertyName) {
            outputs.push(`${propName}: ${output.bindingPropertyName}`);
          } else {
            outputs.push(propName);
          }
        } else if (a instanceof HostBinding) {
          const hostBinding: HostBinding = a;
          if (hostBinding.hostPropertyName) {
            host[`[${hostBinding.hostPropertyName}]`] = propName;
          } else {
            host[`[${propName}]`] = propName;
          }
        } else if (a instanceof HostListener) {
          const hostListener: HostListener = a;
          const args = hostListener.args || [];
          host[`(${hostListener.eventName})`] = `${propName}(${args.join(',')})`;
        } else if (a instanceof Query) {
          queries[propName] = a;
        }
      });
    });
    return this._merge(dm, inputs, outputs, host, queries, directiveType);
  }

  private _extractPublicName(def: string) { return splitAtColon(def, [null, def])[1].trim(); }

  private _merge(
      directive: Directive, inputs: string[], outputs: string[], host: {[key: string]: string},
      queries: {[key: string]: any}, directiveType: Type<any>): Directive {
    const mergedInputs: string[] = inputs;

    if (directive.inputs) {
      const inputNames: string[] =
          directive.inputs.map((def: string): string => this._extractPublicName(def));

      inputs.forEach((inputDef: string) => {
        const publicName = this._extractPublicName(inputDef);
        if (inputNames.indexOf(publicName) > -1) {
          throw new Error(
              `Input '${publicName}' defined multiple times in '${stringify(directiveType)}'`);
        }
      });

      mergedInputs.unshift(...directive.inputs);
    }

    let mergedOutputs: string[] = outputs;

    if (directive.outputs) {
      const outputNames: string[] =
          directive.outputs.map((def: string): string => this._extractPublicName(def));

      outputs.forEach((outputDef: string) => {
        const publicName = this._extractPublicName(outputDef);
        if (outputNames.indexOf(publicName) > -1) {
          throw new Error(
              `Output event '${publicName}' defined multiple times in '${stringify(directiveType)}'`);
        }
      });
      mergedOutputs.unshift(...directive.outputs);
    }

    const mergedHost = directive.host ? StringMapWrapper.merge(directive.host, host) : host;
    const mergedQueries =
        directive.queries ? StringMapWrapper.merge(directive.queries, queries) : queries;

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
