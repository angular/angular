/**
 * Task List Component
 *
 * Chapter 2 (Change Detection) - OnPush 전략으로 최적화
 * Chapter 4 (Rendering) - trackBy로 효율적인 리스트 렌더링
 * Chapter 7 (Signals) - Signal 기반 상태 관리
 */

import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskCardComponent } from './task-card.component';
import { TaskFormComponent } from './task-form.component';
import { TaskState } from '../../core/state/task.state';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskFormData, TaskPriority, TaskCategory, PRIORITY_LABELS, CATEGORY_LABELS } from '../../core/models/task.model';
import { EXPORT_PLUGIN } from '../../core/plugins/plugin.token';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskCardComponent, TaskFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="task-list-container">
      <div class="container">
        <!-- 헤더 섹션 -->
        <div class="page-header">
          <div>
            <h2>내 작업</h2>
            <p class="text-muted">
              전체 {{ taskState.stats().total }}개 중
              {{ taskState.stats().active }}개 진행 중,
              {{ taskState.stats().completed }}개 완료
            </p>
          </div>

          <div class="header-actions">
            <button
              class="btn btn-outline"
              (click)="showForm.set(!showForm())"
            >
              {{ showForm() ? '폼 닫기' : '➕ 새 작업' }}
            </button>

            @if (exportPlugins.length > 0) {
              <div class="export-dropdown">
                <button class="btn btn-secondary">
                  📥 내보내기
                </button>
                <div class="dropdown-menu">
                  @for (plugin of exportPlugins; track plugin.name) {
                    <button
                      class="dropdown-item"
                      (click)="exportTasks(plugin)"
                    >
                      {{ plugin.name }}
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- 작업 폼 -->
        @if (showForm()) {
          <app-task-form
            [editTask]="editingTask()"
            (save)="onSaveTask($event)"
            (cancel)="onCancelEdit()"
          />
        }

        <!-- 필터 섹션 -->
        <div class="filters">
          <div class="filter-group">
            <input
              type="text"
              class="form-control"
              placeholder="🔍 검색..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="onFilterChange()"
            />
          </div>

          <div class="filter-group">
            <select
              class="form-control form-select"
              [(ngModel)]="filterPriority"
              (ngModelChange)="onFilterChange()"
            >
              <option [ngValue]="null">모든 우선순위</option>
              @for (priority of priorities; track priority.value) {
                <option [value]="priority.value">{{ priority.label }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <select
              class="form-control form-select"
              [(ngModel)]="filterCategory"
              (ngModelChange)="onFilterChange()"
            >
              <option [ngValue]="null">모든 카테고리</option>
              @for (category of categories; track category.value) {
                <option [value]="category.value">{{ category.label }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <select
              class="form-control form-select"
              [(ngModel)]="filterCompleted"
              (ngModelChange)="onFilterChange()"
            >
              <option [ngValue]="null">모든 상태</option>
              <option [value]="false">진행 중</option>
              <option [value]="true">완료</option>
            </select>
          </div>

          @if (hasActiveFilters()) {
            <button
              class="btn btn-outline btn-sm"
              (click)="clearFilters()"
            >
              필터 초기화
            </button>
          }
        </div>

        <!-- 통계 -->
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-label">완료율</span>
            <span class="stat-value">{{ taskState.stats().completionRate }}%</span>
          </div>
          @for (priority of priorities; track priority.value) {
            @if (taskState.stats().byPriority[priority.value]) {
              <div class="stat-item">
                <span class="stat-label">{{ priority.label }}</span>
                <span class="stat-value">{{ taskState.stats().byPriority[priority.value] }}</span>
              </div>
            }
          }
        </div>

        <!-- 작업 목록 -->
        <div class="task-list">
          @if (taskState.loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>작업을 불러오는 중...</p>
            </div>
          } @else if (taskState.filteredTasks().length === 0) {
            <div class="empty-state">
              <div class="empty-state-icon">📝</div>
              @if (taskState.tasks().length === 0) {
                <h3>작업이 없습니다</h3>
                <p class="text-muted">
                  새 작업을 추가하여 시작하세요!
                </p>
                <button
                  class="btn btn-primary"
                  (click)="taskService.generateSampleTasks()"
                >
                  샘플 데이터 생성
                </button>
              } @else {
                <h3>검색 결과가 없습니다</h3>
                <p class="text-muted">
                  다른 필터 조건을 시도해보세요
                </p>
              }
            </div>
          } @else {
            <div class="task-grid">
              @for (task of taskState.filteredTasks(); track trackByTaskId($index, task)) {
                <app-task-card
                  [task]="task"
                  (toggleComplete)="onToggleComplete($event)"
                  (edit)="onEditTask($event)"
                  (delete)="onDeleteTask($event)"
                />
              }
            </div>
          }
        </div>

        <!-- 액션 바 -->
        @if (taskState.tasks().length > 0) {
          <div class="action-bar">
            <button
              class="btn btn-outline"
              (click)="taskState.clearCompletedTasks()"
              [disabled]="taskState.stats().completed === 0"
            >
              완료된 작업 삭제
            </button>
            <button
              class="btn btn-danger btn-outline"
              (click)="taskState.clearAllTasks()"
            >
              모든 작업 삭제
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .task-list-container {
      padding: 2rem 0;
      min-height: calc(100vh - 400px);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 2rem;
      gap: 2rem;
    }

    .page-header h2 {
      margin-bottom: 0.5rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .export-dropdown {
      position: relative;
    }

    .export-dropdown:hover .dropdown-menu {
      display: block;
    }

    .dropdown-menu {
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      box-shadow: var(--shadow-lg);
      margin-top: 0.5rem;
      min-width: 150px;
      z-index: 10;
    }

    .dropdown-item {
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .dropdown-item:hover {
      background: var(--bg-hover);
    }

    .filters {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr auto;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 0.75rem;
      box-shadow: var(--shadow-sm);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
    }

    .stats-bar {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 0.75rem;
      color: white;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-label {
      font-size: 0.75rem;
      opacity: 0.9;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .task-list {
      margin-bottom: 2rem;
    }

    .task-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .loading-state .spinner {
      margin: 0 auto 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-state h3 {
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }

    .empty-state .btn {
      margin-top: 1.5rem;
    }

    .action-bar {
      display: flex;
      justify-content: center;
      gap: 1rem;
      padding: 2rem 0;
      border-top: 1px solid var(--border-color);
    }

    @media (max-width: 1024px) {
      .task-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
      }

      .header-actions {
        width: 100%;
      }

      .header-actions button {
        flex: 1;
      }

      .filters {
        grid-template-columns: 1fr;
      }

      .stats-bar {
        justify-content: space-between;
      }

      .task-grid {
        grid-template-columns: 1fr;
      }

      .action-bar {
        flex-direction: column;
      }
    }
  `]
})
export class TaskListComponent {
  // Dependency injection
  taskState = inject(TaskState);
  taskService = inject(TaskService);
  exportPlugins = inject(EXPORT_PLUGIN, { optional: true }) || [];

  // Local state
  showForm = signal(false);
  editingTask = signal<Task | null>(null);

  // Filter state
  searchTerm = '';
  filterPriority: TaskPriority | null = null;
  filterCategory: TaskCategory | null = null;
  filterCompleted: boolean | null = null;

  // Options
  priorities = Object.values(TaskPriority).map(value => ({
    value,
    label: PRIORITY_LABELS[value]
  }));

  categories = Object.values(TaskCategory).map(value => ({
    value,
    label: CATEGORY_LABELS[value]
  }));

  /**
   * Chapter 4 (Rendering) - trackBy 함수로 효율적인 리스트 렌더링
   * ID 기반 추적으로 불필요한 DOM 업데이트 방지
   */
  trackByTaskId(_index: number, task: Task): string {
    return task.id;
  }

  onSaveTask(formData: TaskFormData): void {
    const editTask = this.editingTask();

    if (editTask) {
      // 수정
      this.taskService.updateTask(editTask.id, formData);
    } else {
      // 새로 추가
      this.taskService.createTask(formData);
    }

    this.showForm.set(false);
    this.editingTask.set(null);
  }

  onCancelEdit(): void {
    this.showForm.set(false);
    this.editingTask.set(null);
  }

  onEditTask(task: Task): void {
    this.editingTask.set(task);
    this.showForm.set(true);
  }

  onToggleComplete(taskId: string): void {
    this.taskService.toggleComplete(taskId);
  }

  onDeleteTask(taskId: string): void {
    this.taskService.deleteTask(taskId);
  }

  onFilterChange(): void {
    this.taskState.setFilter({
      searchTerm: this.searchTerm || undefined,
      priority: this.filterPriority || undefined,
      category: this.filterCategory || undefined,
      completed: this.filterCompleted !== null ? this.filterCompleted : undefined
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterPriority = null;
    this.filterCategory = null;
    this.filterCompleted = null;
    this.taskState.clearFilter();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.filterPriority ||
      this.filterCategory ||
      this.filterCompleted !== null
    );
  }

  exportTasks(plugin: any): void {
    plugin.export(this.taskState.filteredTasks());
  }
}
