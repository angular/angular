import { Component, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

// Zone.js를 이용한 성능 최적화 실전 예제
@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h3>5.1 고빈도 이벤트 최적화</h3>
      <p>스크롤, 마우스, 터치 이벤트 등은 매우 높은 빈도로 발생합니다.</p>

      <div class="btn-group">
        <button class="btn-primary" (click)="startScrollTracking('inside')">
          스크롤 추적 (Zone 내)
        </button>
        <button class="btn-accent" (click)="startScrollTracking('outside')">
          스크롤 추적 (Zone 외)
        </button>
        <button class="btn-success" (click)="stopScrollTracking()">
          추적 중지
        </button>
      </div>

      <div class="metrics">
        <div class="metric-card">
          <div class="metric-card-label">스크롤 이벤트</div>
          <div class="metric-card-value">{{ scrollEventCount }}</div>
          <div class="metric-card-unit">총 이벤트</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-label">변경 감지</div>
          <div class="metric-card-value">{{ changeDetectionCount }}</div>
          <div class="metric-card-unit">총 실행</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-label">효율성</div>
          <div class="metric-card-value">{{ efficiency }}%</div>
          <div class="metric-card-unit">CD 최소화</div>
        </div>
      </div>

      <div *ngIf="scrollLog" class="result-box info">{{ scrollLog }}</div>

      <h3>5.2 requestAnimationFrame (RAF) 최적화</h3>
      <p>
        RAF는 브라우저 리페인트 사이클과 동기화되어 부드러운 애니메이션을 제공합니다.
        Zone 외부에서 실행하면 성능이 향상됩니다.
      </p>

      <div class="btn-group">
        <button class="btn-primary" (click)="startAnimationInside()">
          애니메이션 시작 (Zone 내)
        </button>
        <button class="btn-accent" (click)="startAnimationOutside()">
          애니메이션 시작 (Zone 외)
        </button>
        <button class="btn-success" (click)="stopAnimation()">
          애니메이션 중지
        </button>
      </div>

      <div class="metrics">
        <div class="metric-card">
          <div class="metric-card-label">프레임 수</div>
          <div class="metric-card-value">{{ frameCount }}</div>
          <div class="metric-card-unit">총 프레임</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-label">CD 횟수</div>
          <div class="metric-card-value">{{ animationCDCount }}</div>
          <div class="metric-card-unit">변경 감지</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-label">효율성</div>
          <div class="metric-card-value">{{ rafEfficiency }}%</div>
          <div class="metric-card-unit">최적화율</div>
        </div>
      </div>

      <div *ngIf="animationLog" class="result-box info">{{ animationLog }}</div>

      <h3>5.3 타이머 기반 업데이트 최적화</h3>
      <p>
        게임 루프, 실시간 대시보드 등에서 사용되는 setInterval과 setTimeout을
        Zone 외부에서 실행하여 최적화합니다.
      </p>

      <div class="btn-group">
        <button class="btn-primary" (click)="startTimerInside()">
          타이머 시작 (Zone 내) - 100ms
        </button>
        <button class="btn-accent" (click)="startTimerOutside()">
          타이머 시작 (Zone 외) - 100ms
        </button>
        <button class="btn-success" (click)="stopTimer()">
          타이머 중지
        </button>
      </div>

      <div class="metrics">
        <div class="metric-card">
          <div class="metric-card-label">타이머 틱</div>
          <div class="metric-card-value">{{ timerTicks }}</div>
          <div class="metric-card-unit">총 틱</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-label">CD 횟수</div>
          <div class="metric-card-value">{{ timerCDCount }}</div>
          <div class="metric-card-unit">변경 감지</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-label">CD 비율</div>
          <div class="metric-card-value">{{ timerCDRatio }}%</div>
          <div class="metric-card-unit">CD/틱</div>
        </div>
      </div>

      <div *ngIf="timerLog" class="result-box info">{{ timerLog }}</div>

      <h3>5.4 WebSocket/Server-Sent Events 최적화</h3>
      <p>
        실시간 데이터 스트림은 빠른 속도로 메시지를 받습니다.
        Zone 외부에서 수신하고 필요할 때만 UI 업데이트합니다.
      </p>

      <div class="btn-group">
        <button class="btn-primary" (click)="simulateWebSocketInside()">
          메시지 수신 시뮬레이션 (Zone 내)
        </button>
        <button class="btn-accent" (click)="simulateWebSocketOutside()">
          메시지 수신 시뮬레이션 (Zone 외)
        </button>
      </div>

      <div class="metrics">
        <div class="metric-card">
          <div class="metric-card-label">수신 메시지</div>
          <div class="metric-card-value">{{ messageCount }}</div>
          <div class="metric-card-unit">총 메시지</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-label">CD 횟수</div>
          <div class="metric-card-value">{{ messageCDCount }}</div>
          <div class="metric-card-unit">변경 감지</div>
        </div>
        <div class="metric-card">
          <div class="metric-card-label">절감</div>
          <div class="metric-card-value">{{ messageCDSavings }}%</div>
          <div class="metric-card-unit">CD 감소</div>
        </div>
      </div>

      <div *ngIf="websocketLog" class="result-box info">{{ websocketLog }}</div>

      <h3>5.5 성능 최적화 Best Practices</h3>
      <table>
        <tr>
          <th>시나리오</th>
          <th>권장사항</th>
          <th>성능 개선</th>
        </tr>
        <tr>
          <td>마우스/터치 이벤트</td>
          <td>runOutsideAngular 사용</td>
          <td>변경 감지 최소화</td>
        </tr>
        <tr>
          <td>스크롤 이벤트</td>
          <td>runOutsideAngular + requestAnimationFrame</td>
          <td>부드러운 성능</td>
        </tr>
        <tr>
          <td>애니메이션</td>
          <td>Zone 외부 RAF</td>
          <td>60fps 유지</td>
        </tr>
        <tr>
          <td>실시간 데이터</td>
          <td>배치 업데이트</td>
          <td>CD 횟수 감소</td>
        </tr>
        <tr>
          <td>게임 루프</td>
          <td>Zone 외부 setInterval</td>
          <td>CPU 사용량 감소</td>
        </tr>
      </table>

      <h3>5.6 메모리 누수 방지</h3>
      <p>Zone 리스너를 사용할 때는 반드시 구독을 해제해야 합니다.</p>

      <div class="btn-group">
        <button class="btn-primary" (click)="demonstrateMemoryLeak()">
          메모리 누수 위험 데모
        </button>
        <button class="btn-success" (click)="cleanupSubscriptions()">
          리소스 정리
        </button>
      </div>

      <div *ngIf="memoryLog" class="result-box info">{{ memoryLog }}</div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }

    th {
      background-color: #3f51b5;
      color: white;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    tr:hover {
      background-color: #f0f0f0;
    }
  `]
})
export class PerformanceComponent implements OnDestroy {
  // 스크롤
  scrollEventCount = 0;
  changeDetectionCount = 0;
  efficiency = 0;
  scrollLog = '';

  // 애니메이션
  frameCount = 0;
  animationCDCount = 0;
  rafEfficiency = 0;
  animationLog = '';

  // 타이머
  timerTicks = 0;
  timerCDCount = 0;
  timerCDRatio = 0;
  timerLog = '';

  // WebSocket
  messageCount = 0;
  messageCDCount = 0;
  messageCDSavings = 0;
  websocketLog = '';

  // 메모리
  memoryLog = '';

  // 추적
  private scrollTrackingActive = false;
  private animationActive = false;
  private timerActive = false;
  private rafId?: number;
  private timerId?: number;

  private subscriptions: Array<{ unsubscribe: () => void }> = [];

  constructor(private ngZone: NgZone) {}

  ngOnDestroy(): void {
    this.stopScrollTracking();
    this.stopAnimation();
    this.stopTimer();
    this.cleanupSubscriptions();
  }

  // ===== 5.1 스크롤 추적 최적화 =====

  startScrollTracking(mode: 'inside' | 'outside'): void {
    this.scrollEventCount = 0;
    this.changeDetectionCount = 0;

    this.scrollLog = `\n[스크롤 추적 시작 - ${mode === 'inside' ? 'Zone 내' : 'Zone 외'}]\n`;
    this.scrollTrackingActive = true;

    const listener = () => {
      this.changeDetectionCount++;
    };
    const sub = this.ngZone.onStable.subscribe(listener);
    this.subscriptions.push(sub);

    if (mode === 'inside') {
      // Zone 내부에서 추적
      document.addEventListener('scroll', this.handleScroll.bind(this));
      this.scrollLog += 'Zone 내부에서 스크롤 이벤트를 추적합니다.\n' +
        '각 스크롤 이벤트마다 변경 감지가 실행됩니다.';
    } else {
      // Zone 외부에서 추적
      this.ngZone.runOutsideAngular(() => {
        document.addEventListener('scroll', this.handleScroll.bind(this));
        this.scrollLog = `\n[스크롤 추적 시작 - Zone 외]\n` +
          'Zone 외부에서 스크롤 이벤트를 추적합니다.\n' +
          '변경 감지가 발생하지 않습니다.';
      });
    }
  }

  private handleScroll(): void {
    if (this.scrollTrackingActive) {
      this.scrollEventCount++;

      // 효율성 계산
      if (this.scrollEventCount > 0) {
        const cdRatio = (this.changeDetectionCount / this.scrollEventCount) * 100;
        this.efficiency = Math.round(100 - Math.min(cdRatio, 100));
      }
    }
  }

  stopScrollTracking(): void {
    this.scrollTrackingActive = false;
    document.removeEventListener('scroll', this.handleScroll.bind(this));

    this.scrollLog += `\n\n추적 완료:\n` +
      `- 스크롤 이벤트: ${this.scrollEventCount}\n` +
      `- 변경 감지: ${this.changeDetectionCount}\n` +
      `- 효율성: ${this.efficiency}% 최적화`;
  }

  // ===== 5.2 RAF 최적화 =====

  startAnimationInside(): void {
    this.frameCount = 0;
    this.animationCDCount = 0;
    this.animationActive = true;

    const listener = () => {
      this.animationCDCount++;
    };
    const sub = this.ngZone.onStable.subscribe(listener);
    this.subscriptions.push(sub);

    this.animationLog = '\n[애니메이션 시작 - Zone 내]\n' +
      'requestAnimationFrame을 Zone 내에서 실행합니다.';

    const animate = () => {
      if (this.animationActive) {
        this.frameCount++;

        if (this.frameCount % 10 === 0) {
          const cdRatio = (this.animationCDCount / this.frameCount) * 100;
          this.rafEfficiency = Math.round(100 - cdRatio);
        }

        this.rafId = requestAnimationFrame(animate);
      }
    };

    this.rafId = requestAnimationFrame(animate);

    setTimeout(() => {
      this.stopAnimation();
    }, 2000);
  }

  startAnimationOutside(): void {
    this.frameCount = 0;
    this.animationCDCount = 0;
    this.animationActive = true;

    const listener = () => {
      this.animationCDCount++;
    };
    const sub = this.ngZone.onStable.subscribe(listener);
    this.subscriptions.push(sub);

    this.animationLog = '\n[애니메이션 시작 - Zone 외]\n' +
      'requestAnimationFrame을 Zone 외에서 실행합니다.';

    this.ngZone.runOutsideAngular(() => {
      const animate = () => {
        if (this.animationActive) {
          this.frameCount++;

          if (this.frameCount % 10 === 0) {
            const cdRatio = (this.animationCDCount / this.frameCount) * 100;
            this.rafEfficiency = Math.round(100 - cdRatio);

            // 필요할 때만 Zone으로 돌아가서 UI 업데이트
            this.ngZone.run(() => {
              // UI 업데이트
            });
          }

          this.rafId = requestAnimationFrame(animate);
        }
      };

      this.rafId = requestAnimationFrame(animate);
    });

    setTimeout(() => {
      this.stopAnimation();
    }, 2000);
  }

  stopAnimation(): void {
    this.animationActive = false;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    this.animationLog += `\n\n애니메이션 완료:\n` +
      `- 총 프레임: ${this.frameCount}\n` +
      `- 변경 감지: ${this.animationCDCount}\n` +
      `- 효율성: ${this.rafEfficiency}% 최적화`;
  }

  // ===== 5.3 타이머 최적화 =====

  startTimerInside(): void {
    this.timerTicks = 0;
    this.timerCDCount = 0;
    this.timerActive = true;

    const listener = () => {
      this.timerCDCount++;
    };
    const sub = this.ngZone.onStable.subscribe(listener);
    this.subscriptions.push(sub);

    this.timerLog = '\n[타이머 시작 - Zone 내]\n' +
      'setInterval을 Zone 내에서 실행합니다.\n' +
      '각 틱마다 변경 감지가 실행됩니다.';

    this.timerId = window.setInterval(() => {
      if (this.timerActive) {
        this.timerTicks++;
        this.timerCDRatio = Math.round((this.timerCDCount / Math.max(this.timerTicks, 1)) * 100);
      }
    }, 100);

    setTimeout(() => {
      this.stopTimer();
    }, 2000);
  }

  startTimerOutside(): void {
    this.timerTicks = 0;
    this.timerCDCount = 0;
    this.timerActive = true;

    const listener = () => {
      this.timerCDCount++;
    };
    const sub = this.ngZone.onStable.subscribe(listener);
    this.subscriptions.push(sub);

    this.timerLog = '\n[타이머 시작 - Zone 외]\n' +
      'setInterval을 Zone 외에서 실행합니다.\n' +
      '변경 감지가 발생하지 않습니다.';

    this.ngZone.runOutsideAngular(() => {
      this.timerId = window.setInterval(() => {
        if (this.timerActive) {
          this.timerTicks++;
          this.timerCDRatio = Math.round((this.timerCDCount / Math.max(this.timerTicks, 1)) * 100);

          // 일정 간격으로 UI 업데이트
          if (this.timerTicks % 5 === 0) {
            this.ngZone.run(() => {
              // UI 업데이트
            });
          }
        }
      }, 100);
    });

    setTimeout(() => {
      this.stopTimer();
    }, 2000);
  }

  stopTimer(): void {
    this.timerActive = false;

    if (this.timerId) {
      clearInterval(this.timerId);
    }

    this.timerLog += `\n\n타이머 완료:\n` +
      `- 총 틱: ${this.timerTicks}\n` +
      `- 변경 감지: ${this.timerCDCount}\n` +
      `- CD 비율: ${this.timerCDRatio}%`;
  }

  // ===== 5.4 WebSocket 시뮬레이션 =====

  simulateWebSocketInside(): void {
    this.messageCount = 0;
    this.messageCDCount = 0;

    const listener = () => {
      this.messageCDCount++;
    };
    const sub = this.ngZone.onStable.subscribe(listener);
    this.subscriptions.push(sub);

    this.websocketLog = '\n[WebSocket 시뮬레이션 - Zone 내]\n' +
      '메시지를 빠르게 수신합니다.\n실행 중...';

    // 빠른 메시지 수신 시뮬레이션
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        this.messageCount++;

        if (i === 99) {
          this.messageCDSavings = 0;
          this.websocketLog += `\n\n완료:\n` +
            `- 메시지: ${this.messageCount}\n` +
            `- 변경 감지: ${this.messageCDCount}\n` +
            `- 절감: ${this.messageCDSavings}%`;
        }
      }, i * 5);
    }
  }

  simulateWebSocketOutside(): void {
    this.messageCount = 0;
    this.messageCDCount = 0;

    const listener = () => {
      this.messageCDCount++;
    };
    const sub = this.ngZone.onStable.subscribe(listener);
    this.subscriptions.push(sub);

    this.websocketLog = '\n[WebSocket 시뮬레이션 - Zone 외]\n' +
      '메시지를 Zone 외에서 수신합니다.\n실행 중...';

    this.ngZone.runOutsideAngular(() => {
      // 빠른 메시지 수신 시뮬레이션
      for (let i = 0; i < 100; i++) {
        setTimeout(() => {
          this.messageCount++;

          // 배치 업데이트: 10개씩 처리
          if ((i + 1) % 10 === 0) {
            this.ngZone.run(() => {
              // UI 업데이트
            });
          }

          if (i === 99) {
            const cdCount = Math.ceil(100 / 10); // 배치 수만큼
            this.messageCDCount = cdCount;
            const savings = Math.round((1 - cdCount / 100) * 100);
            this.messageCDSavings = savings;

            this.websocketLog += `\n\n완료:\n` +
              `- 메시지: ${this.messageCount}\n` +
              `- 변경 감지: ${this.messageCDCount}\n` +
              `- 절감: ${this.messageCDSavings}%`;
          }
        }, i * 5);
      }
    });
  }

  // ===== 5.6 메모리 누수 =====

  demonstrateMemoryLeak(): void {
    this.memoryLog = '\n[메모리 누수 위험]\n\n구독을 해제하지 않으면:';

    const listener = () => {
      // 작업
    };

    // 구독 해제 없이 반복 등록 (나쁜 예)
    for (let i = 0; i < 5; i++) {
      this.ngZone.onStable.subscribe(listener);
      this.memoryLog += `\n- 리스너 #${i + 1} 등록됨 (해제 안 함)`;
    }

    this.memoryLog += `\n\n위험: 5개의 리스너가 계속 실행됩니다!\n` +
      `메모리가 낭비되고 성능이 저하됩니다.`;
  }

  cleanupSubscriptions(): void {
    this.memoryLog = '\n[리소스 정리]\n\n구독 해제:';

    let count = 0;
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
      count++;
      this.memoryLog += `\n- 리스너 #${count} 해제됨`;
    });

    this.subscriptions = [];

    this.memoryLog += `\n\n모든 ${count}개의 리스너가 안전하게 정리되었습니다.`;
  }
}
