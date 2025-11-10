# 7장: Signals - 새로운 반응성

> *"모든 것에 RxJS보다 더 나은 방법이 있을까?"*

## 반응형 그래프

Signals는 **의존성 그래프**를 자동으로 생성합니다:

```typescript
import { signal, computed, effect } from '@angular/core';

// signals 생성
const count = signal(0);
const multiplier = signal(2);

// computed signal (자동 의존성 추적)
const doubled = computed(() => count() * multiplier());

// effect (의존성 변경 시 실행)
effect(() => {
  console.log(`Count: ${count()}, Doubled: ${doubled()}`);
});

// signals 업데이트
count.set(5);        // 출력: "Count: 5, Doubled: 10"
multiplier.set(3);   // 출력: "Count: 5, Doubled: 15"
```

## Signals vs RxJS

| 기능 | Signals | RxJS |
|------|---------|------|
| 동기/비동기 | 동기 | 비동기 |
| 구독 | 자동 | 수동 subscribe/unsubscribe |
| 메모리 | 최소 | unsubscribe 안 하면 누수 |
| 학습 곡선 | 간단 | 복잡 |
| 사용 사례 | 로컬 상태 | 비동기 작업, 이벤트 |

**다음**: [8장: 라우터 내부](08-router.md)
