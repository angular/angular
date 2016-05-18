import {Component} from '@angular/core';
import {MdIcon} from '@angular2-material/icon/icon';
import {MdToolbar} from '@angular2-material/toolbar/toolbar';

@Component({
  moduleId: module.id,
  selector: 'toolbar-demo',
  templateUrl: 'toolbar-demo.html',
  styleUrls: ['toolbar-demo.css'],
  directives: [MdToolbar, MdIcon]
})
export class ToolbarDemo {

}
