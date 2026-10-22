import {Component, signal} from '@angular/core';
import {Toolbar, ToolbarWidget} from '@angular/aria/toolbar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [Toolbar, ToolbarWidget],
})
export class App {
  readonly bold = signal(false);
  readonly italic = signal(false);
  readonly underlined = signal(false);
}
