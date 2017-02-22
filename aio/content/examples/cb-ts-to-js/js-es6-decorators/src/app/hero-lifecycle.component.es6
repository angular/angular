// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'hero-lifecycle',
  template: `<h1>Hero: {{name}}</h1>`
})
export class HeroComponent {
  name = '';
  ngOnInit() {
    // todo: fetch from server async
    setTimeout(() => this.name = 'Windstorm', 0);
  }
}
