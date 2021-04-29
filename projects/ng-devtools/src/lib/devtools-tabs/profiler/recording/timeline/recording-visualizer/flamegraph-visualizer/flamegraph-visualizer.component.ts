import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import {
  FlamegraphNode,
  ROOT_LEVEL_ELEMENT_LABEL,
  FlamegraphFormatter,
} from '../../record-formatter/flamegraph-formatter/flamegraph-formatter';
import { Color, RawData } from 'ngx-flamegraph/lib/utils';
import { ProfilerFrame } from 'protocol';
import { SelectedDirective, SelectedEntry } from '../timeline-visualizer.component';
import { Theme, ThemeService } from 'projects/ng-devtools/src/lib/theme-service';
import { Subscription } from 'rxjs';
import { formatDirectiveProfile } from '../formatter';

@Component({
  selector: 'ng-flamegraph-visualizer',
  templateUrl: './flamegraph-visualizer.component.html',
  styleUrls: ['./flamegraph-visualizer.component.scss'],
})
export class FlamegraphVisualizerComponent implements OnInit, OnDestroy {
  profilerBars: FlamegraphNode[] = [];
  view: [number, number] = [235, 200];
  colors: Color;

  private _formatter = new FlamegraphFormatter();
  private _showChangeDetection = false;
  private _frame: ProfilerFrame;
  private _currentThemeSubscription: Subscription;
  currentTheme: Theme;

  @Output() nodeSelect = new EventEmitter<SelectedEntry>();

  @Input() set frame(frame: ProfilerFrame) {
    this._frame = frame;
    this._selectFrame();
  }

  @Input() set changeDetection(changeDetection: boolean) {
    this._showChangeDetection = changeDetection;
    this._selectFrame();
  }

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    this._currentThemeSubscription = this.themeService.currentTheme.subscribe((theme) => {
      this.currentTheme = theme;
      this.colors =
        theme === 'dark-theme'
          ? {
              hue: [210, 90],
              saturation: [90, 90],
              lightness: [25, 25],
            }
          : {
              hue: [50, 15],
              saturation: [100, 100],
              lightness: [75, 75],
            };
      this._selectFrame();
    });
  }

  ngOnDestroy(): void {
    this._currentThemeSubscription.unsubscribe();
  }

  selectFrame(frame: RawData): void {
    if (frame.label === ROOT_LEVEL_ELEMENT_LABEL) {
      return;
    }

    const flameGraphNode = frame as FlamegraphNode;
    const directiveData = this.formatEntryData(flameGraphNode);

    this.nodeSelect.emit({
      entry: flameGraphNode,
      selectedDirectives: directiveData,
    });
  }

  formatEntryData(flameGraphNode: FlamegraphNode): SelectedDirective[] {
    return formatDirectiveProfile(flameGraphNode.original.directives);
  }

  private _selectFrame(): void {
    this.profilerBars = [this._formatter.formatFrame(this._frame, this._showChangeDetection, this.currentTheme)];
  }
}
