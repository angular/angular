import { Inject, Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { WindowToken } from 'app/shared/window';

@Injectable()
/**
 * Google Analytics Service - captures app behaviors and sends them to Google Analytics (GA).
 * Presupposes that GA script has been loaded from a script on the host web page.
 * Associates data with a GA "property" from the environment (`gaId`).
 */
export class GaService {

  private previousUrl: string;

  constructor(@Inject(WindowToken) private window: Window) {
    this.gtag('config', environment['gaId'] );
  }

  locationChanged(url: string) {
    this.sendPage(url);
  }

  sendPage(url: string) {
    // Won't re-send if the url hasn't changed.
    if (url === this.previousUrl) { return; }
    this.previousUrl = url;
    this.gtag('set', 'page', '/' + url);
  }

  sendEvent(source: string, action: string, label?: string, value?: number) {
    this.gtag('send', 'event', source, action, label, value);
  }

  gtag(...args: any[]) {
    const gtagFn = (this.window as any)['gtag'];
    if (gtagFn) {
      gtagFn(...args);
    }
  }
}
