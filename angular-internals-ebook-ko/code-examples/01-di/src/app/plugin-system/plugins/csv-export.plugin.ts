import { Plugin } from '../plugin.token';

export class CsvExportPlugin implements Plugin {
  name = 'CSV Export';

  execute(data: any): string {
    // CSV 형식으로 데이터 변환
    const csv = this.convertToCSV(data);
    return `CSV로 내보내기 완료 (${csv.split('\n').length} 줄)`;
  }

  private convertToCSV(data: any): string {
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(item =>
        Object.values(item).join(',')
      ).join('\n');
      return `${headers}\n${rows}`;
    }
    return JSON.stringify(data);
  }
}
