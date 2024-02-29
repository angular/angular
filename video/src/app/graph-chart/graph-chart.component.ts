import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-graph-chart',
  templateUrl: './graph-chart.component.html',
  styleUrl: './graph-chart.component.css'
})
export class GraphChartComponent implements OnInit, OnDestroy{
  @Input() lineNames
  options: EChartsOption;
  updateOptions: EChartsOption;

  private time = 24 * 3600 * 1000;
  private now: Date;
  private value: number;
  private data: DataT[];
  private timer: any;

  constructor() {}

  ngOnInit(): void {
    this.data = [];
    this.now = new Date();
    this.value = Math.random() * 10;

    for (let i = 0; i < 120; i++) {
      this.data.push(this.randomData());
    }

    this.options = {
      title: {
        text: 'Longtime Graph'
      },
      tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const date = new Date();
        const value = params[0].value[1];
        return `${params[0].seriesName}<br />Time: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}<br />Value: ${value}`;
      }
    },
      legend: {
        data: this.lineNames
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'time',
        splitLine: {
          show: false,
        },
        axisLabel: {
          formatter: function () {
            const date = new Date();
            return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
          }
        }
      },
      yAxis: {
        type: 'value'
      },
      series: this.lineNames.map(item => ({
        name: item,
        type: 'line',
        showSymbol: false,
        data: this.data,
      }))
    };

    this.timer = setInterval(() => {
      this.data.shift();
      this.data.push(this.randomData());

      this.updateOptions = {
        series: this.lineNames.map(item =>
          (item === this.lineNames[0]) ?
            { data: this.multiplyData(this.data, 2) } :
            { data: this.multiplyData(this.data, 1) }
        ),
      };
    }, 1000);
  }
    multiplyData(data: DataT[], multiplier: number): DataT[] {
      return data.map(entry => {
        return {
          ...entry,
          value: [entry.value[0], entry.value[1] * multiplier]
        };
      });
    }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  randomData(): DataT {
    this.now = new Date(this.now.getTime() + this.time);
    this.value = Math.random() * 10;
    return {
      name: this.now.toString(),
      value: [
        [this.now.getFullYear(), this.now.getMonth() + 1, this.now.getDate()].join('/'),
        Math.round(this.value),
      ],
    };
  }

  customToNumber(custom: DataT): number {
    return custom.value[1];
  }
}

type DataT = {
  name: string;
  value: [string, number];
};
