import {Injectable} from 'angular2/src/core/di';
import {isBlank} from 'angular2/src/core/facade/lang';

/**
 * Specifies app root url for the application.
 *
 * Used by the {@link Compiler} when resolving HTML and CSS template URLs.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
@Injectable()
export class AppRootUrl {
  constructor(public value: string) {}
}
