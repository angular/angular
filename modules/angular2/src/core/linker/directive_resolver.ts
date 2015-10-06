import {resolveForwardRef, Injectable} from 'angular2/src/core/di';
import {Type, isString, isPresent, isBlank, stringify} from 'angular2/src/core/facade/lang';
import {BaseException} from 'angular2/src/core/facade/exceptions';
import {ListWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';
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
  ViewChildMetadata,
  QueryMetadata
} from 'angular2/src/core/metadata';
import {reflector} from 'angular2/src/core/reflection/reflection';

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
      for (var i = 0; i < typeMetadata.length; i++) {
        var metadata = typeMetadata[i];
        if (metadata instanceof DirectiveMetadata) {
          var propertyMetadata = reflector.propMetadata(type);
          return this._mergeWithPropertyMetadata(metadata, propertyMetadata, type);
        }
      }
    }
    throw new BaseException(`No Directive annotation found on ${stringify(type)}`);
  }

  private _mergeWithPropertyMetadata(dm: DirectiveMetadata,
                                     propertyMetadata: {[key: string]: any[]},
                                     type: Type): DirectiveMetadata {
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
    return this._merge(dm, inputs, outputs, host, queries, type);
  }

  private _mergeQueries(dm: DirectiveMetadata, queries: {[key: string]: any}, type: Type):
      {[key: string]: any} {
    var mergedQueries =
        isPresent(dm.queries) ? StringMapWrapper.merge(dm.queries, queries) : queries;
    StringMapWrapper.forEach(mergedQueries, (query: any, propName: string) => {
      if (!isValidDirective(query.selector) && !isString(query.selector)) {
        throw new BaseException(
            `Unexpected directive value '${stringify(query.selector)}' on the '${stringify(query)}' of component '${stringify(type)}'`);
      }
    });
    return mergedQueries;
  }

  private _merge(dm: DirectiveMetadata, inputs: string[], outputs: string[],
                 host: {[key: string]: string}, queries: {[key: string]: any},
                 type: Type): DirectiveMetadata {
    var mergedInputs = isPresent(dm.inputs) ? ListWrapper.concat(dm.inputs, inputs) : inputs;
    var mergedOutputs = isPresent(dm.outputs) ? ListWrapper.concat(dm.outputs, outputs) : outputs;
    var mergedHost = isPresent(dm.host) ? StringMapWrapper.merge(dm.host, host) : host;
    var mergedQueries = this._mergeQueries(dm, queries, type);

    // TODO: remove after migrating from properties to inputs
    if (mergedInputs.length == 0 && isPresent(dm.properties)) mergedInputs = dm.properties;
    if (mergedOutputs.length == 0 && isPresent(dm.events)) mergedOutputs = dm.events;

    if (dm instanceof ComponentMetadata) {
      return new ComponentMetadata({
        selector: dm.selector,
        inputs: mergedInputs,
        outputs: mergedOutputs,
        host: mergedHost,
        bindings: dm.bindings,
        exportAs: dm.exportAs,
        moduleId: dm.moduleId,
        queries: mergedQueries,
        changeDetection: dm.changeDetection,
        viewBindings: dm.viewBindings
      });

    } else {
      return new DirectiveMetadata({
        selector: dm.selector,
        inputs: mergedInputs,
        outputs: mergedOutputs,
        host: mergedHost,
        bindings: dm.bindings,
        exportAs: dm.exportAs,
        moduleId: dm.moduleId,
        queries: mergedQueries
      });
    }
  }
}

function isValidDirective(value: Type): boolean {
  return isPresent(value) && (value instanceof Type);
}
