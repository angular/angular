import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, SimpleChanges, OnChanges, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Default 변경 감지 전략을 사용하는 컴포넌트
 *
 * Default 전략의 특징:
 * - 모든 변경 감지 이벤트에 대해 확인
 * - 타이머, 이벤트, HTTP 응답 등 모든 비동기 작업 후
 * - 브라우저 이벤트, 타이머 이벤트 등 모든 이벤트 후 실행
 * - OnPush보다 더 빈번한 변경 감지 (성능 오버헤드)
 */
@Component({
  selector: 'app-default',
  standalone: true,
  imports: [CommonModule],
  // 기본값이므로 명시적으로 지정하지 않아도 되지만, 비교를 위해 명시
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="demo-box">
      <h3>Default 전략 <span class="badge default">Default</span></h3>

      <div class="counter">
        <span class="counter-value">{{ count }}</span>
        <div class="button-group">
          <button (click)="increment()">증가</button>
          <button (click)="decrement()">감소</button>
        </div>
      </div>

      <div class="stats">
        <div class="stat-row">
          <span class="stat-label">현재 카운트:</span>
          <span class="stat-value">{{ count }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">변경 감지 횟수:</span>
          <span class="stat-value">{{ changeDetectionCount }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">마지막 감지 시간:</span>
          <span class="stat-value">{{ lastDetectionTime }}</span>
        </div>
      </div>

      <div class="note">
        <strong>설명:</strong> Default 전략은 모든 비동기 이벤트 후에 변경 감지를 실행합니다.
        OnPush보다 더 자주 실행되어 성능 오버헤드가 있습니다.
      </div>

      <h4 style="margin-top: 1rem; margin-bottom: 0.5rem;">비동기 타이머 테스트</h4>
      <button (click)="startAsyncTimer()">2초 타이머 시작</button>
      <p style="margin: 0.5rem 0; font-size: 0.9rem;" *ngIf="timerMessage">
        {{ timerMessage }}
      </p>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DefaultComponent implements OnChanges {
  // 부모 컴포넌트에서 전달받는 입력 속성
  @Input() inputValue: string = '';

  // 컴포넌트 상태
  count: number = 0;
  changeDetectionCount: number = 0;
  lastDetectionTime: string = '아직 없음';
  timerMessage: string = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    // 변경 감지 라이프사이클 훅 설정
    this.monitorChangeDetection();
  }

  /**
   * OnChanges 라이프사이클 훅: 입력 속성이 변경되었을 때 호출됨
   */
  ngOnChanges(changes: SimpleChanges) {
    console.log('Default ngOnChanges 호출됨:', changes);
    this.updateDetectionInfo();
  }

  /**
   * 카운트 증가
   */
  increment() {
    this.count++;
    this.updateDetectionInfo();
  }

  /**
   * 카운트 감소
   */
  decrement() {
    this.count--;
    this.updateDetectionInfo();
  }

  /**
   * 비동기 타이머 시작
   * Default 전략에서는 setTimeout 후에도 변경 감지가 실행됨
   */
  startAsyncTimer() {
    this.timerMessage = '타이머 실행 중...';
    this.updateDetectionInfo();

    // Zone 밖에서 타이머 시작 (변경 감지 트리거 안 함)
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        // Zone 다시 진입 (변경 감지 트리거)
        this.ngZone.run(() => {
          this.timerMessage = '타이머 완료! Default 전략은 이 시점에 변경 감지를 실행합니다.';
          this.updateDetectionInfo();
        });
      }, 2000);
    });
  }

  /**
   * 변경 감지 정보 업데이트
   */
  private updateDetectionInfo() {
    this.changeDetectionCount++;
    this.lastDetectionTime = new Date().toLocaleTimeString('ko-KR');
    console.log(`Default 변경 감지: ${this.changeDetectionCount}회`);
  }

  /**
   * 변경 감지 모니터링 (Angular 내부 동작 확인용)
   */
  private monitorChangeDetection() {
    const originalDetect = this.cdr.detectChanges.bind(this.cdr);

    (this.cdr as any).detectChanges = () => {
      console.log('Default detectChanges() 수동 호출');
      originalDetect();
    };
  }
}
