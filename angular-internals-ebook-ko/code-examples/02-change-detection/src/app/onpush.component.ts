import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, SimpleChanges, OnChanges, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * OnPush 변경 감지 전략을 사용하는 컴포넌트
 *
 * OnPush 전략의 특징:
 * - @Input 속성이 변경되었을 때만 확인
 * - 이벤트 리스너가 트리거되었을 때만 확인
 * - 옵저버블이 값을 emit할 때만 확인
 * - 더 나은 성능 (변경 감지 사이클이 덜 발생)
 */
@Component({
  selector: 'app-onpush',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-box">
      <h3>OnPush 전략 <span class="badge onpush">OnPush</span></h3>

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
        <strong>설명:</strong> OnPush 전략은 입력 속성 변경 또는 이벤트 발생 시에만 변경 감지를 실행합니다.
        많은 변경 감지 사이클 시간이 절약되므로 성능이 향상됩니다.
      </div>

      <h4 style="margin-top: 1rem; margin-bottom: 0.5rem;">입력 속성 테스트</h4>
      <p style="margin: 0.5rem 0; font-size: 0.9rem;">
        입력값: <strong>{{ inputValue }}</strong>
      </p>
      <p style="margin: 0; font-size: 0.8rem; color: #666;">
        (부모 컴포넌트에서 inputValue를 변경하면 여기서만 업데이트됩니다)
      </p>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class OnPushComponent implements OnChanges {
  // 부모 컴포넌트에서 전달받는 입력 속성
  @Input() inputValue: string = '';

  // 컴포넌트 상태
  count: number = 0;
  changeDetectionCount: number = 0;
  lastDetectionTime: string = '아직 없음';

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
    console.log('OnPush ngOnChanges 호출됨:', changes);
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
   * 변경 감지 정보 업데이트
   */
  private updateDetectionInfo() {
    this.changeDetectionCount++;
    this.lastDetectionTime = new Date().toLocaleTimeString('ko-KR');
    console.log(`OnPush 변경 감지: ${this.changeDetectionCount}회`);
  }

  /**
   * 변경 감지 모니터링 (Angular 내부 동작 확인용)
   */
  private monitorChangeDetection() {
    // ngZone을 사용하여 Angular 영역 밖에서 작업 감지
    const originalDetect = this.cdr.detectChanges.bind(this.cdr);

    (this.cdr as any).detectChanges = () => {
      console.log('OnPush detectChanges() 수동 호출');
      originalDetect();
    };
  }
}
