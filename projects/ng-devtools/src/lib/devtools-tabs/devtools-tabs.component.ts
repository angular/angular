import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Events, MessageBus } from 'protocol';
import { DirectiveExplorerComponent } from './directive-explorer/directive-explorer.component';
import { ApplicationEnvironment } from '../application-environment';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TabUpdate } from './tab-update';
import { Theme, ThemeService } from '../theme-service';
import { Subscription } from 'rxjs';
import { MatTabNav } from '@angular/material/tabs';
import { RouterTreeComponent } from './router-tree/router-tree.component';
import { MatDialog } from '@angular/material/dialog';
import { RouterConfirmDialogComponent } from './router-tree/router-confirm-dialog/router-confirm-dialog.component';

@Component({
  selector: 'ng-devtools-tabs',
  templateUrl: './devtools-tabs.component.html',
  styleUrls: ['./devtools-tabs.component.scss'],
})
export class DevToolsTabsComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() angularVersion: string | undefined = undefined;
  @ViewChild(DirectiveExplorerComponent) directiveExplorer: DirectiveExplorerComponent;
  @ViewChild('navBar', { static: true }) navbar: MatTabNav;
  @ViewChild('routerTree', { static: false }) routerTree: RouterTreeComponent;

  tabs = ['Components', 'Profiler'];
  activeTab: 'Components' | 'Profiler' | 'Router Tree' = 'Components';

  inspectorRunning = false;
  routerTreeEnabled = false;

  private _currentThemeSubscription: Subscription;
  currentTheme: Theme;

  constructor(
    public tabUpdate: TabUpdate,
    public themeService: ThemeService,
    private _messageBus: MessageBus<Events>,
    private _applicationEnvironment: ApplicationEnvironment,
    private _dialog: MatDialog
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

  onTabChange(tab: 'Profiler' | 'Components' | 'Router Tree'): void {
    this.activeTab = tab;
    this.tabUpdate.notify();
    if (tab === 'Router Tree') {
      setTimeout(() => {
        this.routerTree.render();
      });
    }
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

  toggleRouterTree(change: MatSlideToggleChange): void {
    if (change.checked) {
      this.tabs = ['Components', 'Profiler', 'Router Tree'];
      this.routerTreeEnabled = true;
    } else {
      if (this.activeTab === 'Router Tree') {
        const dialogRef = this._dialog.open(RouterConfirmDialogComponent);
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.routerTreeEnabled = false;
            this.tabs = ['Components', 'Profiler'];
            this.activeTab = 'Components';
          } else {
            this.routerTreeEnabled = true;
          }
        });
      } else {
        this.routerTreeEnabled = false;
        this.tabs = ['Components', 'Profiler'];
      }
    }
  }
}
