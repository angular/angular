# 4장 코드 예제: 렌더링 엔진

이 예제는 Angular의 렌더링 엔진 내부 구조를 보여줍니다.

## 포함 내용

### 1. 렌더링 엔진 기본 개념 (`app.component.ts`)
렌더링 엔진의 핵심 개념과 LView 구조를 시연합니다:
- **LView (Logical View)**: 컴포넌트의 내부 상태와 DOM을 연결하는 구조
- **변경 감지**: 데이터 변경 시 필요한 부분만 업데이트
- **성능 모니터링**: 렌더링 시간 측정 및 분석

#### LView 구조
```
LView = [
  // [0] 컴포넌트 데이터 (context)
  { message: 'Hello', count: 0 },

  // [1] 부모 LView 참조
  parentLView,

  // [2] 다음 LView 참조
  nextLView,

  // [3] TView (Template View - 정적 정보)
  tView,

  // [4+] 바인딩된 데이터
  "바인딩된 값 1",
  "바인딩된 값 2",

  // 마지막: DOM 요소에 대한 참조
  inputElement
]
```

### 2. 리스트 렌더링 최적화 (`list-rendering.component.ts`)
효율적인 리스트 렌더링을 보여줍니다:
- **trackBy 함수**: 각 항목의 고유 식별자를 지정하여 성능 향상
- **성능 비교**: trackBy 사용 여부에 따른 렌더링 횟수 비교
- **LView 재사용**: trackBy를 통한 DOM 재사용

#### trackBy의 중요성
```typescript
// trackBy 없음 (비효율적)
<li *ngFor="let item of items">{{ item.name }}</li>

// trackBy 있음 (효율적)
<li *ngFor="let item of items; trackBy: trackByFn">
  {{ item.name }}
</li>

trackByFn(index: number, item: Item): any {
  return item.id;  // 항목의 고유 식별자 반환
}
```

**성능 차이:**
- trackBy 없음: 리스트 변경 시 모든 항목의 DOM이 재생성
- trackBy 있음: 변경된 항목만 업데이트, 순서 변경 시에만 DOM 재정렬

### 3. 조건부 렌더링 (`conditional-rendering.component.ts`)
Angular 18+의 새로운 제어 흐름을 시연합니다:
- **@if / @else**: 명확한 조건부 렌더링
- **@switch / @case**: 다중 조건 처리
- **@for**: 효율적인 리스트 렌더링
- **@empty**: 빈 리스트 상태 처리

#### 새로운 문법의 장점
```typescript
// 이전: *ngIf (구조적 지시자)
<div *ngIf="isLoading">로딩 중...</div>

// 새로운: @if (제어 흐름)
@if (isLoading) {
  <div>로딩 중...</div>
}
```

**이점:**
- 더 명확한 문법
- 자동 else-if 지원
- 템플릿 타입 체크 개선
- LView 생성 최소화

## 주요 파일 구조

```
04-rendering/
├── src/
│   ├── app/
│   │   ├── app.component.ts              # 렌더링 엔진 개요
│   │   ├── list-rendering.component.ts   # 리스트 렌더링 최적화
│   │   └── conditional-rendering.component.ts  # @if/@for/@switch
│   │
│   ├── index.html                        # 진입점 HTML
│   ├── main.ts                           # 부트스트랩
│   └── styles.css                        # 전역 스타일
│
├── package.json                          # 의존성
├── angular.json                          # Angular 설정
├── tsconfig.json                         # TypeScript 설정
└── README.md                             # 이 파일
```

## 렌더링 엔진의 내부 구조

### 1. Renderer2 vs Renderer Engine
```typescript
// 구형: Renderer2 (추상화 레이어)
constructor(private renderer: Renderer2, private el: ElementRef) {}
this.renderer.createElement('div');

// 신형: 직접 DOM 조작 (더 빠름)
// Angular 컴파일러가 자동으로 최적화된 코드 생성
```

### 2. 변경 감지 전략
```typescript
// 기본: Default 변경 감지
@Component({
  changeDetection: ChangeDetectionStrategy.Default
})
// 모든 바인딩을 매번 확인

// 최적: OnPush 전략
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
// 입력값 변경 시에만 확인
```

### 3. Zone.js와 렌더링
```typescript
// Zone.js는 비동기 작업을 감지하고 변경 감지를 트리거합니다
// 모든 이벤트, setTimeout, Promise 등이 감시됩니다

// 성능 최적화: Zone 밖에서 작업
constructor(private ngZone: NgZone) {}

this.ngZone.runOutsideAngular(() => {
  // 이 코드는 변경 감지를 트리거하지 않음
  setInterval(() => {
    // 성능 민감한 작업
  }, 100);
});
```

## 예제 실행

```bash
cd 04-rendering
npm install
npm start
```

http://localhost:4200 열기

## 주요 학습 개념

### 1. LView와 TView의 차이
- **LView**: 동적 데이터, 컴포넌트 인스턴스별로 생성
- **TView**: 정적 템플릿 정보, 컴포넌트 타입당 하나만 생성

### 2. 렌더링 성능 최적화 팁
```typescript
// ✓ 좋은 예: trackBy 사용
<div *ngFor="let item of items; trackBy: trackById">
  {{ item.name }}
</div>

// ✓ 좋은 예: OnPush 전략
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// ✓ 좋은 예: @if로 필요한 부분만 렌더링
@if (showDetail) {
  <app-detail></app-detail>
}

// ✗ 나쁜 예: trackBy 없이 리스트 렌더링
<div *ngFor="let item of items">
  {{ item.name }}
</div>

// ✗ 나쁜 예: 모든 데이터에 대해 변경 감지
@Component({
  changeDetection: ChangeDetectionStrategy.Default
})

// ✗ 나쁜 예: 필요 없는 항목도 렌더링
<div *ngIf="!showDetail">
  <div *ngFor="let item of largeList">
    {{ item.name }}
  </div>
</div>
```

### 3. 렌더링 엔진 디버깅
```typescript
// Angular DevTools 사용
// 1. Chrome DevTools 열기
// 2. 'Angular' 탭 선택
// 3. Components 트리에서 LView 구조 확인

// console에서 확인
ng.probe(document.querySelector('app-root')).componentInstance;
```

## 연습 문제

1. **trackBy 성능 비교**
   - trackBy 없이 1000개 항목을 렌더링하고 시간 측정
   - trackBy를 추가하고 시간 측정
   - 차이를 분석하고 결론 작성

2. **OnPush 최적화**
   - list-rendering 컴포넌트에 `ChangeDetectionStrategy.OnPush` 적용
   - 렌더링 횟수 변화 관찰
   - 성능 개선 분석

3. **커스텀 trackBy**
   - 항목의 id 대신 다른 필드를 trackBy로 사용해보기
   - 영향 분석

4. **@if로 마이그레이션**
   - 조건부 렌더링 컴포넌트의 *ngIf를 @if로 변환
   - 성능 차이 측정

5. **복잡한 렌더링 최적화**
   - 중첩된 리스트에서 trackBy 구현
   - 각 레벨에서 trackBy 함수 작성

## 학습 목표

이 예제를 완료한 후, 다음을 이해해야 합니다:

- ✅ LView 구조와 DOM의 관계
- ✅ 렌더링 엔진의 변경 감지 메커니즘
- ✅ trackBy를 사용한 리스트 성능 최적화
- ✅ @if, @for, @switch를 활용한 효율적인 조건부 렌더링
- ✅ ChangeDetectionStrategy.OnPush의 성능상 이점
- ✅ 렌더링 성능을 측정하고 최적화하는 방법

## 소스 코드 참조

Angular 소스 코드에서 렌더링 엔진 관련 파일:

- `packages/core/src/render3/view_engine_compatibility.ts` - LView 정의
- `packages/core/src/render3/instructions/element.ts` - 엘리먼트 렌더링
- `packages/core/src/render3/instructions/text.ts` - 텍스트 렌더링
- `packages/core/src/render3/instructions/property.ts` - 프로퍼티 바인딩
- `packages/core/src/render3/renderer.ts` - 렌더 엔진
- `packages/core/src/render3/component.ts` - 컴포넌트 렌더링
- `packages/core/src/render3/node_manipulation.ts` - DOM 조작
- `packages/core/src/core_render3_private_export.ts` - 내부 API
- `packages/core/src/change_detection/differs/default_iterable_differ.ts` - 리스트 diff

## 관련 Angular 함수와 클래스

```typescript
// 신호 (Signals) - Angular 14+
import { signal, computed, effect } from '@angular/core';

// 변경 감지 전략
import { ChangeDetectionStrategy } from '@angular/core';

// 렌더링 제어
import { NgIf, NgFor, NgSwitch, CommonModule } from '@angular/common';

// 새로운 제어 흐름 (Angular 17+)
// @if, @else, @switch, @case, @for, @empty
```

## 성능 최적화 체크리스트

- [ ] 큰 리스트에 trackBy 함수 적용
- [ ] OnPush 변경 감지 전략 사용
- [ ] ng-container로 불필요한 DOM 노드 제거
- [ ] lazy loading으로 필요한 부분만 로드
- [ ] 복잡한 계산은 computed()로 메모이제이션
- [ ] Zone.js 제외 작업 (runOutsideAngular)
- [ ] 불필요한 구독은 unsubscribe

## 다음 단계

[5장: 컴파일러](../05-compiler/README.md)로 계속하세요
