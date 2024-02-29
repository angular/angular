import { Component, ChangeDetectorRef, Input, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.css']
})
export class GaugeChartComponent implements OnInit, OnDestroy {
  @Input() cname: string
  chartOption: EChartsOption;
  intervalSubscription: Subscription;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cdr.detectChanges();
    this.updateChartData(); // Initial update

    // Update chart data every second
    this.intervalSubscription = interval(1000).subscribe(() => {
      this.updateChartData();
    });
  }

  ngOnDestroy() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  private updateChartData() {
    this.chartOption = {
      tooltip: {
        formatter: '{a} <br/>{b} : {c}%'
      },
      series: [
        {
          name: this.cname,
          type: 'gauge',
          detail: {formatter: '{value}°C'},
          data: [{value: (+Math.random().toFixed(2) * 10 + 4), name: this.cname}]
        }
      ]
    };
  }
}
