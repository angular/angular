import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

// runOutsideAngular를 사용한 성능 최적화 예제
@Component({
  selector: 'app-outside-zone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h3>4.1 runOutsideAngular 개념</h3>
      <p>
        <span class="badge badge-success">변경 감지 발생</span>
        runOutsideAngular를 사용하면 Zone 외부에서 작업을 실행하여
        불필요한 변경 감지를 피할 수 있습니다.
      </p>

      <div class="btn-group">
        <button class="btn-primary" (click)="insideZoneTask()">
          Zone 내 작업 (변경 감지 O)
        </button>
        <button class="btn-accent" (click)="outsideZoneTask()">
          Zone 외 작업 (변경 감지 X)
        </button>
      </div>

      <div *ngIf="comparisonLog" class="result-box info">{{ comparisonLog }}</div>

      <h3>4.2 runOutsideAngular 실전 예제</h3>
      <p>마우스 이동 이벤트를 추적합니다 (고빈도 이벤트).</p>

      <div class="btn-group">
        <button class="btn-primary" (click)="startMouseTracking()">
          마우스 추적 시작 (Zone 내)
        </button>
        <button class="btn-accent" (click)="startMouseTrackingOutside()">
          마우스 추적 시작 (Zone 외)
        </button>
        <button class="btn-success" (click)="stopMouseTracking()">
          마우스 추적 중지
        </button>
      </div>

      <div class="metrics">
        <div class="metric-card">
          <div class="metric-card-label">마우스 이벤트 횟수</div>
          <div class="metric-card-value">{{ mouseEventCount }}</div>
          <div class="metric-card-unit">총 이벤트</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-label">변경 감지 횟수</div>
          <div class="metric-card-value">{{ changeDetectionCount }}</div>
          <div class="metric-card-unit">CD 실행 수</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-label">마우스 좌표</div>
          <div class="metric-card-value">{{ mouseX }}, {{ mouseY }}</div>
          <div class="metric-card-unit">px</div>
        </div>
      </div>

      <div *ngIf="mouseTrackingLog" class="result-box info">{{ mouseTrackingLog }}</div>

      <h3>4.3 runOutsideAngular로 감싸진 코드</h3>
      <p>다음 작업들은 Zone 외부에서 실행되어 성능을 최적화합니다:</p>

      <div class="checkbox-group">
        <label>
          <input type="checkbox" [checked]="isTrackingOutside" disabled />
          고빈도 DOM 업데이트 (마우스, 스크롤 이벤트)
        </label>
        <label>
          <input type="checkbox" [checked]="isTrackingOutside" disabled />
          애니메이션 프레임 (requestAnimationFrame)
        </label>
        <label>
          <input type="checkbox" [checked]="isTrackingOutside" disabled />
          WebSocket 메시지 (고속 통신)
        </label>
        <label>
          <input type="checkbox" [checked]="isTrackingOutside" disabled />
          타이머 기반 업데이트 (게임 루프 등)
        </label>
      </div>

      <h3>4.4 Zone 재진입 (runOutsideAngular 내에서 runInside)</h3>
      <div class="btn-group">
        <button class="btn-primary" (click)="nestingZoneExample()">
          Zone 재진입 예제 실행
        </button>
      </div>

      <div *ngIf="nestingLog" class="result-box info">{{ nestingLog }}</div>

      <h3>4.5 성능 비교</h3>
      <div class="btn-group">
        <button class="btn-primary" (click)="performanceComparison()">
          성능 비교 실행
        </button>
      </div>

      <div *ngIf="performanceLog" class="result-box info">{{ performanceLog }}</div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class OutsideZoneComponent {
  // 상태
  comparisonLog = '';
  mouseTrackingLog = '';
  nestingLog = '';
  performanceLog = '';

  // 마우스 추적
  mouseEventCount = 0;
  changeDetectionCount = 0;
  mouseX = 0;
  mouseY = 0;
  isTrackingOutside = false;

  private mouseTrackingActive = false;
  private changeDetectionListener?: () => void;

  constructor(private ngZone: NgZone) {}

  // ===== 4.1 기본 비교 =====

  insideZoneTask(): void {
    // Zone 내 작업: 변경 감지 트리거
    const startTime = performance.now();

    this.comparisonLog = `\n[Zone 내 작업]\n시작 시간: ${startTime.toFixed(2)}ms`;

    // 비동기 작업
    setTimeout(() => {
      const endTime = performance.now();
      this.comparisonLog += `\n완료 시간: ${endTime.toFixed(2)}ms\n변경 감지: 발생 (이 로그 업데이트)`;
    }, 100);
  }

  outsideZoneTask(): void {
    // Zone 외부 작업: 변경 감지 미트리거
    const startTime = performance.now();

    this.ngZone.runOutsideAngular(() => {
      this.comparisonLog = `\n[Zone 외 작업]\n시작 시간: ${startTime.toFixed(2)}ms`;

      setTimeout(() => {
        const endTime = performance.now();
        const log = `\n완료 시간: ${endTime.toFixed(2)}ms\n변경 감지: 미발생 (로그가 자동 업데이트되지 않음)`;

        // 마지막에만 Zone으로 돌아와서 UI 업데이트
        this.ngZone.run(() => {
          this.comparisonLog += log + '\n\n(ngZone.run()으로 수동 업데이트함)';
        });
      }, 100);
    });
  }

  // ===== 4.2 마우스 추적 =====

  startMouseTracking(): void {
    // Zone 내부에서 마우스 이벤트 추적 (변경 감지 발생)
    this.mouseTrackingLog = '\n[마우스 추적 시작 - Zone 내]\n';
    this.mouseEventCount = 0;
    this.changeDetectionCount = 0;
    this.mouseTrackingActive = true;
    this.isTrackingOutside = false;

    // 변경 감지 카운팅
    this.changeDetectionListener = () => {
      this.changeDetectionCount++;
    };
    this.ngZone.onStable.subscribe(this.changeDetectionListener);

    document.addEventListener('mousemove', this.handleMouseMove.bind(this));

    this.mouseTrackingLog += 'Zone 내부에서 mousemove 이벤트를 추적합니다.\n' +
      '각 마우스 이벤트마다 변경 감지가 실행됩니다.\n' +
      '성능이 저하될 수 있습니다.';
  }

  startMouseTrackingOutside(): void {
    // Zone 외부에서 마우스 이벤트 추적 (변경 감지 미발생)
    this.mouseTrackingLog = '\n[마우스 추적 시작 - Zone 외]\n';
    this.mouseEventCount = 0;
    this.changeDetectionCount = 0;
    this.mouseTrackingActive = true;
    this.isTrackingOutside = true;

    // 변경 감지 카운팅
    this.changeDetectionListener = () => {
      this.changeDetectionCount++;
    };
    this.ngZone.onStable.subscribe(this.changeDetectionListener);

    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.handleMouseMove.bind(this));

      this.mouseTrackingLog = '\n[마우스 추적 시작 - Zone 외]\n' +
        'Zone 외부에서 mousemove 이벤트를 추적합니다.\n' +
        '각 마우스 이벤트마다 변경 감지가 실행되지 않습니다.\n' +
        '마지막에 좌표가 한 번에 업데이트됩니다.\n' +
        '성능이 훨씬 좋습니다.';
    });
  }

  private handleMouseMove(event: MouseEvent): void {
    this.mouseEventCount++;
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    // Zone 외부에서 실행되었다면 UI 업데이트를 명시적으로 트리거
    if (this.isTrackingOutside && this.mouseEventCount % 50 === 0) {
      this.ngZone.run(() => {
        // UI 업데이트
      });
    }
  }

  stopMouseTracking(): void {
    this.mouseTrackingActive = false;

    if (this.changeDetectionListener) {
      this.ngZone.onStable.unsubscribe();
    }

    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));

    const summary = `\n추적 완료:\n` +
      `- 총 마우스 이벤트: ${this.mouseEventCount}\n` +
      `- 변경 감지 횟수: ${this.changeDetectionCount}\n` +
      `- 비율: ${((this.changeDetectionCount / Math.max(this.mouseEventCount, 1)) * 100).toFixed(2)}%\n\n` +
      `Zone 외부에서 추적 시 변경 감지 횟수가 훨씬 적습니다!`;

    this.mouseTrackingLog = summary;
  }

  // ===== 4.3은 이미 template에 표시됨 =====

  // ===== 4.4 Zone 재진입 =====

  nestingZoneExample(): void {
    this.nestingLog = '\n[Zone 재진입 예제]\n\n실행 흐름:';

    // 먼저 Zone 외부로
    this.ngZone.runOutsideAngular(() => {
      this.nestingLog += '\n1. Zone 외부 코드 실행';

      // Zone 외부 작업
      setTimeout(() => {
        this.nestingLog += '\n2. Zone 외부 setTimeout 콜백';

        // 다시 Zone으로 진입
        this.ngZone.run(() => {
          this.nestingLog += '\n3. ngZone.run()으로 Zone 재진입';
          this.nestingLog += '\n4. 변경 감지 트리거됨 (이 로그 업데이트)';

          // Zone 내 작업
          Promise.resolve().then(() => {
            this.nestingLog += '\n5. Zone 내 Promise 실행';
            this.nestingLog += '\n6. 변경 감지 자동 트리거';
          });
        });
      }, 100);
    });
  }

  // ===== 4.5 성능 비교 =====

  performanceComparison(): void {
    this.performanceLog = '\n[성능 비교 테스트]\n\n테스트 1: Zone 내부 (1000개 이벤트)\n실행 중...';

    const iterations = 1000;

    // 테스트 1: Zone 내부
    const startInside = performance.now();
    let cdCountInside = 0;

    const insideListener = () => {
      cdCountInside++;
    };
    const insideSubscription = this.ngZone.onStable.subscribe(insideListener);

    for (let i = 0; i < iterations; i++) {
      // Zone 내부에서 비동기 작업
      Promise.resolve().then(() => {
        // 작업
      });
    }

    setTimeout(() => {
      const endInside = performance.now();
      const durationInside = endInside - startInside;
      insideSubscription.unsubscribe();

      this.performanceLog += `\n- 소요 시간: ${durationInside.toFixed(2)}ms`;
      this.performanceLog += `\n- 변경 감지: ${cdCountInside}회`;

      // 테스트 2: Zone 외부
      this.performanceLog += `\n\n테스트 2: Zone 외부 (${iterations}개 이벤트)\n실행 중...`;

      const startOutside = performance.now();
      let cdCountOutside = 0;

      const outsideListener = () => {
        cdCountOutside++;
      };
      const outsideSubscription = this.ngZone.onStable.subscribe(outsideListener);

      this.ngZone.runOutsideAngular(() => {
        for (let i = 0; i < iterations; i++) {
          Promise.resolve().then(() => {
            // 작업
          });
        }
      });

      setTimeout(() => {
        const endOutside = performance.now();
        const durationOutside = endOutside - startOutside;
        outsideSubscription.unsubscribe();

        this.performanceLog += `\n- 소요 시간: ${durationOutside.toFixed(2)}ms`;
        this.performanceLog += `\n- 변경 감지: ${cdCountOutside}회`;

        // 결과
        const improvement = ((1 - durationOutside / durationInside) * 100).toFixed(2);
        this.performanceLog += `\n\n[결과]\n`;
        this.performanceLog += `- Zone 내부: ${durationInside.toFixed(2)}ms (CD: ${cdCountInside}회)\n`;
        this.performanceLog += `- Zone 외부: ${durationOutside.toFixed(2)}ms (CD: ${cdCountOutside}회)\n`;
        this.performanceLog += `- 성능 개선: ${improvement}%\n\n`;
        this.performanceLog += `runOutsideAngular를 사용하면 불필요한 변경 감지를 피할 수 있어\n`;
        this.performanceLog += `특히 고빈도 이벤트에서 성능이 크게 향상됩니다!`;
      }, 300);
    }, 300);
  }
}
