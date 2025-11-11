/**
 * Settings Component
 *
 * Chapter 2 (Change Detection) - OnPush 전략
 * Chapter 8 (Router) - Lazy Loading
 */

import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskState } from '../../core/state/task.state';
import { TaskService } from '../../core/services/task.service';
import { EXPORT_PLUGIN } from '../../core/plugins/plugin.token';

interface Setting {
  id: string;
  label: string;
  description: string;
  value: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="settings-container">
      <div class="container">
        <div class="page-header">
          <h2>⚙️ 설정</h2>
          <p class="text-muted">애플리케이션 설정 및 데이터 관리</p>
        </div>

        <!-- 일반 설정 -->
        <div class="settings-section">
          <h3>일반 설정</h3>
          <div class="settings-list">
            @for (setting of settings(); track setting.id) {
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-label">{{ setting.label }}</div>
                  <div class="setting-description text-muted">
                    {{ setting.description }}
                  </div>
                </div>
                <label class="toggle">
                  <input
                    type="checkbox"
                    [(ngModel)]="setting.value"
                    (change)="onSettingChange(setting)"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            }
          </div>
        </div>

        <!-- 플러그인 -->
        <div class="settings-section">
          <h3>플러그인</h3>
          @if (exportPlugins.length > 0) {
            <div class="plugin-list">
              @for (plugin of exportPlugins; track plugin.name) {
                <div class="plugin-item">
                  <div class="plugin-icon">🔌</div>
                  <div class="plugin-info">
                    <div class="plugin-name">{{ plugin.name }}</div>
                    <div class="plugin-description text-muted">
                      버전: {{ plugin.version }}
                    </div>
                    <div class="plugin-formats">
                      지원 형식:
                      @for (format of plugin.getSupportedFormats(); track format) {
                        <span class="badge badge-primary">{{ format }}</span>
                      }
                    </div>
                  </div>
                  <span class="badge badge-success">활성</span>
                </div>
              }
            </div>
          } @else {
            <p class="text-muted">설치된 플러그인이 없습니다.</p>
          }
        </div>

        <!-- 데이터 관리 -->
        <div class="settings-section">
          <h3>데이터 관리</h3>

          <div class="data-stats">
            <div class="data-stat-item">
              <div class="data-stat-label">전체 작업</div>
              <div class="data-stat-value">{{ taskState.stats().total }}</div>
            </div>
            <div class="data-stat-item">
              <div class="data-stat-label">완료된 작업</div>
              <div class="data-stat-value">{{ taskState.stats().completed }}</div>
            </div>
            <div class="data-stat-item">
              <div class="data-stat-label">저장 공간</div>
              <div class="data-stat-value">{{ getStorageSize() }} KB</div>
            </div>
          </div>

          <div class="action-buttons">
            <button
              class="btn btn-primary"
              (click)="exportAllData()"
              [disabled]="taskState.stats().total === 0"
            >
              📥 데이터 내보내기
            </button>

            <button
              class="btn btn-secondary"
              (click)="taskService.generateSampleTasks()"
            >
              ➕ 샘플 데이터 추가
            </button>

            <button
              class="btn btn-outline"
              (click)="clearCompletedTasks()"
              [disabled]="taskState.stats().completed === 0"
            >
              🗑️ 완료된 작업 삭제
            </button>

            <button
              class="btn btn-danger btn-outline"
              (click)="clearAllData()"
              [disabled]="taskState.stats().total === 0"
            >
              ⚠️ 모든 데이터 삭제
            </button>
          </div>
        </div>

        <!-- 정보 -->
        <div class="settings-section">
          <h3>애플리케이션 정보</h3>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">버전</div>
              <div class="info-value">{{ appInfo.version }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">빌드</div>
              <div class="info-value">{{ appInfo.build }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Angular 버전</div>
              <div class="info-value">{{ appInfo.angularVersion }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">라이선스</div>
              <div class="info-value">{{ appInfo.license }}</div>
            </div>
          </div>

          <div class="tech-stack">
            <h4>사용된 기술</h4>
            <div class="tech-badges">
              @for (tech of technologies; track tech) {
                <span class="badge badge-primary">{{ tech }}</span>
              }
            </div>
          </div>

          <div class="concepts">
            <h4>구현된 개념</h4>
            <div class="concept-list">
              @for (concept of concepts; track concept) {
                <div class="concept-item">
                  <span class="concept-check">✓</span>
                  {{ concept }}
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 2rem 0;
      min-height: calc(100vh - 400px);
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h2 {
      margin-bottom: 0.5rem;
    }

    .settings-section {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-sm);
    }

    .settings-section h3 {
      margin-bottom: 1.5rem;
      color: var(--primary-color);
      font-size: 1.25rem;
    }

    .settings-section h4 {
      margin-bottom: 1rem;
      color: var(--text-primary);
      font-size: 1rem;
    }

    /* Settings List */
    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      transition: all 0.2s ease;
    }

    .setting-item:hover {
      border-color: var(--primary-color);
      background: var(--bg-secondary);
    }

    .setting-info {
      flex: 1;
    }

    .setting-label {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .setting-description {
      font-size: 0.875rem;
    }

    /* Toggle Switch */
    .toggle {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 26px;
    }

    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.4s;
      border-radius: 26px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }

    .toggle input:checked + .toggle-slider {
      background-color: var(--primary-color);
    }

    .toggle input:checked + .toggle-slider:before {
      transform: translateX(24px);
    }

    /* Plugin List */
    .plugin-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .plugin-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
    }

    .plugin-icon {
      font-size: 2rem;
    }

    .plugin-info {
      flex: 1;
    }

    .plugin-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .plugin-description {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .plugin-formats {
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Data Management */
    .data-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .data-stat-item {
      padding: 1rem;
      background: var(--bg-secondary);
      border-radius: 0.5rem;
      text-align: center;
    }

    .data-stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .data-stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .action-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .info-item {
      padding: 1rem;
      background: var(--bg-secondary);
      border-radius: 0.5rem;
    }

    .info-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .info-value {
      font-weight: 600;
      color: var(--text-primary);
    }

    /* Tech Stack */
    .tech-stack {
      margin-bottom: 2rem;
    }

    .tech-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    /* Concepts */
    .concept-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 0.75rem;
    }

    .concept-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--bg-secondary);
      border-radius: 0.375rem;
      font-size: 0.9375rem;
    }

    .concept-check {
      color: var(--secondary-color);
      font-weight: bold;
    }

    @media (max-width: 768px) {
      .action-buttons {
        grid-template-columns: 1fr;
      }

      .setting-item {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
    }
  `]
})
export class SettingsComponent {
  taskState = inject(TaskState);
  taskService = inject(TaskService);
  exportPlugins = inject(EXPORT_PLUGIN, { optional: true }) || [];

  settings = signal<Setting[]>([
    {
      id: 'notifications',
      label: '알림 활성화',
      description: '작업 완료 시 알림을 표시합니다',
      value: true
    },
    {
      id: 'autoSave',
      label: '자동 저장',
      description: '변경사항을 자동으로 저장합니다',
      value: true
    },
    {
      id: 'darkMode',
      label: '다크 모드',
      description: '다크 모드를 활성화합니다 (준비 중)',
      value: false
    }
  ]);

  appInfo = {
    version: '1.0.0',
    build: new Date().toLocaleDateString('ko-KR'),
    angularVersion: '18.0.0',
    license: 'MIT'
  };

  technologies = [
    'Angular 18',
    'TypeScript',
    'Signals',
    'Standalone Components',
    'OnPush',
    'Zone.js',
    'Router',
    'Dependency Injection'
  ];

  concepts = [
    'Chapter 1: 의존성 주입 (DI)',
    'Chapter 2: 변경 감지 (Change Detection)',
    'Chapter 3: 생명주기 (Lifecycle)',
    'Chapter 4: 렌더링 (Rendering)',
    'Chapter 5: 컴파일러 (Compiler)',
    'Chapter 6: Zone.js',
    'Chapter 7: Signals',
    'Chapter 8: Router'
  ];

  onSettingChange(setting: Setting): void {
    console.log(`Setting changed: ${setting.id} = ${setting.value}`);
    // 설정 변경 로직 구현
    localStorage.setItem(`setting-${setting.id}`, String(setting.value));
  }

  exportAllData(): void {
    if (this.exportPlugins.length > 0) {
      // 첫 번째 플러그인 사용
      this.exportPlugins[0].export(this.taskState.tasks());
    } else {
      alert('내보내기 플러그인이 설치되지 않았습니다.');
    }
  }

  clearCompletedTasks(): void {
    if (confirm('완료된 모든 작업을 삭제하시겠습니까?')) {
      this.taskState.clearCompletedTasks();
    }
  }

  clearAllData(): void {
    if (confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      this.taskState.clearAllTasks();
    }
  }

  getStorageSize(): number {
    try {
      const data = localStorage.getItem('taskmaster-tasks');
      if (data) {
        return Math.round(new Blob([data]).size / 1024);
      }
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
    }
    return 0;
  }
}
