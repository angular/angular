import { bind, Injector, OpaqueToken } from 'angular2/di';

import { BaseException, ABSTRACT, isBlank } from 'angular2/src/facade/lang';
import { Promise, PromiseWrapper } from 'angular2/src/facade/async';
import { List, ListWrapper, StringMap } from 'angular2/src/facade/collection';

import { Options } from './sample_options';

/**
 * A WebDriverExtension implements extended commands of the webdriver protocol
 * for a given browser, independent of the WebDriverAdapter.
 * Needs one implementation for every supported Browser.
 */
@ABSTRACT()
export class WebDriverExtension {
  static bindTo(childTokens) {
    return [
      bind(_CHILDREN).toAsyncFactory(
        (injector) => PromiseWrapper.all(ListWrapper.map(childTokens, (token) => injector.asyncGet(token) )),
        [Injector]
      ),
      bind(WebDriverExtension).toFactory(
        (children, capabilities) => {
          var delegate;
          ListWrapper.forEach(children, (extension) => {
            if (extension.supports(capabilities)) {
              delegate = extension;
            }
          });
          if (isBlank(delegate)) {
            throw new BaseException('Could not find a delegate for given capabilities!');
          }
          return delegate;
        },
        [_CHILDREN, Options.CAPABILITIES]
      )
    ];
  }

  gc():Promise {
    throw new BaseException('NYI');
  }

  timeBegin(name):Promise {
    throw new BaseException('NYI');
  }

  timeEnd(name, restart:boolean):Promise {
    throw new BaseException('NYI');
  }

  /**
   * Format:
   * - cat: category of the event
   * - name: event name: 'script', 'gc', 'render', ...
   * - ph: phase: 'B' (begin), 'E' (end), 'b' (nestable start), 'e' (nestable end), 'X' (Complete event)
   * - ts: timestamp in ms, e.g. 12345
   * - pid: process id
   * - args: arguments, e.g. {heapSize: 1234}
   *
   * Based on [Chrome Trace Event Format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit)
   **/
  readPerfLog():Promise<List> {
    throw new BaseException('NYI');
  }

  supports(capabilities:StringMap):boolean {
    return true;
  }
}

var _CHILDREN = new OpaqueToken('WebDriverExtension.children');
