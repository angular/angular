# Angular 내부 구조를 위한 코드 예제

이 디렉토리는 책의 각 챕터에 대한 실행 가능한 코드 예제를 포함합니다.

## 구조

각 챕터는 작동하는 코드가 있는 자체 디렉토리를 가지고 있습니다:

```
code-examples/
├── 01-di/                    # 의존성 주입 예제
├── 02-change-detection/      # 변경 감지 최적화
├── 03-lifecycle/             # 컴포넌트 생명주기 훅
├── 04-rendering/             # 렌더링 엔진 탐험
├── 05-compiler/              # 컴파일러 출력 분석
├── 06-zone/                  # Zone.js 패턴
├── 07-signals/               # Signals와 반응성
├── 08-router/                # 라우터 내부 구조
└── 09-taskmaster/            # 완전한 애플리케이션
```

## 예제 실행

각 예제는 독립적인 Angular 프로젝트입니다:

```bash
cd 01-di/
npm install
npm start
```

그런 다음 http://localhost:4200 을 여세요

## 전제 조건

- Node.js 18+ (가급적 22+)
- npm 또는 pnpm
- Angular CLI (선택사항, 이 예제들에는 필요 없음)

## 배울 내용

### 1장: 의존성 주입
- 실제 작동하는 계층적 인젝터
- Multi-provider 패턴
- InjectionToken 사용
- DI를 사용한 플러그인 아키텍처

### 2장: 변경 감지
- OnPush vs Default 전략 비교
- 성능 최적화 기법
- 수동 변경 감지 제어
- Zone.js 통합

### 3장: 생명주기
- 순서대로 8가지 생명주기 훅
- 각 훅을 언제 사용하는지
- ViewChild/ContentChild 타이밍
- Effects를 사용한 Signal 기반 생명주기

### 4장: 렌더링
- LView 구조 시각화
- 명령어 기반 렌더링
- 성능 프로파일링
- DOM 업데이트 추적

### 5장: 컴파일러
- 템플릿 컴파일 출력
- AOT vs JIT 비교
- 번들 크기 분석
- 최적화 기법

### 6장: Zone.js
- NgZone API 사용
- runOutsideAngular 패턴
- 커스텀 zone 생성
- 성능 최적화

### 7장: Signals
- Signal 기초
- Computed signals
- Effects
- RxJS 상호 운용

### 8장: 라우터
- 고급 라우팅 패턴
- Guards와 resolvers
- Lazy loading
- Route reuse 전략

### 9장: TaskMaster
- 완전한 프로덕션 앱
- 모든 개념 통합
- 모범 사례
- 성능 최적화

## 팁

1. **순차적으로 시작** - 예제들은 이전 개념을 기반으로 합니다
2. **코드 수정** - 값을 변경하고, 망가뜨리고, 실험하며 배우세요
3. **DevTools 사용** - Angular DevTools가 개념 시각화에 도움이 됩니다
4. **소스 읽기** - 각 예제는 Angular 소스 코드를 참조합니다

## 문제 해결

### 포트가 이미 사용 중
```bash
npm start -- --port 4201
```

### Node 버전 문제
Node 22+ 사용 (각 프로젝트의 .nvmrc에 지정됨)

### 의존성 문제
```bash
rm -rf node_modules package-lock.json
npm install
```

## 추가 리소스

- [Angular 소스 코드](https://github.com/angular/angular)
- [Angular DevTools](https://angular.dev/tools/devtools)
- [메인 책](../README.md)

즐거운 코딩 되세요! 🚀
