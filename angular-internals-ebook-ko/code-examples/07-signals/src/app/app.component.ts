import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterComponent } from './counter.component';
import { ComputedExampleComponent } from './computed-example.component';
import { EffectsExampleComponent } from './effects-example.component';

/**
 * 루트 애플리케이션 컴포넌트
 *
 * Signal 기능을 시연하는 모든 예제 컴포넌트를 표시합니다:
 * - 기본 Signal (CounterComponent)
 * - Computed Signal (ComputedExampleComponent)
 * - Effect (EffectsExampleComponent)
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CounterComponent,
    ComputedExampleComponent,
    EffectsExampleComponent
  ],
  template: `
    <div class="container">
      <header>
        <h1>🎯 Angular Signals 예제</h1>
        <p>Angular 18+ 에서의 Signals API 사용법</p>
      </header>

      <main>
        <!-- 기본 Signal 예제 -->
        <section>
          <h2>1. 기본 Signal</h2>
          <div class="section-content">
            <p>Signal은 값을 감싸는 반응형 객체입니다. 값이 변경되면 자동으로 의존하는 컴포넌트들이 업데이트됩니다.</p>
            <app-counter></app-counter>
          </div>
        </section>

        <!-- Computed Signal 예제 -->
        <section>
          <h2>2. Computed Signals</h2>
          <div class="section-content">
            <p>Computed signal은 다른 signal의 값에 기반하여 자동으로 계산되는 읽기 전용 signal입니다.</p>
            <app-computed-example></app-computed-example>
          </div>
        </section>

        <!-- Effect 예제 -->
        <section>
          <h2>3. Effects</h2>
          <div class="section-content">
            <p>Effect는 signal이 변경될 때 특정 작업을 수행하는 부수 효과입니다. (로깅, API 호출 등)</p>
            <app-effects-example></app-effects-example>
          </div>
        </section>

        <!-- 추가 정보 -->
        <section>
          <h2>4. Signals의 주요 특징</h2>
          <div class="section-content">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">반응성 (Reactivity)</div>
                <p>Signal의 값이 변경되면 자동으로 의존하는 computed와 effect가 실행됩니다.</p>
              </div>
              <div class="stat-card">
                <div class="stat-label">세분화된 업데이트 (Fine-grained Updates)</div>
                <p>변경된 signal에만 반응하므로 불필요한 업데이트를 피할 수 있습니다.</p>
              </div>
              <div class="stat-card">
                <div class="stat-label">선택적 업데이트 (Selective Updates)</div>
                <p>signal()이 변경된 때만 업데이트되므로, 배열 참조가 바뀌어도 영향이 없습니다.</p>
              </div>
              <div class="stat-card">
                <div class="stat-label">RxJS 상호운용성 (RxJS Interop)</div>
                <p>toSignal()과 toObservable()을 사용하여 Signal과 Observable을 변환할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666;">
        <p>Angular Signals API 문서: <a href="https://angular.io/guide/signals" target="_blank">angular.io/guide/signals</a></p>
      </footer>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      text-align: center;
      margin-bottom: 40px;
    }

    header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      color: #007bff;
    }

    header p {
      font-size: 16px;
      color: #666;
    }

    main {
      margin-bottom: 30px;
    }

    section {
      margin-bottom: 30px;
    }

    h2 {
      font-size: 22px;
      margin-bottom: 15px;
      color: #333;
      border-left: 4px solid #007bff;
      padding-left: 15px;
    }

    .section-content {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    footer {
      font-size: 12px;
    }

    footer a {
      color: #007bff;
      text-decoration: none;
    }

    footer a:hover {
      text-decoration: underline;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .stat-card {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }

    .stat-label {
      font-weight: bold;
      color: #007bff;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .stat-card p {
      margin: 0;
      font-size: 13px;
      color: #666;
      line-height: 1.5;
    }
  `]
})
export class AppComponent {
  // 루트 컴포넌트는 주로 다른 컴포넌트들을 조합하는 역할을 합니다
}
