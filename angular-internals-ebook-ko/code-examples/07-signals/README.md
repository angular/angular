# Angular Signals 예제 프로젝트

Angular 18+ 에서 소개된 **Signals** API의 완전한 예제 프로젝트입니다.

## 📚 개요

Signals는 Angular의 새로운 반응형 상태 관리 API입니다. RxJS와는 다르게 더 간단하고 직관적인 API를 제공하면서도 강력한 반응성을 구현합니다.

### 주요 특징

- **세분화된 반응성 (Fine-grained Reactivity)**: 변경된 signal에만 반응합니다
- **자동 의존성 추적 (Automatic Dependency Tracking)**: computed와 effect가 자동으로 의존성을 추적합니다
- **선택적 업데이트 (Selective Updates)**: 참조가 아닌 값의 변경만 감지합니다
- **RxJS 상호운용성 (RxJS Interop)**: Signal과 Observable을 자유롭게 변환할 수 있습니다

## 🏗️ 프로젝트 구조

```
07-signals/
├── src/
│   ├── index.html                          # 메인 HTML
│   ├── main.ts                             # 애플리케이션 진입점
│   ├── styles.css                          # 전역 스타일
│   └── app/
│       ├── app.component.ts                # 루트 컴포넌트
│       ├── counter.component.ts            # 기본 Signal 예제
│       ├── computed-example.component.ts   # Computed Signal 예제
│       └── effects-example.component.ts    # Effect 예제
├── package.json                            # 프로젝트 의존성
├── tsconfig.json                           # TypeScript 설정
├── tsconfig.app.json                       # 애플리케이션 TypeScript 설정
├── angular.json                            # Angular CLI 설정
├── .gitignore                              # Git 무시 파일
├── .nvmrc                                  # Node 버전 지정
└── README.md                               # 이 파일
```

## 🚀 설치 및 실행

### 필수 조건

- Node.js 22.x 이상 (`.nvmrc` 파일 참조)
- npm 10.x 이상

### 설치

```bash
cd 07-signals
npm install
```

### 개발 서버 실행

```bash
npm start
```

브라우저에서 `http://localhost:4200` 으로 이동합니다.

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist/angular-signals-examples` 디렉토리에 생성됩니다.

## 📖 예제 상세 설명

### 1. 기본 Signal (Counter Component)

**파일**: `src/app/counter.component.ts`

Signal의 가장 기본적인 사용법을 보여줍니다.

```typescript
import { signal } from '@angular/core';

// Signal 생성
count = signal(0);

// 값 읽기
console.log(this.count()); // 0

// 값 설정
this.count.set(5);

// 값 업데이트
this.count.update(current => current + 1);
```

**주요 API**:
- `signal(initialValue)`: Signal 생성
- `signal.set(newValue)`: 값 직접 설정
- `signal.update(fn)`: 현재 값을 기반으로 업데이트
- `signal()`: 템플릿에서 값 읽기 (함수 호출)

**사용 사례**:
- 사용자 입력 처리
- 컴포넌트 상태 관리
- UI 상태 추적

### 2. Computed Signals (Computed Example Component)

**파일**: `src/app/computed-example.component.ts`

다른 signal의 값에 기반하여 자동으로 계산되는 읽기 전용 signal입니다.

```typescript
import { signal, computed } from '@angular/core';

// 기본 signals
count = signal(0);
multiplier = signal(2);

// Computed signal
doubled = computed(() => this.count() * this.multiplier());
```

**주요 특징**:
- **자동 메모이제이션**: 의존 signal이 변경되지 않으면 캐시된 값 반환
- **읽기 전용**: `set()` 또는 `update()` 메서드 없음
- **자동 의존성 추적**: computed 함수 내에서 읽는 signal 자동 추적
- **체이닝**: computed signal은 다른 computed signal에 의존할 수 있음

**사용 사례**:
- 파생 상태 계산
- 필터링된 목록 생성
- 통계 계산
- 형식화된 값 생성

**장점**:
```typescript
// computed 없이
get totalPrice() {
  // 매번 호출될 때마다 계산됨
  return this.items().reduce((sum, item) => sum + item.price, 0);
}

// computed 사용
totalPrice = computed(() =>
  this.items().reduce((sum, item) => sum + item.price, 0)
);
// 의존 signal이 변경될 때만 계산됨
```

### 3. Effects (Effects Example Component)

**파일**: `src/app/effects-example.component.ts`

Signal 변경에 반응하여 부수 효과를 수행합니다.

```typescript
import { signal, effect } from '@angular/core';

count = signal(0);

constructor() {
  // Effect 정의
  effect(() => {
    const current = this.count();
    console.log(`Count changed to ${current}`);
    // API 호출, 로깅, DOM 조작 등
  });
}
```

**주요 특징**:
- **자동 실행**: 컴포넌트 생성 시 한 번, 의존 signal 변경 시마다 실행
- **자동 의존성 추적**: effect 함수 내에서 읽는 signal 자동 추적
- **부수 효과**: API 호출, 로깅, DOM 조작 등
- **자동 정리**: 컴포넌트 제거 시 자동으로 정리

**Effect의 생명주기**:
```typescript
effect(() => {
  // 이 부분은:
  // 1. 컴포넌트 생성 시 즉시 실행
  // 2. 의존 signal이 변경될 때마다 실행
  // 3. 컴포넌트 제거 시 정리됨
});
```

**일회성 Effect**:
```typescript
effect(() => {
  // 이 코드는 한 번만 실행됨
}, { once: true });
```

**사용 사례**:
- 변경 감지 및 로깅
- 외부 API 호출
- 로컬 스토리지 동기화
- 분석 이벤트 추적
- 조건부 유효성 검사

### 4. RxJS 상호운용성

Signal과 Observable을 자유롭게 변환할 수 있습니다.

```typescript
import { signal, toObservable, toSignal } from '@angular/core';

// Signal을 Observable로 변환
signal$ = toObservable(this.count);

// Observable을 Signal로 변환
data = toSignal(this.http.get('/api/data'));

// Signal의 특정 속성을 Observable로
count$ = toObservable(this.count);
```

**변환 API**:
- `toObservable(signal)`: Signal을 Observable로 변환
- `toSignal(observable)`: Observable을 Signal로 변환

**사용 시나리오**:
```typescript
// RxJS 연산자와 함께 사용
searchResults = toSignal(
  this.searchInput$.pipe(
    debounceTime(300),
    switchMap(query => this.http.get(`/api/search?q=${query}`))
  )
);
```

## 🎯 Signal vs Observable vs RxJS Subjects

| 특성 | Signal | Observable | Subject |
|------|--------|-----------|---------|
| 현재 값 추적 | ✅ 예 | ❌ 아니오 | ⚠️ 구독 후부터 |
| 동기식 | ✅ 예 | ❌ 아니오 | ⚠️ 변함 |
| 변경 감지 | ✅ 세분화됨 | ⚠️ 스트림 | ⚠️ 스트림 |
| 메모리 효율 | ✅ 높음 | ⚠️ 보통 | ⚠️ 보통 |
| 학습곡선 | ✅ 낮음 | ⚠️ 높음 | ⚠️ 높음 |

## 💡 모범 사례

### 1. 적절한 도구 선택

```typescript
// Signal 사용 - 동기식 상태
userName = signal('');

// Observable 사용 - 비동기 스트림
data$ = this.http.get('/api/data');

// Effect 사용 - 상태 변경 감지
effect(() => {
  console.log(`User name changed to: ${this.userName()}`);
});
```

### 2. 과도한 effect 피하기

```typescript
// ❌ 나쁜 예: 계산할 수 있는 것을 effect로 처리
count = signal(0);
doubled: number = 0;

constructor() {
  effect(() => {
    this.doubled = this.count() * 2;
  });
}

// ✅ 좋은 예: computed 사용
doubled = computed(() => this.count() * 2);
```

### 3. 메모리 누수 방지

```typescript
// ✅ 좋은 예: ngOnDestroy에서 구독 정리
private subscription: Subscription | null = null;

constructor() {
  const nameObservable = toObservable(this.name);
  this.subscription = nameObservable.subscribe(...);
}

ngOnDestroy() {
  if (this.subscription) {
    this.subscription.unsubscribe();
  }
}
```

### 4. Signal 동결 (Readonly)

```typescript
// 실수로 수정하지 않도록 방지
count = signal(0);

// 컴포넌트 외부에서 접근할 때는 getter 사용
getCount() {
  return this.count.asReadonly();
}
```

## 📝 추가 리소스

- [Angular 공식 문서 - Signals](https://angular.io/guide/signals)
- [Angular RFC - Signals](https://github.com/angular/angular/discussions/49090)
- [Angular Blog - Introducing Angular Signals](https://blog.angular.io/signals-changes-coming-to-angular-17-91674cdc0d6b)

## 🔧 문제 해결

### Signal이 업데이트되지 않는 경우

```typescript
// ❌ 객체를 직접 수정 - 참조가 변경되지 않음
user = signal({ name: 'John', age: 30 });
const u = this.user();
u.name = 'Jane'; // 감지되지 않음

// ✅ 새 객체로 대체
this.user.set({ ...this.user(), name: 'Jane' });
// 또는
this.user.update(u => ({ ...u, name: 'Jane' }));
```

### Computed가 자주 재계산되는 경우

```typescript
// ✅ 불필요한 signal 읽기 제거
// 함수 내부에서만 읽어야 함
calculation = computed(() => {
  return this.value() + this.multiplier();
  // this.otherValue() 를 읽으면 그것도 의존성이 됨
});
```

## 📄 라이선스

MIT

## 🤝 기여

이 예제 프로젝트에 대한 피드백이나 개선 사항은 환영합니다.

---

**마지막 업데이트**: 2024년 11월
**Angular 버전**: 18.x
**Node 버전**: 22.x
