import { Component, Input, ViewChild } from '@angular/core';
import { Events, MessageBus } from 'protocol';
import { MatTabGroup } from '@angular/material/tabs';
import { ComponentExplorerComponent } from './component-explorer/component-explorer.component';

@Component({
  selector: 'ng-devtools-tabs',
  templateUrl: './devtools-tabs.component.html',
  styleUrls: ['./devtools-tabs.component.css'],
})
export class DevToolsTabsComponent {
  @Input() messageBus: MessageBus<Events>;
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
  @ViewChild(ComponentExplorerComponent) componentExplorer: ComponentExplorerComponent;

  inspectorRunning = false;

  toggleInspector(): void {
    this.inspectorRunning = !this.inspectorRunning;
    if (this.inspectorRunning) {
      this.messageBus.emit('inspectorStart');
      this.tabGroup.selectedIndex = 0;
    } else {
      this.messageBus.emit('inspectorEnd');
    }
  }

  refresh(): void {
    this.componentExplorer.refresh();
  }
}
