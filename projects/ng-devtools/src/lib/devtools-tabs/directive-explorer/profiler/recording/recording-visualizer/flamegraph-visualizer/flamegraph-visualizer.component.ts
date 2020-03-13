import { Component, ElementRef, Input } from '@angular/core';
import { FlamegraphNode } from '../../timeline/format-records';
import { RawData } from 'ngx-flamegraph/lib/utils';

@Component({
  selector: 'ng-flamegraph-visualizer',
  templateUrl: './flamegraph-visualizer.component.html',
  styleUrls: ['./flamegraph-visualizer.component.css'],
})
export class FlamegraphVisualizerComponent {
  profilerBars: FlamegraphNode[] = [];
  selectedEntry: FlamegraphNode = null;

  @Input() set bars(data: FlamegraphNode[]) {
    this.selectedEntry = null;
    this.profilerBars = data;
  }

  constructor(private _el: ElementRef) {}

  selectFrame(frame: RawData): void {
    this.selectedEntry = frame as FlamegraphNode;
  }

  get availableWidth(): number {
    return this._el.nativeElement.querySelector('.level-profile-wrapper').offsetWidth;
  }
}
