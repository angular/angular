import { Attribute, Component, Inject, Optional } from '@angular/core';

// #docregion
// #docregion templateUrl
@Component({
  selector: 'hero-title',
  templateUrl: './hero-title.component.html'
})
// #enddocregion templateUrl
export class HeroTitleComponent {
  msg: string = '';
  constructor(
    @Inject('titlePrefix') @Optional() private titlePrefix: string,
    @Attribute('title') private title: string
  ) { }

  ok() {
    this.msg = 'OK!';
  }
}
// #enddocregion
