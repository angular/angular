import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BargraphNode, BarGraphFormatter } from '../../record-formatter/bargraph-formatter';
import { ProfilerFrame } from 'protocol';
import { SelectedDirective, SelectedEntry } from '../timeline-visualizer.component';
import { Theme, ThemeService } from 'projects/ng-devtools/src/lib/theme-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ng-bargraph-visualizer',
  templateUrl: './bargraph-visualizer.component.html',
  styleUrls: ['./bargraph-visualizer.component.scss'],
})
export class BargraphVisualizerComponent implements OnInit, OnDestroy {
  barColor: string;
  profileRecords: BargraphNode[];

  @Output() nodeSelect = new EventEmitter<SelectedEntry>();

  private _formatter = new BarGraphFormatter();
  private _currentThemeSubscription: Subscription;
  currentTheme: Theme;

  @Input() set frame(data: ProfilerFrame) {
    this.profileRecords = this._formatter.formatFrame(data);
  }

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    this._currentThemeSubscription = this.themeService.currentTheme.subscribe((theme) => {
      this.currentTheme = theme;
      this.barColor = theme === 'dark-theme' ? '#073d69' : '#cfe8fc';
    });
  }

  ngOnDestroy(): void {
    this._currentThemeSubscription.unsubscribe();
  }

  formatEntryData(bargraphNode: BargraphNode): SelectedDirective[] {
    const graphData: SelectedDirective[] = [];
    bargraphNode.original.directives.forEach((node) => {
      const { changeDetection } = node;
      if (changeDetection) {
        graphData.push({
          directive: node.name,
          method: 'changes',
          value: parseFloat(changeDetection.toFixed(2)),
        });
      }
      Object.keys(node.lifecycle).forEach((key) => {
        graphData.push({
          directive: node.name,
          method: key,
          value: +node.lifecycle[key].toFixed(2),
        });
      });
    });
    return graphData;
  }

  selectNode(node: BargraphNode): void {
    this.nodeSelect.emit({
      entry: node,
      parentHierarchy: node.parents.map((element) => {
        return { name: element.directives[0].name };
      }),
      selectedDirectives: this.formatEntryData(node),
    });
  }
}
