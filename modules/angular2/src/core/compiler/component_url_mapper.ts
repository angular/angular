import {Injectable} from 'angular2/di';
import {Type} from 'angular2/src/facade/lang';

/**
 * Resolve a {@link Type} from a {@link Component} into a URL.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
@Injectable()
export class ComponentUrlMapper {
  /**
   * Returns the base URL to the component source file.
   * The returned URL could be:
   * - an absolute URL,
   * - a path relative to the application
   */
  getUrl(component: Type): string { return './'; }
}
