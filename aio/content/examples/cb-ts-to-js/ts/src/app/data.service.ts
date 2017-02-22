import { Injectable } from '@angular/core';

@Injectable()
export class DataService {
  constructor() { }

  getHeroName() {
    return 'Windstorm';
  }
}
