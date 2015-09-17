import {resolveForwardRef, Injectable} from 'angular2/src/core/di';
import {Type, isPresent, stringify} from 'angular2/src/core/facade/lang';
import {BaseException} from 'angular2/src/core/facade/exceptions';
import {ListWrapper, StringMap, StringMapWrapper} from 'angular2/src/core/facade/collection';
import {
  DirectiveMetadata,
  ComponentMetadata,
  PropertyMetadata,
  EventMetadata,
  HostBindingMetadata,
  HostListenerMetadata
} from 'angular2/src/core/metadata';
import {reflector} from 'angular2/src/core/reflection/reflection';

/**
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
          return this._mergeWithPropertyMetadata(metadata, propertyMetadata);
        }
      }
    }
    throw new BaseException(`No Directive annotation found on ${stringify(type)}`);
  }

  private _mergeWithPropertyMetadata(dm: DirectiveMetadata,
                                     propertyMetadata:
                                         StringMap<string, any[]>): DirectiveMetadata {
    var properties = [];
    var events = [];
    var host = {};

    StringMapWrapper.forEach(propertyMetadata, (metadata: any[], propName: string) => {
      metadata.forEach(a => {
        if (a instanceof PropertyMetadata) {
          if (isPresent(a.bindingPropertyName)) {
            properties.push(`${propName}: ${a.bindingPropertyName}`);
          } else {
            properties.push(propName);
          }
        }

        if (a instanceof EventMetadata) {
          if (isPresent(a.bindingPropertyName)) {
            events.push(`${propName}: ${a.bindingPropertyName}`);
          } else {
            events.push(propName);
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
          var args = isPresent(a.args) ? a.args.join(', ') : '';
          host[`(${a.eventName})`] = `${propName}(${args})`;
        }
      });
    });
    return this._merge(dm, properties, events, host);
  }

  private _merge(dm: DirectiveMetadata, properties: string[], events: string[],
                 host: StringMap<string, string>): DirectiveMetadata {
    var mergedProperties =
        isPresent(dm.properties) ? ListWrapper.concat(dm.properties, properties) : properties;
    var mergedEvents = isPresent(dm.events) ? ListWrapper.concat(dm.events, events) : events;
    var mergedHost = isPresent(dm.host) ? StringMapWrapper.merge(dm.host, host) : host;

    if (dm instanceof ComponentMetadata) {
      return new ComponentMetadata({
        selector: dm.selector,
        properties: mergedProperties,
        events: mergedEvents,
        host: mergedHost,
        dynamicLoadable: dm.dynamicLoadable,
        bindings: dm.bindings,
        exportAs: dm.exportAs,
        moduleId: dm.moduleId,
        compileChildren: dm.compileChildren,
        changeDetection: dm.changeDetection,
        viewBindings: dm.viewBindings
      });

    } else {
      return new DirectiveMetadata({
        selector: dm.selector,
        properties: mergedProperties,
        events: mergedEvents,
        host: mergedHost,
        bindings: dm.bindings,
        exportAs: dm.exportAs,
        moduleId: dm.moduleId,
        compileChildren: dm.compileChildren
      });
    }
  }
}
