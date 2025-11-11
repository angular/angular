# 2장 코드 예제: 변경 감지 (Change Detection)

이 예제는 Angular의 변경 감지 시스템 내부 구조를 보여줍니다.

## 포함 내용

### 1. 변경 감지 전략 비교 (`onpush.component.ts`, `default.component.ts`)

두 가지 주요 변경 감지 전략을 시연합니다:

- **Default 전략**: 모든 비동기 이벤트 후 변경 감지 실행
  - 타이머, Promise, 이벤트 리스너 등 모든 비동기 작업 후 실행
  - 더 빈번한 변경 감지 (성능 오버헤드)
  - 개발자가 신경 쓸 필요 없음 (자동 관리)

- **OnPush 전략**: 특정 조건에서만 변경 감지 실행
  - @Input 속성 변경 시
  - 컴포넌트 이벤트 리스너 트리거 시
  - 옵저버블이 값을 emit할 때
  - 성능 최적화 (변경 감지 사이클 감소)

### 2. 수동 변경 감지 제어 (`app.component.ts`)

ChangeDetectorRef를 사용한 수동 제어 방법:

- `detectChanges()`: 즉시 변경 감지 실행
- `markForCheck()`: 다음 변경 감지 사이클에 포함
- `detach()`: 자동 변경 감지 비활성화
- `reattach()`: 자동 변경 감지 재활성화

### 3. Zone.js 통합 (`app.component.ts`)

NgZone을 사용한 Angular 영역(Zone) 관리:

- `ngZone.run()`: Angular 영역에서 코드 실행 (변경 감지 트리거)
- `ngZone.runOutsideAngular()`: Angular 영역 외에서 코드 실행 (성능 최적화)

성능이 중요한 작업(마우스 추적, 애니메이션 등)을 Zone 외부에서 실행하여
불필요한 변경 감지를 피할 수 있습니다.

## 주요 파일

```
02-change-detection/
├── src/
│   ├── app/
│   │   ├── app.component.ts          # 메인 컴포넌트 (종합 시연)
│   │   ├── onpush.component.ts       # OnPush 전략 예제
│   │   ├── default.component.ts      # Default 전략 예제
│   │   │
│   │   └── (다른 컴포넌트들...)
│   │
│   ├── main.ts                       # 애플리케이션 부트스트랩
│   ├── index.html                    # HTML 진입점
│   └── styles.css                    # 전역 스타일
│
├── package.json                      # 프로젝트 의존성
├── tsconfig.json                     # TypeScript 설정
├── angular.json                      # Angular CLI 설정
└── README.md                         # 이 파일
```

## 예제 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start

# 프로덕션 빌드
npm build
```

http://localhost:4200 열기

## 주요 개념

### 변경 감지란?

Angular는 컴포넌트의 상태가 변경되었을 때 템플릿을 자동으로 업데이트합니다.
이를 위해 **변경 감지(Change Detection)**라는 메커니즘을 사용합니다.

### 변경 감지 프로세스

1. **이벤트 감지**: Zone.js가 모든 비동기 이벤트 감시
2. **변경 감지 트리거**: Angular 영역 내 코드 완료 후 변경 감지 시작
3. **템플릿 업데이트**: 바뀐 값을 템플릿에 반영

### Zone.js의 역할

Angular는 내부적으로 **Zone.js**를 사용하여 비동기 작업을 추적합니다:

- 모든 비동기 API(setTimeout, Promise, 이벤트 등)를 감시
- Angular 영역 내에서 작업이 완료되면 변경 감지 트리거
- 영역 진입/퇴출으로 성능 최적화 가능

```typescript
// Angular 영역 내 (변경 감지 트리거)
this.ngZone.run(() => {
  // 이 코드는 변경 감지를 트리거함
});

// Angular 영역 외 (변경 감지 안 함)
this.ngZone.runOutsideAngular(() => {
  // 이 코드는 변경 감지를 트리거하지 않음 (성능 우수)
});
```

### OnPush vs Default 선택 기준

**Default를 사용하세요:**
- 대부분의 경우 (권장)
- 예측 불가능한 업데이트
- 개발 속도가 중요할 때

**OnPush를 사용하세요:**
- 성능이 매우 중요할 때
- 불변성을 엄격히 따를 수 있을 때
- 입력 기반 컴포넌트 (프리젠테이셔널 컴포넌트)

## 실습 문제

### 1. 기본 비교
- 양쪽 컴포넌트에서 버튼을 클릭하고 변경 감지 횟수를 확인
- 입력값을 변경하면 어떻게 되는지 관찰

### 2. Zone 테스트
- "Angular Zone에서 실행" 버튼 클릭 후 콘솔 로그 확인
- "Angular Zone 밖에서 실행" 버튼 클릭 후 차이점 비교

### 3. 수동 제어
- `detach()`와 `reattach()` 버튼으로 자동 감지 토글
- 각 메서드의 동작 차이 관찰

### 4. 성능 측정 (선택사항)
- Chrome DevTools의 Performance 탭에서 변경 감지 추적
- 프로파일링 도구로 성능 차이 측정
- 실제 프로젝트에 OnPush 적용하고 성능 개선 확인

## 학습 목표

이 예제를 실행한 후, 다음을 이해해야 합니다:

- ✅ Default와 OnPush 변경 감지 전략의 차이점
- ✅ Zone.js가 비동기 작업을 감시하고 Angular 영역을 관리하는 방법
- ✅ ChangeDetectorRef를 사용한 수동 변경 감지 제어
- ✅ NgZone으로 성능 최적화하는 방법
- ✅ 각 전략의 장단점과 선택 기준
- ✅ 실제 프로젝트에서의 최적화 전략

## 주요 파일 위치

Angular 소스 코드에서 관련 구현:

- `packages/core/src/change_detection/change_detector_ref.ts` - ChangeDetectorRef 인터페이스
- `packages/core/src/zone/ng_zone.ts` - NgZone 구현
- `packages/core/src/render3/view/view.ts` - 컴포넌트 뷰와 변경 감지 루프
- `packages/core/src/change_detection/constants.ts` - ChangeDetectionStrategy 정의
- `packages/core/src/change_detection/differs/` - 변경 감지 알고리즘

## 다음 단계

[3장: 템플릿](../03-templates/README.md)로 계속하세요

## 참고 자료

### Angular 공식 문서
- [Change Detection Strategy](https://angular.io/guide/change-detection)
- [ChangeDetectorRef API](https://angular.io/api/core/ChangeDetectorRef)
- [NgZone API](https://angular.io/api/core/NgZone)
- [Zone.js](https://github.com/angular/zone.js)

### 권장 학습 순서
1. 변경 감지 전략의 개념 이해
2. 실제 예제에서 OnPush vs Default 비교
3. Zone.js와의 상호작용 학습
4. 성능 프로파일링과 최적화
5. 실제 프로젝트에 적용

## 주의사항

### OnPush 사용 시 주의점

OnPush 전략을 사용할 때는 **불변성(Immutability)** 원칙을 엄격히 따르세요:

```typescript
// ❌ 잘못된 방법 (작동 안 함)
this.list.push(newItem); // 객체의 참조가 안 바뀜

// ✅ 올바른 방법 (OnPush와 호환)
this.list = [...this.list, newItem]; // 새 배열 생성
```

### 성능 최적화 팁

1. **측정 먼저**: 성능 문제를 확인한 후 최적화
2. **도구 사용**: Chrome DevTools, Angular DevTools로 분석
3. **프로파일링**: 변경 감지 시간 측정
4. **점진적 적용**: OnPush를 모든 컴포넌트에 무작정 적용하지 마세요

## 문제 해결

### "OnPush를 사용했는데 업데이트가 안 됨"
- @Input으로 전달된 객체의 참조가 바뀌었는지 확인
- ChangeDetectorRef.markForCheck()를 수동으로 호출
- 옵저버블 구독 시 async 파이프 사용

### "변경 감지가 너무 자주 발생"
- 불필요한 바인딩 제거
- OnPush 전략 적용 검토
- Zone.js runOutsideAngular() 활용

---

**마지막 업데이트**: 2025년 11월
**Angular 버전**: 18+
**Node 버전**: 18+
