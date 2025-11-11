/**
 * Task Form Component
 *
 * Chapter 2 (Change Detection) - OnPush 전략
 * Chapter 3 (Lifecycle) - 폼 초기화 및 정리
 */

import { Component, ChangeDetectionStrategy, OnInit, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Task,
  TaskFormData,
  TaskPriority,
  TaskCategory,
  PRIORITY_LABELS,
  CATEGORY_LABELS
} from '../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="task-form">
      <h3>{{ editTask() ? '작업 수정' : '새 작업 추가' }}</h3>

      <form (ngSubmit)="onSubmit()" #form="ngForm">
        <div class="form-group">
          <label class="form-label" for="title">제목 *</label>
          <input
            type="text"
            id="title"
            class="form-control"
            [(ngModel)]="formData.title"
            name="title"
            required
            maxlength="100"
            placeholder="작업 제목을 입력하세요"
            #titleInput="ngModel"
          />
          @if (titleInput.invalid && titleInput.touched) {
            <small class="text-danger">제목은 필수입니다</small>
          }
        </div>

        <div class="form-group">
          <label class="form-label" for="description">설명</label>
          <textarea
            id="description"
            class="form-control"
            [(ngModel)]="formData.description"
            name="description"
            maxlength="500"
            rows="3"
            placeholder="작업 설명을 입력하세요"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="priority">우선순위</label>
            <select
              id="priority"
              class="form-control form-select"
              [(ngModel)]="formData.priority"
              name="priority"
            >
              @for (priority of priorities; track priority.value) {
                <option [value]="priority.value">{{ priority.label }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="category">카테고리</label>
            <select
              id="category"
              class="form-control form-select"
              [(ngModel)]="formData.category"
              name="category"
            >
              @for (category of categories; track category.value) {
                <option [value]="category.value">{{ category.label }}</option>
              }
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="dueDate">마감일</label>
          <input
            type="date"
            id="dueDate"
            class="form-control"
            [(ngModel)]="dueDateString"
            name="dueDate"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="tags">태그 (쉼표로 구분)</label>
          <input
            type="text"
            id="tags"
            class="form-control"
            [(ngModel)]="tagsString"
            name="tags"
            placeholder="예: 중요, 긴급, 검토필요"
          />
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="form.invalid"
          >
            {{ editTask() ? '수정' : '추가' }}
          </button>
          <button
            type="button"
            class="btn btn-outline"
            (click)="onCancel()"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .task-form {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
      margin-bottom: 2rem;
    }

    .task-form h3 {
      margin-bottom: 1.5rem;
      color: var(--primary-color);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .text-danger {
      display: block;
      margin-top: 0.25rem;
      color: var(--danger-color);
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class TaskFormComponent implements OnInit {
  // Signal inputs
  editTask = input<Task | null>(null);

  // Signal outputs
  save = output<TaskFormData>();
  cancel = output<void>();

  // Form data
  formData: TaskFormData = this.getEmptyFormData();
  dueDateString = '';
  tagsString = '';

  // Options
  priorities = Object.values(TaskPriority).map(value => ({
    value,
    label: PRIORITY_LABELS[value]
  }));

  categories = Object.values(TaskCategory).map(value => ({
    value,
    label: CATEGORY_LABELS[value]
  }));

  ngOnInit(): void {
    const task = this.editTask();
    if (task) {
      this.loadTaskData(task);
    }
  }

  onSubmit(): void {
    // 태그 파싱
    if (this.tagsString.trim()) {
      this.formData.tags = this.tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    } else {
      this.formData.tags = undefined;
    }

    // 마감일 파싱
    if (this.dueDateString) {
      this.formData.dueDate = new Date(this.dueDateString);
    } else {
      this.formData.dueDate = undefined;
    }

    this.save.emit({ ...this.formData });
    this.resetForm();
  }

  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }

  private loadTaskData(task: Task): void {
    this.formData = {
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority,
      category: task.category,
      tags: task.tags ? [...task.tags] : undefined,
      dueDate: task.dueDate
    };

    if (task.dueDate) {
      this.dueDateString = this.formatDateForInput(task.dueDate);
    }

    if (task.tags && task.tags.length > 0) {
      this.tagsString = task.tags.join(', ');
    }
  }

  private resetForm(): void {
    this.formData = this.getEmptyFormData();
    this.dueDateString = '';
    this.tagsString = '';
  }

  private getEmptyFormData(): TaskFormData {
    return {
      title: '',
      description: '',
      completed: false,
      priority: TaskPriority.MEDIUM,
      category: TaskCategory.PERSONAL
    };
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
