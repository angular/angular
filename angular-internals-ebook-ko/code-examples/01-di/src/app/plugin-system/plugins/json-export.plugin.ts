import { Plugin } from '../plugin.token';

export class JsonExportPlugin implements Plugin {
  name = 'JSON Export';

  execute(data: any): string {
    // JSON 형식으로 데이터 변환
    const json = JSON.stringify(data, null, 2);
    const size = new Blob([json]).size;
    return `JSON으로 내보내기 완료 (${(size / 1024).toFixed(2)} KB)`;
  }
}
