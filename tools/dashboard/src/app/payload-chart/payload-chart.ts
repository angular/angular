import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {PayloadResult} from '../data-definitions';
import {NgxChartItem, NgxChartResult} from '../ngx-definitions';

@Component({
  selector: 'payload-chart',
  templateUrl: './payload-chart.html',
  styleUrls: ['./payload-chart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'dashboard-panel'
  }
})
export class PayloadChart {

  /** Color scheme for the payload graph. */
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  /** X-Axis label of the Chart. */
  xAxisLabel = 'Date';

  /** Y-Axis label of the Chart. */
  yAxisLabel = 'Payload Size (kb)';

  /** Chart data that is taken by NGX-Charts. */
  chartData: NgxChartResult[];

  /** Payload data that will be rendered in the chart. */
  @Input()
  set data(value: PayloadResult[]) {
    this.chartData = this.createChartResults(value);
  }

  /** Remove duplicate payload results for similar days. */
  private filterDuplicateDays(data: PayloadResult[]) {
    const filteredData = new Map<string, PayloadResult>();

    data.forEach(result => {
      // Parse the timestamp from the payload results as a date.
      const date = new Date(result.timestamp);

      // Ignore hours, minutes, seconds and milliseconds from the date to allow comparisons
      // only of the day.
      date.setHours(0, 0, 0, 0);

      // Store the ISO string of the date in a Map to overwrite the previous payload result for
      // the same day.
      filteredData.set(date.toISOString(), result);
    });

    return Array.from(filteredData.values());
  }

  /** Creates a list of ngx-chart results of the Payload results. */
  private createChartResults(data: PayloadResult[]) {
    if (!data) {
      return [];
    }

    // Data snapshot from Firebase is not ordered by timestamp. Before rendering the graph
    // manually sort the results by their timestamp.
    data = data.sort((a, b) => a.timestamp < b.timestamp ? -1 : 1);

    // It can happen that there will be multiple payload results for the same day. This happens
    // when multiple Pull Requests are merged in the same day. For the charts we only want to
    // have the last payload result of a day (for performance and value correctness)
    data = this.filterDuplicateDays(data);

    const materialChartItems: NgxChartItem[] = [];
    const cdkChartItems: NgxChartItem[] = [];

    // Walk through every result entry and create a NgxChart item that can be rendered inside of
    // the linear chart.
    data.forEach(result => {
      if (!result.material_fesm_2015 || !result.cdk_fesm_2015) {
        return;
      }

      // Convert the timestamp of the payload result into a date because NGX-Charts can group
      // dates in the x-axis.
      const date = new Date(result.timestamp);

      materialChartItems.push({ name: date, value: result.material_fesm_2015 });
      cdkChartItems.push({ name: date, value: result.cdk_fesm_2015 });
    });

    return [
      { name: 'Material', series: materialChartItems },
      { name: 'CDK', series: cdkChartItems }
    ];
  }

}

