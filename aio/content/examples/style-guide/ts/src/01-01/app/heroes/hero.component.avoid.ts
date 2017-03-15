// #docregion
/* avoid */

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component, OnInit } from '@angular/core';

class Hero {
  id: number;
  name: string;
}

@Component({
  selector: 'my-app',
  template: `
      <h1>{{title}}</h1>
      <pre>{{heroes | json}}</pre>
    `,
  styleUrls: ['app/app.component.css']
})
class AppComponent implements OnInit {
  title = 'Tour of Heroes';

  heroes: Hero[] = [];

  ngOnInit() {
    getHeroes().then(heroes => this.heroes = heroes);
  }
}

@NgModule({
  imports: [ BrowserModule ],
  declarations: [ AppComponent ],
  exports: [ AppComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);

const HEROES: Hero[] = [
  {id: 1, name: 'Bombasto'},
  {id: 2, name: 'Tornado'},
  {id: 3, name: 'Magneta'},
];

function getHeroes(): Promise<Hero[]> {
  return Promise.resolve(HEROES); // TODO: get hero data from the server;
}
