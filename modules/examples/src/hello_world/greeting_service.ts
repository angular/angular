import {Injectable} from 'angular2/core';
import {Configuration} from 'angular2/auto_configuration';
import {CONST_EXPR} from 'angular2/src/core/facade/lang';

// A service available to the Injector, used by the HelloCmp component.
@Injectable()
export class GreetingService {
  greeting: string = 'hello';
}

// CONST_EXPR is only needed because of Dart transpilation
export const GREETINGS_BINDINGS: any[] = CONST_EXPR([GreetingService]);

// This represents a configuration class to make the GreetingService globally available for
// those components that are autoconfigured.
@Configuration()
class GreetingServiceConfiguration {
  getBindings() { return GREETINGS_BINDINGS; }
}
