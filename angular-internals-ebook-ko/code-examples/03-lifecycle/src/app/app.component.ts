// App 컴포넌트 - 전체 라이프사이클 예제를 관리하는 메인 컴포넌트
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LifecycleDemoComponent } from './lifecycle-demo.component';
import { ParentComponent } from './parent.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LifecycleDemoComponent,
    ParentComponent,
  ],
  template: `
    <div class="container">
      <!-- 헤더 -->
      <h1>Angular 컴포넌트 라이프사이클 (Lifecycle Hooks)</h1>

      <!-- 개요 카드 -->
      <div class="card primary">
        <h2>라이프사이클 훅이란?</h2>
        <p>
          Angular 컴포넌트는 생성부터 제거될 때까지 다양한 라이프사이클 단계를 거칩니다.
          각 단계에서 특정 메서드를 호출하여 컴포넌트의 초기화, 변경 감지, 뷰 업데이트 등을 제어할 수 있습니다.
        </p>
      </div>

      <!-- 라이프사이클 순서 설명 -->
      <div class="card info">
        <h2>8가지 라이프사이클 훅 (실행 순서)</h2>
        <ol>
          <li><strong>ngOnChanges:</strong> @Input 속성이 변경될 때 (초기화 시에도 호출)</li>
          <li><strong>ngOnInit:</strong> 컴포넌트가 초기화될 때 (한 번만 호출)</li>
          <li><strong>ngDoCheck:</strong> 변경 감지 실행마다 호출 (매우 자주)</li>
          <li><strong>ngAfterContentInit:</strong> 컴포넌트 콘텐츠 초기화 완료 후</li>
          <li><strong>ngAfterContentChecked:</strong> 프로젝션된 콘텐츠 검사 후 (매우 자주)</li>
          <li><strong>ngAfterViewInit:</strong> 컴포넌트 뷰 초기화 완료 후</li>
          <li><strong>ngAfterViewChecked:</strong> 컴포넌트 뷰 검사 후 (매우 자주)</li>
          <li><strong>ngOnDestroy:</strong> 컴포넌트가 제거될 때 (한 번만 호출)</li>
        </ol>
      </div>

      <!-- 데모 섹션 -->
      <div class="grid">
        <!-- 라이프사이클 데모 -->
        <div class="card secondary">
          <h2>기본 라이프사이클 훅 데모</h2>
          <p class="info-box">
            <strong>설명:</strong> 모든 라이프사이클 훅을 구현한 컴포넌트입니다.
            각 훅이 호출될 때마다 콘솔에 메시지가 출력되고 아래 로그에 표시됩니다.
          </p>
          <app-lifecycle-demo></app-lifecycle-demo>
        </div>

        <!-- 부모-자식 컴포넌트 관계 -->
        <div class="card warning">
          <h2>부모-자식 컴포넌트 라이프사이클</h2>
          <p class="info-box">
            <strong>설명:</strong> 부모 컴포넌트와 자식 컴포넌트의 라이프사이클이
            어떤 순서로 실행되는지 확인할 수 있습니다.
          </p>
          <app-parent></app-parent>
        </div>
      </div>

      <!-- 추가 정보 -->
      <div class="card success">
        <h2>실행 주기별 분류</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
          <div>
            <h3>한 번만 실행</h3>
            <ul>
              <li>ngOnInit - 초기화</li>
              <li>ngAfterViewInit - 뷰 초기화 완료</li>
              <li>ngAfterContentInit - 콘텐츠 초기화 완료</li>
              <li>ngOnDestroy - 컴포넌트 제거</li>
            </ul>
          </div>
          <div>
            <h3>여러 번 실행</h3>
            <ul>
              <li>ngOnChanges - @Input 변경 시</li>
              <li>ngDoCheck - 변경 감지 실행 시</li>
              <li>ngAfterContentChecked - 콘텐츠 검사 시</li>
              <li>ngAfterViewChecked - 뷰 검사 시</li>
            </ul>
          </div>
          <div>
            <h3>실행 빈도</h3>
            <ul>
              <li>매우 자주 실행됨: ngDoCheck, ngAfterContentChecked, ngAfterViewChecked</li>
              <li>성능 주의: 이 메서드들에서는 무거운 작업을 하지 않아야 함</li>
              <li>권장: ngOnInit에서 초기화 작업 수행</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 실전 팁 -->
      <div class="card danger">
        <h2>라이프사이클 훅 사용 시 주의사항</h2>
        <ul>
          <li>
            <strong>ngDoCheck, ngAfterContentChecked, ngAfterViewChecked:</strong>
            이 메서드들은 변경 감지가 실행될 때마다 호출됩니다.
            따라서 복잡한 로직이나 API 호출 같은 무거운 작업을 하면 성능이 저하됩니다.
          </li>
          <li>
            <strong>ngOnInit 활용:</strong>
            대부분의 초기화 작업은 ngOnInit에서 수행하는 것이 좋습니다.
          </li>
          <li>
            <strong>ngOnDestroy에서 정리:</strong>
            타이머, 이벤트 리스너, Observable 구독 등은 ngOnDestroy에서 반드시 정리해야 메모리 누수를 방지할 수 있습니다.
          </li>
          <li>
            <strong>@Input 변경 감지:</strong>
            @Input 속성의 변경을 감지하려면 ngOnChanges를 사용합니다.
          </li>
          <li>
            <strong>ViewChild/@ContentChild:</strong>
            ViewChild와 ContentChild를 사용하려면 ngAfterViewInit 또는 ngAfterContentInit 이후에만 접근 가능합니다.
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 16px;
      border-radius: 4px;
      margin: 16px 0;
    }

    .info-box strong {
      color: #1565c0;
    }
  `],
})
export class AppComponent {
  // 이 컴포넌트는 라이프사이클 훅을 시연하지 않고
  // 다른 컴포넌트들의 라이프사이클 훅을 보여주는 컨테이너 역할을 합니다.
}
