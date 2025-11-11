/**
 * Dashboard Component
 *
 * Chapter 6 (Zone.js) - runOutsideAngular로 차트 렌더링 최적화
 * Chapter 7 (Signals) - Effect로 차트 업데이트
 * Chapter 8 (Router) - Lazy Loading
 */

import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  NgZone,
  inject,
  effect,
  signal,
  ElementRef,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskState } from '../../core/state/task.state';
import { TaskStats, PRIORITY_LABELS, CATEGORY_LABELS } from '../../core/models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-container">
      <div class="container">
        <div class="page-header">
          <h2>📊 분석 대시보드</h2>
          <p class="text-muted">작업 진행 상황과 통계를 확인하세요</p>
        </div>

        <!-- 주요 메트릭 -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📝</div>
            <div class="metric-content">
              <div class="metric-label">전체 작업</div>
              <div class="metric-value">{{ stats().total }}</div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">⏳</div>
            <div class="metric-content">
              <div class="metric-label">진행 중</div>
              <div class="metric-value">{{ stats().active }}</div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">✅</div>
            <div class="metric-content">
              <div class="metric-label">완료</div>
              <div class="metric-value">{{ stats().completed }}</div>
            </div>
          </div>

          <div class="metric-card highlight">
            <div class="metric-icon">📈</div>
            <div class="metric-content">
              <div class="metric-label">완료율</div>
              <div class="metric-value">{{ stats().completionRate }}%</div>
            </div>
            <div class="metric-progress">
              <div
                class="metric-progress-bar"
                [style.width.%]="stats().completionRate"
              ></div>
            </div>
          </div>
        </div>

        <!-- 차트 섹션 -->
        <div class="charts-grid">
          <!-- 우선순위 차트 -->
          <div class="chart-card">
            <h3>우선순위별 분포</h3>
            <div class="chart-container">
              <canvas #priorityChart></canvas>
            </div>
            <div class="chart-legend">
              @for (item of priorityData(); track item.label) {
                <div class="legend-item">
                  <span
                    class="legend-color"
                    [style.background-color]="item.color"
                  ></span>
                  <span class="legend-label">{{ item.label }}</span>
                  <span class="legend-value">{{ item.value }}</span>
                </div>
              }
            </div>
          </div>

          <!-- 카테고리 차트 -->
          <div class="chart-card">
            <h3>카테고리별 분포</h3>
            <div class="chart-container">
              <canvas #categoryChart></canvas>
            </div>
            <div class="chart-legend">
              @for (item of categoryData(); track item.label) {
                <div class="legend-item">
                  <span
                    class="legend-color"
                    [style.background-color]="item.color"
                  ></span>
                  <span class="legend-label">{{ item.label }}</span>
                  <span class="legend-value">{{ item.value }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- 상세 통계 -->
        <div class="stats-detail">
          <h3>상세 통계</h3>

          <div class="stats-section">
            <h4>우선순위별</h4>
            <div class="stats-list">
              @for (priority of priorities; track priority.value) {
                @if (stats().byPriority[priority.value]) {
                  <div class="stat-row">
                    <span class="stat-label">{{ priority.label }}</span>
                    <span class="stat-bar-container">
                      <span
                        class="stat-bar"
                        [class]="'priority-' + priority.value"
                        [style.width.%]="getPercentage(stats().byPriority[priority.value])"
                      ></span>
                    </span>
                    <span class="stat-value">{{ stats().byPriority[priority.value] }}</span>
                  </div>
                }
              }
            </div>
          </div>

          <div class="stats-section">
            <h4>카테고리별</h4>
            <div class="stats-list">
              @for (category of categories; track category.value) {
                @if (stats().byCategory[category.value]) {
                  <div class="stat-row">
                    <span class="stat-label">{{ category.label }}</span>
                    <span class="stat-bar-container">
                      <span
                        class="stat-bar stat-bar-category"
                        [style.width.%]="getPercentage(stats().byCategory[category.value])"
                      ></span>
                    </span>
                    <span class="stat-value">{{ stats().byCategory[category.value] }}</span>
                  </div>
                }
              }
            </div>
          </div>
        </div>

        <!-- 인사이트 -->
        <div class="insights">
          <h3>💡 인사이트</h3>
          <div class="insight-grid">
            @if (stats().completionRate >= 80) {
              <div class="insight-card success">
                <span class="insight-icon">🎉</span>
                <p>훌륭합니다! 완료율이 {{ stats().completionRate }}%입니다.</p>
              </div>
            }

            @if (stats().active > 10) {
              <div class="insight-card warning">
                <span class="insight-icon">⚠️</span>
                <p>진행 중인 작업이 {{ stats().active }}개입니다. 우선순위를 정리해보세요.</p>
              </div>
            }

            @if (stats().total === 0) {
              <div class="insight-card info">
                <span class="insight-icon">📝</span>
                <p>아직 작업이 없습니다. 새 작업을 추가하여 시작하세요!</p>
              </div>
            }

            @if (stats().completionRate < 30 && stats().total > 5) {
              <div class="insight-card warning">
                <span class="insight-icon">💪</span>
                <p>완료율이 낮습니다. 작은 작업부터 시작해보세요!</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem 0;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h2 {
      margin-bottom: 0.5rem;
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .metric-card.highlight {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      flex-direction: column;
      align-items: stretch;
    }

    .metric-icon {
      font-size: 2.5rem;
    }

    .metric-content {
      flex: 1;
    }

    .metric-label {
      font-size: 0.875rem;
      opacity: 0.8;
      margin-bottom: 0.25rem;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
    }

    .metric-progress {
      height: 0.5rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 0.25rem;
      overflow: hidden;
      margin-top: 1rem;
    }

    .metric-progress-bar {
      height: 100%;
      background: white;
      transition: width 0.5s ease;
    }

    /* Charts */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .chart-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .chart-card h3 {
      margin-bottom: 1.5rem;
      color: var(--primary-color);
    }

    .chart-container {
      height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: background 0.2s ease;
    }

    .legend-item:hover {
      background: var(--bg-secondary);
    }

    .legend-color {
      width: 1rem;
      height: 1rem;
      border-radius: 0.25rem;
    }

    .legend-label {
      flex: 1;
      font-weight: 500;
    }

    .legend-value {
      font-weight: 600;
      color: var(--primary-color);
    }

    /* Stats Detail */
    .stats-detail {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      margin-bottom: 2rem;
    }

    .stats-detail h3 {
      margin-bottom: 1.5rem;
      color: var(--primary-color);
    }

    .stats-section {
      margin-bottom: 2rem;
    }

    .stats-section:last-child {
      margin-bottom: 0;
    }

    .stats-section h4 {
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    .stats-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .stat-row {
      display: grid;
      grid-template-columns: 150px 1fr 60px;
      align-items: center;
      gap: 1rem;
    }

    .stat-label {
      font-weight: 500;
    }

    .stat-bar-container {
      height: 1.5rem;
      background: var(--bg-secondary);
      border-radius: 0.75rem;
      overflow: hidden;
    }

    .stat-bar {
      display: block;
      height: 100%;
      border-radius: 0.75rem;
      transition: width 0.5s ease;
    }

    .stat-bar.priority-urgent { background: var(--danger-color); }
    .stat-bar.priority-high { background: var(--warning-color); }
    .stat-bar.priority-medium { background: #3b82f6; }
    .stat-bar.priority-low { background: var(--text-secondary); }
    .stat-bar.stat-bar-category { background: var(--primary-color); }

    .stat-value {
      text-align: right;
      font-weight: 600;
      color: var(--primary-color);
    }

    /* Insights */
    .insights {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
    }

    .insights h3 {
      margin-bottom: 1.5rem;
      color: var(--primary-color);
    }

    .insight-grid {
      display: grid;
      gap: 1rem;
    }

    .insight-card {
      padding: 1.25rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-left: 4px solid;
    }

    .insight-card.success {
      background: rgba(16, 185, 129, 0.1);
      border-color: var(--secondary-color);
    }

    .insight-card.warning {
      background: rgba(245, 158, 11, 0.1);
      border-color: var(--warning-color);
    }

    .insight-card.info {
      background: rgba(79, 70, 229, 0.1);
      border-color: var(--primary-color);
    }

    .insight-icon {
      font-size: 1.5rem;
    }

    .insight-card p {
      margin: 0;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }

      .stat-row {
        grid-template-columns: 100px 1fr 50px;
        gap: 0.5rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private ngZone = inject(NgZone);
  private taskState = inject(TaskState);

  // ViewChild for canvas elements
  priorityChart = viewChild<ElementRef<HTMLCanvasElement>>('priorityChart');
  categoryChart = viewChild<ElementRef<HTMLCanvasElement>>('categoryChart');

  stats = this.taskState.stats;

  priorityData = signal<Array<{ label: string; value: number; color: string }>>([]);
  categoryData = signal<Array<{ label: string; value: number; color: string }>>([]);

  priorities = Object.values(['urgent', 'high', 'medium', 'low']).map(value => ({
    value,
    label: PRIORITY_LABELS[value as keyof typeof PRIORITY_LABELS]
  }));

  categories = Object.values(['work', 'personal', 'shopping', 'health', 'other']).map(value => ({
    value,
    label: CATEGORY_LABELS[value as keyof typeof CATEGORY_LABELS]
  }));

  private chartColors = {
    priority: {
      urgent: '#ef4444',
      high: '#f59e0b',
      medium: '#3b82f6',
      low: '#6b7280'
    },
    category: {
      work: '#8b5cf6',
      personal: '#ec4899',
      shopping: '#10b981',
      health: '#f59e0b',
      other: '#6b7280'
    }
  };

  constructor() {
    // Chapter 7: Effect를 사용하여 stats 변경 시 차트 업데이트
    effect(() => {
      const stats = this.stats();
      this.updateChartData(stats);
    });
  }

  ngOnInit(): void {
    // 초기 차트 렌더링
    setTimeout(() => this.renderCharts(), 100);
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  /**
   * Chapter 6 (Zone.js) - Zone 외부에서 차트 렌더링
   * 성능 최적화: 차트 렌더링은 Angular 변경 감지를 트리거하지 않음
   */
  private renderCharts(): void {
    this.ngZone.runOutsideAngular(() => {
      this.renderPriorityChart();
      this.renderCategoryChart();
    });
  }

  private updateChartData(stats: TaskStats): void {
    // 우선순위 데이터
    const priorityData = Object.entries(stats.byPriority).map(([key, value]) => ({
      label: PRIORITY_LABELS[key as keyof typeof PRIORITY_LABELS],
      value,
      color: this.chartColors.priority[key as keyof typeof this.chartColors.priority]
    }));
    this.priorityData.set(priorityData);

    // 카테고리 데이터
    const categoryData = Object.entries(stats.byCategory).map(([key, value]) => ({
      label: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS],
      value,
      color: this.chartColors.category[key as keyof typeof this.chartColors.category]
    }));
    this.categoryData.set(categoryData);

    // Zone 외부에서 차트 재렌더링
    this.renderCharts();
  }

  /**
   * 간단한 도넛 차트 렌더링 (Canvas API 사용)
   * 실제 프로덕션에서는 Chart.js, D3.js 등 사용 권장
   */
  private renderPriorityChart(): void {
    const canvas = this.priorityChart()?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.priorityData();
    if (data.length === 0) return;

    this.renderDonutChart(ctx, canvas, data);
  }

  private renderCategoryChart(): void {
    const canvas = this.categoryChart()?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.categoryData();
    if (data.length === 0) return;

    this.renderDonutChart(ctx, canvas, data);
  }

  private renderDonutChart(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: Array<{ label: string; value: number; color: string }>
  ): void {
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    const innerRadius = radius * 0.6;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return;

    ctx.clearRect(0, 0, width, height);

    let currentAngle = -Math.PI / 2;

    data.forEach(item => {
      const sliceAngle = (item.value / total) * Math.PI * 2;

      // Draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Draw total in center
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY);
  }

  getPercentage(value: number): number {
    const total = this.stats().total;
    return total > 0 ? (value / total) * 100 : 0;
  }
}
