import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Logger } from 'app/shared/logger.service';

@Injectable()
/**
 * Google Analytics Service - captures app behaviors and sends them to Google Analytics (GA).
 * Presupposes that GA script has been loaded from a script on the host web page.
 * Associates data with a GA "property" from the environment (`gaId`).
 */
export class GaService {
  // ms to wait before acquiring window.ga after analytics library loads
  // empirically determined to allow time for e2e test setup
  static initializeDelay = 1000;

  private previousUrl: string;
  private ga: (...rest: any[]) => void;

  constructor(private logger: Logger) {
    this.initializeGa();
    this.ga('create', environment['gaId'] , 'auto');
  }

  locationChanged(url: string) {
    this.sendPage(url);
  }

  sendPage(url: string) {
    // Won't re-send if the url hasn't changed.
    if (url === this.previousUrl) { return; }
    this.previousUrl = url;
    this.ga('set', 'page', '/' + url);
    this.ga('send', 'pageview');
  }

  // These gyrations are necessary to make the service e2e testable
  // and to disable ga tracking during e2e tests.
  private initializeGa() {
    const ga = window['ga'];
    if (ga) {
      // Queue commands until GA analytics script has loaded.
      const gaQueue: any[][] = [];
      this.ga = (...rest: any[]) => { gaQueue.push(rest); };

      // Then send queued commands to either real or e2e test ga();
      // after waiting to allow possible e2e test to replace global ga function
      ga(() => setTimeout(() => {
        // this.logger.log('GA fn:', window['ga'].toString());
        this.ga = window['ga'];
        gaQueue.forEach((command) => this.ga.apply(null, command));
      }, GaService.initializeDelay));

    } else {
      // delegate `ga` calls to the logger if no ga installed
      this.ga = (...rest: any[]) => { this.logger.log('ga:', rest); };
    }
  }

}
