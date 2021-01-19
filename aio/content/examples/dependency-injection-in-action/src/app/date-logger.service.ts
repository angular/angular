/* tslint:disable:one-line*/
// #docregion
import { Injectable } from '@angular/core';

import { LoggerService } from './logger.service';

// #docregion date-logger-service
@Injectable({
  providedIn: 'root'
})
export class DateLoggerService extends LoggerService
{
  logInfo(msg: any)  { super.logInfo(stamp(msg)); }
  logDebug(msg: any) { super.logInfo(stamp(msg)); }
  logError(msg: any) { super.logError(stamp(msg)); }
}

function stamp(msg: any) { return msg + ' at ' + new Date(); }
// #enddocregion date-logger-service
