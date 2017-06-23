import {Injectable} from '@angular/core';
import {NAMES} from '../dataset/names';
import {COLORS} from '../dataset/colors';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

export let LATEST_ID: number = 0;

export interface UserData {
  id: string;
  name: string;
  progress: string;
  color: string;
}

@Injectable()
export class PeopleDatabase {
  dataChange: BehaviorSubject<UserData[]> = new BehaviorSubject<UserData[]>([]);

  get data(): UserData[] { return this.dataChange.value; }

  constructor() {
    this.initialize();
  }

  initialize() {
    LATEST_ID = 0;
    this.dataChange.next([]);
    for (let i = 0; i < 100; i++) { this.addPerson(); }
  }

  shuffle(changeReferences: boolean) {
    let copiedData = this.data.slice();
    for (let i = copiedData.length; i; i--) {
      let j = Math.floor(Math.random() * i);
      [copiedData[i - 1], copiedData[j]] = [copiedData[j], copiedData[i - 1]];
    }

    if (changeReferences) {
      copiedData = copiedData.map(userData => {
        return {
          id: userData.id,
          name: userData.name,
          progress: userData.progress,
          color: userData.color
        };
      });
    }

    this.dataChange.next(copiedData);
  }

  addPerson() {
    const name =
        NAMES[Math.round(Math.random() * (NAMES.length - 1))] + ' ' +
        NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) + '.';

    const copiedData = this.data.slice();
    copiedData.push({
      id: (++LATEST_ID).toString(),
      name: name,
      progress: Math.round(Math.random() * 100).toString(),
      color: COLORS[Math.round(Math.random() * (COLORS.length - 1))]
    });

    this.dataChange.next(copiedData);
  }
}
