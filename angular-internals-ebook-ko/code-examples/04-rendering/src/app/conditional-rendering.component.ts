import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * 조건부 렌더링 컴포넌트
 *
 * Angular 18+의 @if, @else, @switch 제어 흐름을 시연합니다.
 *
 * 이전 방식(*ngIf, *ngSwitch)과 새로운 방식(@if, @switch)의 차이:
 * - 성능: 새로운 방식이 더 효율적
 * - 가독성: @if가 더 명확함
 * - 자식 템플릿: @else는 *ngElseIf와 달리 명확한 문법
 */
@Component({
  selector: 'app-conditional-rendering',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="subsection">
      <h3>@if / @else 조건부 렌더링</h3>

      <div class="controls">
        <label>
          상태 선택:
          <select [(ngModel)]="status">
            <option>loading</option>
            <option>success</option>
            <option>error</option>
            <option>empty</option>
          </select>
        </label>
      </div>

      <!-- @if / @else를 사용한 조건부 렌더링 -->
      <div class="render-demo">
        <h4>@if / @else 패턴</h4>

        @if (status === 'loading') {
          <div style="padding: 1rem; background: #e3f2fd; border-radius: 4px;">
            <strong>로딩 중...</strong>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">
              렌더링 엔진이 이 블록을 DOM에 추가합니다
            </p>
          </div>
        } @else if (status === 'success') {
          <div style="padding: 1rem; background: #e8f5e9; border-radius: 4px;">
            <strong>✓ 성공!</strong>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">
              데이터가 성공적으로 로드되었습니다
            </p>
          </div>
        } @else if (status === 'error') {
          <div style="padding: 1rem; background: #ffebee; border-radius: 4px;">
            <strong>✕ 오류 발생</strong>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">
              데이터 로드 중 오류가 발생했습니다
            </p>
          </div>
        } @else {
          <div style="padding: 1rem; background: #f5f5f5; border-radius: 4px;">
            <strong>데이터 없음</strong>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">
              표시할 데이터가 없습니다
            </p>
          </div>
        }
      </div>

      <p class="output">
        💡 <strong>@if의 장점:</strong>
        1) 더 명확한 문법 (@if는 HTML과 유사)
        2) 자동으로 else-if 체인 지원
        3) 템플릿 타입 체크 개선
        4) 성능 최적화 (LView 생성 최소화)
      </p>
    </div>

    <!-- @switch 섹션 -->
    <div class="subsection">
      <h3>@switch / @case 다중 조건 렌더링</h3>

      <div class="controls">
        <label>
          사용자 역할:
          <select [(ngModel)]="userRole">
            <option>guest</option>
            <option>user</option>
            <option>admin</option>
            <option>superadmin</option>
          </select>
        </label>
      </div>

      <div class="render-demo">
        <h4>@switch / @case 패턴</h4>

        @switch (userRole) {
          @case ('guest') {
            <div style="padding: 1rem; background: #f5f5f5; border-radius: 4px;">
              <strong>게스트</strong>
              <p style="font-size: 0.9rem; margin-top: 0.5rem;">
                제한된 기능만 사용 가능합니다. 가입하세요!
              </p>
              <button (click)="signUp()">가입하기</button>
            </div>
          }
          @case ('user') {
            <div style="padding: 1rem; background: #e3f2fd; border-radius: 4px;">
              <strong>일반 사용자</strong>
              <p style="font-size: 0.9rem; margin-top: 0.5rem;">
                모든 기능을 사용할 수 있습니다.
              </p>
              <button (click)="viewProfile()">프로필 보기</button>
            </div>
          }
          @case ('admin') {
            <div style="padding: 1rem; background: #fff3e0; border-radius: 4px;">
              <strong>관리자</strong>
              <p style="font-size: 0.9rem; margin-top: 0.5rem;">
                관리자 기능에 접근할 수 있습니다.
              </p>
              <button (click)="manageSite()">사이트 관리</button>
            </div>
          }
          @case ('superadmin') {
            <div style="padding: 1rem; background: #e8f5e9; border-radius: 4px;">
              <strong>슈퍼 관리자</strong>
              <p style="font-size: 0.9rem; margin-top: 0.5rem;">
                모든 권한을 가지고 있습니다.
              </p>
              <button (click)="manageSystem()">시스템 관리</button>
            </div>
          }
          @default {
            <div style="padding: 1rem; background: #ffebee; border-radius: 4px;">
              <strong>알 수 없는 역할</strong>
              <p style="font-size: 0.9rem; margin-top: 0.5rem;">
                유효하지 않은 역할입니다.
              </p>
            </div>
          }
        }
      </div>

      <p class="output">
        💡 <strong>@switch의 특징:</strong>
        1) 많은 조건을 명확하게 처리
        2) @default로 기본값 설정 가능
        3) 각 @case에 대해 별도의 LView 생성
        4) break 문이 필요 없음 (한 번만 실행)
      </p>
    </div>

    <!-- @for 루프 섹션 -->
    <div class="subsection">
      <h3>@for 루프와 조건부 렌더링 조합</h3>

      <div class="controls">
        <button (click)="addPriority()">우선순위 추가</button>
        <button (click)="removePriority()">우선순위 제거</button>
        <button (click)="clearPriorities()">모두 지우기</button>
      </div>

      <div class="render-demo">
        <h4>@for 루프 예제</h4>

        @if (priorities().length > 0) {
          <ul style="list-style: none; padding: 0;">
            @for (priority of priorities(); track priority.id) {
              <li style="padding: 0.75rem; margin: 0.5rem 0; background: #f9f9f9; border-left: 4px solid #dd0031; border-radius: 4px;">
                <strong>{{ priority.label }}</strong>
                <span class="badge" [ngClass]="{'badge success': priority.level > 7, 'badge warning': priority.level <= 7 && priority.level > 3, 'badge info': priority.level <= 3}">
                  레벨: {{ priority.level }}
                </span>
              </li>
            } @empty {
              <p style="color: #999;">우선순위가 없습니다</p>
            }
          </ul>
        } @else {
          <p style="color: #999; padding: 1rem; background: #f9f9f9; border-radius: 4px;">
            항목이 없습니다. 추가해보세요!
          </p>
        }
      </div>

      <p class="output">
        💡 <strong>@for의 특징:</strong>
        1) <code>*ngFor</code>를 대체하는 새로운 문법
        2) <code>track</code>은 <code>trackBy</code>와 동일 (필수)
        3) <code>@empty</code>로 빈 리스트 상태 처리 가능
        4) 인덱스 접근: <code>$index</code>, <code>$first</code>, <code>$last</code> 등 지원
      </p>
    </div>

    <!-- LView 구조 설명 -->
    <div class="subsection">
      <h3>조건부 렌더링과 LView</h3>
      <div class="lview-diagram">
        <code>
@if 조건부 렌더링의 LView 구조:

부모 LView:
├── [0] 부모 컴포넌트 데이터
├── [1] 부모 LView 참조
├── [2] ...
└── [n] 조건 값 (condition: boolean)

@if 블록 (조건이 true일 때만 생성):
├── [0] 자식 LView (부모 LView 참조 포함)
├── [1] 조건 검사 함수
├── [2] DOM 노드 참조
└── [3] ...

@else 블록 (조건이 false일 때만 생성):
└── ...

최적화:
- 조건이 false인 블록은 DOM에 생성되지 않음
- 메모리 절약 및 성능 향상
- 만약 조건이 변경되면, 기존 블록은 제거되고 새 블록이 생성됨
        </code>
      </div>
    </div>

    <!-- 성능 비교 -->
    <div class="subsection">
      <h3>*ngIf vs @if 성능 비교</h3>

      <div class="stats">
        <div class="stat-card">
          <h4>@if (신규)</h4>
          <ul style="list-style: none; padding: 0; margin-top: 0.5rem;">
            <li>✓ 더 빠른 컴파일</li>
            <li>✓ 더 작은 번들 크기</li>
            <li>✓ 더 명확한 문법</li>
          </ul>
        </div>
        <div class="stat-card">
          <h4>*ngIf (레거시)</h4>
          <ul style="list-style: none; padding: 0; margin-top: 0.5rem;">
            <li>• 더 복잡한 문법</li>
            <li>• 더 큰 LView 구조</li>
            <li>• 호환성 유지</li>
          </ul>
        </div>
      </div>

      <p class="output">
        💡 <strong>마이그레이션 권장사항:</strong>
        새 프로젝트는 @if를 사용하세요.
        기존 프로젝트의 경우 점진적으로 마이그레이션하는 것이 좋습니다.
      </p>
    </div>

    <!-- 실제 사용 예시 -->
    <div class="subsection">
      <h3>실제 사용 사례</h3>
      <ul class="rendering-list">
        <li>
          <span><strong>로딩 상태:</strong> @if 사용으로 로딩 UI 표시</span>
          <span class="badge success">권장</span>
        </li>
        <li>
          <span><strong>역할 기반 UI:</strong> @switch로 사용자 역할별 UI 표시</span>
          <span class="badge success">권장</span>
        </li>
        <li>
          <span><strong>데이터 리스트:</strong> @for와 @empty로 빈 상태 처리</span>
          <span class="badge success">권장</span>
        </li>
        <li>
          <span><strong>에러 처리:</strong> @if @else로 에러 메시지 표시</span>
          <span class="badge success">권장</span>
        </li>
      </ul>
    </div>

    <!-- 로깅 -->
    <div class="subsection" *ngIf="logs().length > 0">
      <h3>작업 로그</h3>
      <div class="output">
        <ul style="list-style: none; padding: 0;">
          <li *ngFor="let log of logs().slice(-5)">
            <small>{{ log.message }}</small>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    select {
      width: 200px;
    }
  `]
})
export class ConditionalRenderingComponent {
  // 상태 신호
  status = signal<'loading' | 'success' | 'error' | 'empty'>('loading');

  // 사용자 역할 신호
  userRole = signal<'guest' | 'user' | 'admin' | 'superadmin'>('guest');

  // 우선순위 신호
  private prioritiesData = signal<Array<{ id: number; label: string; level: number }>>([
    { id: 1, label: '매우 높음', level: 9 },
    { id: 2, label: '높음', level: 7 },
  ]);

  priorities = computed(() => this.prioritiesData());

  // 로깅
  private logsData = signal<Array<{ message: string }>>([]);
  logs = computed(() => this.logsData());

  private nextId = 3;

  /**
   * 우선순위 추가
   */
  addPriority() {
    const levels = [1, 3, 5, 7, 9];
    const labels = ['매우 낮음', '낮음', '중간', '높음', '매우 높음'];

    const randomIndex = Math.floor(Math.random() * levels.length);
    const newPriority = {
      id: this.nextId++,
      label: labels[randomIndex],
      level: levels[randomIndex],
    };

    this.prioritiesData.set([...this.priorities(), newPriority]);
    this.addLog(`우선순위 "${newPriority.label}" 추가됨`);
  }

  /**
   * 우선순위 제거
   */
  removePriority() {
    if (this.priorities().length > 0) {
      const removed = this.priorities()[this.priorities().length - 1];
      this.prioritiesData.set(this.priorities().slice(0, -1));
      this.addLog(`우선순위 "${removed.label}" 제거됨`);
    }
  }

  /**
   * 모두 지우기
   */
  clearPriorities() {
    this.prioritiesData.set([]);
    this.addLog('모든 우선순위가 지워졌습니다');
  }

  /**
   * 가입하기 액션
   */
  signUp() {
    this.addLog('가입 페이지로 이동...');
  }

  /**
   * 프로필 보기 액션
   */
  viewProfile() {
    this.addLog('프로필 페이지로 이동...');
  }

  /**
   * 사이트 관리 액션
   */
  manageSite() {
    this.addLog('관리 페이지로 이동...');
  }

  /**
   * 시스템 관리 액션
   */
  manageSystem() {
    this.addLog('시스템 관리 페이지로 이동...');
  }

  /**
   * 로그 추가
   */
  private addLog(message: string) {
    const logs = [...this.logs()];
    logs.push({ message });
    if (logs.length > 10) logs.shift();
    this.logsData.set(logs);
  }
}
