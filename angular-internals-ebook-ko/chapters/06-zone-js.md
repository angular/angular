# 6장: Zone.js와 비동기 세계

> *"Angular는 어떻게 비동기 작업을 추적할까?"*

## Zone.js가 하는 일

Zone.js는 모든 비동기 API를 **패치**하여 실행 컨텍스트를 추적합니다:

```typescript
// Zone.js 전
setTimeout(() => {
  console.log('Timer fired');
}, 1000);

// Zone.js 후 (보이지 않는 패칭)
setTimeout(() => {
  // Zone.js가 이 콜백을 래핑
  zone.run(() => {
    console.log('Timer fired');
    triggerChangeDetection(); // ← 자동!
  });
}, 1000);
```

## 패치된 API

- `setTimeout` / `setInterval`
- `Promise`
- `XMLHttpRequest` / `fetch`
- `EventTarget.addEventListener`
- `MutationObserver`
- `requestAnimationFrame`

## NgZone API

```typescript
import { Component, NgZone } from '@angular/core';

@Component({...})
export class MyComponent {
  constructor(private ngZone: NgZone) {}

  // zone 내부 실행 → CD 트리거
  runInside() {
    this.ngZone.run(() => {
      // 무거운 작업
      this.data = newData;
    }); // ← CD 트리거됨
  }

  // zone 외부 실행 → CD 없음
  runOutside() {
    this.ngZone.runOutsideAngular(() => {
      // 무거운 애니메이션 루프
      requestAnimationFrame(() => {
        // CD 트리거 안 함!
      });
    });
  }
}
```

## Zone을 벗어나야 할 때

- 무거운 애니메이션
- 타사 라이브러리
- CD가 필요 없는 폴링/타이머
- WebSocket 스트림

**[7장: Signals로 계속 →](07-signals.md)**
