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

## 알고리즘

```typescript
// packages/core/primitives/signals/src/에서 단순화

interface ReactiveNode {
  version: number;           // 현재 버전
  producers: ReactiveNode[]; // 의존성
  consumers: ReactiveNode[]; // 의존하는 것들
  value: any;               // 캐시된 값
  dirty: boolean;           // 재계산 필요
}

function readSignal(node: ReactiveNode): any {
  // 현재 consumer의 의존성으로 추적
  if (activeConsumer) {
    node.consumers.push(activeConsumer);
    activeConsumer.producers.push(node);
  }

  return node.value;
}

function writeSignal(node: ReactiveNode, newValue: any): void {
  if (node.value === newValue) return; // 변경 없음

  node.value = newValue;
  node.version++;

  // 모든 consumer를 dirty로 표시
  for (const consumer of node.consumers) {
    markDirty(consumer);
  }
}

function computedSignal(fn: () => any): ReactiveNode {
  const node: ReactiveNode = {
    version: 0,
    producers: [],
    consumers: [],
    value: undefined,
    dirty: true
  };

  node.get = () => {
    if (node.dirty) {
      // 재계산
      const prevConsumer = activeConsumer;
      activeConsumer = node;

      node.value = fn(); // ← 의존성을 자동으로 추적!

      activeConsumer = prevConsumer;
      node.dirty = false;
    }

    return readSignal(node);
  };

  return node;
}
```

## Signals vs RxJS

| 기능 | Signals | RxJS |
|------|---------|------|
| 동기/비동기 | 동기 | 비동기 |
| 구독 | 자동 | 수동 subscribe/unsubscribe |
| 메모리 | 최소 | unsubscribe 안 하면 누수 |
| 학습 곡선 | 간단 | 복잡 |
| 사용 사례 | 로컬 상태 | 비동기 작업, 이벤트 |

## 모범 사례

```typescript
// ✅ 로컬 상태에 signals 사용
class MyComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  increment() {
    this.count.update(n => n + 1);
  }
}

// ✅ 비동기 작업에 RxJS 사용
class DataComponent {
  private dataSignal = signal<Data[]>([]);
  data = this.dataSignal.asReadonly();

  constructor(http: HttpClient) {
    http.get<Data[]>('/api/data').subscribe(data => {
      this.dataSignal.set(data);
    });
  }
}

// ✅ 둘 다 결합
class SmartComponent {
  filter = signal('all');

  private data$ = this.http.get<Data[]>('/api/data');

  filteredData = toSignal(
    this.data$.pipe(
      map(data => data.filter(d => this.applyFilter(d, this.filter())))
    )
  );
}
```

**[8장: 라우터 내부로 계속 →](08-router.md)**
