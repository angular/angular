/**
 * CSV Export Plugin
 *
 * Chapter 1 (DI) - Multi-provider 패턴 구현
 * Chapter 3 (Lifecycle) - 플러그인 생명주기 관리
 */

import { Injectable } from '@angular/core';
import { ExportPlugin } from '../../core/plugins/plugin.token';
import { Task } from '../../core/models/task.model';

@Injectable()
export class CsvExportPlugin implements ExportPlugin {
  readonly name = 'CSV Export';
  readonly version = '1.0.0';

  initialize(): void {
    console.log(`[${this.name}] Plugin initialized`);
  }

  destroy(): void {
    console.log(`[${this.name}] Plugin destroyed`);
  }

  getSupportedFormats(): string[] {
    return ['csv'];
  }

  /**
   * 작업을 CSV 형식으로 내보내기
   */
  async export(tasks: Task[]): Promise<void> {
    if (!tasks || tasks.length === 0) {
      alert('내보낼 작업이 없습니다.');
      return;
    }

    try {
      const csv = this.convertToCSV(tasks);
      this.downloadCSV(csv, `taskmaster-export-${Date.now()}.csv`);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('CSV 내보내기 실패');
    }
  }

  /**
   * 작업을 CSV 문자열로 변환
   */
  private convertToCSV(tasks: Task[]): string {
    // CSV 헤더
    const headers = [
      'ID',
      '제목',
      '설명',
      '완료',
      '우선순위',
      '카테고리',
      '생성일',
      '수정일',
      '마감일',
      '태그'
    ];

    // CSV 행 생성
    const rows = tasks.map(task => [
      this.escapeCSV(task.id),
      this.escapeCSV(task.title),
      this.escapeCSV(task.description),
      task.completed ? '완료' : '미완료',
      this.escapeCSV(task.priority),
      this.escapeCSV(task.category),
      this.formatDate(task.createdAt),
      this.formatDate(task.updatedAt),
      task.dueDate ? this.formatDate(task.dueDate) : '',
      task.tags ? this.escapeCSV(task.tags.join('; ')) : ''
    ]);

    // CSV 문자열 생성
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  /**
   * CSV 필드 이스케이프 처리
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * 날짜 포맷팅
   */
  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ko-KR');
  }

  /**
   * CSV 파일 다운로드
   */
  private downloadCSV(csv: string, filename: string): void {
    // BOM 추가 (Excel에서 한글 깨짐 방지)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}
