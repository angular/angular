import { Promise } from 'angular2/src/facade/async';
import { BaseException, ABSTRACT } from 'angular2/src/facade/lang';

/**
 * A WebDriverAdapter bridges API differences between different WebDriver clients,
 * e.g. JS vs Dart Async vs Dart Sync webdriver.
 * Needs one implementation for every supported WebDriver client.
 */
@ABSTRACT()
export class WebDriverAdapter {
  waitFor(callback:Function):Promise {
    throw new BaseException('NYI');
  }
  executeScript(script:string):Promise {
    throw new BaseException('NYI');
  }
  capabilities():Promise {
    throw new BaseException('NYI');
  }
  logs(type:string):Promise {
    throw new BaseException('NYI');
  }
}
