# 2장: 변경 감지의 수수께끼

> *"버튼을 클릭했는데 UI가 업데이트되지 않아!"*

## 핵심 개념

Angular의 변경 감지는 **트리 순회 알고리즘**입니다. Zone.js가 비동기 작업을 추적하고 변경 감지를 자동으로 트리거합니다.

### 변경 감지 트리

```
AppComponent (Default)
  ├── DashboardComponent (OnPush)
  │   └── OrderCardComponent (OnPush)
  └── SidebarComponent (Default)
```

### 두 가지 전략

**Default (CheckAlways)**
- 모든 비동기 이벤트에서 확인
- 모든 바인딩 체크
- 느림

**OnPush (CheckOnce)**
- @Input() 변경 시에만
- 이벤트 핸들러 실행 시
- Async pipe 값 방출 시
- 수동 markForCheck() 호출 시
- 90% 더 빠름!

### Zone.js의 역할

```typescript
// Zone.js가 패치하는 것:
- setTimeout / setInterval
- Promise
- XMLHttpRequest / fetch
- addEventListener
- requestAnimationFrame
```

### 최적화 패턴

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Async pipe는 자동으로 markForCheck() 호출 -->
    <div>{{ orders$ | async }}</div>
  `
})
export class OptimizedComponent {
  orders$ = this.orderService.getOrders();

  // runOutsideAngular로 성능 향상
  constructor(private ngZone: NgZone) {
    ngZone.runOutsideAngular(() => {
      // 무거운 애니메이션 - CD 트리거 안 함
      requestAnimationFrame(() => {
        // 렌더링 로직
      });
    });
  }
}
```

## 핵심 요점

1. OnPush + Immutability = 빠른 앱
2. Async pipe 사용
3. 무거운 작업은 runOutsideAngular로
4. 불변 객체 패턴 사용

**다음**: [3장: 생명주기 연대기](03-component-lifecycle.md)
