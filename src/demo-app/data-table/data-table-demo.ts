import {Component} from '@angular/core';
import {PeopleDatabase} from './people-database';
import {PersonDataSource} from './person-data-source';

@Component({
  moduleId: module.id,
  selector: 'data-table-demo',
  templateUrl: 'data-table-demo.html',
  styleUrls: ['data-table-demo.css'],
})
export class DataTableDemo {
  dataSource: PersonDataSource;
  propertiesToDisplay = ['userId', 'userName', 'progress', 'color'];

  constructor(private _peopleDatabase: PeopleDatabase) { }

  ngOnInit() {
    this.dataSource = new PersonDataSource(this._peopleDatabase);
  }

  getOpacity(progress: number) {
    let distanceFromMiddle = Math.abs(50 - progress);
    return distanceFromMiddle / 50 + .3;
  }
}
