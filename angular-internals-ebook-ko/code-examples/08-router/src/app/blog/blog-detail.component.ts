// 블로그 상세 컴포넌트
// 특정 블로그 포스트 상세보기

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

/**
 * 블로그 상세 컴포넌트
 *
 * 특정 블로그 포스트의 상세 내용을 표시합니다.
 * 이것은 /blog/:id 경로에서 렌더링되는 자식 라우트입니다.
 * postResolver에 의해 데이터가 미리 로드됩니다.
 */
@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div *ngIf="post" class="post-detail">
      <div class="post-header">
        <h2>{{ post.title }}</h2>
        <div class="post-meta">
          <span class="author">작성자: {{ post.author }}</span>
          <span class="date">{{ post.createdAt | date: 'short' }}</span>
        </div>
      </div>

      <div class="post-content">
        <p>{{ post.content }}</p>

        <div class="post-body">
          <h3>포스트 상세 내용</h3>
          <p>
            이 포스트는 리졸버(postResolver)에 의해 미리 로드되었습니다.
            라우트 활성화 전에 필요한 데이터가 모두 로드되었으므로
            로딩 화면 없이 바로 콘텐츠를 볼 수 있습니다.
          </p>

          <h4>리졸버의 이점</h4>
          <ul>
            <li>라우트 활성화 전에 데이터를 로드하므로 깜빡거림이 없음</li>
            <li>데이터 준비가 완료된 후에야 컴포넌트가 렌더링됨</li>
            <li>에러 처리를 중앙에서 할 수 있음</li>
            <li>사용자 경험 개선</li>
          </ul>

          <h4>관련 포스트</h4>
          <ul>
            <li>
              <a routerLink="/blog/2">성능 최적화 팁</a>
            </li>
            <li>
              <a routerLink="/blog/3">테스트 작성하기</a>
            </li>
            <li>
              <a routerLink="/blog/4">RxJS 패턴</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="post-navigation">
        <button (click)="goBack()" class="btn-back">← 목록으로 돌아가기</button>
      </div>
    </div>

    <div *ngIf="!post" class="loading">
      <p>포스트를 로드 중입니다...</p>
    </div>
  `,
  styles: [
    `
      .post-detail {
        background-color: white;
        padding: 2rem;
        border-radius: 4px;
      }

      .post-header {
        border-bottom: 2px solid #ecf0f1;
        padding-bottom: 1.5rem;
        margin-bottom: 2rem;
      }

      .post-header h2 {
        margin-top: 0;
        color: #2c3e50;
      }

      .post-meta {
        display: flex;
        gap: 2rem;
        color: #7f8c8d;
        font-size: 0.9rem;
      }

      .post-content {
        margin-bottom: 2rem;
      }

      .post-body {
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 4px;
        margin-top: 1.5rem;
      }

      .post-body h3,
      .post-body h4 {
        color: #2c3e50;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
      }

      .post-body h3:first-child,
      .post-body h4:first-child {
        margin-top: 0;
      }

      .post-body ul {
        margin-left: 1.5rem;
      }

      .post-body li {
        margin-bottom: 0.5rem;
      }

      .post-body a {
        color: #3498db;
        text-decoration: none;
      }

      .post-body a:hover {
        text-decoration: underline;
      }

      .post-navigation {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #ecf0f1;
      }

      .btn-back {
        background-color: #95a5a6;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }

      .btn-back:hover {
        background-color: #7f8c8d;
      }

      .loading {
        text-align: center;
        padding: 2rem;
        color: #7f8c8d;
      }
    `,
  ],
})
export class BlogDetailComponent implements OnInit {
  // 블로그 포스트 데이터
  post: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * 컴포넌트 초기화
   *
   * 리졸버에서 가져온 포스트 데이터를 표시합니다.
   */
  ngOnInit(): void {
    // 리졸버에서 제공하는 포스트 데이터
    this.route.data.subscribe((data) => {
      if (data['post']) {
        this.post = data['post'];
        console.log('리졸버에서 받은 포스트 데이터:', this.post);
      }
    });

    // 라우트 매개변수 로깅
    this.route.params.subscribe((params) => {
      console.log(`블로그 포스트 #${params['id']} 열기`);
    });
  }

  /**
   * 블로그 목록으로 돌아가기
   */
  goBack(): void {
    this.router.navigate(['/blog']);
  }
}
