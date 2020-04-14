import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { GraphNode } from '../record-formatter/record-formatter';

@Component({
  selector: 'ng-frame-selector',
  templateUrl: './frame-selector.component.html',
  styleUrls: ['./frame-selector.component.scss'],
})
export class FrameSelectorComponent {
  @ViewChild('barContainer') barContainer: ElementRef;
  @Input() set currentFrame(value: number) {
    this.currentFrameIndex = value;
    this.barContainer?.nativeElement?.children?.[value]?.scrollIntoView({
      behavior: 'auto',
      block: 'end',
      inline: 'nearest',
    });
  }
  @Input() graphData: GraphNode[];
  @Input() profilerFramesLength: number;
  @Output() move = new EventEmitter<number>();
  @Output() selectFrame = new EventEmitter<number>();

  currentFrameIndex: number;
}
