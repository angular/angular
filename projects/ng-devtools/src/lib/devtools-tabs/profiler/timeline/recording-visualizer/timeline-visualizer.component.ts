import { Component, Input } from '@angular/core';
import { VisualizationMode } from '../visualization-mode';
import { ProfilerFrame } from 'protocol';
import { BargraphNode } from '../record-formatter/bargraph-formatter';
import { FlamegraphNode } from '../record-formatter/flamegraph-formatter';

export interface SelectedEntry {
  entry: BargraphNode | FlamegraphNode;
  selectedDirectives: SelectedDirective[];
  parentHierarchy?: { name: string }[];
}

export interface SelectedDirective {
  directive: string;
  method: string;
  value: number;
}

@Component({
  selector: 'ng-timeline-visualizer',
  templateUrl: './timeline-visualizer.component.html',
  styleUrls: ['./timeline-visualizer.component.scss'],
})
export class TimelineVisualizerComponent {
  @Input() set visualizationMode(mode: VisualizationMode) {
    this._visualizationMode = mode;
    this.selectedEntry = null;
    this.selectedDirectives = [];
    this.parentHierarchy = [];
  }
  @Input() frame: ProfilerFrame;
  @Input() changeDetection: boolean;

  cmpVisualizationModes = VisualizationMode;

  selectedEntry: BargraphNode | FlamegraphNode | null = null;
  selectedDirectives: SelectedDirective[] = [];
  parentHierarchy: { name: string }[] = [];
  _visualizationMode: VisualizationMode;

  handleNodeSelect({ entry, parentHierarchy, selectedDirectives }: SelectedEntry): void {
    this.selectedEntry = entry;
    this.selectedDirectives = selectedDirectives;
    this.parentHierarchy = parentHierarchy ?? [];
  }
}
