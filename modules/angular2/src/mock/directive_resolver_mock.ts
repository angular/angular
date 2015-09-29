import {Map, MapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
import {Type, isPresent, stringify, isBlank, print} from 'angular2/src/core/facade/lang';
import {DirectiveMetadata, ComponentMetadata} from '../core/metadata';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';

export class MockDirectiveResolver extends DirectiveResolver {
  private _bindingsOverrides: Map<Type, any[]> = new Map();
  private _viewBindingsOverrides: Map<Type, any[]> = new Map();

  resolve(type: Type): DirectiveMetadata {
    var dm = super.resolve(type);

    var bindingsOverride = this._bindingsOverrides.get(type);
    var viewBindingsOverride = this._viewBindingsOverrides.get(type);

    var bindings = dm.bindings;
    if (isPresent(bindingsOverride)) {
      bindings = dm.bindings.concat(bindingsOverride);
    }

    if (dm instanceof ComponentMetadata) {
      var viewBindings = dm.viewBindings;
      if (isPresent(viewBindingsOverride)) {
        viewBindings = dm.viewBindings.concat(viewBindingsOverride);
      }

      return new ComponentMetadata({
        selector: dm.selector,
        properties: dm.properties,
        events: dm.events,
        host: dm.host,
        bindings: bindings,
        exportAs: dm.exportAs,
        moduleId: dm.moduleId,
        queries: dm.queries,
        changeDetection: dm.changeDetection,
        viewBindings: viewBindings
      });
    }

    return new DirectiveMetadata({
      selector: dm.selector,
      properties: dm.properties,
      events: dm.events,
      host: dm.host,
      bindings: bindings,
      exportAs: dm.exportAs,
      moduleId: dm.moduleId,
      queries: dm.queries
    });
  }

  setBindingsOverride(type: Type, bindings: any[]): void {
    this._bindingsOverrides.set(type, bindings);
  }

  setViewBindingsOverride(type: Type, viewBindings: any[]): void {
    this._viewBindingsOverrides.set(type, viewBindings);
  }
}
