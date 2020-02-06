import { Component, Input, ViewChild } from '@angular/core';
import { Events, MessageBus } from 'protocol';
import { MatTabGroup } from '@angular/material/tabs';
import { DirectiveExplorerComponent } from './directive-explorer/directive-explorer.component';

@Component({
  selector: 'ng-devtools-tabs',
  templateUrl: './devtools-tabs.component.html',
  styleUrls: ['./devtools-tabs.component.css'],
})
export class DevToolsTabsComponent {
  @Input() messageBus: MessageBus<Events>;
  @Input() angularVersion: string | undefined = undefined;
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
  @ViewChild(DirectiveExplorerComponent) directiveExplorer: DirectiveExplorerComponent;

  inspectorRunning = false;

  toggleInspector(): void {
    this.toggleInspectorState();
    this.emitInspectorEvent();
  }

  emitInspectorEvent(): void {
    if (this.inspectorRunning) {
      this.messageBus.emit('inspectorStart');
      this.tabGroup.selectedIndex = 0;
    } else {
      this.messageBus.emit('inspectorEnd');
    }
  }

  toggleInspectorState(): void {
    this.inspectorRunning = !this.inspectorRunning;
  }

  refresh(): void {
    this.directiveExplorer.refresh();
  }
}
