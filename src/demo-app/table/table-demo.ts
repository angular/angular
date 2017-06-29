import {Component, ViewChild} from '@angular/core';
import {PeopleDatabase, UserData} from './people-database';
import {PersonDataSource} from './person-data-source';
import {MdPaginator} from '@angular/material';
import {MdSort} from '@angular/material';

export type UserProperties = 'userId' | 'userName' | 'progress' | 'color' | undefined;

export type TrackByStrategy = 'id' | 'reference' | 'index';

@Component({
  moduleId: module.id,
  selector: 'table-demo',
  templateUrl: 'table-demo.html',
  styleUrls: ['table-demo.css'],
})
export class TableDemo {
  dataSource: PersonDataSource | null;
  propertiesToDisplay: UserProperties[] = [];
  trackByStrategy: TrackByStrategy = 'reference';
  changeReferences = false;
  highlights = new Set<string>();

  @ViewChild(MdPaginator) _paginator: MdPaginator;

  @ViewChild(MdSort) sort: MdSort;

  constructor(public _peopleDatabase: PeopleDatabase) { }

  ngOnInit() {
    this.connect();
  }

  connect() {
    this.propertiesToDisplay = ['userId', 'userName', 'progress', 'color'];
    this.dataSource = new PersonDataSource(this._peopleDatabase,
        this._paginator, this.sort);
    this._peopleDatabase.initialize();
  }

  disconnect() {
    this.dataSource = null;
    this.propertiesToDisplay = [];
  }

  getOpacity(progress: number) {
    let distanceFromMiddle = Math.abs(50 - progress);
    return distanceFromMiddle / 50 + .3;
  }

  userTrackBy = (index: number, item: UserData) => {
    switch (this.trackByStrategy) {
      case 'id': return item.id;
      case 'reference': return item;
      case 'index': return index;
    }
  }

  toggleColorColumn() {
    let colorColumnIndex = this.propertiesToDisplay.indexOf('color');
    if (colorColumnIndex == -1) {
      this.propertiesToDisplay.push('color');
    } else {
      this.propertiesToDisplay.splice(colorColumnIndex, 1);
    }
  }

  toggleHighlight(property: string, enable: boolean) {
    enable ? this.highlights.add(property) : this.highlights.delete(property);
  }
}
