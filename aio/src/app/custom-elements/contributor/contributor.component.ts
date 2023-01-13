import { Component, Input } from '@angular/core';

import { Contributor } from './contributors.model';
import { CONTENT_URL_PREFIX } from 'app/documents/document.service';

@Component({
  selector: 'aio-contributor',
  template: `
    <section class="contributor-card" [class.no-image]="!person.picture"
      attr.aria-labelledby="{{person.name}}-section-heading">
      <div *ngIf="person.picture" class="contributor-image-wrapper">
      <img [src]="pictureBase+person.picture" alt="{{person.name}}" class="contributor-image">
      </div>
      <h3 id="{{person.name}}-section-heading" class="contributor-title">{{person.name}}</h3>
      <p class="contributor-bio">{{person.bio}}</p>
      <div class="contributor-social-links">
        <a *ngIf="person.twitter" mat-icon-button class="info-item icon contributor-social"
            attr.aria-label="twitter of {{person.name}}"
            href="https://twitter.com/{{person.twitter}}"
            target="_blank" (click)="$event.stopPropagation()">
            <mat-icon svgIcon="logos:twitter"></mat-icon>
        </a>
        <a *ngIf="person.website" mat-icon-button class="info-item icon"
           attr.aria-label="website of {{person.name}}"
           href="{{person.website}}" target="_blank" (click)="$event.stopPropagation()">
           <mat-icon class="link-icon">link</mat-icon>
        </a>
      </div>
    </section>
  `
})
export class ContributorComponent {
  @Input() person: Contributor;
  pictureBase = CONTENT_URL_PREFIX + 'images/bios/';
}
