// Early versions

// #docregion
import { Component }         from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <h1>{{title}}</h1>
    <my-car></my-car>
    <my-heroes></my-heroes>
  `
})

export class AppComponent {
  title = 'Dependency Injection';
}
