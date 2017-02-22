import { Component } from '@angular/core';

export class HeroComponent { }

HeroComponent.annotations = [
  new Component({
    selector: 'hero-di-inject-additional',
    template: `<hero-title title="Tour of Heroes"></hero-title>`
  })
];
