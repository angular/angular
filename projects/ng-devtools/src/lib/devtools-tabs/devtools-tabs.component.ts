import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Events, MessageBus } from 'protocol';
import { MatTabGroup } from '@angular/material/tabs';
import { DirectiveExplorerComponent } from './directive-explorer/directive-explorer.component';
import { ApplicationEnvironment } from '../application-environment';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TabUpdate } from './tab-update';
import { Theme, ThemeService } from '../theme-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ng-devtools-tabs',
  templateUrl: './devtools-tabs.component.html',
  styleUrls: ['./devtools-tabs.component.scss'],
})
export class DevToolsTabsComponent implements OnInit, OnDestroy {
  @Input() angularVersion: string | undefined = undefined;
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
  @ViewChild(DirectiveExplorerComponent) directiveExplorer: DirectiveExplorerComponent;

  inspectorRunning = false;

  private _currentThemeSubscription: Subscription;
  currentTheme: Theme;

  constructor(
    public tabUpdate: TabUpdate,
    public themeService: ThemeService,
    private _messageBus: MessageBus<Events>,
    private _applicationEnvironment: ApplicationEnvironment
  ) {}

  ngOnInit(): void {
    this._currentThemeSubscription = this.themeService.currentTheme.subscribe((theme) => (this.currentTheme = theme));
  }

  ngOnDestroy(): void {
    this._currentThemeSubscription.unsubscribe();
  }

  get latestSHA(): string {
    return this._applicationEnvironment.environment.process.env.LATEST_SHA;
  }

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
