// 블로그 레이아웃 컴포넌트
// 중첩 라우트의 부모 컴포넌트

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * 블로그 컴포넌트
 *
 * 블로그 섹션의 부모 컴포넌트입니다.
 * 자식 라우트(블로그 목록, 상세보기)를 호스팅합니다.
 */
@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <h1>블로그</h1>
      <p>
        이것은 중첩 라우트(Child Routes) 예제입니다.
        부모 컴포넌트에서 자식 컴포넌트를 렌더링합니다.
      </p>

      <!-- 자식 라우터 아웃렛 -->
      <router-outlet></router-outlet>
    </div>
  `,
})
export class BlogComponent {
  constructor() {
    console.log('BlogComponent 로드됨 (지연 로드)');
  }
}
