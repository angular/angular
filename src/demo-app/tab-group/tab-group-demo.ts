import {Component, ViewEncapsulation} from '@angular/core';
import {MD_TAB_GROUP_DIRECTIVES} from '../../components/tab-group/tab-group';
import {MdToolbar} from '../../components/toolbar/toolbar';
import {MdInput} from '../../components/input/input';

@Component({
  selector: 'tab-group-demo',
  templateUrl: 'demo-app/tab-group/tab-group-demo.html',
  styleUrls: ['demo-app/tab-group/tab-group-demo.css'],
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
