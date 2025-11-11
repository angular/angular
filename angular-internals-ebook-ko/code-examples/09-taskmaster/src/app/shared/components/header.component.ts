/**
 * Header Component
 *
 * Chapter 2 (Change Detection) - OnPush 전략
 * Chapter 8 (Router) - RouterLink를 사용한 네비게이션
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TaskState } from '../../core/state/task.state';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <h1>📋 TaskMaster</h1>
            <span class="tagline">할 일 관리</span>
          </div>

          <nav class="nav">
            <a
              routerLink="/tasks"
              routerLinkActive="active"
              class="nav-link"
            >
              <span class="nav-icon">📝</span>
              작업
              @if (stats().active > 0) {
                <span class="badge badge-primary">{{ stats().active }}</span>
              }
            </a>
            <a
              routerLink="/analytics"
              routerLinkActive="active"
              class="nav-link"
            >
              <span class="nav-icon">📊</span>
              분석
            </a>
            <a
              routerLink="/settings"
              routerLinkActive="active"
              class="nav-link"
            >
              <span class="nav-icon">⚙️</span>
              설정
            </a>
          </nav>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: var(--shadow-md);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      gap: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo h1 {
      font-size: 1.5rem;
      margin: 0;
    }

    .tagline {
      font-size: 0.875rem;
      opacity: 0.9;
      font-weight: 400;
    }

    .nav {
      display: flex;
      gap: 0.5rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      border-radius: 0.5rem;
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
      position: relative;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .nav-link.active {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .nav-icon {
      font-size: 1.25rem;
    }

    .badge {
      margin-left: 0.25rem;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .logo {
        justify-content: center;
      }

      .nav {
        justify-content: center;
      }

      .tagline {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  // Signal에서 직접 읽기 - OnPush와 완벽하게 작동
  stats = this.taskState.stats;

  constructor(private taskState: TaskState) {}
}
