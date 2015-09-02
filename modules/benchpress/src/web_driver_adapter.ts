import {bind, Binding} from 'angular2/core';
import {Promise} from 'angular2/src/core/facade/async';
import {BaseException, ABSTRACT} from 'angular2/src/core/facade/lang';
import {Map} from 'angular2/src/core/facade/collection';

/**
 * A WebDriverAdapter bridges API differences between different WebDriver clients,
 * e.g. JS vs Dart Async vs Dart Sync webdriver.
 * Needs one implementation for every supported WebDriver client.
 */
@ABSTRACT()
export class WebDriverAdapter {
  static bindTo(delegateToken): Binding[] {
    return [bind(WebDriverAdapter).toFactory((delegate) => delegate, [delegateToken])];
  }

  waitFor(callback: Function): Promise<any> { throw new BaseException('NYI'); }
  executeScript(script: string): Promise<any> { throw new BaseException('NYI'); }
  executeAsyncScript(script: string): Promise<any> { throw new BaseException('NYI'); }
  capabilities(): Promise<Map<string, any>> { throw new BaseException('NYI'); }
  logs(type: string): Promise<any[]> { throw new BaseException('NYI'); }
}
