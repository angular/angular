# 9장: TaskMaster 구축하기 - 모든 것을 하나로

> *"배운 모든 것을 사용하는 실제 무언가를 만들어보자!"*

## 소개

8개 챕터의 Angular 내부 구조 심층 분석 후, Alex는 준비되었습니다. 모든 조각이 제자리에 있었습니다:

- ✅ **의존성 주입** - 계층적 인젝터와 프로바이더 전략
- ✅ **변경 감지** - OnPush 최적화와 Zone.js
- ✅ **컴포넌트 생명주기** - 정확히 언제 데이터를 로드하는지 알기
- ✅ **렌더링 엔진** - LView와 명령어 이해
- ✅ **컴파일러** - 템플릿이 코드가 되는 방법
- ✅ **Zone.js** - Angular zone을 벗어나는 시기
- ✅ **Signals** - 현대적 반응성 패턴
- ✅ **라우터** - 고급 네비게이션과 guards

이제 **TaskMaster** - 모든 개념을 실제 컨텍스트에서 보여주는 완전한 작업 관리 애플리케이션을 만들 시간입니다.

## 요구사항

TaskMaster는 다음과 같아야 합니다:

1. **빠름** - 최적화된 변경 감지, lazy loading
2. **확장 가능** - 확장을 위한 플러그인 아키텍처
3. **현대적** - Signal 기반 상태 관리
4. **테스트됨** - 테스트 가능성을 위한 적절한 DI
5. **프로덕션 준비** - 에러 처리, 로딩 상태, 오프라인 지원

## 아키텍처 개요

```
TaskMaster 애플리케이션
├── Core 모듈 (싱글톤 서비스)
│   ├── AuthService (providedIn: 'root')
│   ├── StateService (Signal 기반)
│   └── ApiService (HTTP 클라이언트 래퍼)
│
├── Features (Lazy-Loaded)
│   ├── Tasks Feature
│   │   ├── TaskListComponent (OnPush)
│   │   ├── TaskDetailComponent (OnPush)
│   │   └── TaskFormComponent (Reactive Forms)
│   │
│   ├── Analytics Feature
│   │   ├── DashboardComponent (OnPush)
│   │   └── ChartsComponent (runOutsideAngular)
│   │
│   └── Settings Feature
│       └── SettingsComponent
│
├── Shared
│   ├── UI Components (OnPush, Standalone)
│   └── Pipes & Directives
│
└── Plugins (확장 포인트)
    ├── Plugin Interface
    ├── Export Plugin (PDF/CSV)
    └── Integration Plugin (Slack/Email)
```

## 1단계: Signals로 상태 관리

먼저, Alex는 Angular Signals를 사용하여 상태 레이어를 만들었습니다:

```typescript
// src/app/core/state/task.state.ts

import { Injectable, signal, computed } from '@angular/core';
import { Task, TaskFilter } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskState {
  // Private signals (내부 상태)
  private _tasks = signal<Task[]>([]);
  private _filter = signal<TaskFilter>('all');
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Public read-only signals
  readonly tasks = this._tasks.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals (파생 상태)
  readonly filteredTasks = computed(() => {
    const tasks = this._tasks();
    const filter = this._filter();

    switch (filter) {
      case 'active':
        return tasks.filter(t => !t.completed);
      case 'completed':
        return tasks.filter(t => t.completed);
      default:
        return tasks;
    }
  });

  readonly stats = computed(() => {
    const tasks = this._tasks();
    return {
      total: tasks.length,
      active: tasks.filter(t => !t.completed).length,
      completed: tasks.filter(t => t.completed).length
    };
  });

  // Actions (상태 변경)
  setTasks(tasks: Task[]): void {
    this._tasks.set(tasks);
  }

  addTask(task: Task): void {
    this._tasks.update(tasks => [...tasks, task]);
  }

  updateTask(id: string, updates: Partial<Task>): void {
    this._tasks.update(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  }

  deleteTask(id: string): void {
    this._tasks.update(tasks => tasks.filter(t => t.id !== id));
  }

  setFilter(filter: TaskFilter): void {
    this._filter.set(filter);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }
}
```

**왜 Signals인가?**

1. **세밀한 반응성** - 변경된 signal을 사용하는 컴포넌트만 업데이트
2. **자동 의존성 추적** - Computed signals가 의존성을 자동으로 추적
3. **타입 안전** - 완전한 TypeScript 지원
4. **간단한 멘탈 모델** - 관리할 구독 없음

## 2단계: OnPush로 최적화된 컴포넌트

다음으로, Alex는 OnPush 전략으로 컴포넌트를 만들었습니다:

```typescript
// src/app/features/tasks/task-list.component.ts

import { Component, ChangeDetectionStrategy, effect } from '@angular/core';
import { TaskState } from '../../core/state/task.state';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-task-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  template: `
    <div class="task-list">
      <!-- 로딩 상태 -->
      @if (taskState.loading()) {
        <app-spinner />
      }

      <!-- 에러 상태 -->
      @if (taskState.error(); as error) {
        <app-error [message]="error" />
      }

      <!-- 작업 -->
      @for (task of taskState.filteredTasks(); track task.id) {
        <app-task-card
          [task]="task"
          (toggle)="onToggle($event)"
          (delete)="onDelete($event)"
        />
      }

      <!-- 빈 상태 -->
      @empty {
        <app-empty-state message="작업이 없습니다" />
      }

      <!-- 통계 푸터 -->
      <app-task-stats [stats]="taskState.stats()" />
    </div>
  `
})
export class TaskListComponent {
  constructor(
    public taskState: TaskState,
    private taskService: TaskService
  ) {
    // effect를 사용하여 초기화 시 작업 로드
    effect(() => {
      if (!this.taskState.loading()) {
        this.loadTasks();
      }
    });
  }

  private loadTasks(): void {
    this.taskState.setLoading(true);
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.taskState.setTasks(tasks);
        this.taskState.setLoading(false);
      },
      error: (error) => {
        this.taskState.setError(error.message);
        this.taskState.setLoading(false);
      }
    });
  }

  onToggle(taskId: string): void {
    const task = this.taskState.tasks().find(t => t.id === taskId);
    if (task) {
      this.taskState.updateTask(taskId, { completed: !task.completed });
      // 백엔드에 저장
      this.taskService.updateTask(taskId, { completed: !task.completed })
        .subscribe();
    }
  }

  onDelete(taskId: string): void {
    this.taskState.deleteTask(taskId);
    this.taskService.deleteTask(taskId).subscribe();
  }
}
```

**OnPush 이점:**

- ✅ signals 변경 시에만 컴포넌트 확인
- ✅ 템플릿의 signal()을 통해 자동
- ✅ 수동 ChangeDetectorRef 불필요
- ✅ 변경 감지 사이클 90% 감소

## 3단계: 계층적 의존성 주입

Alex는 DI를 사용하여 플러그인 시스템을 구현했습니다:

```typescript
// src/app/core/plugins/plugin.interface.ts

export interface Plugin {
  name: string;
  version: string;
  initialize(): void;
  execute(context: PluginContext): Promise<void>;
}

export interface PluginContext {
  tasks: Task[];
  format?: string;
}

// src/app/core/plugins/plugin.token.ts

import { InjectionToken } from '@angular/core';

export const TASK_PLUGINS = new InjectionToken<Plugin[]>('TASK_PLUGINS', {
  providedIn: 'root',
  factory: () => []
});

// src/app/core/services/plugin.service.ts

import { Injectable, Inject } from '@angular/core';
import { TASK_PLUGINS } from '../plugins/plugin.token';
import { Plugin } from '../plugins/plugin.interface';

@Injectable({ providedIn: 'root' })
export class PluginService {
  private plugins = new Map<string, Plugin>();

  constructor(@Inject(TASK_PLUGINS) registeredPlugins: Plugin[]) {
    // multi-provider를 통해 제공된 모든 플러그인 등록
    registeredPlugins.forEach(plugin => this.register(plugin));
  }

  register(plugin: Plugin): void {
    plugin.initialize();
    this.plugins.set(plugin.name, plugin);
  }

  async execute(pluginName: string, context: PluginContext): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }
    await plugin.execute(context);
  }

  listPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}

// src/app/plugins/export/csv-export.plugin.ts

import { Injectable } from '@angular/core';
import { Plugin, PluginContext } from '../../core/plugins/plugin.interface';

@Injectable()
export class CsvExportPlugin implements Plugin {
  name = 'CSV Export';
  version = '1.0.0';

  initialize(): void {
    console.log('CSV Export Plugin initialized');
  }

  async execute(context: PluginContext): Promise<void> {
    const csv = this.convertToCSV(context.tasks);
    this.downloadCSV(csv, 'tasks.csv');
  }

  private convertToCSV(tasks: any[]): string {
    const headers = Object.keys(tasks[0]).join(',');
    const rows = tasks.map(task =>
      Object.values(task).join(',')
    ).join('\n');
    return `${headers}\n${rows}`;
  }

  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

// main.ts 또는 app.config.ts에서 플러그인 등록
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {
      provide: TASK_PLUGINS,
      useClass: CsvExportPlugin,
      multi: true
    },
    {
      provide: TASK_PLUGINS,
      useClass: PdfExportPlugin,
      multi: true
    }
  ]
};
```

## 4단계: Zone.js로 성능 최적화

무거운 차트 렌더링이 있는 분석 대시보드의 경우:

```typescript
// src/app/features/analytics/dashboard.component.ts

import { Component, NgZone, effect } from '@angular/core';
import { TaskState } from '../../core/state/task.state';
import * as d3 from 'd3';

@Component({
  selector: 'app-analytics-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <div #chartContainer class="chart-container"></div>
      <app-stats-cards [stats]="taskState.stats()" />
    </div>
  `
})
export class AnalyticsDashboardComponent {
  @ViewChild('chartContainer', { static: true })
  chartContainer!: ElementRef;

  constructor(
    public taskState: TaskState,
    private ngZone: NgZone
  ) {
    // 작업이 변경될 때 차트 업데이트
    effect(() => {
      const tasks = this.taskState.filteredTasks();

      // Angular zone 밖에서 차트 렌더링
      // D3가 DOM을 자주 조작 - 모든 업데이트마다 CD 원하지 않음
      this.ngZone.runOutsideAngular(() => {
        this.renderChart(tasks);
      });
    });
  }

  private renderChart(tasks: Task[]): void {
    // 복잡한 D3 시각화
    // 많은 DOM 업데이트, 애니메이션 등
    const container = d3.select(this.chartContainer.nativeElement);

    // 여기서 수백 개의 DOM 업데이트...
    // 하지만 변경 감지 트리거되지 않음!

    // 이전 차트 지우기
    container.selectAll('*').remove();

    // 새 시각화 생성
    const svg = container.append('svg')
      .attr('width', 800)
      .attr('height', 400);

    // ... 복잡한 D3 렌더링 로직 ...
  }
}
```

**이점:**

- ✅ 차트 렌더링 중 변경 감지 없음
- ✅ 부드러운 애니메이션 (60fps)
- ✅ 필요할 때만 CD 실행 (통계 카드 업데이트)

## 5단계: Guards와 Lazy Loading이 있는 라우터

```typescript
// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';

// 함수형 guard
const authGuard = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};

// 함수형 resolver
const taskResolver = (route: ActivatedRouteSnapshot) => {
  const taskService = inject(TaskService);
  return taskService.getTask(route.params['id']);
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/tasks/tasks.routes').then(m => m.TASKS_ROUTES)
  },
  {
    path: 'analytics',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/analytics/dashboard.component')
        .then(m => m.AnalyticsDashboardComponent)
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/settings/settings.component')
        .then(m => m.SettingsComponent)
  }
];
```

## 6단계: 완전한 애플리케이션 플로우

모든 시스템을 통한 완전한 사용자 상호작용을 추적해봅시다:

### 시나리오: 사용자가 작업 토글

```typescript
// 1. 템플릿에서 사용자가 체크박스 클릭
<input
  type="checkbox"
  [checked]="task.completed"
  (change)="onToggle(task.id)"  // ← 클릭 이벤트
/>

// 2. 이벤트 핸들러 실행
onToggle(taskId: string): void {
  // 3. signal 상태 업데이트 (computed signals 트리거)
  this.taskState.updateTask(taskId, {
    completed: !this.currentTask.completed
  });

  // 4. 백엔드에 저장
  this.taskService.updateTask(taskId, updates).subscribe();
}

// 5. Signal 업데이트 전파
// TaskState.updateTask()가 _tasks.update() 호출
this._tasks.update(tasks =>
  tasks.map(task =>
    task.id === id ? { ...task, ...updates } : task
  )
);

// 6. Computed signals 재계산
this.stats = computed(() => {
  const tasks = this._tasks(); // signal 읽기 - 의존성 추적
  return { /* ... 계산된 통계 ... */ };
});

// 7. 템플릿이 signal 읽기
{{ taskState.stats().completed }}  // ← 템플릿에서 signal 읽기

// 8. 변경 감지 실행 (OnPush)
// - 컴포넌트 dirty 표시 (signal 변경됨)
// - 이 컴포넌트만 CD 확인
// - DOM에 새 값 렌더링

// 9. LView 업데이트 (Render3)
// - ɵɵtextInterpolate1() 명령어
// - DOM 텍스트 노드 업데이트
// - 효율적인 패치, 전체 재렌더링 아님
```

**모든 시스템이 함께 작동:**

1. ✅ **DI**: 서비스가 계층적으로 주입됨
2. ✅ **Signals**: 세밀한 반응성
3. ✅ **변경 감지**: OnPush + signals = 최적 성능
4. ✅ **렌더링**: Ivy 명령어를 통한 효율적인 DOM 업데이트
5. ✅ **Zone.js**: 이벤트가 자동으로 CD 트리거

## 7단계: 내부 구조 지식으로 테스트

내부 구조를 이해하면 테스트가 더 쉬워집니다:

```typescript
// src/app/features/tasks/task-list.component.spec.ts

import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TaskListComponent } from './task-list.component';
import { TaskState } from '../../core/state/task.state';
import { TaskService } from '../../core/services/task.service';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let mockTaskState: jasmine.SpyObj<TaskState>;
  let mockTaskService: jasmine.SpyObj<TaskService>;

  beforeEach(() => {
    // signals로 mock 상태 생성
    mockTaskState = jasmine.createSpyObj('TaskState', {
      loading: signal(false),
      error: signal(null),
      filteredTasks: signal([]),
      stats: signal({ total: 0, active: 0, completed: 0 }),
      setLoading: undefined,
      setError: undefined,
      updateTask: undefined,
      deleteTask: undefined
    });

    mockTaskService = jasmine.createSpyObj('TaskService', [
      'getTasks',
      'updateTask',
      'deleteTask'
    ]);

    TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        { provide: TaskState, useValue: mockTaskState },
        { provide: TaskService, useValue: mockTaskService }
      ]
    });

    component = TestBed.createComponent(TaskListComponent).componentInstance;
  });

  it('should update task on toggle', () => {
    const task = { id: '1', title: 'Test', completed: false };
    mockTaskState.tasks.and.returnValue([task]);

    component.onToggle('1');

    expect(mockTaskState.updateTask).toHaveBeenCalledWith('1', {
      completed: true
    });
  });
});
```

## 완전한 파일 구조

```
taskmaster/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── task.service.ts
│   │   │   │   └── plugin.service.ts
│   │   │   ├── state/
│   │   │   │   └── task.state.ts
│   │   │   ├── models/
│   │   │   │   └── task.model.ts
│   │   │   └── plugins/
│   │   │       ├── plugin.interface.ts
│   │   │       └── plugin.token.ts
│   │   │
│   │   ├── features/
│   │   │   ├── tasks/
│   │   │   │   ├── task-list.component.ts
│   │   │   │   ├── task-detail.component.ts
│   │   │   │   ├── task-form.component.ts
│   │   │   │   └── tasks.routes.ts
│   │   │   ├── analytics/
│   │   │   │   └── dashboard.component.ts
│   │   │   └── settings/
│   │   │       └── settings.component.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── spinner.component.ts
│   │   │   │   ├── error.component.ts
│   │   │   │   └── empty-state.component.ts
│   │   │   └── pipes/
│   │   │       └── date-format.pipe.ts
│   │   │
│   │   ├── plugins/
│   │   │   ├── export/
│   │   │   │   ├── csv-export.plugin.ts
│   │   │   │   └── pdf-export.plugin.ts
│   │   │   └── integration/
│   │   │       └── slack.plugin.ts
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   │
│   └── main.ts
│
└── package.json
```

## 주요 성과

Alex의 TaskMaster 애플리케이션이 보여주는 것:

### 1. **최적화된 성능**
- 모든 곳에 OnPush → CD 사이클 90% 감소
- Signals → 세밀한 업데이트
- runOutsideAngular → 부드러운 애니메이션
- Lazy loading → 빠른 초기 로드

### 2. **확장 가능한 아키텍처**
- DI를 통한 플러그인 시스템
- Feature 모듈
- 공유 컴포넌트
- 명확한 관심사 분리

### 3. **현대적 패턴**
- Signal 기반 상태
- Standalone 컴포넌트
- 함수형 guards/resolvers
- Computed 값

### 4. **프로덕션 준비**
- 에러 처리
- 로딩 상태
- 오프라인 지원 (service workers)
- 포괄적인 테스트

## 성능 지표

**최적화 전:**
- 초기 로드: 2.5초
- 변경 감지 사이클: ~500/초
- 메모리 사용량: 85MB
- 애니메이션 FPS: 30

**내부 구조 지식 적용 후:**
- 초기 로드: 0.8초 (69% 빠름)
- 변경 감지 사이클: ~50/초 (90% 감소)
- 메모리 사용량: 45MB (47% 감소)
- 애니메이션 FPS: 60 (2배 부드러움)

## 완전한 예제 실행

```bash
cd code-examples/09-taskmaster/
npm install
npm start

# 테스트 실행
npm test

# 프로덕션 빌드
npm run build

# 번들 분석
npm run analyze
```

## Alex가 배운 것

TaskMaster를 만든 후, Alex는 깨달았습니다:

1. **내부 구조 지식은 학문적이지 않음** - 앱 품질에 직접 영향
2. **성능 최적화는 체계적** - 무작위 추측이 아님
3. **아키텍처는 이해에서 나옴** - DI 작동 방식을 알면 더 나은 디자인으로 이어짐
4. **디버깅이 더 빠름** - 내부 구조를 알면 에러가 이해됨
5. **자신감 증가** - 더 이상 "블랙박스" 두려움 없음

## 결론

9개 챕터 전, Alex는 `NullInjectorError`로 좌절했습니다. 이제 Alex는 할 수 있습니다:

- ✅ 확장 가능한 DI 계층 구조 디자인
- ✅ 자신 있게 변경 감지 최적화
- ✅ 생명주기 훅 올바르게 사용
- ✅ 렌더링 성능 이해
- ✅ 컴파일러 지식 활용
- ✅ 비동기 작업 최적화
- ✅ Signals로 반응형 시스템 구축
- ✅ 복잡한 라우팅 아키텍처 생성

더 중요한 것은, Alex가 Angular 디자인 결정 뒤의 **"왜"**를 이해한다는 것입니다.

## 당신의 차례

Alex의 Angular 내부 구조를 통한 여정을 따라왔습니다. 이제 이 지식을 적용할 차례입니다:

1. **뭔가 만들기** - 이 패턴을 사용하여 자신의 프로젝트 생성
2. **기존 앱 최적화** - OnPush, signals, lazy loading 적용
3. **Angular에 기여** - 이제 코드베이스를 이해함
4. **다른 사람 가르치기** - 내부 구조 지식 공유

## 최종 생각

프레임워크 내부 구조를 이해하는 것은 구현 세부사항을 암기하는 것이 아닙니다. 다음에 관한 것입니다:

- 작동 방식에 대한 **직관 개발**
- 트레이드오프를 기반으로 **정보에 입각한 결정** 내리기
- 무작위가 아닌 **체계적으로 디버깅**
- 제약을 이해하여 **더 나은 디자인**

Angular의 아키텍처는 신중하게 설계되었습니다. 모든 패턴은 목적이 있습니다. 이러한 목적을 이해함으로써 더 효과적인 개발자가 됩니다.

---

## 감사합니다

Angular 내부 구조를 통한 Alex의 여정에 함께해 주셔서 감사합니다. 모든 챕터를 읽었든 특정 주제로 점프했든, 가치 있는 통찰을 얻으셨기를 바랍니다.

계속 탐험하세요. 계속 배우세요. 그리고 기억하세요:

> **"마법은 단지 코드일 뿐입니다. 그리고 이제 당신은 코드를 이해합니다."**

---

## 추가 리소스

- **Angular 소스 코드**: https://github.com/angular/angular
- **설계 문서**: https://github.com/angular/angular/tree/main/adev/src/content/reference
- **Angular 블로그**: https://blog.angular.dev
- **RFCs**: https://github.com/angular/angular/discussions
- **커뮤니티**: https://discord.gg/angular

## Alex의 일지에서 - 마지막 항목

*"첫 번째 일지 항목을 돌아보면, 얼마나 멀리 왔는지 믿을 수 없습니다. NullInjectorError로 혼란스러워했던 것에서 깊은 내부 구조 지식으로 프로덕션 준비 앱을 만들기까지.*

*여정은 도전적이었지만 그만한 가치가 있었습니다. 더 이상 프레임워크에 겁먹지 않습니다 - 이해합니다.*

*이것을 읽는 모든 분께: 제가 Angular 내부 구조를 배울 수 있다면, 여러분도 할 수 있습니다. 작게 시작하고, 호기심을 가지고, 계속 파헤치세요.*

*이제 Angular에 첫 PR을 기여할 시간입니다. 어디서 시작할지 정확히 알고 있습니다.*

*- Alex"*

---

**🎉 Angular 내부 구조 완료를 축하합니다! 🎉**

이제 Angular가 실제로 어떻게 작동하는지 진정으로 이해하는 개발자 중 한 명입니다.

가서 놀라운 것을 만드세요.
