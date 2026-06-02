import {Component, viewChild, signal} from '@angular/core';
import {Menu, MenuContent, MenuItem, MenuTrigger} from '@angular/aria/menu';
import {OverlayModule} from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Menu, MenuContent, MenuItem, MenuTrigger, OverlayModule],
})
export class App {
  trigger = viewChild.required<MenuTrigger<string>>('trigger');
  contextMenu = viewChild<Menu<string>>('contextMenu');

  // Position of the context menu
  menuPosition = signal({x: 0, y: 0});

  onContextMenu(event: MouseEvent) {
    event.preventDefault();

    // Update position coordinates
    this.menuPosition.set({x: event.clientX, y: event.clientY});

    // Open the menu via the trigger
    this.trigger().open();
  }

  onItemSelected(value: string) {
    console.log(`Action selected: ${value}`);
  }
}
