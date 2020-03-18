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
  @Input() angularVersion: string | undefined = undefined;
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
  @ViewChild(DirectiveExplorerComponent) directiveExplorer: DirectiveExplorerComponent;

  constructor(private _messageBus: MessageBus<Events>) {}

  inspectorRunning = false;

  toggleInspector(): void {
    this.toggleInspectorState();
    this.emitInspectorEvent();
  }

  emitInspectorEvent(): void {
    if (this.inspectorRunning) {
      this._messageBus.emit('inspectorStart');
      this.tabGroup.selectedIndex = 0;
    } else {
      this._messageBus.emit('inspectorEnd');
    }
  }

  toggleInspectorState(): void {
    this.inspectorRunning = !this.inspectorRunning;
  }

  refresh(): void {
    this.directiveExplorer.refresh();
  }
}
