# TaskMaster - 빠른 시작 가이드 🚀

## 1분 안에 시작하기

### 1단계: 설치
```bash
cd angular-internals-ebook-ko/code-examples/09-taskmaster
npm install
```

### 2단계: 실행
```bash
npm start
```

### 3단계: 브라우저 열기
```
http://localhost:4200
```

---

## 첫 작업 추가하기

1. **"➕ 새 작업"** 버튼 클릭
2. 정보 입력:
   - 제목: "Angular 학습 완료"
   - 설명: "TaskMaster 앱 분석하기"
   - 우선순위: "높음"
   - 카테고리: "업무"
3. **"추가"** 버튼 클릭

축하합니다! 첫 작업을 만들었습니다! 🎉

---

## 주요 기능 둘러보기

### 📝 작업 관리
- ✅ 체크박스 클릭으로 완료 표시
- ✏️ 연필 아이콘으로 수정
- 🗑️ 휴지통 아이콘으로 삭제

### 🔍 검색 및 필터
- 검색창에 키워드 입력
- 우선순위/카테고리/상태 필터 선택
- 여러 필터 동시 사용 가능

### 📊 분석 보기
- 상단 메뉴 **"분석"** 클릭
- 실시간 통계 확인
- 차트로 시각화된 데이터 보기

### 📥 데이터 내보내기
1. **"내보내기"** 버튼 클릭
2. **CSV** 또는 **PDF** 선택
3. 파일 자동 다운로드

---

## 샘플 데이터로 시작하기

작업이 없다면:
1. **"설정"** 페이지로 이동
2. **"샘플 데이터 추가"** 버튼 클릭
3. 6개의 예제 작업 자동 생성

---

## 학습 가이드

### 코드 탐색 순서

#### 1️⃣ 상태 관리 이해하기
```
📁 src/app/core/state/task.state.ts
```
- Signal 기반 상태 관리
- Computed signals
- Effect로 localStorage 동기화

#### 2️⃣ 컴포넌트 구조 보기
```
📁 src/app/features/tasks/task-list.component.ts
```
- OnPush 전략
- trackBy 함수
- Signal 사용법

#### 3️⃣ 플러그인 시스템 분석
```
📁 src/app/core/plugins/plugin.token.ts
📁 src/app/plugins/export/csv-export.plugin.ts
```
- InjectionToken
- Multi-provider 패턴

#### 4️⃣ 라우팅 설정 확인
```
📁 src/app/app.routes.ts
```
- Lazy loading
- Route 설정

---

## 개발 명령어

### 개발 서버
```bash
npm start
# → http://localhost:4200
```

### 프로덕션 빌드
```bash
npm run build
# → dist/taskmaster/
```

### 번들 크기 분석
```bash
npm run analyze
```

---

## 문제 해결

### 포트가 이미 사용 중인 경우
```bash
ng serve --port 4201
```

### 캐시 문제
```bash
ng cache clean
rm -rf .angular
npm start
```

### 의존성 문제
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 학습 팁

### 주석 읽기
각 파일 상단에 **Chapter 참조**가 있습니다:
```typescript
/**
 * Chapter 7 (Signals) - Signal 기반 상태 관리
 * Chapter 2 (Change Detection) - OnPush 전략
 */
```

### Chrome DevTools 활용
1. **F12** 키로 개발자 도구 열기
2. **Application** 탭 → **Local Storage** 확인
3. **Performance** 탭으로 성능 분석

### Angular DevTools 설치
Chrome 웹 스토어에서 "Angular DevTools" 검색 후 설치
- Component 트리 확인
- Change detection 프로파일링

---

## 다음 단계

### ✅ 코드 읽기
1. 각 파일의 주석 읽기
2. Chapter 참조 따라가며 학습
3. 패턴 이해하기

### ✅ 실험하기
1. 색상 테마 변경
2. 새 카테고리 추가
3. 정렬 기능 구현

### ✅ 확장하기
1. 새 플러그인 만들기
2. Backend API 연동
3. PWA로 변환

---

## 주요 파일 위치

```
📦 09-taskmaster/
│
├── 📄 README.md              ← 전체 문서
├── 📄 FILE_STRUCTURE.md      ← 파일 구조 설명
├── 📄 QUICK_START.md         ← 이 파일
│
├── 📁 src/
│   ├── 📄 main.ts            ← 시작점
│   ├── 📄 index.html         ← HTML 템플릿
│   ├── 📄 styles.css         ← 글로벌 스타일
│   │
│   └── 📁 app/
│       ├── 📁 core/          ← 비즈니스 로직
│       ├── 📁 features/      ← 페이지 컴포넌트
│       ├── 📁 shared/        ← 공유 컴포넌트
│       └── 📁 plugins/       ← 플러그인
│
└── 📄 package.json           ← 의존성
```

---

## 도움이 필요하신가요?

### 문서 참조
- `README.md` - 전체 가이드
- `FILE_STRUCTURE.md` - 파일별 상세 설명

### 온라인 자료
- [Angular 공식 문서](https://angular.dev)
- [Signals 가이드](https://angular.dev/guide/signals)

---

**즐거운 학습 되세요!** 📚✨

Angular 내부 구조를 마스터하는 여정에 오신 것을 환영합니다!
