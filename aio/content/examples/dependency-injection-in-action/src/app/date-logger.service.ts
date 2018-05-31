/* tslint:disable:one-line*/
// #docregion
import { Injectable }    from '@angular/core';

import { LoggerService } from './logger.service';

// #docregion date-logger-service
@Injectable({
  providedIn: 'root'
})
// #docregion date-logger-service-signature
export class DateLoggerService extends LoggerService
// #enddocregion date-logger-service-signature
{
  logInfo(msg: any)  { super.logInfo(stamp(msg)); }
  logDebug(msg: any) { super.logInfo(stamp(msg)); }
  logError(msg: any) { super.logError(stamp(msg)); }
}

function stamp(msg: any) { return msg + ' at ' + new Date(); }
// #enddocregion date-logger-service
