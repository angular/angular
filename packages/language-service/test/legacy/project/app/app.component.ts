/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';

export interface Address {
  streetName: string;
}

/** The most heroic being. */
export interface Hero {
  id: number;
  name: string;
  address?: Address;
}

@Component({
  selector: 'my-app',
  template: `
    <h1>{{title}}</h1>
    <h2>{{hero.name}} details!</h2>
  `,
  standalone: false,
})
export class AppComponent {
  /** This is the title of the `AppComponent` Component. */
  title = 'Tour of Heroes';
  hero: Hero = {id: 1, name: 'Windstorm'};
  private internal: string = 'internal';
  heroP = Promise.resolve(this.hero);
  heroes: Hero[] = [this.hero];
  heroesP = Promise.resolve(this.heroes);
  tupleArray: [string, Hero] = ['test', this.hero];
  league: Hero[][] = [this.heroes];
  heroesByName: {[name: string]: Hero} = {};
  primitiveIndexType: {[name: string]: string} = {};
  anyValue: any;
  optional?: string;
  // Use to test the `index` variable conflict between the `ngFor` and component context.
  index = null;
  myClick(event: any) {}
  birthday = new Date();
  readonlyHeroes: ReadonlyArray<Readonly<Hero>> = this.heroes;
  constNames = [{name: 'name'}] as const;
  private myField = 'My Field';
  strOrNumber: string | number = '';
  name = 'Frodo';
  setTitle(newTitle: string) {
    this.title = newTitle;
  }
  setHero(obj: Hero) {
    this.hero = obj;
  }
}
