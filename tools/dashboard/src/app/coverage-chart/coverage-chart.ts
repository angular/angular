import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CoverageEntries, CoverageResult} from '../data-definitions';
import {NgxChartResult} from '../ngx-definitions';

@Component({
  selector: 'coverage-chart',
  templateUrl: './coverage-chart.html',
  styleUrls: ['./coverage-chart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'dashboard-panel'
  }
})
export class CoverageChart {

  /** Color scheme for the coverage graph. */
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  /** X-Axis label of the Chart. */
  xAxisLabel = 'Date';

  /** Y-Axis label of the Chart. */
  yAxisLabel = 'Coverage Percentage (%)';

  /** Chart data that is taken by NGX-Charts. */
  chartData: NgxChartResult[];

  /** Coverage data that will be rendered in the chart. */
  @Input()
  set data(value: CoverageResult[]) {
    this.chartData = this.createChartResults(value);
  }

  /** Remove duplicate coverage results for similar days. */
  private filterDuplicateDays(data: CoverageResult[]) {
    const filteredData = new Map<string, CoverageResult>();

    data.forEach(result => {
      // Parse the timestamp from the coverage result as a date.
      const date = new Date(result.timestamp);

      // Ignore hours, minutes, seconds and milliseconds from the date to allow comparisons
      // only of the day.
      date.setHours(0, 0, 0, 0);

      // Store the ISO string of the date in a Map to overwrite the previous coverage result for
      // the same day.
      filteredData.set(date.toISOString(), result);
    });

    return Array.from(filteredData.values());
  }

  /** Creates a list of ngx-chart results of the coverage results. */
  private createChartResults(data: CoverageResult[]) {
    if (!data) {
      return [];
    }

    // In the early stages of the coverage reports that will be uploaded to Firebase, the timestamp
    // was not added to the reports. All old results need to be filtered out for the chart.
    data = data.filter(result => result.timestamp);

    // Data snapshot from Firebase is not ordered by timestamp. Before rendering the graph
    // manually sort the results by their timestamp.
    data = data.sort((a, b) => a.timestamp < b.timestamp ? -1 : 1);

    // It can happen that there will be multiple coverage reports for the same day. This happens
    // if multiple PRs are merged at the same day. For the charts we only want to
    // have the last coverage report of a day (for performance and value correctness)
    data = this.filterDuplicateDays(data);

    return [
      { name: 'Lines', series: this.createCoverageChartItems(data, 'lines') },
      { name: 'Branches', series: this.createCoverageChartItems(data, 'branches') },
      { name: 'Functions', series: this.createCoverageChartItems(data, 'functions') },
      { name: 'Statements', series: this.createCoverageChartItems(data, 'statements') }
    ];
  }

  /** Creates a list of items for NGX-Charts that represent a coverage entry type. */
  private createCoverageChartItems(data: CoverageResult[], entryType: CoverageEntries) {
    return data.map(result => {
      const entryResult = result[entryType];

      // Convert the timestamp of the coverage result into a date because NGX-Charts can group
      // dates in the x-axis.
      const date = new Date(result.timestamp);

      return { name: date, value: entryResult.pct };
    });
  }
}

