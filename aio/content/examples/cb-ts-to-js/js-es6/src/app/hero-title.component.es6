import { Attribute, Component, Inject, Optional } from '@angular/core';

// #docregion
export class HeroTitleComponent {
  constructor(titlePrefix, title) {
    this.titlePrefix = titlePrefix;
    this.title  = title;
    this.msg = '';
  }

  ok() {
    this.msg = 'OK!';
  }
}

// #docregion templateUrl
HeroTitleComponent.annotations = [
  new Component({
    selector: 'hero-title',
    templateUrl: './hero-title.component.html'
  })
];
// #enddocregion templateUrl

HeroTitleComponent.parameters = [
  [new Optional(), new Inject('titlePrefix')],
  [new Attribute('title')]
];
