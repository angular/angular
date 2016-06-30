import {Component, ViewEncapsulation} from '@angular/core';
import {NgIf, NgFor, AsyncPipe} from '@angular/common';
import {FORM_DIRECTIVES} from '@angular/forms';
import {MD_TABS_DIRECTIVES} from '@angular2-material/tabs/tabs';
import {MdToolbar} from '@angular2-material/toolbar/toolbar';
import {MdInput} from '@angular2-material/input/input';
import {Observable} from 'rxjs/Observable';

@Component({
  moduleId: module.id,
  selector: 'tab-group-demo',
  templateUrl: 'tab-group-demo.html',
  styleUrls: ['tab-group-demo.css'],
  directives: [MD_TABS_DIRECTIVES, MdToolbar, MdInput, NgIf, FORM_DIRECTIVES, NgFor],
  pipes: [AsyncPipe],
  encapsulation: ViewEncapsulation.None,
})
export class TabsDemo {
  tabs = [
    { label: 'Tab One', content: 'This is the body of the first tab' },
    { label: 'Tab Two', content: 'This is the body of the second tab' },
    { label: 'Tab Three', content: 'This is the body of the third tab' },
  ];
  asyncTabs: Observable<any>;
  constructor() {
    this.asyncTabs = Observable.create((observer: any) => {
      setTimeout(() => {
        observer.next(this.tabs);
      }, 1000);
    });
  }
}
