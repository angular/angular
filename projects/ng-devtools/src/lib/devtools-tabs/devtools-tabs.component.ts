import { Component, Input, ViewChild } from '@angular/core';
import { Events, MessageBus } from 'protocol';
import { MatTabGroup } from '@angular/material/tabs';
import { DirectiveExplorerComponent } from './directive-explorer/directive-explorer.component';
import { ApplicationEnvironment } from '../application-environment';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'ng-devtools-tabs',
  templateUrl: './devtools-tabs.component.html',
  styleUrls: ['./devtools-tabs.component.scss'],
})
export class DevToolsTabsComponent {
  @Input() angularVersion: string | undefined = undefined;
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
  @ViewChild(DirectiveExplorerComponent) directiveExplorer: DirectiveExplorerComponent;

  constructor(private _messageBus: MessageBus<Events>, private _applicationEnvironment: ApplicationEnvironment) {}

  get latestSHA(): string {
    return this._applicationEnvironment.environment.process.env.LATEST_SHA;
  }

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
      this._messageBus.emit('removeHighlightOverlay');
    }
  }

  toggleInspectorState(): void {
    this.inspectorRunning = !this.inspectorRunning;
  }

  refresh(): void {
    this.directiveExplorer.refresh();
  }

  toggleTimingAPI(change: MatSlideToggleChange): void {
    change.checked ? this._messageBus.emit('enableTimingAPI') : this._messageBus.emit('disableTimingAPI');
  }
}
