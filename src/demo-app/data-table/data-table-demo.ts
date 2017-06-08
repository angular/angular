import {Component} from '@angular/core';
import {PeopleDatabase} from './people-database';
import {PersonDataSource} from './person-data-source';

export type UserProperties = 'userId' | 'userName' | 'progress' | 'color';

@Component({
  moduleId: module.id,
  selector: 'data-table-demo',
  templateUrl: 'data-table-demo.html',
  styleUrls: ['data-table-demo.css'],
})
export class DataTableDemo {
  dataSource: PersonDataSource;
  propertiesToDisplay: UserProperties[] = ['userId', 'userName', 'progress', 'color'];

  constructor(private _peopleDatabase: PeopleDatabase) { }

  ngOnInit() {
    this.dataSource = new PersonDataSource(this._peopleDatabase);
  }

  getOpacity(progress: number) {
    let distanceFromMiddle = Math.abs(50 - progress);
    return distanceFromMiddle / 50 + .3;
  }

  toggleColorColumn() {
    let colorColumnIndex = this.propertiesToDisplay.indexOf('color');
    if (colorColumnIndex == -1) {
      this.propertiesToDisplay.push('color');
    } else {
      this.propertiesToDisplay.splice(colorColumnIndex, 1);
    }
  }
}
