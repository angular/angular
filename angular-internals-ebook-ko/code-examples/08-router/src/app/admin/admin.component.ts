// 관리자 컴포넌트
// 지연 로드되는 관리자 기능 모듈

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * 관리자 컴포넌트
 *
 * 이 컴포넌트는 app.routes.ts에서 loadComponent()를 통해 지연 로드됩니다.
 * 번들 초기 크기를 줄이기 위해 필요할 때만 로드됩니다.
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <h1>관리자 대시보드</h1>
      <p>
        이 페이지는 지연 로드(Lazy Loading)되었습니다.
        처음 방문할 때만 번들에서 로드됩니다.
      </p>

      <h2>관리자 기능</h2>
      <ul>
        <li>사용자 관리</li>
        <li>콘텐츠 관리</li>
        <li>시스템 설정</li>
        <li>분석 및 보고</li>
      </ul>

      <div class="alert alert-info">
        <p>
          RoleGuard에 의해 보호되어 있습니다.
          현재는 시뮬레이션 환경이므로 누구나 접근할 수 있습니다.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .alert {
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
      }

      .alert-info {
        background-color: #d6eaf8;
        color: #2980b9;
        border-left: 4px solid #2980b9;
      }
    `,
  ],
})
export class AdminComponent {
  constructor() {
    console.log('AdminComponent 로드됨 (지연 로드)');
  }
}
