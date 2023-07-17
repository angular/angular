import { Component, Inject } from '@angular/core';
import { LocalStorage } from 'app/shared/storage.service';

export const storageKey = 'aio-accepts-cookies';

@Component({
  selector: 'aio-cookies-popup',
  template: `
    <div class="cookies-popup no-print" *ngIf="!hasAcceptedCookies">
      <h2 class="visually-hidden">Cookies concent notice</h2>

      This site uses cookies from Google to deliver its services and to analyze traffic.

      <div class="actions">
        <a mat-button href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener">
          Learn more
        </a>
        <button mat-button (click)="acceptCookies()">
          OK, got it
        </button>
      </div>
    </div>
  `,
})
export class CookiesPopupComponent {
  /** Whether the user has already accepted the cookies disclaimer. */
  hasAcceptedCookies: boolean;

  constructor(@Inject(LocalStorage) private storage: Storage) {
    this.hasAcceptedCookies = this.storage.getItem(storageKey) === 'true';
  }

  acceptCookies() {
    this.storage.setItem(storageKey, 'true');
    this.hasAcceptedCookies = true;
  }
}
