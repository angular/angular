/**
 * Root App Component
 *
 * Chapter 2 (Change Detection) - OnPush 전략
 * Chapter 5 (Compiler) - Standalone 컴포넌트
 * Chapter 8 (Router) - RouterOutlet 사용
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header.component';
import { FooterComponent } from './shared/components/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-container">
      <!-- Header -->
      <app-header />

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet />
      </main>

      <!-- Footer -->
      <app-footer />
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
    }
  `]
})
export class AppComponent {
  // Root component - 단순하고 깨끗하게 유지
  // 모든 로직은 feature components에서 처리
}
