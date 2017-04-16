import { Component, Input } from '@angular/core';

import { Contributor } from './contributors.model';

@Component({
  selector: 'aio-contributor',
  template: `
    <div [ngClass]="{ 'flipped': person.isFlipped }" class="contributor-card">

        <div class="card-front" (click)="flipCard(person)">
            <div *ngIf="person.picture" class="contributor-image" [style.background-image]="'url('+pictureBase+person.picture+')'">
            </div>

            <div *ngIf="!person.picture" class="contributor-image" [style.background-image]="'url('+pictureBase+noPicture+')'">
            </div>
            <h3>{{person.name}}</h3>
            <div class="contributor-info">
                <a *ngIf="person.twitter" href="https://twitter.com/{{person.twitter}}" target="_blank">
                    <span class="fa fa-twitter fa-2x"></span>
                </a>
                <a *ngIf="person.website" href="{{person.website}}" target="_blank">
                    <span class="fa fa-link fa-2x"></span>
                </a>
                <div>
                    <a *ngIf="person.bio" aria-label="View Bio">View Bio</a>
                </div>
            </div>
        </div>

        <div class="card-back" *ngIf="person.isFlipped" (click)="flipCard(person)">
            <h3>{{person.name}}</h3>
            <p class="contributor-bio" >{{person.bio}}</p>
        </div>
    </div>
  `
})
export class ContributorComponent {
  @Input() person: Contributor;
  noPicture = '_no-one.png';
  pictureBase = 'content/images/bios/';

  flipCard(person) {
    person.isFlipped = !person.isFlipped;
  }
}
