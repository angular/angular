// 소개 컴포넌트
// Angular 18+ 스탠드얼론 컴포넌트

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

/**
 * 소개 컴포넌트
 *
 * - 애플리케이션에 대한 정보 표시
 * - 라우트 매개변수 처리
 * - 리졸버 데이터 표시
 */
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <div class="header-section">
        <h1>{{ title }}</h1>
        <p class="description">{{ description }}</p>
      </div>

      <!-- 사용자 프로필 정보 (매개변수 라우팅) -->
      <div *ngIf="userId" class="info-section">
        <h2>사용자 프로필</h2>
        <div class="profile-info">
          <div class="info-item">
            <span class="label">사용자 ID:</span>
            <span class="value">{{ userId }}</span>
          </div>
          <div *ngIf="resolvedUser" class="info-item">
            <span class="label">이름:</span>
            <span class="value">{{ resolvedUser.name }}</span>
          </div>
          <div *ngIf="resolvedUser" class="info-item">
            <span class="label">이메일:</span>
            <span class="value">{{ resolvedUser.email }}</span>
          </div>
          <div *ngIf="resolvedUser" class="info-item">
            <span class="label">역할:</span>
            <span class="value">{{ resolvedUser.role }}</span>
          </div>
        </div>
        <button (click)="goBack()" class="btn-secondary">돌아가기</button>
      </div>

      <!-- 게시물 정보 (리졸버 데이터) -->
      <div *ngIf="resolvedPost" class="info-section">
        <h2>게시물 상세보기</h2>
        <div class="post-info">
          <div class="info-item">
            <span class="label">게시물 ID:</span>
            <span class="value">{{ resolvedPost.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">제목:</span>
            <span class="value">{{ resolvedPost.title }}</span>
          </div>
          <div class="info-item">
            <span class="label">내용:</span>
            <span class="value">{{ resolvedPost.content }}</span>
          </div>
          <div class="info-item">
            <span class="label">작성자:</span>
            <span class="value">{{ resolvedPost.author }}</span>
          </div>
          <div class="info-item">
            <span class="label">작성 일시:</span>
            <span class="value">{{ resolvedPost.createdAt | date: 'medium' }}</span>
          </div>
        </div>
        <button (click)="goBack()" class="btn-secondary">돌아가기</button>
      </div>

      <!-- 일반 소개 페이지 -->
      <div *ngIf="!userId && !resolvedPost" class="content-section">
        <h2>Angular 라우팅 소개</h2>

        <div class="section">
          <h3>라우팅이란?</h3>
          <p>
            라우팅은 싱글 페이지 애플리케이션(SPA)에서 다양한 컴포넌트를
            조건부로 표시하는 메커니즘입니다. 브라우저의 URL을 변경하지 않고도
            다양한 뷰를 전환할 수 있습니다.
          </p>
        </div>

        <div class="section">
          <h3>Angular 라우터의 핵심 개념</h3>
          <ul>
            <li>
              <strong>Routes:</strong> 라우트 구성을 정의하는 배열
            </li>
            <li>
              <strong>Router:</strong> 라우트 네비게이션을 관리하는 서비스
            </li>
            <li>
              <strong>RouterOutlet:</strong> 라우트된 컴포넌트를 렌더링하는 지점
            </li>
            <li>
              <strong>RouterLink:</strong> 프로그래밍 없이 라우트 간 네비게이션
            </li>
            <li>
              <strong>ActivatedRoute:</strong> 현재 라우트 정보에 접근
            </li>
          </ul>
        </div>

        <div class="section">
          <h3>라우팅 장점</h3>
          <ul>
            <li>빠른 페이지 전환 (서버 요청 불필요)</li>
            <li>상태 유지 (URL 기반 상태 관리)</li>
            <li>뒤로가기/앞으로 가기 지원</li>
            <li>북마크 가능</li>
            <li>SEO 최적화 가능 (프리렌더링 사용 시)</li>
          </ul>
        </div>

        <div class="section">
          <h3>라우팅 vs 페이지 새로고침</h3>
          <table>
            <thead>
              <tr>
                <th>특성</th>
                <th>라우팅 (SPA)</th>
                <th>페이지 새로고침</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>속도</td>
                <td>매우 빠름</td>
                <td>느림</td>
              </tr>
              <tr>
                <td>서버 요청</td>
                <td>필요 시에만</td>
                <td>매번</td>
              </tr>
              <tr>
                <td>상태 유지</td>
                <td>가능</td>
                <td>불가능</td>
              </tr>
              <tr>
                <td>UX</td>
                <td>매끄러움</td>
                <td>끊김</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3>Angular 18+ 라우팅 개선사항</h3>
          <ul>
            <li>
              <strong>함수형 API:</strong> 클래스 기반 가드 대신 함수형 가드 사용
            </li>
            <li>
              <strong>스탠드얼론 컴포넌트:</strong> NgModule 없이 라우팅 구성
            </li>
            <li>
              <strong>ResolveFn:</strong> 함수형 리졸버 지원
            </li>
            <li>
              <strong>동적 라우트 프리페칭:</strong> 더 정확한 프리로딩 전략
            </li>
          </ul>
        </div>

        <div class="alert alert-info">
          <h4>학습 팁</h4>
          <p>
            이 예제의 네비게이션을 통해 다양한 라우팅 기능을 직접 체험해보세요.
            각 페이지에서 라우트 변경이 어떻게 작동하는지 콘솔을 보면서 확인할 수
            있습니다.
          </p>
        </div>

        <div class="navigation-buttons">
          <a routerLink="/" class="btn">홈으로 돌아가기</a>
          <a routerLink="/user/1" class="btn">사용자 프로필 보기</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .header-section {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #ecf0f1;
      }

      .description {
        color: #7f8c8d;
        font-style: italic;
        margin-bottom: 0;
      }

      .info-section {
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 4px;
        margin-bottom: 2rem;
      }

      .profile-info,
      .post-info {
        margin: 1rem 0;
      }

      .info-item {
        display: flex;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #ecf0f1;
      }

      .label {
        font-weight: bold;
        width: 120px;
        color: #2c3e50;
      }

      .value {
        color: #555;
        flex: 1;
      }

      .content-section {
        padding-top: 1rem;
      }

      .section {
        margin-bottom: 2rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }

      .section h3 {
        color: #2c3e50;
        margin-top: 0;
        margin-bottom: 1rem;
      }

      .section ul {
        margin-left: 1.5rem;
      }

      .section li {
        margin-bottom: 0.75rem;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }

      th,
      td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }

      th {
        background-color: #34495e;
        color: white;
        font-weight: bold;
      }

      tr:hover {
        background-color: #ecf0f1;
      }

      .alert {
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
      }

      .alert h4 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }

      .alert-info {
        background-color: #d6eaf8;
        color: #2980b9;
        border-left: 4px solid #2980b9;
      }

      .navigation-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
        flex-wrap: wrap;
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
      }

      .btn:hover {
        background-color: #2980b9;
      }

      .btn-secondary {
        background-color: #95a5a6;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        margin-top: 1rem;
      }

      .btn-secondary:hover {
        background-color: #7f8c8d;
      }
    `,
  ],
})
export class AboutComponent implements OnInit {
  // 페이지 제목
  title = '소개';
  description = 'Angular 라우팅에 대해 알아봅시다.';

  // 라우트 매개변수
  userId: string | null = null;

  // 리졸버 데이터
  resolvedUser: any = null;
  resolvedPost: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * 컴포넌트 초기화
   *
   * - 라우트 매개변수 처리
   * - 리졸버 데이터 접근
   * - 라우트 데이터 설정
   */
  ngOnInit(): void {
    // 라우트 매개변수 처리 (예: /user/:id)
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.userId = params['id'];
        console.log(`사용자 ID: ${this.userId}`);
      }
    });

    // 리졸버 데이터 접근
    this.route.data.subscribe((data) => {
      // 리졸버에서 제공하는 사용자 데이터
      if (data['user']) {
        this.resolvedUser = data['user'];
        console.log('리졸버에서 받은 사용자 데이터:', this.resolvedUser);
      }

      // 리졸버에서 제공하는 게시물 데이터
      if (data['post']) {
        this.resolvedPost = data['post'];
        console.log('리졸버에서 받은 게시물 데이터:', this.resolvedPost);
      }

      // 라우트 메타데이터 설정
      if (data['title']) {
        this.title = data['title'];
      }

      console.log('라우트 데이터:', data);
    });

    // 라우트 설정 정보 출력
    console.log('현재 라우트:', this.route);
  }

  /**
   * 뒤로가기
   */
  goBack(): void {
    this.router.navigate(['/']);
  }
}
