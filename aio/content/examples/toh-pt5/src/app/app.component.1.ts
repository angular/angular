// #docplaster
// #docregion , v2
import { Component } from '@angular/core';

// #enddocregion v2
@Component({
  selector: 'my-app',
  template: `
    <h1>{{title}}</h1>
    <my-heroes></my-heroes>
  `
})
// #enddocregion
// #docregion v2
@Component({
  selector: 'my-app',
  // #docregion template-v2
  template: `
     <h1>{{title}}</h1>
     <a routerLink="/heroes">Heroes</a>
     <router-outlet></router-outlet>
   `
  // #enddocregion template-v2
})
// #enddocregion
@Component({
  selector: 'my-app',
  // #docregion template-v3
  template: `
     <h1>{{title}}</h1>
     <nav>
       <a routerLink="/dashboard">Dashboard</a>
       <a routerLink="/heroes">Heroes</a>
     </nav>
     <router-outlet></router-outlet>
   `
  // #enddocregion template-v3
})
// #docregion , v2
export class AppComponent {
  title = 'Tour of Heroes';
}
