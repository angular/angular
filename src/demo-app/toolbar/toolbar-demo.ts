import {Component} from '@angular/core';
import {MdIcon} from '../../components/icon/icon';
import {MdToolbar} from '../../components/toolbar/toolbar';

@Component({
  selector: 'toolbar-demo',
  templateUrl: 'demo-app/toolbar/toolbar-demo.html',
  styleUrls: ['demo-app/toolbar/toolbar-demo.css'],
  directives: [MdToolbar, MdIcon]
})
export class ToolbarDemo {

}
