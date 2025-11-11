# Angular 컴포넌트 라이프사이클 (Component Lifecycle) 예제

Angular 컴포넌트의 생명주기와 8가지 라이프사이클 훅을 학습하고 실습하기 위한 프로젝트입니다.

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [설치 및 실행](#설치-및-실행)
- [파일 구조](#파일-구조)
- [라이프사이클 훅 설명](#라이프사이클-훅-설명)
- [컴포넌트 설명](#컴포넌트-설명)
- [주요 개념](#주요-개념)
- [실행 순서](#실행-순서)

## 프로젝트 개요

이 프로젝트는 Angular 18에서 모든 8가지 컴포넌트 라이프사이클 훅을 시연합니다:

1. **ngOnChanges** - @Input 속성 변경 시
2. **ngOnInit** - 컴포넌트 초기화 시
3. **ngDoCheck** - 변경 감지 실행 시
4. **ngAfterContentInit** - 프로젝션된 콘텐츠 초기화 완료 시
5. **ngAfterContentChecked** - 프로젝션된 콘텐츠 검사 후
6. **ngAfterViewInit** - 뷰 초기화 완료 시
7. **ngAfterViewChecked** - 뷰 검사 후
8. **ngOnDestroy** - 컴포넌트 제거 시

## 설치 및 실행

### 필수 조건

- Node.js 22 이상 (`.nvmrc` 파일 참조)
- npm 또는 yarn

### 설치

```bash
npm install
```

또는

```bash
yarn install
```

### 실행

개발 서버 실행:

```bash
npm start
```

또는

```bash
ng serve
```

브라우저에서 `http://localhost:4200` 으로 접속합니다.

### 빌드

프로덕션 빌드:

```bash
npm run build
```

또는

```bash
ng build
```

### 테스트

```bash
npm test
```

## 파일 구조

```
03-lifecycle/
├── src/
│   ├── index.html                 # 메인 HTML 파일
│   ├── main.ts                    # Angular 부트스트래핑 파일
│   ├── styles.css                 # 전역 스타일
│   └── app/
│       ├── app.component.ts       # 메인 컴포넌트 (라이프사이클 설명)
│       ├── lifecycle-demo.component.ts  # 모든 8가지 훅을 보여주는 컴포넌트
│       ├── parent.component.ts    # 부모-자식 라이프사이클 데모
│       └── child.component.ts     # 자식 컴포넌트
├── angular.json                   # Angular CLI 설정
├── tsconfig.json                  # TypeScript 설정
├── tsconfig.app.json              # 앱 TypeScript 설정
├── tsconfig.spec.json             # 테스트 TypeScript 설정
├── package.json                   # NPM 패키지 설정
├── .gitignore                     # Git 무시 파일
├── .nvmrc                         # Node 버전 설정
└── README.md                      # 이 파일
```

## 라이프사이클 훅 설명

### 1. ngOnChanges

```typescript
ngOnChanges(changes: SimpleChanges): void {
  // @Input 속성이 변경될 때마다 호출됨
  // 부모 컴포넌트에서 @Input 값을 변경하면 이 메서드가 호출됨
  // SimpleChanges 객체를 통해 변경 이력 확인 가능
}
```

**특징:**
- @Input 속성이 변경될 때마다 호출
- 초기화 시에도 호출됨
- SimpleChanges 객체로 previousValue와 currentValue 확인 가능

**사용 시기:**
- @Input 값의 변경을 감지하고 반응해야 할 때

### 2. ngOnInit

```typescript
ngOnInit(): void {
  // 컴포넌트가 초기화될 때 한 번만 호출
  // 데이터 바인딩이 완료된 후 호출됨
}
```

**특징:**
- 컴포넌트 생명주기에서 한 번만 호출
- 생성자 이후에 호출
- 데이터 바인딩이 완료된 상태

**사용 시기:**
- HTTP 요청으로 데이터 초기화
- 이벤트 구독 설정
- 타이머 시작
- 초기 상태 설정

### 3. ngDoCheck

```typescript
ngDoCheck(): void {
  // Angular의 변경 감지(Change Detection)가 실행될 때마다 호출
  // 매우 자주 호출되므로 주의 필요
}
```

**특징:**
- 변경 감지가 실행될 때마다 호출됨
- 매우 자주 호출됨 (성능 주의 필요)
- 사용자 정의 변경 감지 로직 구현 가능

**사용 시기:**
- Angular가 감지하지 못하는 변경을 직접 감지해야 할 때
- 성능에 영향을 주지 않는 간단한 로직만 사용

### 4. ngAfterContentInit

```typescript
ngAfterContentInit(): void {
  // 컴포넌트에 프로젝션된 콘텐츠(ng-content)가 초기화된 후 호출
  // @ContentChild에 처음 접근할 수 있는 시점
}
```

**특징:**
- 프로젝션된 콘텐츠 초기화 후 한 번만 호출
- @ContentChild를 이용한 프로젝션 콘텐츠 접근 가능

**사용 시기:**
- 프로젝션된 콘텐츠를 조작해야 할 때

### 5. ngAfterContentChecked

```typescript
ngAfterContentChecked(): void {
  // Angular가 프로젝션된 콘텐츠를 검사한 후 호출
  // ngAfterContentInit 이후 매번 변경 감지 실행 시마다 호출
}
```

**특징:**
- ngAfterContentInit 이후부터 변경 감지 사이클마다 호출됨
- 매우 자주 호출됨

**사용 시기:**
- 프로젝션된 콘텐츠 변경을 감지해야 할 때

### 6. ngAfterViewInit

```typescript
ngAfterViewInit(): void {
  // 컴포넌트의 뷰와 자식 컴포넌트의 뷰가 초기화된 후 호출
  // @ViewChild에 처음 접근할 수 있는 시점
}
```

**특징:**
- 뷰 초기화 후 한 번만 호출
- @ViewChild를 이용한 DOM 요소 접근 가능
- 자식 컴포넌트의 모든 초기화가 완료된 상태

**사용 시기:**
- DOM 요소를 직접 조작해야 할 때
- 자식 컴포넌트의 메서드나 속성에 접근해야 할 때

### 7. ngAfterViewChecked

```typescript
ngAfterViewChecked(): void {
  // Angular가 컴포넌트의 뷰와 자식 뷰를 검사한 후 호출
  // ngAfterViewInit 이후 매번 변경 감지 실행 시마다 호출
}
```

**특징:**
- ngAfterViewInit 이후부터 변경 감지 사이클마다 호출됨
- 매우 자주 호출됨

**사용 시기:**
- 뷰 변경을 감지해야 할 때

### 8. ngOnDestroy

```typescript
ngOnDestroy(): void {
  // 컴포넌트가 제거되기 직전에 호출
  // 정리 작업을 수행하는 최후의 기회
}
```

**특징:**
- 컴포넌트 제거 시 한 번만 호출
- 정리 작업을 수행하는 최적의 장소

**사용 시기:**
- Observable 구독 정리 (unsubscribe)
- 타이머 제거 (clearInterval, clearTimeout)
- 이벤트 리스너 제거
- 메모리 누수 방지

## 컴포넌트 설명

### AppComponent (app.component.ts)

메인 컴포넌트로, 라이프사이클 훅의 개요와 설명을 제공합니다.

- 8가지 라이프사이클 훅 목록과 설명
- 실행 순서 설명
- 주의사항 및 팁

### LifecycleDemoComponent (lifecycle-demo.component.ts)

모든 8가지 라이프사이클 훅을 구현한 컴포넌트입니다.

**구현된 훅:**
- ngOnChanges - @Input 변경 감지
- ngOnInit - 초기화
- ngDoCheck - 변경 감지 감시
- ngAfterContentInit - 프로젝션 콘텐츠 초기화
- ngAfterContentChecked - 프로젝션 콘텐츠 검사
- ngAfterViewInit - 뷰 초기화
- ngAfterViewChecked - 뷰 검사
- ngOnDestroy - 정리

**기능:**
- 각 훅 호출 시 로그에 메시지 출력
- 훅 호출 순서와 타이밍 시각화
- 콘솔과 화면에 동시 로깅

### ParentComponent (parent.component.ts)

부모-자식 라이프사이클 관계를 보여주는 부모 컴포넌트입니다.

**기능:**
- 자식 컴포넌트 동적 생성/제거
- 자식에게 데이터 전달 (@Input)
- 부모-자식 라이프사이클 실행 순서 표시

### ChildComponent (child.component.ts)

부모로부터 데이터를 받는 자식 컴포넌트입니다.

**구현된 훅:**
- ngOnChanges - @Input 변경 감지
- ngOnInit - 초기화
- ngAfterViewInit - 뷰 초기화
- ngOnDestroy - 정리

## 주요 개념

### 변경 감지 (Change Detection)

Angular는 다양한 이벤트가 발생했을 때 변경 감지를 실행합니다:
- 사용자 입력 (클릭, 입력)
- 비동기 작업 완료 (HTTP, 타이머)
- 컴포넌트 입력값 변경

변경 감지 실행 시 다음 훅들이 호출됩니다:
1. ngDoCheck
2. ngAfterContentChecked
3. ngAfterViewChecked

### @Input과 @ViewChild

**@Input:**
- 부모에서 자식으로 데이터 전달
- 값이 변경되면 ngOnChanges 호출

**@ViewChild:**
- 자식 컴포넌트나 DOM 요소 참조
- ngAfterViewInit 이후에만 접근 가능

## 실행 순서

### 컴포넌트 초기화 단계

부모-자식 구조에서 처음 초기화될 때:

```
부모:
1. 부모 ngOnChanges (초기값)
2. 부모 ngOnInit
3. 부모 ngDoCheck
4. 부모 ngAfterContentInit
5. 부모 ngAfterContentChecked

자식:
6. 자식 ngOnChanges (초기값)
7. 자식 ngOnInit
8. 자식 ngDoCheck
9. 자식 ngAfterViewInit
10. 자식 ngAfterViewChecked

부모:
11. 부모 ngAfterViewInit
12. 부모 ngAfterViewChecked
```

### 변경 감지 단계

부모의 @Input 값이 변경될 때:

```
부모:
1. 부모 ngDoCheck
2. 부모 ngAfterContentChecked

자식:
3. 자식 ngOnChanges
4. 자식 ngDoCheck
5. 자식 ngAfterViewChecked

부모:
6. 부모 ngAfterViewChecked
```

### 컴포넌트 제거 단계

컴포넌트가 DOM에서 제거될 때:

```
자식:
1. 자식 ngOnDestroy

부모:
2. 부모 ngOnDestroy
```

## 성능 팁

### 주의할 점

1. **ngDoCheck, ngAfterContentChecked, ngAfterViewChecked에서 무거운 작업 금지**
   - 이 메서드들은 매우 자주 호출됨
   - HTTP 요청, 복잡한 계산 등을 하면 성능 저하

2. **ngOnInit 활용**
   - 초기화 작업은 ngOnInit에서 수행
   - 한 번만 호출되므로 성능상 유리

3. **ngOnDestroy에서 정리**
   - Observable 구독 정리
   - 타이머 제거
   - 메모리 누수 방지

### 성능 최적화

```typescript
// 나쁜 예: ngDoCheck에서 API 호출
ngDoCheck(): void {
  this.http.get('/api/data').subscribe(...); // 매우 자주 호출됨
}

// 좋은 예: ngOnInit에서 API 호출
ngOnInit(): void {
  this.http.get('/api/data').subscribe(...); // 한 번만 호출됨
}
```

## 학습 목표

이 프로젝트를 통해 다음을 학습할 수 있습니다:

1. ✅ 8가지 라이프사이클 훅의 개념 이해
2. ✅ 각 훅이 호출되는 시점과 목적 파악
3. ✅ 라이프사이클 훅의 실행 순서 학습
4. ✅ 부모-자식 컴포넌트 간 라이프사이클 관계 이해
5. ✅ 실전에서 각 훅을 올바르게 사용하는 방법
6. ✅ 성능 최적화 팁

## 추가 리소스

- [Angular 공식 문서 - Component Lifecycle](https://angular.io/guide/lifecycle-hooks)
- [Angular 변경 감지 가이드](https://angular.io/guide/change-detection)
- [Angular OnInit 인터페이스](https://angular.io/api/core/OnInit)

## 라이선스

이 프로젝트는 예제 코드이며 자유롭게 사용 및 수정할 수 있습니다.

## 작성자

Angular Internals eBook (한국어 버전)
