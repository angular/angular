// #docplaster
// #docregion , mock-crises
export class Crisis {
  constructor(public id: number, public name: string) { }
}

const CRISES = [
  new Crisis(1, 'Dragon Burning Cities'),
  new Crisis(2, 'Sky Rains Great White Sharks'),
  new Crisis(3, 'Giant Asteroid Heading For Earth'),
  new Crisis(4, 'Procrastinators Meeting Delayed Again'),
];
// #enddocregion mock-crises

let crisesPromise = Promise.resolve(CRISES);

import { Injectable } from '@angular/core';

@Injectable()
export class CrisisService {

  static nextCrisisId = 100;

  getCrises() { return crisesPromise; }

  getCrisis(id: number | string) {
    return crisesPromise
      .then(crises => crises.find(crisis => crisis.id === +id));
  }

  // #enddocregion
  addCrisis(name: string) {
    name = name.trim();
    if (name) {
      let crisis = new Crisis(CrisisService.nextCrisisId++, name);
      crisesPromise.then(crises => crises.push(crisis));
    }
  }
  // #docregion
}
