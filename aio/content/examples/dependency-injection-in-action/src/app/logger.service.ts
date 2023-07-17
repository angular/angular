// #docregion
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  logs: string[] = [];

  logInfo(msg: any)  { this.log(`INFO: ${msg}`); }
  logDebug(msg: any) { this.log(`DEBUG: ${msg}`); }
  logError(msg: any) { this.log(`ERROR: ${msg}`, true); }

  private log(msg: any, isErr = false) {
    this.logs.push(msg);
    if (isErr) {
      console.error(msg);
    } else {
      console.log(msg);
    }
  }
}
