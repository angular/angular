/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentMetadata, DirectiveMetadata, HostBindingMetadata, HostListenerMetadata, Injectable, InputMetadata, OutputMetadata, QueryMetadata, resolveForwardRef} from '@angular/core';

import {ReflectorReader, reflector} from '../core_private';

import {StringMapWrapper} from './facade/collection';
import {BaseException} from './facade/exceptions';
import {Type, isPresent, stringify} from './facade/lang';
import {splitAtColon} from './util';

function _isDirectiveMetadata(type: any): type is DirectiveMetadata {
  return type instanceof DirectiveMetadata;
}

/*
 * Resolve a `Type` for {@link DirectiveMetadata}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
@Injectable()
export class DirectiveResolver {
  constructor(private _reflector: ReflectorReader = reflector) {}

  /**
   * Return {@link DirectiveMetadata} for a given `Type`.
   */
  resolve(type: Type): DirectiveMetadata {
    var typeMetadata = this._reflector.annotations(resolveForwardRef(type));
    if (isPresent(typeMetadata)) {
      var metadata = typeMetadata.find(_isDirectiveMetadata);
      if (isPresent(metadata)) {
        var propertyMetadata = this._reflector.propMetadata(type);
        return this._mergeWithPropertyMetadata(metadata, propertyMetadata, type);
      }
    }

    throw new BaseException(`No Directive annotation found on ${stringify(type)}`);
  }

  private _mergeWithPropertyMetadata(
      dm: DirectiveMetadata, propertyMetadata: {[key: string]: any[]},
      directiveType: Type): DirectiveMetadata {
    var inputs: string[] = [];
    var outputs: string[] = [];
    var host: {[key: string]: string} = {};
    var queries: {[key: string]: any} = {};

    StringMapWrapper.forEach(propertyMetadata, (metadata: any[], propName: string) => {
      metadata.forEach(a => {
        if (a instanceof InputMetadata) {
          if (isPresent(a.bindingPropertyName)) {
            inputs.push(`${propName}: ${a.bindingPropertyName}`);
          } else {
            inputs.push(propName);
          }
        }

        if (a instanceof OutputMetadata) {
          if (isPresent(a.bindingPropertyName)) {
            outputs.push(`${propName}: ${a.bindingPropertyName}`);
          } else {
            outputs.push(propName);
          }
        }

        if (a instanceof HostBindingMetadata) {
          if (isPresent(a.hostPropertyName)) {
            host[`[${a.hostPropertyName}]`] = propName;
          } else {
            host[`[${propName}]`] = propName;
          }
        }

        if (a instanceof HostListenerMetadata) {
          var args = isPresent(a.args) ? (<any[]>a.args).join(', ') : '';
          host[`(${a.eventName})`] = `${propName}(${args})`;
        }

        if (a instanceof QueryMetadata) {
          queries[propName] = a;
        }
      });
    });
    return this._merge(dm, inputs, outputs, host, queries, directiveType);
  }

  private _extractPublicName(def: string) { return splitAtColon(def, [null, def])[1].trim(); }

  private _merge(
      dm: DirectiveMetadata, inputs: string[], outputs: string[], host: {[key: string]: string},
      queries: {[key: string]: any}, directiveType: Type): DirectiveMetadata {
    let mergedInputs: string[];

    if (isPresent(dm.inputs)) {
      const inputNames: string[] =
          dm.inputs.map((def: string): string => this._extractPublicName(def));
      inputs.forEach((inputDef: string) => {
        const publicName = this._extractPublicName(inputDef);
        if (inputNames.indexOf(publicName) > -1) {
          throw new BaseException(
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
          throw new BaseException(
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

    if (dm instanceof ComponentMetadata) {
      return new ComponentMetadata({
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
        precompile: dm.precompile
      });

    } else {
      return new DirectiveMetadata({
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
