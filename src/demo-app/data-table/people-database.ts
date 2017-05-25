import {Injectable} from '@angular/core';
import {NAMES} from '../dataset/names';
import {COLORS} from '../dataset/colors';

export let LATEST_ID: number = 0;

export interface UserData {
  id: string;
  name: string;
  progress: string;
  color: string;
}

@Injectable()
export class PeopleDatabase {
  data: UserData[] = [];

  constructor() {
    for (let i = 0; i < 100; i++) { this.addPerson(); }
  }

  addPerson() {
    const name =
        NAMES[Math.round(Math.random() * (NAMES.length - 1))] + ' ' +
        NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) + '.';

    this.data.push({
      id: (++LATEST_ID).toString(),
      name: name,
      progress: Math.round(Math.random() * 100).toString(),
      color: COLORS[Math.round(Math.random() * (COLORS.length - 1))]
    });
  }
}
