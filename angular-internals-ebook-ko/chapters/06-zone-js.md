# 6장: Zone.js와 비동기 세계

> *"Angular는 어떻게 비동기 작업을 추적할까?"*

## Zone.js가 하는 일

Zone.js는 모든 비동기 API를 **패치**하여 실행 컨텍스트를 추적합니다:

```typescript
// Zone.js 전
setTimeout(() => console.log('타이머'), 1000);

// Zone.js 후 (보이지 않는 패칭)
setTimeout(() => {
  zone.run(() => {
    console.log('타이머');
    triggerChangeDetection(); // ← 자동!
  });
}, 1000);
```

## NgZone API

```typescript
constructor(private ngZone: NgZone) {}

// zone 내부 실행 → CD 트리거
runInside() {
  this.ngZone.run(() => {
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
```

**다음**: [7장: Signals](07-signals.md)
