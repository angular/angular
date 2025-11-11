/**
 * Task Filter Pipe
 *
 * Chapter 4 (Rendering) - Pure Pipe for efficient filtering
 *
 * 참고: Signal과 Computed를 사용할 수 있으므로 Pipe는 선택사항이지만,
 * 파이프 사용법을 보여주기 위해 포함
 */

import { Pipe, PipeTransform } from '@angular/core';
import { Task, TaskFilter } from '../../core/models/task.model';

@Pipe({
  name: 'taskFilter',
  standalone: true,
  pure: true // Pure pipe - 입력이 변경될 때만 재실행
})
export class TaskFilterPipe implements PipeTransform {
  transform(tasks: Task[], filter: TaskFilter): Task[] {
    if (!tasks || !filter) {
      return tasks;
    }

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
  }
}
