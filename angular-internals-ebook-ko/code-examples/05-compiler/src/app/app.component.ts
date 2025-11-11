import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateExampleComponent } from './template-example.component';

// Angular 컴파일러의 역할을 보여주는 메인 컴포넌트
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TemplateExampleComponent],
  template: `
    <h1>Angular 컴파일러 (Compiler)</h1>

    <!-- 섹션 1: 컴파일 프로세스 개요 -->
    <div class="section">
      <h2>1. Angular 컴파일 프로세스</h2>

      <h3>컴파일 단계</h3>
      <div class="compilation-flow">
        <div class="flow-step">TypeScript</div>
        <span class="flow-arrow">→</span>
        <div class="flow-step">분석</div>
        <span class="flow-arrow">→</span>
        <div class="flow-step">변환</div>
        <span class="flow-arrow">→</span>
        <div class="flow-step">코드생성</div>
        <span class="flow-arrow">→</span>
        <div class="flow-step">JavaScript</div>
      </div>

      <div class="info-box">
        <strong>💡 핵심 개념:</strong> Angular 컴파일러는 TypeScript 소스 코드를 분석하여
        JavaScript로 변환합니다. 이 과정에서 템플릿도 함께 처리되어
        런타임 성능을 최적화합니다.
      </div>
    </div>

    <!-- 섹션 2: AOT vs JIT -->
    <div class="section">
      <h2>2. AOT (Ahead-of-Time) vs JIT (Just-in-Time) 컴파일</h2>

      <table class="comparison-table">
        <thead>
          <tr>
            <th>항목</th>
            <th><span class="compiler-badge aot-badge">AOT</span></th>
            <th><span class="compiler-badge jit-badge">JIT</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>컴파일 시점</strong></td>
            <td>빌드 시간</td>
            <td>런타임 (브라우저에서)</td>
          </tr>
          <tr>
            <td><strong>번들 크기</strong></td>
            <td>작음 ✅ (컴파일러 미포함)</td>
            <td>큼 ❌ (컴파일러 포함)</td>
          </tr>
          <tr>
            <td><strong>초기 로딩</strong></td>
            <td>빠름 ✅ (미리 컴파일)</td>
            <td>느림 ❌ (컴파일 필요)</td>
          </tr>
          <tr>
            <td><strong>템플릿 검사</strong></td>
            <td>강력함 ✅ (빌드 타임)</td>
            <td>약함 ❌ (런타임)</td>
          </tr>
          <tr>
            <td><strong>보안</strong></td>
            <td>높음 ✅ (소스 감춤)</td>
            <td>낮음 ❌ (소스 노출)</td>
          </tr>
          <tr>
            <td><strong>개발 속도</strong></td>
            <td>느림 ❌ (빌드 필요)</td>
            <td>빠름 ✅ (ng serve)</td>
          </tr>
          <tr>
            <td><strong>기본값</strong></td>
            <td>프로덕션 ✅</td>
            <td>개발 (deprecated)</td>
          </tr>
        </tbody>
      </table>

      <div class="warning-box">
        <strong>⚠️ 주의:</strong> Angular 9+ 부터 AOT가 기본값입니다.
        JIT는 특별한 경우를 제외하고 더 이상 권장되지 않습니다.
      </div>
    </div>

    <!-- 섹션 3: 템플릿 컴파일 -->
    <div class="section">
      <h2>3. 템플릿 컴파일 과정</h2>

      <h3>컴파일러가 처리하는 템플릿 요소</h3>
      <ul class="compiler-list">
        <li>
          <strong>데이터 바인딩:</strong> {{ interpolation }}, [property],
          (event), [(ngModel)]
        </li>
        <li>
          <strong>구조적 디렉티브:</strong> *ngIf, *ngFor, *ngSwitch -
          AngularJS와 달리 렌더링 레벨에서 처리
        </li>
        <li>
          <strong>속성 바인딩:</strong> 타입 검사를 통해 컴파일 타임에 에러 감지
        </li>
        <li>
          <strong>이벤트 바인딩:</strong> 메서드 존재 여부 및 시그니처 검사
        </li>
        <li>
          <strong>파이프:</strong> {{ value | pipe }} - 파이프 레지스트리 생성
        </li>
        <li>
          <strong>양방향 바인딩:</strong> ngModelChange 이벤트 자동 생성
        </li>
      </ul>

      <app-template-example></app-template-example>
    </div>

    <!-- 섹션 4: 번들 최적화 -->
    <div class="section">
      <h2>4. 번들 최적화 기법</h2>

      <div class="grid-2">
        <div>
          <h3>트리 셰이킹 (Tree Shaking)</h3>
          <ul class="optimization-list">
            <li>사용하지 않는 코드 제거</li>
            <li>ES6 모듈 기반</li>
            <li>DeadCode 제거</li>
            <li>롤업/웹팩에서 자동 처리</li>
          </ul>
        </div>

        <div>
          <h3>코드 분할 (Code Splitting)</h3>
          <ul class="optimization-list">
            <li>라우트 기반 번들 분리</li>
            <li>lazy 로딩</li>
            <li>초기 로딩 시간 감소</li>
            <li>온디맨드 다운로드</li>
          </ul>
        </div>
      </div>

      <h3>최적화 결과</h3>
      <div class="output-box">
📊 AOT 컴파일 번들 크기 감소:

초기 번들:
  - main.js: ~800 KB (JIT)
  - 컴파일러: ~500 KB

AOT 최적화 후:
  - main.js: ~200 KB (번들 감소: 75%)
  - 컴파일러: 제거됨
  - 로딩 시간: 3초 → 500ms (6배 빠름!)

트리 셰이킹:
  - 사용하지 않는 RxJS 연산자: ~100 KB 제거
  - 사용하지 않는 Material 컴포넌트: ~200 KB 제거

전체 크기: 500 KB → 150 KB (70% 감소)
      </div>
    </div>

    <!-- 섹션 5: Strict 모드 컴파일 -->
    <div class="section">
      <h2>5. Strict Mode 템플릿 검사</h2>

      <h3>컴파일 타임 에러 감지</h3>
      <ul class="feature-list">
        <li>✅ 존재하지 않는 프로퍼티 검사</li>
        <li>✅ 잘못된 타입 바인딩 감지</li>
        <li>✅ 필수 입력 값 검증</li>
        <li>✅ 파이프 인자 타입 검사</li>
        <li>✅ 이벤트 핸들러 시그니처 검증</li>
      </ul>

      <div class="success-box">
        <strong>✨ 장점:</strong> 템플릿 에러를 배포 전에 발견하여
        런타임 버그를 예방합니다.
      </div>
    </div>

    <!-- 섹션 6: 컴파일러 옵션 -->
    <div class="section">
      <h2>6. tsconfig.json의 Angular 컴파일러 옵션</h2>

      <div class="template-demo">
        <code>
"angularCompilerOptions": {
  "enableI18nLegacyMessageIdFormat": false,
  "strictInjectionParameters": true,    // DI 파라미터 엄격 검사
  "strictInputAccessModifiers": true,   // @Input() 접근자 검사
  "strictTemplates": true                // 템플릿 타입 검사 활성화
}
        </code>
      </div>

      <h3>주요 옵션</h3>
      <ul class="concept-list">
        <li>
          <strong>strictTemplates:</strong> 가장 중요한 옵션.
          템플릿의 타입 안정성을 보장합니다.
        </li>
        <li>
          <strong>fullTemplateTypeCheck:</strong> 더 깊은 템플릿 검사 수행
        </li>
        <li>
          <strong>strictAttributeTypes:</strong> DOM 속성 타입 검사
        </li>
        <li>
          <strong>strictDomLocalRefTypes:</strong> 템플릿 참조 변수 타입 검사
        </li>
      </ul>
    </div>

    <!-- 섹션 7: 학습 포인트 -->
    <div class="section">
      <h2>7. 학습 포인트</h2>

      <ul class="feature-list">
        <li>✅ AOT 컴파일은 프로덕션 환경의 필수 요소입니다</li>
        <li>✅ 템플릿은 컴파일 타임에 JavaScript로 변환됩니다</li>
        <li>✅ 트리 셰이킹으로 번들 크기를 70% 이상 줄일 수 있습니다</li>
        <li>✅ Strict Mode는 런타임 에러를 사전에 방지합니다</li>
        <li>✅ @Component의 template/templateUrl는 컴파일러에 의해 처리됩니다</li>
        <li>✅ ng build 기본값은 AOT + 프로덕션 설정입니다</li>
      </ul>
    </div>

    <!-- 섹션 8: 소스 코드 참조 -->
    <div class="section">
      <h2>8. Angular 소스 코드 참조</h2>

      <ul class="concept-list">
        <li>
          <code>packages/compiler/src/</code> - TypeScript 컴파일러 호출
        </li>
        <li>
          <code>packages/compiler/src/template_parser/</code> - 템플릿 파서
        </li>
        <li>
          <code>packages/compiler/src/expression_parser/</code> - 표현식 분석
        </li>
        <li>
          <code>packages/compiler/src/output/</code> - 코드 생성기
        </li>
        <li>
          <code>packages/compiler-cli/src/</code> - Angular Compiler CLI
        </li>
        <li>
          <code>packages/core/src/render3/component.ts</code> - 컴포넌트 정의
        </li>
      </ul>
    </div>
  `
})
export class AppComponent {
  // 컴포넌트 로직은 최소한으로 유지
  // 대부분의 기능은 템플릿에 표시됨
}
