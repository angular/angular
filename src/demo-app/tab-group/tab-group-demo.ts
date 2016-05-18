import {Component, ViewEncapsulation} from '@angular/core';
import {MD_TAB_GROUP_DIRECTIVES} from '@angular2-material/tab-group/tab-group';
import {MdToolbar} from '@angular2-material/toolbar/toolbar';
import {MdInput} from '@angular2-material/input/input';

@Component({
  moduleId: module.id,
  selector: 'tab-group-demo',
  templateUrl: 'tab-group-demo.html',
  styleUrls: ['tab-group-demo.css'],
  directives: [MD_TAB_GROUP_DIRECTIVES, MdToolbar, MdInput],
  encapsulation: ViewEncapsulation.None,
})
export class TabGroupDemo {
  tabs = [
    { label: 'Tab One', content: 'This is the body of the first tab' },
    { label: 'Tab Two', content: 'This is the body of the second tab' },
    { label: 'Tab Three', content: 'This is the body of the third tab' },
  ];
}
