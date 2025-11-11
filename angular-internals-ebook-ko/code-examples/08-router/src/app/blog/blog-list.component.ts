// 블로그 목록 컴포넌트
// 모든 블로그 포스트 목록 표시

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * 블로그 목록 컴포넌트
 *
 * 블로그 포스트 목록을 표시합니다.
 * 이것은 /blog 경로에서 렌더링되는 자식 라우트입니다.
 */
@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <h2>블로그 목록</h2>
      <p>다양한 블로그 포스트를 읽어보세요.</p>

      <div class="blog-list">
        <article *ngFor="let post of posts" class="blog-item">
          <h3>{{ post.title }}</h3>
          <p class="meta">
            작성자: {{ post.author }} | 작성일: {{ post.date }}
          </p>
          <p class="excerpt">{{ post.excerpt }}</p>
          <a [routerLink]="['/blog', post.id]" class="read-more">
            더 읽기 →
          </a>
        </article>
      </div>
    </div>
  `,
  styles: [
    `
      .blog-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
        margin-top: 2rem;
      }

      .blog-item {
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 4px;
        border-left: 4px solid #3498db;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .blog-item:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .blog-item h3 {
        margin-top: 0;
        color: #2c3e50;
      }

      .meta {
        color: #7f8c8d;
        font-size: 0.9rem;
        margin-bottom: 1rem;
      }

      .excerpt {
        color: #555;
        line-height: 1.6;
        margin-bottom: 1rem;
      }

      .read-more {
        color: #3498db;
        text-decoration: none;
        font-weight: bold;
        transition: color 0.2s ease;
      }

      .read-more:hover {
        color: #2980b9;
      }
    `,
  ],
})
export class BlogListComponent implements OnInit {
  // 블로그 포스트 목록
  posts: any[] = [];

  ngOnInit(): void {
    // 시뮬레이션 데이터
    this.posts = [
      {
        id: 1,
        title: 'Angular 라우팅 가이드',
        author: '홍길동',
        date: '2024-11-01',
        excerpt:
          'Angular의 라우팅 시스템에 대해 깊이 있게 알아봅니다. 기본 개념부터 고급 기법까지 다루고 있습니다.',
      },
      {
        id: 2,
        title: '성능 최적화 팁',
        author: '김철수',
        date: '2024-11-02',
        excerpt:
          'Angular 애플리케이션의 성능을 최적화하는 다양한 방법들을 소개합니다. 지연 로드, 변경 감지 최적화 등을 다룹니다.',
      },
      {
        id: 3,
        title: '테스트 작성하기',
        author: '이영희',
        date: '2024-11-03',
        excerpt:
          'Angular 컴포넌트와 서비스의 단위 테스트를 작성하는 방법을 배워봅니다. Jasmine과 Karma를 사용합니다.',
      },
      {
        id: 4,
        title: 'RxJS 패턴',
        author: '박민수',
        date: '2024-11-04',
        excerpt:
          'RxJS를 사용한 반응형 프로그래밍 패턴들을 소개합니다. Observable, Subject, 다양한 연산자들을 다룹니다.',
      },
    ];

    console.log('BlogListComponent 로드됨');
  }
}
