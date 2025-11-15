import {Dir} from '@angular/cdk/bidi';
import {Component} from '@angular/core';
import {Toolbar, ToolbarWidget, ToolbarWidgetGroup} from '@angular/aria/toolbar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [Dir, Toolbar, ToolbarWidget, ToolbarWidgetGroup],
})
export class App {}
