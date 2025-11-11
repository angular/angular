/**
 * Task Card Component
 *
 * Chapter 2 (Change Detection) - OnPush 전략으로 최적화
 * Chapter 3 (Lifecycle) - Input 변경 감지
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, PRIORITY_LABELS, CATEGORY_LABELS } from '../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="task-card" [class.completed]="task().completed">
      <div class="task-card-header">
        <div class="task-checkbox">
          <input
            type="checkbox"
            [checked]="task().completed"
            (change)="onToggleComplete()"
            [id]="'task-' + task().id"
          />
          <label [for]="'task-' + task().id" class="task-title">
            {{ task().title }}
          </label>
        </div>

        <div class="task-actions">
          <button
            class="btn-icon"
            (click)="onEdit()"
            title="수정"
          >
            ✏️
          </button>
          <button
            class="btn-icon btn-icon-danger"
            (click)="onDelete()"
            title="삭제"
          >
            🗑️
          </button>
        </div>
      </div>

      @if (task().description) {
        <p class="task-description">{{ task().description }}</p>
      }

      <div class="task-badges">
        <span class="badge badge-priority" [class]="'priority-' + task().priority">
          {{ getPriorityLabel() }}
        </span>
        <span class="badge badge-category">
          {{ getCategoryLabel() }}
        </span>
        @if (task().dueDate) {
          <span class="badge badge-due" [class.overdue]="isOverdue()">
            📅 {{ formatDate(task().dueDate) }}
          </span>
        }
      </div>

      @if (task().tags && task().tags.length > 0) {
        <div class="task-tags">
          @for (tag of task().tags; track tag) {
            <span class="tag">#{{ tag }}</span>
          }
        </div>
      }

      <div class="task-meta">
        <small class="text-muted">
          생성: {{ formatDate(task().createdAt) }}
        </small>
      </div>
    </div>
  `,
  styles: [`
    .task-card {
      background: white;
      border: 2px solid var(--border-color);
      border-radius: 0.75rem;
      padding: 1.25rem;
      transition: all 0.3s ease;
      animation: fadeIn 0.3s ease-out;
    }

    .task-card:hover {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .task-card.completed {
      opacity: 0.7;
      background: var(--bg-secondary);
    }

    .task-card-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 0.75rem;
      gap: 1rem;
    }

    .task-checkbox {
      display: flex;
      align-items: start;
      gap: 0.75rem;
      flex: 1;
    }

    .task-checkbox input[type="checkbox"] {
      margin-top: 0.25rem;
      flex-shrink: 0;
    }

    .task-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      word-break: break-word;
    }

    .task-card.completed .task-title {
      text-decoration: line-through;
      color: var(--text-secondary);
    }

    .task-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.375rem;
      font-size: 1.125rem;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
      line-height: 1;
    }

    .btn-icon:hover {
      background: var(--bg-hover);
      transform: scale(1.1);
    }

    .btn-icon-danger:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    .task-description {
      color: var(--text-secondary);
      font-size: 0.9375rem;
      line-height: 1.6;
      margin-bottom: 0.75rem;
      word-break: break-word;
    }

    .task-badges {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }

    .badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.625rem;
    }

    .badge-priority {
      font-weight: 600;
    }

    .badge-priority.priority-urgent {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger-color);
    }

    .badge-priority.priority-high {
      background: rgba(245, 158, 11, 0.1);
      color: var(--warning-color);
    }

    .badge-priority.priority-medium {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .badge-priority.priority-low {
      background: rgba(107, 114, 128, 0.1);
      color: var(--text-secondary);
    }

    .badge-category {
      background: rgba(79, 70, 229, 0.1);
      color: var(--primary-color);
    }

    .badge-due {
      background: rgba(16, 185, 129, 0.1);
      color: var(--secondary-color);
    }

    .badge-due.overdue {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger-color);
      font-weight: 600;
    }

    .task-tags {
      display: flex;
      gap: 0.375rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }

    .tag {
      background: var(--bg-secondary);
      color: var(--text-secondary);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .task-meta {
      font-size: 0.8125rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class TaskCardComponent {
  // Signal-based inputs (Angular 17.1+)
  task = input.required<Task>();

  // Signal-based outputs
  toggleComplete = output<string>();
  edit = output<Task>();
  delete = output<string>();

  getPriorityLabel(): string {
    return PRIORITY_LABELS[this.task().priority];
  }

  getCategoryLabel(): string {
    return CATEGORY_LABELS[this.task().category];
  }

  isOverdue(): boolean {
    const dueDate = this.task().dueDate;
    return dueDate ? new Date(dueDate) < new Date() && !this.task().completed : false;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onToggleComplete(): void {
    this.toggleComplete.emit(this.task().id);
  }

  onEdit(): void {
    this.edit.emit(this.task());
  }

  onDelete(): void {
    if (confirm(`"${this.task().title}" 작업을 삭제하시겠습니까?`)) {
      this.delete.emit(this.task().id);
    }
  }
}
