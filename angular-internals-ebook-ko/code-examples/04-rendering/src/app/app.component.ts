import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListRenderingComponent } from './list-rendering.component';
import { ConditionalRenderingComponent } from './conditional-rendering.component';

/**
 * Angular 렌더링 엔진 개요 컴포넌트
 *
 * LView 구조 및 DOM 업데이트 메커니즘을 시연합니다.
 * Angular의 효율적인 렌더링 시스템을 이해하기 위한 핵심 개념을 다룹니다.
 *
 * LView (Logical View) 구조:
 * - 각 컴포넌트는 LView라는 내부 데이터 구조를 가집니다
 * - LView는 컴포넌트의 상태, 바인딩, DOM 노드에 대한 참조를 저장합니다
 * - 렌더링 엔진은 변경 감지 후 필요한 부분만 LView를 업데이트합니다
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ListRenderingComponent, ConditionalRenderingComponent],
  template: `
    <div class="section">
      <h1>Angular 렌더링 엔진 (Rendering Engine)</h1>
      <p>렌더링 엔진은 Angular의 핵심으로, 효율적인 DOM 업데이트와 성능 최적화를 담당합니다.</p>
    </div>

    <!-- 렌더링 엔진 기본 개념 섹션 -->
    <div class="section">
      <h2>1. 렌더링 엔진 기본 개념</h2>
      <div class="subsection">
        <h3>LView (Logical View) 구조</h3>
        <p>각 컴포넌트는 다음과 같은 LView 구조를 가집니다:</p>
        <div class="lview-diagram">
          <code>
LView = [
  // [0] 컴포넌트 데이터 (context)
  // [1] 부모 LView 참조
  // [2] 다음 LView 참조
  // [3] 자식 노드 (TView)
  // [4+] 바인딩된 데이터 (properties, inputs, outputs)
  // ...
  // 마지막: DOM 요소에 대한 참조
]

예시:
LView = [
  { message: 'Hello', count: 0 },  // 컴포넌트 인스턴스
  parentLView,                       // 부모 LView
  nextLView,                         // 형제 LView
  tView,                             // 템플릿 뷰
  "바인딩된 값 1",                   // 데이터 바인딩
  "바인딩된 값 2",
  inputElement,                      // DOM 참조
  ...
]
          </code>
        </div>
        <p class="output">
          💡 <strong>핵심:</strong> LView는 컴포넌트 상태와 DOM을 연결하는 가상 구조입니다.
          변경 감지 시 LView의 데이터만 업데이트되고, 필요한 부분만 DOM에 적용됩니다.
        </p>
      </div>

      <div class="subsection">
        <h3>렌더링 플로우</h3>
        <ol style="margin-left: 1.5rem; line-height: 1.8;">
          <li><strong>변경 감지:</strong> ZoneJS가 비동기 작업을 감지하고 변경 감지 사이클 시작</li>
          <li><strong>LView 업데이트:</strong> 바인딩된 데이터 변경 감지 및 LView 업데이트</li>
          <li><strong>Instruction 생성:</strong> 렌더러가 필요한 DOM 조작 명령어 생성</li>
          <li><strong>DOM 적용:</strong> 생성된 명령어가 브라우저 DOM에 적용됨</li>
          <li><strong>라이프사이클 훅:</strong> AfterViewInit 등의 훅 실행</li>
        </ol>
      </div>
    </div>

    <!-- 렌더링 성능 모니터링 섹션 -->
    <div class="section">
      <h2>2. 렌더링 성능 모니터링</h2>
      <div class="controls">
        <button (click)="triggerRender()">렌더링 트리거</button>
        <button (click)="resetMetrics()">지표 초기화</button>
      </div>

      <div class="stats">
        <div class="stat-card">
          <h4>렌더링 횟수</h4>
          <div class="stat-value">{{ renderCount() }}</div>
        </div>
        <div class="stat-card">
          <h4>마지막 렌더링 시간</h4>
          <div class="stat-value">{{ lastRenderTime() }}ms</div>
        </div>
        <div class="stat-card">
          <h4>평균 렌더링 시간</h4>
          <div class="stat-value">{{ averageRenderTime() }}ms</div>
        </div>
      </div>

      <div class="subsection">
        <h3>렌더링 엔진 특성</h3>
        <ul class="rendering-list">
          <li>
            <span><strong>Incremental Rendering:</strong> 변경된 부분만 업데이트</span>
            <span class="badge">성능 최적화</span>
          </li>
          <li>
            <span><strong>Dirty Checking:</strong> LView의 데이터 변경을 감지</span>
            <span class="badge">효율성</span>
          </li>
          <li>
            <span><strong>Batch Updates:</strong> 여러 변경을 모아 한 번에 처리</span>
            <span class="badge">속도</span>
          </li>
          <li>
            <span><strong>Lazy Rendering:</strong> 필요할 때만 컴포넌트 렌더링</span>
            <span class="badge success">메모리 절약</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 데이터 바인딩 섹션 -->
    <div class="section">
      <h2>3. 데이터 바인딩과 렌더링</h2>
      <div class="subsection">
        <h3>실시간 바인딩 예제</h3>
        <div class="controls">
          <label>
            메시지:
            <input [(ngModel)]="message" type="text" placeholder="메시지 입력">
          </label>
          <label>
            카운트:
            <input [(ngModel)]="count" type="number" min="0">
          </label>
          <button (click)="increment()">증가</button>
          <button (click)="decrement()">감소</button>
        </div>

        <div class="render-demo">
          <h4>바인딩 결과:</h4>
          <p><strong>메시지:</strong> {{ message }}</p>
          <p><strong>카운트:</strong> {{ count }}</p>
          <p><strong>계산된 값:</strong> {{ calculatedValue() }}</p>
          <p><strong>렌더링 상태:</strong> {{ renderStatus() }}</p>
        </div>

        <p class="output">
          💡 <strong>메커니즘:</strong> 입력값이 변경되면:
          1) 이벤트가 발생하고 ZoneJS가 감지
          2) 변경 감지 사이클이 시작되어 LView의 바인딩 확인
          3) 변경된 바인딩만 렌더러가 처리
          4) DOM이 업데이트됨
        </p>
      </div>
    </div>

    <!-- 조건부 렌더링 섹션 -->
    <div class="section">
      <h2>4. 조건부 렌더링 (@if/@else/@switch)</h2>
      <app-conditional-rendering></app-conditional-rendering>
    </div>

    <!-- 리스트 렌더링 섹션 -->
    <div class="section">
      <h2>5. 리스트 렌더링과 성능 최적화</h2>
      <app-list-rendering></app-list-rendering>
    </div>

    <!-- 고급 렌더링 개념 섹션 -->
    <div class="section">
      <h2>6. 고급 렌더링 개념</h2>
      <div class="subsection">
        <h3>프래그먼트 (Fragments)</h3>
        <p>프래그먼트는 DOM을 변경하지 않고 논리적으로 관련된 엘리먼트들을 그룹화합니다:</p>
        <div class="lview-diagram">
          <code>
&lt;ng-container&gt;
  {{ messageA }}
  {{ messageB }}
&lt;/ng-container&gt;

렌더링 결과:
- 추가 DOM 노드 없음
- LView에만 기록됨
- 성능상 유리
          </code>
        </div>
      </div>

      <div class="subsection">
        <h3>ViewContainerRef와 동적 렌더링</h3>
        <p>ViewContainerRef를 사용하여 동적으로 컴포넌트를 렌더링할 수 있습니다:</p>
        <div class="lview-diagram">
          <code>
constructor(private vcr: ViewContainerRef) {}

createComponent() {
  // LView 생성
  const ref = this.vcr.createComponent(MyComponent);
  // 컴포넌트가 DOM에 추가됨
}
          </code>
        </div>
      </div>

      <div class="subsection">
        <h3>변경 감지 전략</h3>
        <ul class="rendering-list">
          <li>
            <span><strong>Default:</strong> 매번 모든 바인딩 확인</span>
            <span class="badge">정확성</span>
          </li>
          <li>
            <span><strong>OnPush:</strong> 입력값 변경 시에만 확인</span>
            <span class="badge success">성능</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 학습 포인트 섹션 -->
    <div class="section">
      <h2>학습 포인트</h2>
      <ul class="rendering-list">
        <li>✅ <code>LView</code>는 컴포넌트의 내부 상태와 DOM을 연결하는 구조</li>
        <li>✅ 렌더링 엔진은 변경된 부분만 업데이트하여 성능 최적화</li>
        <li>✅ <code>trackBy</code>를 사용한 리스트 렌더링은 성능 향상에 필수</li>
        <li>✅ <code>@if</code>, <code>@for</code>, <code>@switch</code>는 효율적인 조건부 렌더링</li>
        <li>✅ 변경 감지 전략(<code>OnPush</code>)으로 불필요한 렌더링 방지 가능</li>
        <li>✅ <code>ng-container</code>와 <code>ng-template</code>은 추가 DOM 없이 렌더링 제어</li>
      </ul>
    </div>

    <!-- 소스 코드 참조 섹션 -->
    <div class="section">
      <h2>소스 코드 참조</h2>
      <ul class="rendering-list">
        <li><code>packages/core/src/render3/view_engine_compatibility.ts</code> - LView 정의</li>
        <li><code>packages/core/src/render3/instructions/element.ts</code> - 엘리먼트 렌더링</li>
        <li><code>packages/core/src/render3/instructions/text.ts</code> - 텍스트 렌더링</li>
        <li><code>packages/core/src/render3/renderer.ts</code> - 렌더 엔진</li>
        <li><code>packages/core/src/render3/component.ts</code> - 컴포넌트 렌더링</li>
        <li><code>packages/core/src/render3/node_manipulation.ts</code> - DOM 조작</li>
      </ul>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent implements OnInit {
  // 바인딩 테스트용 신호
  message = signal('안녕하세요!');
  count = signal(0);

  // 성능 모니터링 신호
  private renderCountValue = signal(0);
  private renderTimes = signal<number[]>([]);
  private lastRenderTimeValue = signal(0);

  // 계산된 값들
  calculatedValue = computed(() => {
    // 이 함수는 count나 message가 변경될 때만 실행됨 (메모이제이션)
    return `메시지: ${this.message()} | 카운트: ${this.count() * 2}`;
  });

  renderCount = computed(() => this.renderCountValue());

  lastRenderTime = computed(() => this.lastRenderTimeValue());

  averageRenderTime = computed(() => {
    const times = this.renderTimes();
    if (times.length === 0) return 0;
    const sum = times.reduce((a, b) => a + b, 0);
    return Math.round(sum / times.length * 100) / 100;
  });

  renderStatus = computed(() => {
    const count = this.renderCount();
    return count === 0 ? '준비됨' : `렌더링됨 (${count}회)`;
  });

  ngOnInit() {
    // 초기 렌더링 기록
    this.triggerRender();
  }

  /**
   * 렌더링을 트리거하고 성능 메트릭 기록
   * 렌더링 엔진이 실제로 DOM을 업데이트할 때 시간을 측정합니다
   */
  triggerRender() {
    const startTime = performance.now();

    // 렌더링을 강제로 트리거 (실제로는 변경 감지가 자동으로 수행)
    // 이 예제에서는 신호 변경으로 렌더링을 시뮬레이션
    this.renderCountValue.set(this.renderCountValue() + 1);

    // 렌더링이 완료될 때까지 대기
    requestAnimationFrame(() => {
      const endTime = performance.now();
      const renderTime = Math.round((endTime - startTime) * 100) / 100;

      this.lastRenderTimeValue.set(renderTime);

      // 렌더링 시간 기록
      const times = [...this.renderTimes()];
      times.push(renderTime);
      if (times.length > 20) times.shift(); // 최근 20개만 유지
      this.renderTimes.set(times);
    });
  }

  /**
   * 지표 초기화
   */
  resetMetrics() {
    this.renderCountValue.set(0);
    this.renderTimes.set([]);
    this.lastRenderTimeValue.set(0);
  }

  /**
   * 카운트 증가
   * 신호가 업데이트되면 Angular의 렌더링 엔진이 자동으로 DOM을 업데이트합니다
   */
  increment() {
    this.count.set(this.count() + 1);
  }

  /**
   * 카운트 감소
   */
  decrement() {
    this.count.set(this.count() - 1);
  }
}
