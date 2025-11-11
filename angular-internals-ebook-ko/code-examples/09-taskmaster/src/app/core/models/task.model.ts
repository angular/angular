/**
 * Task Model
 *
 * 작업 항목의 데이터 구조를 정의합니다.
 * Chapter 1 (DI) - 타입 시스템을 통한 계약 정의
 */

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: TaskPriority;
  category: TaskCategory;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags?: string[];
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  SHOPPING = 'shopping',
  HEALTH = 'health',
  OTHER = 'other'
}

export interface TaskStats {
  total: number;
  completed: number;
  active: number;
  byPriority: Record<TaskPriority, number>;
  byCategory: Record<TaskCategory, number>;
  completionRate: number;
}

export interface TaskFilter {
  searchTerm?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  completed?: boolean;
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 한글 레이블 매핑
 */
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: '낮음',
  [TaskPriority.MEDIUM]: '보통',
  [TaskPriority.HIGH]: '높음',
  [TaskPriority.URGENT]: '긴급'
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  [TaskCategory.WORK]: '업무',
  [TaskCategory.PERSONAL]: '개인',
  [TaskCategory.SHOPPING]: '쇼핑',
  [TaskCategory.HEALTH]: '건강',
  [TaskCategory.OTHER]: '기타'
};
