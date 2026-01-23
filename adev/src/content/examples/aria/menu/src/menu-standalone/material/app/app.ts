import {Component, signal, viewChild} from '@angular/core';
import {Menu, MenuContent, MenuItem} from '@angular/aria/menu';
import {OverlayModule} from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [Menu, MenuContent, MenuItem, OverlayModule],
})
export class App {
  hasInteracted = signal(false);
  updateMenu = viewChild<Menu<string>>('updateMenu');
}
