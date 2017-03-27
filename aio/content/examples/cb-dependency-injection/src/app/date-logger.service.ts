/* tslint:disable:one-line:check-open-brace*/
// #docregion
import { Injectable }    from '@angular/core';

import { LoggerService } from './logger.service';

// #docregion minimal-logger
// class used as a restricting interface (hides other public members)
export abstract class MinimalLogger {
  logInfo: (msg: string) => void;
  logs: string[];
}
// #enddocregion minimal-logger

/*
// Transpiles to:
// #docregion minimal-logger-transpiled
  var MinimalLogger = (function () {
    function MinimalLogger() {}
    return MinimalLogger;
  }());
  exports("MinimalLogger", MinimalLogger);
// #enddocregion minimal-logger-transpiled
 */

// #docregion date-logger-service
@Injectable()
// #docregion date-logger-service-signature
export class DateLoggerService extends LoggerService implements MinimalLogger
// #enddocregion date-logger-service-signature
{
  logInfo(msg: any)  { super.logInfo(stamp(msg)); }
  logDebug(msg: any) { super.logInfo(stamp(msg)); }
  logError(msg: any) { super.logError(stamp(msg)); }
}

function stamp(msg: any) { return msg + ' at ' + new Date(); }
// #enddocregion date-logger-service
