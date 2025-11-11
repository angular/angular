/**
 * PDF Export Plugin
 *
 * Chapter 1 (DI) - Multi-provider 패턴 구현
 * Chapter 6 (Zone.js) - Zone 외부에서 실행하여 성능 최적화
 */

import { Injectable, NgZone } from '@angular/core';
import { ExportPlugin } from '../../core/plugins/plugin.token';
import { Task, PRIORITY_LABELS, CATEGORY_LABELS } from '../../core/models/task.model';

@Injectable()
export class PdfExportPlugin implements ExportPlugin {
  readonly name = 'PDF Export';
  readonly version = '1.0.0';

  constructor(private ngZone: NgZone) {}

  initialize(): void {
    console.log(`[${this.name}] Plugin initialized`);
  }

  destroy(): void {
    console.log(`[${this.name}] Plugin destroyed`);
  }

  getSupportedFormats(): string[] {
    return ['pdf'];
  }

  /**
   * 작업을 PDF로 내보내기
   * Chapter 6: Zone 외부에서 실행하여 불필요한 변경 감지 방지
   */
  async export(tasks: Task[]): Promise<void> {
    if (!tasks || tasks.length === 0) {
      alert('내보낼 작업이 없습니다.');
      return;
    }

    // Zone 외부에서 실행 - 성능 최적화
    this.ngZone.runOutsideAngular(() => {
      try {
        this.generatePDF(tasks);
      } catch (error) {
        console.error('PDF export failed:', error);
        // Zone 내부로 돌아와서 UI 업데이트
        this.ngZone.run(() => {
          alert('PDF 내보내기 실패');
        });
      }
    });
  }

  /**
   * PDF 생성 (간단한 HTML 기반 PDF)
   *
   * 실제 프로덕션에서는 jsPDF, pdfmake 같은 라이브러리 사용 권장
   * 여기서는 학습 목적으로 간단한 구현 사용
   */
  private generatePDF(tasks: Task[]): void {
    // HTML 템플릿 생성
    const html = this.generateHTML(tasks);

    // 새 창에서 열고 인쇄
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('팝업이 차단되었습니다. 팝업을 허용해주세요.');
      return;
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // 로드 완료 후 인쇄 대화상자 표시
    printWindow.onload = () => {
      printWindow.print();
    };
  }

  /**
   * PDF용 HTML 생성
   */
  private generateHTML(tasks: Task[]): string {
    const date = new Date().toLocaleDateString('ko-KR');

    return `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>TaskMaster - 작업 목록</title>
        <style>
          @media print {
            @page { margin: 2cm; }
            body { margin: 0; }
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Noto Sans KR', sans-serif;
            padding: 20px;
            line-height: 1.6;
          }

          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #4f46e5;
          }

          .header h1 {
            color: #4f46e5;
            font-size: 28px;
            margin-bottom: 10px;
          }

          .header .date {
            color: #6b7280;
            font-size: 14px;
          }

          .summary {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
          }

          .summary h2 {
            font-size: 18px;
            margin-bottom: 10px;
          }

          .summary-stats {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
          }

          .stat {
            flex: 1;
            min-width: 120px;
          }

          .stat-label {
            font-size: 12px;
            color: #6b7280;
          }

          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
          }

          .task {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            break-inside: avoid;
          }

          .task-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 10px;
          }

          .task-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            flex: 1;
          }

          .task-title.completed {
            text-decoration: line-through;
            color: #9ca3af;
          }

          .task-badges {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
          }

          .badge-priority-urgent { background: #fee2e2; color: #dc2626; }
          .badge-priority-high { background: #fed7aa; color: #ea580c; }
          .badge-priority-medium { background: #fef3c7; color: #d97706; }
          .badge-priority-low { background: #dbeafe; color: #2563eb; }
          .badge-category { background: #e0e7ff; color: #4f46e5; }
          .badge-completed { background: #d1fae5; color: #059669; }

          .task-description {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
          }

          .task-meta {
            font-size: 12px;
            color: #9ca3af;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
          }

          .task-tags {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            margin-top: 8px;
          }

          .tag {
            background: #f3f4f6;
            color: #4b5563;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
          }

          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 TaskMaster</h1>
          <div class="date">작업 목록 - ${date}</div>
        </div>

        <div class="summary">
          <h2>요약</h2>
          <div class="summary-stats">
            <div class="stat">
              <div class="stat-label">전체 작업</div>
              <div class="stat-value">${tasks.length}</div>
            </div>
            <div class="stat">
              <div class="stat-label">완료</div>
              <div class="stat-value">${tasks.filter(t => t.completed).length}</div>
            </div>
            <div class="stat">
              <div class="stat-label">진행 중</div>
              <div class="stat-value">${tasks.filter(t => !t.completed).length}</div>
            </div>
            <div class="stat">
              <div class="stat-label">완료율</div>
              <div class="stat-value">
                ${tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        ${tasks.map(task => this.generateTaskHTML(task)).join('')}

        <div class="footer">
          TaskMaster - Angular 내부 구조 완전 통합 애플리케이션
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 개별 작업 HTML 생성
   */
  private generateTaskHTML(task: Task): string {
    const priorityLabel = PRIORITY_LABELS[task.priority];
    const categoryLabel = CATEGORY_LABELS[task.category];

    return `
      <div class="task">
        <div class="task-header">
          <div class="task-title ${task.completed ? 'completed' : ''}">
            ${task.completed ? '✓ ' : ''}${this.escapeHtml(task.title)}
          </div>
        </div>

        <div class="task-badges">
          <span class="badge badge-priority-${task.priority}">${priorityLabel}</span>
          <span class="badge badge-category">${categoryLabel}</span>
          ${task.completed ? '<span class="badge badge-completed">완료</span>' : ''}
        </div>

        <div class="task-description">
          ${this.escapeHtml(task.description)}
        </div>

        <div class="task-meta">
          <span>생성: ${this.formatDate(task.createdAt)}</span>
          ${task.dueDate ? `<span>마감: ${this.formatDate(task.dueDate)}</span>` : ''}
        </div>

        ${task.tags && task.tags.length > 0 ? `
          <div class="task-tags">
            ${task.tags.map(tag => `<span class="tag">#${this.escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * HTML 이스케이프
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 날짜 포맷팅
   */
  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ko-KR');
  }
}
