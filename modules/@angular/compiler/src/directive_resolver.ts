/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, HostBinding, HostListener, Injectable, Input, Output, Query, Type, resolveForwardRef} from '@angular/core';

import {StringMapWrapper} from './facade/collection';
import {isPresent, stringify} from './facade/lang';
import {ReflectorReader, reflector} from './private_import_core';
import {splitAtColon} from './util';

function _isDirectiveMetadata(type: any): type is Directive {
  return type instanceof Directive;
}

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
    var typeMetadata = this._reflector.annotations(resolveForwardRef(type));
    if (isPresent(typeMetadata)) {
      var metadata = typeMetadata.find(_isDirectiveMetadata);
      if (isPresent(metadata)) {
        var propertyMetadata = this._reflector.propMetadata(type);
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
    var inputs: string[] = [];
    var outputs: string[] = [];
    var host: {[key: string]: string} = {};
    var queries: {[key: string]: any} = {};

    StringMapWrapper.forEach(propertyMetadata, (metadata: any[], propName: string) => {
      metadata.forEach(a => {
        if (a instanceof Input) {
          if (isPresent(a.bindingPropertyName)) {
            inputs.push(`${propName}: ${a.bindingPropertyName}`);
          } else {
            inputs.push(propName);
          }
        } else if (a instanceof Output) {
          const output: Output = a;
          if (isPresent(output.bindingPropertyName)) {
            outputs.push(`${propName}: ${output.bindingPropertyName}`);
          } else {
            outputs.push(propName);
          }
        } else if (a instanceof HostBinding) {
          const hostBinding: HostBinding = a;
          if (isPresent(hostBinding.hostPropertyName)) {
            host[`[${hostBinding.hostPropertyName}]`] = propName;
          } else {
            host[`[${propName}]`] = propName;
          }
        } else if (a instanceof HostListener) {
          const hostListener: HostListener = a;
          var args = isPresent(hostListener.args) ? (<any[]>hostListener.args).join(', ') : '';
          host[`(${hostListener.eventName})`] = `${propName}(${args})`;
        } else if (a instanceof Query) {
          queries[propName] = a;
        }
      });
    });
    return this._merge(dm, inputs, outputs, host, queries, directiveType);
  }

  private _extractPublicName(def: string) { return splitAtColon(def, [null, def])[1].trim(); }

  private _merge(
      dm: Directive, inputs: string[], outputs: string[], host: {[key: string]: string},
      queries: {[key: string]: any}, directiveType: Type<any>): Directive {
    let mergedInputs: string[];

    if (isPresent(dm.inputs)) {
      const inputNames: string[] =
          dm.inputs.map((def: string): string => this._extractPublicName(def));
      inputs.forEach((inputDef: string) => {
        const publicName = this._extractPublicName(inputDef);
        if (inputNames.indexOf(publicName) > -1) {
          throw new Error(
              `Input '${publicName}' defined multiple times in '${stringify(directiveType)}'`);
        }
      });
      mergedInputs = dm.inputs.concat(inputs);
    } else {
      mergedInputs = inputs;
    }

    let mergedOutputs: string[];

    if (isPresent(dm.outputs)) {
      const outputNames: string[] =
          dm.outputs.map((def: string): string => this._extractPublicName(def));

      outputs.forEach((outputDef: string) => {
        const publicName = this._extractPublicName(outputDef);
        if (outputNames.indexOf(publicName) > -1) {
          throw new Error(
              `Output event '${publicName}' defined multiple times in '${stringify(directiveType)}'`);
        }
      });
      mergedOutputs = dm.outputs.concat(outputs);
    } else {
      mergedOutputs = outputs;
    }

    var mergedHost = isPresent(dm.host) ? StringMapWrapper.merge(dm.host, host) : host;
    var mergedQueries =
        isPresent(dm.queries) ? StringMapWrapper.merge(dm.queries, queries) : queries;

    if (dm instanceof Component) {
      return new Component({
        selector: dm.selector,
        inputs: mergedInputs,
        outputs: mergedOutputs,
        host: mergedHost,
        exportAs: dm.exportAs,
        moduleId: dm.moduleId,
        queries: mergedQueries,
        changeDetection: dm.changeDetection,
        providers: dm.providers,
        viewProviders: dm.viewProviders,
        entryComponents: dm.entryComponents,
        template: dm.template,
        templateUrl: dm.templateUrl,
        styles: dm.styles,
        styleUrls: dm.styleUrls,
        encapsulation: dm.encapsulation,
        animations: dm.animations,
        interpolation: dm.interpolation
      });

    } else {
      return new Directive({
        selector: dm.selector,
        inputs: mergedInputs,
        outputs: mergedOutputs,
        host: mergedHost,
        exportAs: dm.exportAs,
        queries: mergedQueries,
        providers: dm.providers
      });
    }
  }
}
