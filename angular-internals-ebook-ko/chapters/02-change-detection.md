# 2장: 변경 감지의 수수께끼

> *"버튼을 클릭했는데 UI가 업데이트되지 않아!"*

## 문제

의존성 주입 승리의 여운이 남아있는 Alex는 자신감이 넘쳤습니다. 다음 작업은 간단해 보였습니다: 실시간 주문 업데이트를 보여주는 실시간 대시보드를 만드는 것이었죠.

Alex는 매초마다 데이터를 가져오는 컴포넌트를 만들었습니다:

```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <h2>Live Orders: {{ orders.length }}</h2>
      <div *ngFor="let order of orders">
        {{ order.id }} - {{ order.status }}
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  orders: Order[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    // 네이티브 setInterval을 사용한 업데이트 폴링
    setInterval(() => {
      this.orderService.getOrders().subscribe(orders => {
        this.orders = orders;
        console.log('Orders updated:', orders.length); // 올바르게 로그됨!
      });
    }, 1000);
  }
}
```

콘솔은 매초마다 주문이 업데이트되는 것을 보여줬습니다. 완벽해요! 하지만 UI는... 변경되지 않았습니다. 디스플레이는 "Live Orders: 0"을 보여주며 절대 업데이트되지 않았습니다.

**"데이터는 업데이트되는데 뷰는 안 돼!"** Alex는 당황했습니다.

그리고 Alex는 뭔가를 시도했습니다: 페이지의 아무 곳이나 클릭했습니다. 갑자기 UI가 모든 보류 중인 변경사항과 함께 업데이트되었습니다.

*"뭐라고? 클릭은 업데이트를 트리거하는데 데이터 변경은 안 돼?"*

## 조사

이 미스터리는 Alex를 Angular의 변경 감지 시스템 깊숙이 이끌었습니다.

### 발견 1: 변경 감지는 이벤트에서 실행됨

Alex는 `packages/core/src/change_detection/`에서 답을 찾았습니다:

```typescript
// packages/core/src/render3/instructions/change_detection.ts

/**
 * 뷰를 dirty로 표시하고(확인 필요) 변경 감지를 스케줄링
 */
export function markViewDirty(lView: LView): void {
  while (lView) {
    lView[FLAGS] |= LViewFlags.Dirty;

    const parent = lView[PARENT];
    if (parent === null) {
      // 루트에 도달, tick 스케줄링
      scheduleTick(lView);
      return;
    }
    lView = parent;
  }
}

/**
 * 메인 변경 감지 함수
 */
export function detectChanges(component: {}): void {
  const lView = getComponentLViewByIndex(getComponentDef(component)!.id, getLView());
  detectChangesInternal(lView, component);
}
```

💡 **핵심 통찰 #1**: 변경 감지는 자동으로 실행되지 않습니다 - 무언가가 트리거해야 합니다!

### 발견 2: Zone.js가 비동기 작업을 패치함

Alex는 Angular가 **Zone.js**를 사용하여 변경 감지를 자동으로 트리거한다는 것을 발견했습니다:

```typescript
// zone.js/lib/zone.ts에서 단순화

class NgZone {
  run<T>(fn: () => T): T {
    // Angular zone 내에서 함수 실행
    return this._inner.run(() => {
      const result = fn();

      // 함수 완료 후 변경 감지 트리거
      this.onMicrotaskEmpty.emit();

      return result;
    });
  }

  runOutsideAngular<T>(fn: () => T): T {
    // 변경 감지 트리거 없이 실행
    return this._outer.run(fn);
  }
}
```

Zone.js는 모든 비동기 API를 패치합니다:
- `setTimeout` / `setInterval`
- `Promise`
- `XMLHttpRequest` / `fetch`
- `addEventListener`

이들이 완료되면 Zone.js는 Angular에게 변경 감지를 실행하라고 알립니다.

하지만 여기 함정이 있습니다: **Alex의 코드는 Angular zone에서 실행되지 않았습니다!**

## 해결책

수정은 간단했습니다 - Angular의 zone 내에서 interval을 실행하는 것이죠:

```typescript
import { Component, OnInit, NgZone } from '@angular/core';

@Component({...})
export class DashboardComponent implements OnInit {
  orders: Order[] = [];

  constructor(
    private orderService: OrderService,
    private ngZone: NgZone  // NgZone 주입
  ) {}

  ngOnInit() {
    // 옵션 1: Angular의 zone 사용
    this.ngZone.run(() => {
      setInterval(() => {
        this.orderService.getOrders().subscribe(orders => {
          this.orders = orders;
        });
      }, 1000);
    });

    // 옵션 2: 수동으로 변경 감지 트리거
    setInterval(() => {
      this.orderService.getOrders().subscribe(orders => {
        this.orders = orders;
        this.ngZone.run(() => {}); // CD 강제 실행
      });
    }, 1000);

    // 옵션 3: RxJS timer 사용 (자동으로 zone 내에서)
    timer(0, 1000)
      .pipe(switchMap(() => this.orderService.getOrders()))
      .subscribe(orders => {
        this.orders = orders;
      });
  }
}
```

그런데 왜 클릭하면 UI가 업데이트되었을까요? **왜냐하면 클릭 이벤트는 Zone.js에 의해 자동으로 패치되기 때문입니다!**

## 심층 분석: 변경 감지가 작동하는 방법

이제 Alex는 완전한 메커니즘을 이해하고 싶었습니다.

### 변경 감지 트리

모든 컴포넌트는 바인딩이 변경되었는지 확인하는 **change detector**를 가지고 있습니다:

```
┌─────────────────┐
│   AppComponent  │  ← 루트
│   CD: Default   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───┴────┐ ┌─┴──────┐
│Dashboard│ │ Sidebar│
│Default  │ │ OnPush │
└───┬────┘ └────────┘
    │
┌───┴──────┐
│OrderCard │
│  OnPush  │
└──────────┘
```

### 알고리즘

```typescript
// render3/instructions/change_detection.ts에서 단순화

function detectChangesInView(
  lView: LView,
  mode: ChangeDetectionMode
): void {
  const tView = lView[TVIEW];
  const flags = lView[FLAGS];

  // 다음의 경우 건너뛰기:
  // - 뷰가 파괴됨
  // - 뷰가 분리됨
  // - 뷰가 OnPush이고 dirty가 아님
  if (
    flags & LViewFlags.Destroyed ||
    flags & LViewFlags.Detached ||
    (mode === ChangeDetectionMode.OnPush && !(flags & LViewFlags.Dirty))
  ) {
    return;
  }

  // 확인 중으로 표시
  lView[FLAGS] &= ~LViewFlags.Dirty;
  lView[FLAGS] |= LViewFlags.CheckAlways;

  // 뷰 새로고침 (템플릿 함수 실행)
  refreshView(tView, lView, tView.template, lView[CONTEXT]);

  // 자식 확인
  const components = tView.components;
  if (components !== null) {
    for (let i = 0; i < components.length; i++) {
      const componentIndex = components[i];
      const componentView = getComponentLViewByIndex(componentIndex, lView);
      detectChangesInView(componentView, mode);
    }
  }
}
```

💡 **핵심 통찰 #2**: 변경 감지는 컴포넌트 트리를 위에서 아래로 순회합니다!

### 변경 감지 전략

Angular는 두 가지 전략을 제공합니다:

```typescript
// packages/core/src/change_detection/constants.ts

export enum ChangeDetectionStrategy {
  /**
   * 트리거될 때마다 뷰 확인 (기본값)
   * 모든 비동기 이벤트에서 실행
   */
  Default = 1,

  /**
   * 다음의 경우에만 확인:
   * - @Input() 변경
   * - 컴포넌트가 이벤트 방출
   * - markForCheck()를 통해 수동으로 트리거
   */
  OnPush = 0
}
```

#### Default 전략

```typescript
@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.Default, // 기본값
  template: `
    <div *ngFor="let user of users">
      {{ user.name }} - {{ user.status }}
    </div>
  `
})
export class UserListComponent {
  users: User[] = [];

  constructor(private userService: UserService) {
    // 이것은 CD를 트리거합니다
    setInterval(() => {
      this.userService.getUsers().subscribe(users => {
        this.users = users; // 뷰가 자동으로 업데이트됨
      });
    }, 1000);
  }
}
```

모든 비동기 작업은 **모든 Default 컴포넌트**에 대한 변경 감지를 트리거합니다.

#### OnPush 전략

```typescript
@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      {{ user.name }} - {{ user.status }}
      <button (click)="toggleStatus()">Toggle</button>
    </div>
  `
})
export class UserCardComponent {
  @Input() user!: User;

  toggleStatus() {
    // ❌ 뷰가 업데이트되지 않습니다!
    this.user.status = this.user.status === 'active' ? 'inactive' : 'active';

    // ✅ 이것은 작동합니다 - 새로운 객체 참조
    this.user = { ...this.user, status: this.user.status === 'active' ? 'inactive' : 'active' };
  }
}
```

OnPush는 다음의 경우에만 확인합니다:
1. **@Input() 참조 변경** (깊은 동등성이 아님!)
2. **템플릿의 이벤트 핸들러 실행**
3. **Async pipe가 새 값 방출**
4. **ChangeDetectorRef.markForCheck()를 통해 수동으로 표시**

### 뷰 플래그

Alex는 변경 감지가 **비트 플래그**를 사용하여 상태를 추적한다는 것을 발견했습니다:

```typescript
// packages/core/src/render3/interfaces/view.ts

export const enum LViewFlags {
  /** 뷰가 확인 필요한지 여부 */
  Dirty = 0b00000001,

  /** 뷰가 CD 트리에 연결됨 */
  Attached = 0b00000010,

  /** 뷰가 파괴됨 */
  Destroyed = 0b00000100,

  /** 첫 번째 확인이 실행되지 않음 */
  FirstCheck = 0b00001000,

  /** 뷰가 OnPush 사용 */
  CheckAlways = 0b00010000,

  // ... 더 많은 플래그
}
```

이 플래그들은 뷰를 확인해야 하는지 결정합니다:

```typescript
function shouldCheckView(lView: LView): boolean {
  const flags = lView[FLAGS];

  return (
    !(flags & LViewFlags.Destroyed) &&  // 파괴되지 않음
    (flags & LViewFlags.Attached) &&     // 트리에 연결됨
    (flags & LViewFlags.Dirty ||         // Dirty로 표시됨 또는
     flags & LViewFlags.CheckAlways)     // 항상 확인 (Default 전략)
  );
}
```

## 성능 최적화

이 지식으로 무장한 Alex는 대시보드를 최적화했습니다:

### Before: 느림 (모든 것이 Default)

```typescript
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <app-order-card *ngFor="let order of orders" [order]="order"></app-order-card>
  `
})
export class DashboardComponent {
  orders: Order[] = [];

  ngOnInit() {
    // 매초마다 전체 트리에 대해 CD 트리거!
    interval(1000)
      .pipe(switchMap(() => this.orderService.getOrders()))
      .subscribe(orders => {
        this.orders = orders;
      });
  }
}
```

**문제**: 매초마다 대시보드 + 모든 자식 컴포넌트에 대해 변경 감지가 실행되며, 데이터가 변경되지 않았을 때도 실행됩니다!

### After: 빠름 (모든 곳에 OnPush)

```typescript
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-order-card
      *ngFor="let order of orders; trackBy: trackByOrderId"
      [order]="order">
    </app-order-card>
  `
})
export class DashboardComponent {
  orders: Order[] = [];

  ngOnInit() {
    interval(1000)
      .pipe(
        switchMap(() => this.orderService.getOrders()),
        // 데이터가 실제로 변경된 경우에만 방출
        distinctUntilChanged((prev, curr) =>
          JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe(orders => {
        // OnPush를 위해 새 배열 참조 생성
        this.orders = [...orders];
      });
  }

  trackByOrderId(index: number, order: Order): number {
    return order.id;
  }
}

@Component({
  selector: 'app-order-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      {{ order.id }} - {{ order.status }}
    </div>
  `
})
export class OrderCardComponent {
  @Input() order!: Order;
}
```

**결과**: 10배 빠름! 변경 감지는 데이터가 실제로 변경될 때만 실행되며, 필요한 컴포넌트만 확인합니다.

### ChangeDetectorRef 사용

수동 제어를 위해:

```typescript
import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-manual-cd',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>{{ count }}</div>`
})
export class ManualCDComponent {
  count = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  increment() {
    this.count++;

    // 옵션 1: 이 뷰와 조상을 dirty로 표시
    this.cdr.markForCheck();

    // 옵션 2: 즉시 CD 실행 (동기)
    this.cdr.detectChanges();

    // 옵션 3: CD에서 분리 (수동 모드)
    this.cdr.detach();
    // 나중에: this.cdr.reattach();
  }
}
```

## 실제 예제: 최적화된 실시간 대시보드

`code-examples/02-change-detection/`에서 완전한 코드 확인:

```typescript
// 최적화된 CD를 사용한 실시간 대시보드
@Component({
  selector: 'app-optimized-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Orders: {{ (orders$ | async)?.length }}</h2>
    <app-order-list [orders]="orders$ | async"></app-order-list>
  `
})
export class OptimizedDashboardComponent {
  orders$ = interval(1000).pipe(
    switchMap(() => this.orderService.getOrders()),
    shareReplay(1)
  );
}
```

`async` pipe 사용:
- ✅ 자동으로 구독/구독 해제
- ✅ 새 값에 대해 `markForCheck()` 호출
- ✅ OnPush와 완벽하게 작동

## 핵심 요점

1. **변경 감지는 트리 순회입니다** - Angular는 컴포넌트를 위에서 아래로 확인합니다

2. **Zone.js가 CD를 트리거합니다** - 비동기 작업이 자동으로 변경 감지를 트리거합니다

3. **OnPush는 당신의 친구입니다** - 최소한의 노력으로 엄청난 성능 향상

4. **불변성이 중요합니다** - OnPush는 새로운 객체 참조가 필요합니다

5. **Async Pipe를 사용하세요** - 구독과 CD를 자동으로 처리합니다

6. **수동 제어 가능** - 고급 경우를 위한 ChangeDetectorRef

## 다음 챕터

변경 감지를 이해하면 Alex의 성능 문제가 해결되었습니다. 하지만 새로운 질문이 생겼습니다:

- *생명주기 훅은 정확히 언제 실행될까?*
- *OnInit과 AfterViewInit의 차이는 무엇일까?*
- *언제 데이터를 로드해야 할까?*

다음: [3장: 생명주기 연대기](03-component-lifecycle.md)

## 추가 읽을거리

- 소스: `packages/core/src/change_detection/`
- 소스: `packages/core/src/render3/instructions/change_detection.ts`
- Zone.js: `packages/zone.js/`
- 문서: https://angular.dev/guide/change-detection

## Alex의 일지에서

*"충격적이다. 변경 감지는 마법이 아니다 - Zone.js와 함께하는 트리 순회일 뿐이다! OnPush 전략이 이제 완전히 이해된다. 왜 전에 사용하지 않았을까.*

*핵심: 불변성 + OnPush = 빠른 앱. 간단하다.*

*다음: 생명주기 훅을 알아내자. ngOnInit은 정확히 언제 실행되고 ngAfterViewInit과 비교했을 때 언제일까?"*
