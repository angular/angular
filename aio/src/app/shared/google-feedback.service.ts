import { Injectable } from '@angular/core';
import { Logger } from 'app/shared/logger.service';

interface UserFeedback {
  api: { startFeedback: (config: any) => void };
}

@Injectable()
/**
 * Google Feedback Service - opens a Google Feedback facility.
 * Presupposes that tiny Google Feedback has been loaded from
 * //www.gstatic.com/feedback/api.js with a script on the host web page.
 */
export class GoogleFeedbackService {

  // ms to wait before acquiring window.userfeedback after library loads
  // empirically determined to allow time for e2e test setup
  static initializeDelay = 1000;

  private userFeedback: UserFeedback;

  constructor(private logger: Logger) {
    // fallback userFeedback
    this.userFeedback = {
      api: { startFeedback: () => {
          logger.error('Google Feedback service is not available.');
        }
      }
    };
  }

  openFeedback() {
    this.initializeGoogleFeedback().then(ufb => {
      const configuration = {
        'productId': '410509', // Google's Angular Docs key?
        'authuser': '1',
        'bucket': 'angulario'
      };
      ufb.api.startFeedback(configuration);
    });
  };

  private initializeGoogleFeedback() {
    let ufb = window['userfeedback'];
    if (ufb) {
      return Promise.resolve<UserFeedback>(this.userFeedback = ufb);
    } else {
      // Give script more time to async load.
      // Useful in e2e tests.
      return new Promise<UserFeedback>(resolve => {
        setTimeout(() => {
          ufb = window['userfeedback'];
          if (ufb) { this.userFeedback = ufb; }
          resolve(this.userFeedback);
        }, GoogleFeedbackService.initializeDelay);
      });
    }
  }
}
