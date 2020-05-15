import { Component, EventEmitter, Input, Output } from '@angular/core';

interface Data {
  label: string;
  value: number;
}

@Component({
  selector: 'ng-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent {
  @Input() set data(nodes: Data[]) {
    this._originals = nodes;
    this.internalData = [];
    const max = nodes.reduce((a: number, c) => Math.max(a, c.value), -Infinity);
    for (const node of nodes) {
      this.internalData.push({
        label: node.label,
        value: (node.value / max) * 100,
      });
    }
  }
  @Input() color: string;
  @Output() pick = new EventEmitter<Data>();
  private _originals: Data[];

  internalData: Data[] = [];

  select(idx: number): void {
    this.pick.emit(this._originals[idx]);
  }
}
