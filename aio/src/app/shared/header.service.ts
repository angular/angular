import {DOCUMENT} from '@angular/common';
import {Injectable, inject} from '@angular/core';

/**
 * Information about the deployment of this application.
 */
@Injectable({providedIn: 'root'})
export class HeaderService {
  document = inject(DOCUMENT);

  setCanonical(path: string): void {
    this.document.querySelector('link[rel=canonical]')?.setAttribute('href', path);
  }
}
