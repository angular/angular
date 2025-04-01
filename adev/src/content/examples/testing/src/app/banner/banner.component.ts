import {Component, signal} from '@angular/core';

// #docregion component
@Component({
  selector: 'app-banner',
  template: '<h1>{{title()}}</h1>',
  styles: ['h1 { color: green; font-size: 350%}'],
})
export class BannerComponent {
  title = signal('Test Tour of Heroes');
}
// #enddocregion component
