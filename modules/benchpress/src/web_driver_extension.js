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

  timeStamp(name:string, names:List<String>):Promise {
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
   * - name: event name, e.g. 'script', 'gc', ...
   * - ph: phase: 'B' (begin), 'E' (end), 'b' (nestable start), 'e' (nestable end)
   * - ts: timestamp, e.g. 12345
   * - args: arguments, e.g. {someArg: 1}
   *
   * Based on [Chrome Trace Event Format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit)
   **/
  readPerfLog():Promise<List> {
    throw new BaseException('NYI');
  }
}
