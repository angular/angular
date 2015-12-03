import {Injectable} from 'angular2/src/core/di';
import {Type, isPresent} from 'angular2/src/facade/lang';
import {Map, MapWrapper} from 'angular2/src/facade/collection';
import {reflector} from 'angular2/src/core/reflection/reflection';

/**
 * Resolve a `Type` from a {@link ComponentMetadata} into a URL.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}.
 */
@Injectable()
export class ComponentUrlMapper {
  /**
   * Returns the base URL to the component source file.
   * The returned URL could be:
   * - an absolute URL,
   * - a path relative to the application
   */
  getUrl(component: Type): string {
    return reflector.isReflectionEnabled() ? reflector.importUri(component) : './';
  }
}

/**
 * A {@link ComponentUrlMapper} that maintains an internal map of types to URLs.
 */
export class RuntimeComponentUrlMapper extends ComponentUrlMapper {
  /** @internal */
  _componentUrls = new Map<Type, string>();

  constructor() { super(); }

  /**
   * Add a mapping from component type to url to the resolver.
   */
  setComponentUrl(component: Type, url: string) { this._componentUrls.set(component, url); }

  getUrl(component: Type): string {
    var url = this._componentUrls.get(component);
    if (isPresent(url)) return url;
    return super.getUrl(component);
  }
}
