import {Component} from '@angular/core';

export interface Section {
  name: string;
  updated: Date;
}

/**
 * @title List with sections
 */
@Component({
  selector: 'list-sections-example',
  styleUrls: ['list-sections-example.css'],
  templateUrl: 'list-sections-example.html',
})
export class ListSectionsExample {
  folders: Section[] = [
    {
      name: 'Photos',
      updated: new Date('1/1/16'),
    },
    {
      name: 'Recipes',
      updated: new Date('1/17/16'),
    },
    {
      name: 'Work',
      updated: new Date('1/28/16'),
    }
  ];
  notes: Section[] = [
    {
      name: 'Vacation Itinerary',
      updated: new Date('2/20/16'),
    },
    {
      name: 'Kitchen Remodel',
      updated: new Date('1/18/16'),
    }
  ];
}
