import { Component, Input } from '@angular/core';

import { Contributor } from './contributors.model';

@Component({
  selector: 'aio-contributor',
  template: `
    <header>
      <img src="{{pictureBase}}{{person.picture || noPicture}}" alt="name" width="240" height="208">
      <h3>{{person.name}}</h3>
      <button *ngIf="person.bio" aria-label="View Bio" (click)="showBio=!showBio">View Bio</button>

      <!-- TODO: get the twitter/website icons and get rid of text -->
      <a *ngIf="person.twitter" href="https://twitter.com/{{person.twitter}}">
        <span class="icon-twitter">twitter</span>
      </a>
      <a *ngIf="person.website" href="{{person.website}}">
        <span class="icon-publ">website</span>
      </a>
      <p>{{person.bio}}</p>

    <header>
    <!-- TODO: This should be modal and float over the width of page -->
    <article *ngIf="showBio">
      <h3>{{person.name}}</h3>
      <p>{{person.bio}}</p>
    <article>
  `
})
export class ContributorComponent {
  @Input() person: Contributor;
  showBio = false;
  noPicture = '_no-one.png';
  pictureBase = 'content/images/bios/';
}

