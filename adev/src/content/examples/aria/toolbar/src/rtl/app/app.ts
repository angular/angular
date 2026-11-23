import {Dir} from '@angular/cdk/bidi';
import {Component, signal} from '@angular/core';
import {Toolbar, ToolbarWidget, ToolbarWidgetGroup} from '@angular/aria/toolbar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [Dir, Toolbar, ToolbarWidget, ToolbarWidgetGroup],
})
export class App {
  readonly bold = signal(false);
  readonly italic = signal(false);
  readonly underlined = signal(false);
  readonly alignment = signal<'left' | 'center' | 'right'>('left');
}
