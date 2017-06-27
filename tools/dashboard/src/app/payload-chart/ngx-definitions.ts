export interface NgxChartResult {
  name: string;
  series: NgxChartItem[];
}

export interface NgxChartItem {
  name: Date;
  value: number|string;
}
