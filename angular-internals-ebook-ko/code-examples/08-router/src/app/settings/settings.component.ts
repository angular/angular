// 설정 컴포넌트
// 지연 로드되는 사용자 설정 모듈

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * 설정 컴포넌트
 *
 * 이 컴포넌트는 app.routes.ts에서 loadComponent()를 통해 지연 로드됩니다.
 * AuthGuard에 의해 보호되어 있어 인증된 사용자만 접근할 수 있습니다.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <h1>설정</h1>
      <p>
        이 페이지는 지연 로드(Lazy Loading)되었습니다.
        인증된 사용자만 접근할 수 있습니다.
      </p>

      <h2>사용자 설정</h2>

      <div class="settings-section">
        <h3>프로필 설정</h3>
        <ul>
          <li>사용자 정보 수정</li>
          <li>비밀번호 변경</li>
          <li>프로필 사진 변경</li>
        </ul>
      </div>

      <div class="settings-section">
        <h3>알림 설정</h3>
        <ul>
          <li>이메일 알림</li>
          <li>푸시 알림</li>
          <li>알림 빈도 설정</li>
        </ul>
      </div>

      <div class="settings-section">
        <h3>개인정보 설정</h3>
        <ul>
          <li>개인정보 공개 범위</li>
          <li>데이터 수집 동의</li>
          <li>계정 삭제</li>
        </ul>
      </div>

      <div class="alert alert-success">
        <p>
          이 페이지는 인증 가드(AuthGuard)에 의해 보호되고 있습니다.
          로그인하지 않으면 접근할 수 없습니다.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-section {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1.5rem;
        border-left: 4px solid #3498db;
      }

      .settings-section h3 {
        color: #2c3e50;
        margin-top: 0;
        margin-bottom: 0.75rem;
      }

      .settings-section ul {
        margin-left: 1.5rem;
        margin-bottom: 0;
      }

      .settings-section li {
        margin-bottom: 0.5rem;
      }

      .alert {
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
      }

      .alert-success {
        background-color: #d5f4e6;
        color: #27ae60;
        border-left: 4px solid #27ae60;
      }
    `,
  ],
})
export class SettingsComponent {
  constructor() {
    console.log('SettingsComponent 로드됨 (지연 로드)');
  }
}
