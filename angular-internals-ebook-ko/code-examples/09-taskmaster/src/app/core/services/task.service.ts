/**
 * Task Service
 *
 * Chapter 1 (DI) - 싱글톤 서비스 패턴
 * Chapter 3 (Lifecycle) - 서비스 생명주기 관리
 */

import { Injectable } from '@angular/core';
import { Task, TaskFormData, TaskPriority, TaskCategory } from '../models/task.model';
import { TaskState } from '../state/task.state';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private taskState: TaskState) {}

  /**
   * 새 작업 생성
   */
  createTask(data: TaskFormData): Task {
    const task: Task = {
      id: this.generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.taskState.addTask(task);
    return task;
  }

  /**
   * 작업 업데이트
   */
  updateTask(id: string, data: Partial<TaskFormData>): void {
    this.taskState.updateTask(id, data);
  }

  /**
   * 작업 삭제
   */
  deleteTask(id: string): void {
    this.taskState.deleteTask(id);
  }

  /**
   * 작업 완료 토글
   */
  toggleComplete(id: string): void {
    this.taskState.toggleTaskComplete(id);
  }

  /**
   * ID로 작업 찾기
   */
  getTaskById(id: string): Task | undefined {
    return this.taskState.tasks().find(task => task.id === id);
  }

  /**
   * 샘플 데이터 생성
   */
  generateSampleTasks(): void {
    const sampleTasks: TaskFormData[] = [
      {
        title: 'Angular 내부 구조 학습 완료',
        description: 'Chapter 1부터 9까지 모든 내용 학습하기',
        completed: true,
        priority: TaskPriority.HIGH,
        category: TaskCategory.WORK,
        tags: ['학습', 'Angular']
      },
      {
        title: 'TaskMaster 앱 개발',
        description: '프로덕션 준비된 할 일 관리 앱 만들기',
        completed: false,
        priority: TaskPriority.URGENT,
        category: TaskCategory.WORK,
        tags: ['개발', 'Angular', 'TypeScript']
      },
      {
        title: '장보기',
        description: '우유, 계란, 빵 구매하기',
        completed: false,
        priority: TaskPriority.MEDIUM,
        category: TaskCategory.SHOPPING,
        tags: ['식료품']
      },
      {
        title: '운동하기',
        description: '30분 조깅 또는 헬스장 가기',
        completed: false,
        priority: TaskPriority.MEDIUM,
        category: TaskCategory.HEALTH,
        tags: ['건강', '운동']
      },
      {
        title: '코드 리뷰',
        description: 'PR #123 리뷰 및 피드백 제공',
        completed: true,
        priority: TaskPriority.HIGH,
        category: TaskCategory.WORK,
        tags: ['코드리뷰', '팀워크']
      },
      {
        title: '독서',
        description: '클린 아키텍처 3장 읽기',
        completed: false,
        priority: TaskPriority.LOW,
        category: TaskCategory.PERSONAL,
        tags: ['독서', '자기계발']
      }
    ];

    sampleTasks.forEach(taskData => this.createTask(taskData));
  }

  /**
   * 고유 ID 생성
   */
  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 작업 데이터 검증
   */
  validateTask(data: Partial<TaskFormData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('제목은 필수입니다');
    }

    if (data.title && data.title.length > 100) {
      errors.push('제목은 100자를 초과할 수 없습니다');
    }

    if (data.description && data.description.length > 500) {
      errors.push('설명은 500자를 초과할 수 없습니다');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 작업 복제
   */
  duplicateTask(id: string): void {
    const task = this.getTaskById(id);
    if (task) {
      const duplicated: TaskFormData = {
        title: `${task.title} (복사본)`,
        description: task.description,
        completed: false,
        priority: task.priority,
        category: task.category,
        tags: task.tags ? [...task.tags] : undefined,
        dueDate: task.dueDate
      };
      this.createTask(duplicated);
    }
  }
}
