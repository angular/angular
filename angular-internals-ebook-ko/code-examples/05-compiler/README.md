# 5장 코드 예제: 컴파일러 (Compiler)

이 예제는 Angular의 컴파일러 내부 구조와 AOT/JIT 컴파일, 번들 최적화를 보여줍니다.

## 포함 내용

### 1. 컴파일 프로세스 (`app.component.ts`)
Angular 컴파일러의 전체 작동 원리:
- TypeScript → JavaScript 변환 과정
- 템플릿 파싱 및 분석
- 코드 생성 및 최적화

### 2. AOT vs JIT 비교
빌드 시간과 런타임 성능의 차이:

| 항목 | AOT (추천) | JIT (deprecated) |
|------|-----------|------------------|
| **컴파일 시점** | 빌드 시간 | 런타임 (브라우저) |
| **번들 크기** | 작음 ✅ | 큼 ❌ |
| **초기 로딩** | 빠름 ✅ | 느림 ❌ |
| **템플릿 검사** | 강력 ✅ | 약함 ❌ |
| **보안** | 높음 ✅ | 낮음 ❌ |
| **개발 속도** | 느림 ❌ | 빠름 ✅ |

#### AOT (Ahead-of-Time) 컴파일
```
타입스크립트 → Angular 컴파일러 → JavaScript (최적화됨) → 브라우저
```
- 프로덕션 환경의 필수 사항
- 컴파일러가 번들에 포함되지 않음
- 템플릿 에러를 빌드 타임에 발견
- Angular 9+ 기본값

#### JIT (Just-in-Time) 컴파일
```
타입스크립트 → JavaScript → 브라우저 → Angular 컴파일러 → 실행
```
- 런타임에 컴파일 수행
- 컴파일러 포함으로 번들 크기 증가
- 초기 로딩 시간 증가
- 개발 중 빠른 피드백 가능
- 더 이상 권장되지 않음

### 3. 템플릿 컴파일 (`template-example.component.ts`)
컴파일러가 처리하는 다양한 템플릿 문법:

```typescript
// 인터폴레이션
{{ message }}
{{ 2 + 3 }}
{{ getGreeting() }}

// 프로퍼티 바인딩
<button [disabled]="isDisabled">버튼</button>
<p [style.color]="dynamicColor">텍스트</p>

// 이벤트 바인딩
<button (click)="handleClick()">클릭</button>

// 양방향 바인딩
<input [(ngModel)]="twoWayValue">

// 구조적 디렉티브
<p *ngIf="isVisible">조건부</p>
<li *ngFor="let item of items">{{ item }}</li>
<div [ngSwitch]="option">
  <p *ngSwitchCase="'a'">A</p>
</div>

// 템플릿 참조 변수
<input #ref>
{{ ref.value }}

// 파이프
{{ message | uppercase }}
{{ currentDate | date:'short' }}

// 안전 네비게이션
{{ optionalObj?.property }}
```

모든 이 문법들은 컴파일 타임에 JavaScript 코드로 변환됩니다.

### 4. 번들 최적화

#### 트리 셰이킹 (Tree Shaking)
```
초기 번들: ~500 KB
↓ (사용하지 않는 코드 제거)
최적화 후: ~150 KB (70% 감소)
```

- ES6 모듈의 정적 분석
- DeadCode 제거
- 웹팩/롤업에서 자동 처리

#### 코드 분할 (Code Splitting)
```
메인 번들: ~200 KB
라우트 1: ~50 KB
라우트 2: ~40 KB
↓ (온디맨드 로딩)
초기 로딩: 200 KB → 빠른 로딩
```

#### 최적화 결과
```
JIT 빌드:
  - main.js: ~800 KB
  - 컴파일러 포함: ~500 KB
  - 총합: 1.3 MB

AOT 프로덕션 빌드:
  - main.js: ~200 KB (트리 셰이킹)
  - 컴파일러 제거
  - 총합: 200 KB

개선율: 85% 크기 감소!
로딩 시간: 3초 → 500ms (6배 빨라짐!)
```

## 주요 파일

```
05-compiler/
├── src/
│   ├── app/
│   │   ├── app.component.ts           # 컴파일 프로세스 설명
│   │   └── template-example.component.ts  # 템플릿 문법 예제
│   │
│   ├── index.html                    # 메인 HTML
│   ├── main.ts                       # AOT 부트스트랩
│   └── styles.css                    # 스타일
│
├── package.json                      # 의존성
├── tsconfig.json                     # TS 및 Angular 컴파일러 옵션
├── angular.json                      # Angular 설정
└── README.md                         # 이 파일
```

## 예제 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (AOT 기본값)
npm start

# 프로덕션 빌드 (AOT + 최적화)
npm run build:prod

# 번들 크기 분석
ng build --stats-json
# stats.json을 번들 분석 도구에 업로드
```

http://localhost:4200 열기

## 컴파일러 옵션 (tsconfig.json)

```json
{
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,    // DI 파라미터 엄격 검사
    "strictInputAccessModifiers": true,   // @Input() 접근자 검사
    "strictTemplates": true                // 템플릿 타입 안정성 검사
  }
}
```

### 주요 옵션

- **strictTemplates**: 가장 중요한 옵션. 템플릿의 모든 표현식을 타입 검사합니다.
- **fullTemplateTypeCheck**: 더 깊은 수준의 템플릿 검사 수행
- **strictAttributeTypes**: DOM 속성의 타입 검사
- **strictDomLocalRefTypes**: 템플릿 참조 변수 타입 검사
- **noImplicitOverride**: 오버라이드 메서드 명시 필요

## 학습 목표

이 예제를 실행한 후, 다음을 이해해야 합니다:

- ✅ Angular 컴파일러의 전체 작동 원리
- ✅ AOT가 왜 프로덕션 필수인지
- ✅ 템플릿이 컴파일 타임에 어떻게 처리되는지
- ✅ 트리 셰이킹으로 번들 크기를 줄이는 방법
- ✅ Strict 모드가 런타임 에러를 방지하는 방법
- ✅ 컴파일러 옵션으로 개발 경험 향상
- ✅ AOT와 JIT의 성능 차이 이해

## 연습 문제

1. **빌드 비교**: `npm run build:prod`와 `npm run build:jit` 결과를 비교하세요
   - 번들 크기 비교
   - 빌드 시간 비교

2. **템플릿 에러 생성**: template-example.component.ts에 의도적으로 잘못된 바인딩을 추가하고 컴파일 에러 확인
   ```typescript
   // 존재하지 않는 메서드
   {{ nonExistentMethod() }}

   // 타입 불일치
   <input [disabled]="'string'">  // boolean이 필요함
   ```

3. **Strict 모드 테스트**: tsconfig.json에서 strictTemplates를 false로 변경하고 에러가 사라지는지 확인

4. **번들 분석**: `ng build --stats-json` 후 webpack-bundle-analyzer 사용
   ```bash
   npm install -g webpack-bundle-analyzer
   webpack-bundle-analyzer dist/angular-compiler-examples/stats.json
   ```

5. **코드 분할 구현**: 새 라우트 추가 후 lazy loading 적용

## 소스 코드 참조

Angular 소스 코드에서 컴파일러 구현:

- `packages/compiler/src/` - TypeScript 컴파일러 호출 및 통합
- `packages/compiler/src/template_parser/` - 템플릿 파싱
- `packages/compiler/src/expression_parser/` - 표현식 분석
- `packages/compiler/src/output/` - JavaScript 코드 생성
- `packages/compiler-cli/src/` - Angular Compiler CLI
- `packages/core/src/render3/component.ts` - 컴포넌트 정의

### 주요 컴파일 클래스

```typescript
// 템플릿 파서
TemplateParser {
  parse(template: string): ParseTreeElement[]
}

// 표현식 분석
ExpressionParser {
  parseBinding(expression: string): AST
  parseAction(expression: string): AST
}

// 코드 생성기
CodeGenerator {
  generate(ast: AST): string  // JavaScript 코드 반환
}

// 타입 체커
TypeChecker {
  checkTemplateExpression(expr: AST, context: any): Diagnostic[]
}
```

## 성능 팁

1. **AOT는 기본값**: Angular 9+ 에서는 항상 AOT로 빌드됨
2. **strict 옵션 활성화**: 런타임 버그를 사전에 방지
3. **트리 셰이킹 확인**: 사용하지 않는 라이브러리 제거
4. **코드 분할 활용**: 라우트 기반 lazy loading으로 초기 로딩 속도 향상
5. **sourcemaps 확인**: 개발에서는 true, 프로덕션에서는 false

## 배포 체크리스트

- [ ] `ng build --configuration production` 실행
- [ ] 번들 크기 검증 (angular.json의 budgets 설정)
- [ ] 소스 맵 비활성화 (보안)
- [ ] Gzip 압축 설정
- [ ] CDN 캐싱 전략 수립

## 다음 단계

[6장: Zone.js](../06-zone/README.md)로 계속하세요.

이 장에서는 Zone.js가 어떻게 Angular의 변경 감지를 트리거하는지 알아봅니다.
