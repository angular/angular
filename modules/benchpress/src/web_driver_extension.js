import { BaseException, ABSTRACT } from 'angular2/src/facade/lang';
import { Promise } from 'angular2/src/facade/async';
import { List } from 'angular2/src/facade/collection';

/**
 * A WebDriverExtension implements extended commands of the webdriver protocol
 * for a given browser, independent of the WebDriverAdapter.
 * Needs one implementation for every supported Browser.
 */
@ABSTRACT()
export class WebDriverExtension {
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
}
