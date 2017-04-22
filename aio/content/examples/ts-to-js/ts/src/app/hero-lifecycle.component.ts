// #docregion
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'hero-lifecycle',
  template: `<h1>Hero: {{name}}</h1>`
})
export class HeroComponent implements OnInit {
  name: string;
  ngOnInit() {
    // todo: fetch from server async
    setTimeout(() => this.name = 'Windstorm', 0);
  }
}
