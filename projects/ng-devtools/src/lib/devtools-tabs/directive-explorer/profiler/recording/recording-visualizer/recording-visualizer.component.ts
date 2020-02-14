import { Component, ElementRef, Input } from '@angular/core';
import { FlamegraphNode } from '../timeline/format-records';
import { RawData } from 'ngx-flamegraph/lib/utils';

@Component({
  selector: 'ng-recording-visualizer',
  templateUrl: './recording-visualizer.component.html',
  styleUrls: ['./recording-visualizer.component.css'],
})
export class RecordingVisualizerComponent {
  profilerBars: FlamegraphNode[] = [];
  selectedEntry: FlamegraphNode = null;

  @Input() sidebarDisabled = false;
  @Input() set bars(data: FlamegraphNode[]) {
    this.selectedEntry = null;
    this.profilerBars = data;
  }

  constructor(private _el: ElementRef) {}

  selectFrame(frame: RawData) {
    this.selectedEntry = frame as FlamegraphNode;
  }

  get availableWidth() {
    return this._el.nativeElement.querySelector('.level-profile-wrapper').offsetWidth;
  }
}
