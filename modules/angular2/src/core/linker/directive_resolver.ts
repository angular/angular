import {resolveForwardRef, Injectable} from 'angular2/src/core/di';
import {Type, isPresent, isBlank, stringify} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {
  DirectiveMetadata,
  ComponentMetadata,
  InputMetadata,
  OutputMetadata,
  HostBindingMetadata,
  HostListenerMetadata,
  ContentChildrenMetadata,
  ViewChildrenMetadata,
  ContentChildMetadata,
  ViewChildMetadata
} from 'angular2/src/core/metadata';
import {reflector} from 'angular2/src/core/reflection/reflection';

function _isDirectiveMetadata(type: any): boolean {
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
  /**
   * Return {@link DirectiveMetadata} for a given `Type`.
   */
  resolve(type: Type): DirectiveMetadata {
    var typeMetadata = reflector.annotations(resolveForwardRef(type));
    if (isPresent(typeMetadata)) {
      var metadata = typeMetadata.find(_isDirectiveMetadata);
      if (isPresent(metadata)) {
        var propertyMetadata = reflector.propMetadata(type);
        return this._mergeWithPropertyMetadata(metadata, propertyMetadata, type);
      }
    }

    throw new BaseException(`No Directive annotation found on ${stringify(type)}`);
  }

  private _mergeWithPropertyMetadata(dm: DirectiveMetadata,
                                     propertyMetadata: {[key: string]: any[]},
                                     directiveType: Type): DirectiveMetadata {
    var inputs = [];
    var outputs = [];
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

        if (a instanceof ContentChildrenMetadata) {
          queries[propName] = a;
        }

        if (a instanceof ViewChildrenMetadata) {
          queries[propName] = a;
        }

        if (a instanceof ContentChildMetadata) {
          queries[propName] = a;
        }

        if (a instanceof ViewChildMetadata) {
          queries[propName] = a;
        }
      });
    });
    return this._merge(dm, inputs, outputs, host, queries, directiveType);
  }

  private _merge(dm: DirectiveMetadata, inputs: string[], outputs: string[],
                 host: {[key: string]: string}, queries: {[key: string]: any},
                 directiveType: Type): DirectiveMetadata {
    var mergedInputs = isPresent(dm.inputs) ? ListWrapper.concat(dm.inputs, inputs) : inputs;

    var mergedOutputs;
    if (isPresent(dm.outputs)) {
      dm.outputs.forEach((propName: string) => {
        if (ListWrapper.contains(outputs, propName)) {
          throw new BaseException(
              `Output event '${propName}' defined multiple times in '${stringify(directiveType)}'`);
        }
      });
      mergedOutputs = ListWrapper.concat(dm.outputs, outputs);
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
        viewProviders: dm.viewProviders
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

export var CODEGEN_DIRECTIVE_RESOLVER = new DirectiveResolver();
