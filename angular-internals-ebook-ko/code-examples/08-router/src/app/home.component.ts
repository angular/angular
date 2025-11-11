// 홈 컴포넌트
// Angular 18+ 스탠드얼론 컴포넌트

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

/**
 * 홈 컴포넌트
 *
 * 애플리케이션의 홈 페이지를 표시합니다.
 * 라우팅의 기본 개념과 고급 기능을 소개합니다.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <h1>{{ title }}</h1>

      <div class="intro-section">
        <p>
          Angular 라우터는 싱글 페이지 애플리케이션(SPA)에서 다양한 뷰를 전환하는
          핵심 메커니즘입니다. 이 예제에서는 Angular 18+의 최신 라우팅 기능들을
          배워봅니다.
        </p>
      </div>

      <!-- 라우팅 기능 소개 -->
      <h2>주요 라우팅 기능</h2>
      <ul class="feature-list">
        <li>
          <strong>기본 라우팅:</strong> 다양한 컴포넌트 간 네비게이션
        </li>
        <li>
          <strong>매개변수 라우팅:</strong> URL 매개변수를 통한 동적 라우팅
        </li>
        <li>
          <strong>가드(Guards):</strong> 라우트 보호 및 접근 제어
        </li>
        <li>
          <strong>리졸버(Resolvers):</strong> 라우트 활성화 전 데이터 프리페칭
        </li>
        <li>
          <strong>지연 로드(Lazy Loading):</strong> 번들 크기 최적화
        </li>
        <li>
          <strong>중첩 라우트(Child Routes):</strong> 계층적 라우팅 구조
        </li>
      </ul>

      <!-- 네비게이션 예제 -->
      <h2>네비게이션 예제</h2>
      <div class="navigation-examples">
        <!-- 기본 라우팅 -->
        <div class="example-section">
          <h3>1. 기본 라우팅</h3>
          <p>간단한 페이지 간 이동입니다.</p>
          <a routerLink="/about" class="btn">소개 페이지로 이동</a>
        </div>

        <!-- 매개변수 라우팅 -->
        <div class="example-section">
          <h3>2. 매개변수 라우팅</h3>
          <p>URL에 매개변수를 포함하여 동적 콘텐츠를 로드합니다.</p>
          <div class="button-group">
            <a routerLink="/user/1" class="btn">사용자 1 프로필</a>
            <a routerLink="/user/2" class="btn">사용자 2 프로필</a>
            <a routerLink="/user/3" class="btn">사용자 3 프로필</a>
          </div>
        </div>

        <!-- 인증 가드 -->
        <div class="example-section">
          <h3>3. 인증 가드</h3>
          <p>인증되지 않은 사용자는 다음 페이지에 접근할 수 없습니다.</p>
          <div class="button-group">
            <a routerLink="/dashboard" class="btn">대시보드 (보호됨)</a>
            <a routerLink="/post/1" class="btn">게시물 (보호됨)</a>
          </div>
        </div>

        <!-- 지연 로드 -->
        <div class="example-section">
          <h3>4. 지연 로드</h3>
          <p>첫 방문 시에만 로드되어 초기 번들 크기를 줄입니다.</p>
          <div class="button-group">
            <a routerLink="/blog" class="btn">블로그 (지연 로드)</a>
            <a routerLink="/settings" class="btn">설정 (지연 로드)</a>
          </div>
        </div>
      </div>

      <!-- 코드 예제 -->
      <h2>라우팅 설정 예제</h2>
      <div class="code-example">
        <p>app.routes.ts의 기본 라우트 설정:</p>
        <pre><code>{{
          codeExample
        }}</code></pre>
      </div>

      <!-- 최근 라우팅 이력 -->
      <h2>라우팅 이벤트</h2>
      <div class="alert alert-info">
        <p>
          브라우저의 개발자 도구 콘솔을 열어보세요.
          라우트 변경 시 다양한 라우팅 이벤트가 로깅됩니다.
        </p>
      </div>

      <!-- 고급 개념 -->
      <h2>고급 라우팅 개념</h2>
      <div class="advanced-section">
        <h3>라우트 가드 (Route Guards)</h3>
        <p>
          가드는 특정 라우트에 대한 접근을 제어하는 메커니즘입니다.
          Angular 18+에서는 함수형 가드를 권장합니다.
        </p>

        <h3>데이터 프리페칭 (Data Preloading)</h3>
        <p>
          리졸버를 사용하여 라우트 활성화 전에 필요한 데이터를
          미리 로드할 수 있습니다. 사용자 경험을 향상시킵니다.
        </p>

        <h3>지연 로드 (Lazy Loading)</h3>
        <p>
          loadComponent()를 사용하여 필요할 때만 컴포넌트를 로드합니다.
          큰 애플리케이션에서 초기 로딩 시간을 크게 줄일 수 있습니다.
        </p>

        <h3>프리로딩 전략 (Preloading Strategy)</h3>
        <p>
          withPreloading()을 사용하여 백그라운드에서 지연 로드 모듈을
          프리로드할 수 있습니다. 사용자가 실제로 네비게이션할 때
          이미 로드된 상태가 되어 더 빠른 전환이 가능합니다.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .intro-section {
        background-color: #ecf0f1;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 2rem;
      }

      .feature-list {
        margin-left: 2rem;
        margin-bottom: 2rem;
      }

      .feature-list li {
        margin-bottom: 0.75rem;
        line-height: 1.6;
      }

      .feature-list strong {
        color: #2c3e50;
      }

      .navigation-examples {
        margin-bottom: 2rem;
      }

      .example-section {
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-left: 4px solid #3498db;
        margin-bottom: 1.5rem;
        border-radius: 4px;
      }

      .example-section h3 {
        color: #2c3e50;
        margin-top: 0;
        margin-bottom: 0.5rem;
      }

      .example-section p {
        margin-bottom: 1rem;
        color: #555;
      }

      .btn {
        display: inline-block;
        background-color: #3498db;
        color: white;
        padding: 0.75rem 1.5rem;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.3s ease;
        cursor: pointer;
        border: none;
        font-size: 0.95rem;
      }

      .btn:hover {
        background-color: #2980b9;
      }

      .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .code-example {
        background-color: #2c3e50;
        color: #ecf0f1;
        padding: 1.5rem;
        border-radius: 4px;
        margin-bottom: 2rem;
        overflow-x: auto;
      }

      .code-example p {
        margin-bottom: 1rem;
        color: #fff;
      }

      .code-example pre {
        background-color: transparent;
        color: #ecf0f1;
        padding: 0;
        border-radius: 0;
        margin: 0;
      }

      .code-example code {
        background-color: transparent;
        color: #ecf0f1;
        padding: 0;
      }

      .advanced-section {
        background-color: #f0f8ff;
        padding: 1.5rem;
        border-radius: 4px;
        border-left: 4px solid #9b59b6;
      }

      .advanced-section h3 {
        color: #2c3e50;
        margin-top: 1rem;
        margin-bottom: 0.5rem;
      }

      .advanced-section h3:first-child {
        margin-top: 0;
      }

      .advanced-section p {
        color: #555;
        margin-bottom: 1rem;
      }

      @media (max-width: 768px) {
        .button-group {
          flex-direction: column;
        }

        .btn {
          width: 100%;
          text-align: center;
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  // 페이지 제목
  title = '홈 페이지';

  // 코드 예제
  codeExample = `export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { title: '홈' }
  },
  {
    path: 'about',
    component: AboutComponent,
    data: { title: '소개' }
  },
  {
    path: 'user/:id',
    component: UserComponent,
    resolve: { user: userResolver }
  },
  {
    path: 'blog',
    loadComponent: () => import('./blog')
      .then(m => m.BlogComponent),
    canActivate: [authGuard]
  }
];`;

  constructor(private route: ActivatedRoute) {}

  /**
   * 컴포넌트 초기화
   *
   * 라우트 데이터에서 제목을 가져옵니다.
   */
  ngOnInit(): void {
    // 라우트 데이터에서 제목 설정
    this.route.data.subscribe((data) => {
      if (data['title']) {
        this.title = data['title'];
      }
      console.log('라우트 데이터:', data);
    });

    // 라우트 쿼리 매개변수 처리
    this.route.queryParams.subscribe((params) => {
      console.log('쿼리 매개변수:', params);
    });
  }
}
