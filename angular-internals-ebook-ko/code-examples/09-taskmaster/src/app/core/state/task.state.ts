/**
 * Task State Management
 *
 * Chapter 7 (Signals) - Signal 기반 반응형 상태 관리
 * Chapter 2 (Change Detection) - OnPush와 함께 사용하여 최적화
 */

import { Injectable, signal, computed, effect } from '@angular/core';
import { Task, TaskFilter, TaskStats, TaskPriority, TaskCategory } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskState {
  // Private writable signals
  private readonly _tasks = signal<Task[]>([]);
  private readonly _filter = signal<TaskFilter>({});
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals - 외부에서는 읽기만 가능
  readonly tasks = this._tasks.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Computed Signal - 필터링된 작업 목록
   * Chapter 7: Computed는 의존성이 변경될 때만 재계산됨
   */
  readonly filteredTasks = computed(() => {
    const tasks = this._tasks();
    const filter = this._filter();

    return tasks.filter(task => {
      // 검색어 필터링
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.tags?.some(tag => tag.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;
      }

      // 우선순위 필터링
      if (filter.priority && task.priority !== filter.priority) {
        return false;
      }

      // 카테고리 필터링
      if (filter.category && task.category !== filter.category) {
        return false;
      }

      // 완료 상태 필터링
      if (filter.completed !== undefined && task.completed !== filter.completed) {
        return false;
      }

      return true;
    });
  });

  /**
   * Computed Signal - 작업 통계
   * Chapter 7: 자동 의존성 추적으로 tasks가 변경될 때만 재계산
   */
  readonly stats = computed<TaskStats>(() => {
    const tasks = this._tasks();
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;

    // 우선순위별 통계
    const byPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<TaskPriority, number>);

    // 카테고리별 통계
    const byCategory = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<TaskCategory, number>);

    return {
      total,
      completed,
      active: total - completed,
      byPriority,
      byCategory,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  });

  constructor() {
    // Effect - localStorage 동기화
    // Chapter 7: Effect는 의존성이 변경될 때 자동 실행
    effect(() => {
      const tasks = this._tasks();
      try {
        localStorage.setItem('taskmaster-tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks to localStorage:', error);
      }
    });

    // 초기 데이터 로드
    this.loadFromLocalStorage();
  }

  /**
   * 작업 추가
   */
  addTask(task: Task): void {
    this._tasks.update(tasks => [...tasks, task]);
  }

  /**
   * 작업 업데이트
   */
  updateTask(id: string, updates: Partial<Task>): void {
    this._tasks.update(tasks =>
      tasks.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    );
  }

  /**
   * 작업 삭제
   */
  deleteTask(id: string): void {
    this._tasks.update(tasks => tasks.filter(task => task.id !== id));
  }

  /**
   * 작업 완료 상태 토글
   */
  toggleTaskComplete(id: string): void {
    this._tasks.update(tasks =>
      tasks.map(task =>
        task.id === id
          ? { ...task, completed: !task.completed, updatedAt: new Date() }
          : task
      )
    );
  }

  /**
   * 필터 설정
   */
  setFilter(filter: TaskFilter): void {
    this._filter.set(filter);
  }

  /**
   * 필터 초기화
   */
  clearFilter(): void {
    this._filter.set({});
  }

  /**
   * 모든 작업 삭제
   */
  clearAllTasks(): void {
    if (confirm('모든 작업을 삭제하시겠습니까?')) {
      this._tasks.set([]);
    }
  }

  /**
   * 완료된 작업 삭제
   */
  clearCompletedTasks(): void {
    this._tasks.update(tasks => tasks.filter(task => !task.completed));
  }

  /**
   * localStorage에서 작업 로드
   */
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('taskmaster-tasks');
      if (stored) {
        const tasks = JSON.parse(stored) as Task[];
        // Date 객체 복원
        const restoredTasks = tasks.map(task => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));
        this._tasks.set(restoredTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error);
      this._error.set('작업 로드 실패');
    }
  }

  /**
   * 로딩 상태 설정
   */
  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  /**
   * 에러 설정
   */
  setError(error: string | null): void {
    this._error.set(error);
  }
}
