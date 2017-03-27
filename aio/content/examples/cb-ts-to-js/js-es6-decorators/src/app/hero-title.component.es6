import { Attribute, Component, Inject, Optional } from '@angular/core';

// #docregion
// #docregion templateUrl
@Component({
  selector: 'hero-title',
  templateUrl: './hero-title.component.html'
})
// #enddocregion templateUrl
export class HeroTitleComponent {
  msg = '';
  constructor(
    @Inject('titlePrefix') @Optional() titlePrefix,
    @Attribute('title') title
  ) {
    this.titlePrefix = titlePrefix;
    this.title = title;
  }

  ok() {
    this.msg = 'OK!';
  }
}
// #enddocregion

