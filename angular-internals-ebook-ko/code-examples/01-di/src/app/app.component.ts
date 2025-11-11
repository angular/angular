import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PluginService } from './plugin-system/plugin.service';
import { ParentComponent } from './injector-hierarchy/parent.component';
import { ProviderExamplesComponent } from './provider-types/examples.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ParentComponent, ProviderExamplesComponent],
  template: `
    <h1>Angular 의존성 주입 (DI) 예제</h1>

    <div class="section">
      <h2>1. 플러그인 시스템 (Multi-Provider 패턴)</h2>
      <p>등록된 플러그인 수: <strong>{{ pluginCount }}</strong></p>

      <button (click)="executePlugins()">모든 플러그인 실행</button>

      <div *ngIf="pluginResults.length > 0" class="output">
        <h3>실행 결과:</h3>
        <ul class="plugin-list">
          <li *ngFor="let result of pluginResults">{{ result }}</li>
        </ul>
      </div>

      <p class="output">
        💡 <strong>개념:</strong> Multi-provider 패턴을 사용하면 동일한 토큰에 대해 여러 provider를 등록할 수 있습니다.
        이는 플러그인 아키텍처나 확장 가능한 시스템을 만들 때 유용합니다.
      </p>
    </div>

    <div class="section">
      <h2>2. 인젝터 계층 구조</h2>
      <app-parent></app-parent>
      <p class="output">
        💡 <strong>개념:</strong> Angular는 계층적 인젝터 시스템을 사용합니다.
        각 컴포넌트는 자체 인젝터를 가질 수 있으며, 의존성을 찾을 때 인젝터 트리를 따라 올라갑니다.
      </p>
    </div>

    <div class="section">
      <h2>3. Provider 타입들</h2>
      <app-provider-examples></app-provider-examples>
      <p class="output">
        💡 <strong>개념:</strong> Angular는 다양한 provider 타입을 지원합니다:
        - <code>useValue</code>: 정적 값
        - <code>useClass</code>: 클래스 인스턴스
        - <code>useFactory</code>: 팩토리 함수
        - <code>useExisting</code>: 기존 provider의 별칭
      </p>
    </div>

    <div class="section">
      <h2>학습 포인트</h2>
      <ul class="plugin-list">
        <li>✅ <code>providedIn: 'root'</code>는 루트 인젝터에 서비스를 등록합니다 (트리 셰이킹 가능)</li>
        <li>✅ <code>InjectionToken</code>은 클래스가 아닌 의존성을 주입할 때 사용합니다</li>
        <li>✅ Multi-provider (<code>multi: true</code>)는 여러 값을 배열로 제공합니다</li>
        <li>✅ 계층적 DI는 컴포넌트 트리를 따라 의존성을 해결합니다</li>
        <li>✅ <code>inject()</code> 함수는 생성자 주입의 대안입니다 (Angular 14+)</li>
      </ul>
    </div>

    <div class="section">
      <h2>소스 코드 참조</h2>
      <ul class="plugin-list">
        <li><code>packages/core/src/di/r3_injector.ts</code> - R3Injector 구현</li>
        <li><code>packages/core/src/di/injector.ts</code> - Injector 기본 클래스</li>
        <li><code>packages/core/src/di/injection_token.ts</code> - InjectionToken</li>
        <li><code>packages/core/src/render3/di.ts</code> - NodeInjector (컴포넌트 레벨)</li>
      </ul>
    </div>
  `
})
export class AppComponent {
  pluginResults: string[] = [];

  constructor(private pluginService: PluginService) {}

  get pluginCount(): number {
    return this.pluginService.getPluginCount();
  }

  executePlugins() {
    const testData = [
      { id: 1, name: '할 일 1', completed: false },
      { id: 2, name: '할 일 2', completed: true },
      { id: 3, name: '할 일 3', completed: false }
    ];

    this.pluginResults = this.pluginService.executeAll(testData);
  }
}
