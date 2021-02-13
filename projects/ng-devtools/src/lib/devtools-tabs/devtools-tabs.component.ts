import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Events, MessageBus } from 'protocol';
import { DirectiveExplorerComponent } from './directive-explorer/directive-explorer.component';
import { ApplicationEnvironment } from '../application-environment';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TabUpdate } from './tab-update';
import { Theme, ThemeService } from '../theme-service';
import { Subscription } from 'rxjs';
import { MatTabNav } from '@angular/material/tabs';

@Component({
  selector: 'ng-devtools-tabs',
  templateUrl: './devtools-tabs.component.html',
  styleUrls: ['./devtools-tabs.component.scss'],
})
export class DevToolsTabsComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() angularVersion: string | undefined = undefined;
  @ViewChild(DirectiveExplorerComponent) directiveExplorer: DirectiveExplorerComponent;
  @ViewChild('navBar', { static: true }) navbar: MatTabNav;

  tabs = ['Components', 'Profiler'];
  activeTab: 'Components' | 'Profiler' = 'Components';

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

  ngAfterViewInit(): void {
    this.navbar.disablePagination = true;
  }

  ngOnDestroy(): void {
    this._currentThemeSubscription.unsubscribe();
  }

  get latestSHA(): string {
    return this._applicationEnvironment.environment.process.env.LATEST_SHA;
  }

  onTabChange(tab: 'Profiler' | 'Components'): void {
    this.activeTab = tab;
    this.tabUpdate.notify();
  }

  toggleInspector(): void {
    this.toggleInspectorState();
    this.emitInspectorEvent();
  }

  emitInspectorEvent(): void {
    if (this.inspectorRunning) {
      this._messageBus.emit('inspectorStart');
      this.activeTab = 'Components';
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
