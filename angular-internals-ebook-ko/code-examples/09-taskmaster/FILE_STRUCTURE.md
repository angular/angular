# TaskMaster - 파일 구조 및 설명

## 📊 프로젝트 통계
- **총 파일 수**: 27개
- **TypeScript 파일**: 19개
- **총 코드 라인**: ~3,700 줄
- **컴포넌트 수**: 9개
- **서비스 수**: 2개
- **플러그인 수**: 2개

---

## 📁 루트 설정 파일

### 프로젝트 설정
- **`.nvmrc`** - Node.js 버전 명시 (v22)
- **`.gitignore`** - Git 제외 파일 설정
- **`package.json`** - 프로젝트 의존성 및 스크립트
- **`tsconfig.json`** - TypeScript 컴파일러 설정 (strict mode)
- **`angular.json`** - Angular CLI 설정 (빌드, 서브 등)
- **`README.md`** - 프로젝트 문서화
- **`FILE_STRUCTURE.md`** - 이 파일 (파일 구조 설명)

---

## 📂 src/ - 소스 코드

### 루트 파일
```
src/
├── index.html          # HTML 템플릿 (title: "TaskMaster - 할 일 관리")
├── main.ts             # 애플리케이션 부트스트랩
└── styles.css          # 글로벌 스타일 (프로페셔널 디자인)
```

### 🏗️ app/ - 애플리케이션 코드

#### 루트 컴포넌트
```
app/
├── app.component.ts    # 루트 컴포넌트 (OnPush, RouterOutlet)
├── app.config.ts       # 애플리케이션 설정 (providers, plugins)
└── app.routes.ts       # 라우트 정의 (lazy loading)
```

**주요 개념:**
- Chapter 5: Standalone 컴포넌트
- Chapter 8: Router 설정

---

#### 💎 core/ - 핵심 비즈니스 로직

##### models/ - 데이터 모델
```
core/models/
└── task.model.ts       # Task 인터페이스, Enum, 타입 정의
```
**내용:**
- `Task` 인터페이스
- `TaskPriority` enum (낮음, 보통, 높음, 긴급)
- `TaskCategory` enum (업무, 개인, 쇼핑, 건강, 기타)
- `TaskStats`, `TaskFilter` 인터페이스
- 한글 레이블 매핑

**주요 개념:**
- Chapter 1: 타입 시스템

##### state/ - 상태 관리
```
core/state/
└── task.state.ts       # Signal 기반 상태 관리
```
**주요 기능:**
- Private writable signals
- Public readonly signals
- Computed signals (filteredTasks, stats)
- Effect (localStorage 동기화)
- CRUD 메서드

**주요 개념:**
- Chapter 7: Signals (signal, computed, effect)
- Chapter 2: OnPush와 함께 최적화

##### services/ - 비즈니스 로직
```
core/services/
└── task.service.ts     # Task CRUD 서비스
```
**주요 기능:**
- createTask, updateTask, deleteTask
- toggleComplete
- generateSampleTasks
- validateTask
- duplicateTask

**주요 개념:**
- Chapter 1: Singleton 서비스 (`providedIn: 'root'`)

##### plugins/ - 플러그인 시스템
```
core/plugins/
└── plugin.token.ts     # InjectionToken 및 인터페이스
```
**주요 기능:**
- `Plugin` 기본 인터페이스
- `ExportPlugin` 인터페이스
- `IntegrationPlugin` 인터페이스
- `EXPORT_PLUGIN` InjectionToken
- Multi-provider 패턴

**주요 개념:**
- Chapter 1: InjectionToken, Multi-provider

---

#### 🎯 features/ - 기능 컴포넌트 (모두 Lazy Loading)

##### tasks/ - 작업 관리
```
features/tasks/
├── task-list.component.ts    # 메인 작업 목록 (필터, 검색, 정렬)
├── task-card.component.ts    # 개별 작업 카드
└── task-form.component.ts    # 작업 추가/수정 폼
```

**task-list.component.ts:**
- OnPush 전략
- trackBy 함수
- Signal 기반 상태
- 필터링 UI
- 플러그인 통합

**task-card.component.ts:**
- Signal inputs/outputs
- OnPush 전략
- 개별 작업 표시
- 완료, 수정, 삭제 액션

**task-form.component.ts:**
- Template-driven forms
- 입력 검증
- 작업 추가/수정 모드

**주요 개념:**
- Chapter 2: OnPush
- Chapter 4: trackBy로 효율적인 렌더링
- Chapter 8: Lazy loading

##### analytics/ - 분석 대시보드
```
features/analytics/
└── dashboard.component.ts    # 통계 및 차트
```
**주요 기능:**
- 실시간 메트릭 (전체, 완료, 진행 중, 완료율)
- 우선순위별 도넛 차트
- 카테고리별 도넛 차트
- 상세 통계 막대 그래프
- 스마트 인사이트

**주요 개념:**
- Chapter 6: runOutsideAngular로 차트 렌더링
- Chapter 7: Effect로 차트 업데이트
- Chapter 8: Lazy loading

##### settings/ - 설정
```
features/settings/
└── settings.component.ts     # 설정 및 데이터 관리
```
**주요 기능:**
- 일반 설정 (알림, 자동저장, 다크모드)
- 플러그인 목록
- 데이터 통계
- 데이터 내보내기/삭제
- 애플리케이션 정보
- 기술 스택 표시

**주요 개념:**
- Chapter 1: 플러그인 주입
- Chapter 8: Lazy loading

---

#### 🔌 plugins/ - 플러그인 구현

```
plugins/
├── plugin.interface.ts              # 플러그인 인터페이스 재수출
└── export/
    ├── csv-export.plugin.ts         # CSV 내보내기
    └── pdf-export.plugin.ts         # PDF 내보내기
```

**csv-export.plugin.ts:**
- ExportPlugin 구현
- CSV 변환 로직
- BOM 추가 (한글 지원)
- 파일 다운로드

**pdf-export.plugin.ts:**
- ExportPlugin 구현
- HTML 기반 PDF 생성
- 인쇄 최적화 스타일
- runOutsideAngular 사용

**주요 개념:**
- Chapter 1: Multi-provider 패턴
- Chapter 3: 플러그인 생명주기
- Chapter 6: Zone.js 최적화

---

#### 🔄 shared/ - 공유 컴포넌트

##### components/ - UI 컴포넌트
```
shared/components/
├── header.component.ts       # 앱 헤더 (네비게이션)
└── footer.component.ts       # 앱 푸터
```

**header.component.ts:**
- RouterLink로 네비게이션
- Signal로 실시간 통계 표시
- 반응형 디자인

**footer.component.ts:**
- 애플리케이션 정보
- 기술 스택 목록
- 학습 개념 표시

**주요 개념:**
- Chapter 2: OnPush
- Chapter 8: RouterLink

##### pipes/ - 커스텀 파이프
```
shared/pipes/
└── task-filter.pipe.ts       # 작업 필터링 파이프
```
**주요 기능:**
- Pure pipe (효율적인 필터링)
- 검색어, 우선순위, 카테고리, 완료 상태 필터

**주요 개념:**
- Chapter 4: Pure Pipe

---

## 🎨 스타일 시스템

**styles.css 주요 내용:**
- CSS 변수 (색상 테마)
- 타이포그래피
- 버튼 스타일
- 폼 컨트롤
- 카드 컴포넌트
- 그리드 레이아웃
- 유틸리티 클래스
- 반응형 미디어 쿼리
- 애니메이션

---

## 📋 각 Chapter별 구현 파일 매핑

### Chapter 1: 의존성 주입 (DI)
- ✅ `core/plugins/plugin.token.ts` - InjectionToken
- ✅ `app.config.ts` - Multi-provider 등록
- ✅ `plugins/export/*.plugin.ts` - 플러그인 구현
- ✅ `features/tasks/task-list.component.ts` - 플러그인 주입

### Chapter 2: 변경 감지 (Change Detection)
- ✅ **모든 컴포넌트** - OnPush 전략
- ✅ `core/state/task.state.ts` - Signal과 OnPush

### Chapter 3: 생명주기 (Lifecycle)
- ✅ `features/tasks/task-form.component.ts` - ngOnInit
- ✅ `features/analytics/dashboard.component.ts` - OnDestroy
- ✅ `plugins/export/*.plugin.ts` - initialize, destroy

### Chapter 4: 렌더링 (Rendering)
- ✅ `features/tasks/task-list.component.ts` - trackBy 함수
- ✅ `shared/pipes/task-filter.pipe.ts` - Pure pipe
- ✅ **모든 컴포넌트** - 효율적인 템플릿

### Chapter 5: 컴파일러 (Compiler)
- ✅ **모든 컴포넌트** - Standalone
- ✅ `tsconfig.json` - strict mode
- ✅ `angular.json` - AOT 설정

### Chapter 6: Zone.js
- ✅ `app.config.ts` - provideZoneChangeDetection
- ✅ `features/analytics/dashboard.component.ts` - runOutsideAngular
- ✅ `plugins/export/pdf-export.plugin.ts` - Zone 외부 실행

### Chapter 7: Signals
- ✅ `core/state/task.state.ts` - signal, computed, effect
- ✅ `features/tasks/task-card.component.ts` - input, output
- ✅ **모든 컴포넌트** - Signal 읽기

### Chapter 8: Router
- ✅ `app.routes.ts` - 라우트 정의
- ✅ `app.config.ts` - provideRouter
- ✅ `app.component.ts` - RouterOutlet
- ✅ `shared/components/header.component.ts` - RouterLink
- ✅ **모든 feature 컴포넌트** - Lazy loading

---

## 🚀 실행 방법

```bash
# 1. 의존성 설치
cd 09-taskmaster
npm install

# 2. 개발 서버 실행
npm start

# 3. 브라우저에서 열기
# http://localhost:4200
```

---

## 📦 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 번들 크기 분석
npm run analyze

# 출력 디렉토리
# dist/taskmaster/
```

---

## 🎯 학습 포인트

각 파일의 상단 주석에 **해당 Chapter 참조**가 포함되어 있습니다:

```typescript
/**
 * Task State Management
 *
 * Chapter 7 (Signals) - Signal 기반 반응형 상태 관리
 * Chapter 2 (Change Detection) - OnPush와 함께 사용하여 최적화
 */
```

이를 통해:
1. 어떤 개념이 어디에 적용되었는지 쉽게 파악
2. Chapter별 코드 예제 빠른 검색
3. 실제 통합 방식 학습

---

## ✨ 주요 패턴 요약

### Signal 패턴
- Private writable + Public readonly
- Computed for derived state
- Effect for side effects

### DI 패턴
- Singleton services (`providedIn: 'root'`)
- InjectionToken for abstractions
- Multi-provider for plugins

### Component 패턴
- OnPush everywhere
- Signal inputs/outputs
- Standalone components

### Performance 패턴
- trackBy for lists
- Pure pipes
- runOutsideAngular for heavy operations
- Lazy loading for features

---

**프로덕션 준비 완료!** 🎉

이 파일 구조는 **확장 가능하고, 유지보수 가능하며, 성능 최적화된** Angular 애플리케이션의 모범 사례입니다.
