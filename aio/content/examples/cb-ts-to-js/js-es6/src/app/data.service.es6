import { Injectable } from '@angular/core';

export class DataService {
  constructor() {
  }
  getHeroName() {
    return 'Windstorm';
  }
}

DataService.annotations = [
  new Injectable()
];
