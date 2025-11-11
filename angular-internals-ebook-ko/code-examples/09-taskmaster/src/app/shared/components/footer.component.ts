/**
 * Footer Component
 *
 * Chapter 2 (Change Detection) - OnPush 전략
 * Chapter 5 (Compiler) - Standalone 컴포넌트
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>TaskMaster</h3>
            <p class="text-muted">
              Angular 내부 구조를 모두 활용한<br>
              프로덕션급 할 일 관리 애플리케이션
            </p>
          </div>

          <div class="footer-section">
            <h4>기술 스택</h4>
            <ul class="tech-list">
              <li>✅ Signal 기반 상태 관리</li>
              <li>✅ OnPush 변경 감지</li>
              <li>✅ 플러그인 아키텍처</li>
              <li>✅ Lazy Loading</li>
              <li>✅ Zone.js 최적화</li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>학습 개념</h4>
            <ul class="tech-list">
              <li>Chapter 1: 의존성 주입</li>
              <li>Chapter 2: 변경 감지</li>
              <li>Chapter 3: 생명주기</li>
              <li>Chapter 4: 렌더링</li>
              <li>Chapter 5: 컴파일러</li>
              <li>Chapter 6: Zone.js</li>
              <li>Chapter 7: Signals</li>
              <li>Chapter 8: Router</li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>정보</h4>
            <p class="text-muted">
              버전: {{ version }}<br>
              빌드 날짜: {{ buildDate }}<br>
              © 2024 TaskMaster
            </p>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="text-muted">
            Angular 내부 구조 완전 정복 - 최종 통합 프로젝트
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: var(--text-primary);
      color: white;
      margin-top: 4rem;
      padding: 3rem 0 1rem;
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-section h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #667eea;
    }

    .footer-section h4 {
      font-size: 1rem;
      margin-bottom: 0.75rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .footer-section p {
      line-height: 1.8;
    }

    .tech-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .tech-list li {
      padding: 0.375rem 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
    }

    .footer-bottom {
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
    }

    .text-muted {
      color: rgba(255, 255, 255, 0.6);
    }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FooterComponent {
  readonly version = '1.0.0';
  readonly buildDate = new Date().toLocaleDateString('ko-KR');
}
