// #docregion
import { Injectable } from '@angular/core';

import { LoggerService } from './logger.service';

// #docregion date-logger-service
@Injectable({
  providedIn: 'root'
})
export class DateLoggerService extends LoggerService
{
  override logInfo(msg: any)  { super.logInfo(stamp(msg)); }
  override logDebug(msg: any) { super.logInfo(stamp(msg)); }
  override logError(msg: any) { super.logError(stamp(msg)); }
}

function stamp(msg: any) { return msg + ' at ' + new Date(); }
// #enddocregion date-logger-service
