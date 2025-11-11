import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutsideZoneComponent } from './outside-zone.component';
import { PerformanceComponent } from './performance.component';

// Zone.js 기본 개념 및 NgZone API 시연
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, OutsideZoneComponent, PerformanceComponent],
  template: `
    <div class="container">
      <!-- 헤더 -->
      <div class="header">
        <h1>Zone.js 종합 예제</h1>
        <p>Angular의 Zone.js를 이해하고 성능을 최적화하기</p>
      </div>

      <!-- 섹션 1: Zone.js 기본 개념 -->
      <div class="section">
        <h2>1. Zone.js 기본 개념</h2>

        <h3>Zone 상태 추적</h3>
        <div class="metrics">
          <div class="metric-card">
            <div class="metric-card-label">현재 Zone 상태</div>
            <div class="metric-card-value">{{ isInsideAngularZone ? 'Inside' : 'Outside' }}</div>
            <div class="metric-card-unit">{{ isInsideAngularZone ? 'Angular Zone' : 'Other Zone' }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-card-label">비동기 작업 횟수</div>
            <div class="metric-card-value">{{ asyncOperationCount }}</div>
            <div class="metric-card-unit">총 작업 수</div>
          </div>
          <div class="metric-card">
            <div class="metric-card-label">변경 감지 실행</div>
            <div class="metric-card-value">{{ changeDetectionCount }}</div>
            <div class="metric-card-unit">총 실행 수</div>
          </div>
        </div>

        <h3>기본 작업 예제</h3>
        <div class="btn-group">
          <button class="btn-primary" (click)="simpleAsync()">
            간단한 비동기 작업 (Promise)
          </button>
          <button class="btn-primary" (click)="simpleTimeout()">
            setTimeout 작업
          </button>
          <button class="btn-primary" (click)="eventEmitterExample()">
            이벤트 리스너 예제
          </button>
        </div>

        <div *ngIf="basicLog" class="result-box info">{{ basicLog }}</div>
      </div>

      <!-- 섹션 2: NgZone API 상세 -->
      <div class="section">
        <h2>2. NgZone API 상세</h2>

        <h3>Zone 상태 확인</h3>
        <p style="margin: 10px 0;">
          현재 Zone 상태:
          <span class="badge" [ngClass]="isInsideAngularZone ? 'badge-success' : 'badge-warn'">
            {{ isInsideAngularZone ? 'Angular Zone 내부' : 'Angular Zone 외부' }}
          </span>
        </p>

        <h3>Zone 컨텍스트 정보</h3>
        <div class="result-box info">
          NgZone 인스턴스: {{ ngZoneInfo }}
        </div>

        <h3>동기 작업 실행</h3>
        <div class="btn-group">
          <button class="btn-primary" (click)="synchronousTask()">
            동기 작업 (변경 감지 발생)
          </button>
          <button class="btn-accent" (click)="asyncTaskWithin()">
            Zone 내 비동기 작업
          </button>
        </div>

        <div *ngIf="zoneLog" class="result-box info">{{ zoneLog }}</div>
      </div>

      <!-- 섹션 3: 변경 감지 추적 -->
      <div class="section">
        <h2>3. 변경 감지 추적</h2>

        <div class="metrics">
          <div class="metric-card">
            <div class="metric-card-label">변경 감지 횟수</div>
            <div class="metric-card-value">{{ changeDetectionCount }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-card-label">마지막 CD 시간</div>
            <div class="metric-card-value">{{ lastChangeDetectionTime }}</div>
            <div class="metric-card-unit">ms</div>
          </div>
        </div>

        <h3>변경 감지 시뮬레이션</h3>
        <div class="btn-group">
          <button class="btn-primary" (click)="triggerChangeDetection()">
            변경 감지 트리거 (NgZone.onStable)
          </button>
          <button class="btn-success" (click)="resetChangeDetectionCounter()">
            카운터 리셋
          </button>
        </div>

        <div *ngIf="changeDetectionLog" class="result-box success">{{ changeDetectionLog }}</div>
      </div>

      <!-- 섹션 4: runOutsideAngular 데모 -->
      <div class="section">
        <h2>4. runOutsideAngular (성능 최적화)</h2>
        <p>변경 감지를 피하고 성능을 최적화하는 작업들입니다.</p>

        <app-outside-zone></app-outside-zone>
      </div>

      <!-- 섹션 5: 성능 최적화 -->
      <div class="section">
        <h2>5. 성능 최적화 비교</h2>
        <p>Zone 내부와 외부에서의 성능 차이를 비교합니다.</p>

        <app-performance></app-performance>
      </div>

      <!-- 섹션 6: 고급 Zone API -->
      <div class="section">
        <h2>6. 고급 Zone API</h2>

        <h3>Zone.current 정보</h3>
        <div class="result-box info">{{ zoneCurrentInfo }}</div>

        <h3>Zone 리스너 등록</h3>
        <div class="btn-group">
          <button class="btn-primary" (click)="registerZoneListeners()">
            Zone 리스너 등록
          </button>
          <button class="btn-accent" (click)="checkZoneEvents()">
            Zone 이벤트 확인
          </button>
        </div>

        <div *ngIf="advancedLog" class="result-box info">{{ advancedLog }}</div>
      </div>

      <!-- 섹션 7: Zone 마이크로태스크 -->
      <div class="section">
        <h2>7. Zone 마이크로태스크 (Microtask)</h2>
        <p>Promise, async/await, 라이프사이클 훅 등이 마이크로태스크를 사용합니다.</p>

        <div class="btn-group">
          <button class="btn-primary" (click)="microtaskExample()">
            마이크로태스크 예제
          </button>
          <button class="btn-primary" (click)="macrotaskExample()">
            매크로태스크 예제
          </button>
        </div>

        <div *ngIf="microtaskLog" class="result-box info">{{ microtaskLog }}</div>
      </div>

      <!-- 섹션 8: 실시간 로그 -->
      <div class="section">
        <h2>8. 실시간 변경 감지 로그</h2>
        <p>모든 Zone 이벤트를 추적합니다.</p>

        <div class="btn-group">
          <button class="btn-primary" (click)="clearAllLogs()">
            모든 로그 삭제
          </button>
          <button class="btn-accent" (click)="toggleAutoScroll()">
            자동 스크롤: {{ autoScroll ? '켜짐' : '꺼짐' }}
          </button>
        </div>

        <div class="log-container" #logContainer>
          <div *ngFor="let log of allLogs" class="log-entry">
            <span class="log-time">[{{ log.time }}]</span>
            <span class="log-type">{{ log.type }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent implements OnInit {
  // 상태 변수
  isInsideAngularZone = true;
  asyncOperationCount = 0;
  changeDetectionCount = 0;
  lastChangeDetectionTime = 0;
  autoScroll = true;

  // 로그
  basicLog = '';
  zoneLog = '';
  changeDetectionLog = '';
  advancedLog = '';
  microtaskLog = '';
  allLogs: Array<{ time: string; type: string; message: string }> = [];

  // Zone 정보
  ngZoneInfo = 'NgZone 인스턴스 로딩 중...';
  zoneCurrentInfo = 'Zone.current 정보 로딩 중...';

  // 로그 컨테이너
  @ViewChild('logContainer') logContainer?: ElementRef;

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    this.initializeZoneMonitoring();
    this.updateZoneInfo();
  }

  // ===== 1. Zone.js 기본 개념 =====

  simpleAsync(): void {
    this.asyncOperationCount++;

    const startLog = `\n[작업 #${this.asyncOperationCount}] 비동기 Promise 시작`;
    this.basicLog = startLog;
    this.addLog('BASIC', `Promise 작업 시작 (내부 Zone)`);

    Promise.resolve()
      .then(() => {
        const message = `[작업 #${this.asyncOperationCount}] Promise 완료됨\n변경 감지가 자동으로 실행됩니다.`;
        this.basicLog += '\n' + message;
        this.addLog('BASIC', 'Promise 작업 완료, 변경 감지 트리거됨');
      });
  }

  simpleTimeout(): void {
    this.asyncOperationCount++;

    const message = `\n[작업 #${this.asyncOperationCount}] setTimeout 실행 (지연: 100ms)`;
    this.basicLog = message;
    this.addLog('BASIC', 'setTimeout 작업 시작');

    setTimeout(() => {
      this.basicLog += '\nsetTimeout 콜백 실행됨\n변경 감지가 자동으로 실행됩니다.';
      this.addLog('BASIC', 'setTimeout 콜백 완료, 변경 감지 트리거됨');
    }, 100);
  }

  eventEmitterExample(): void {
    this.basicLog = '\n[이벤트 리스너 예제]\n이벤트가 발생하면 Zone에서 자동으로 변경 감지를 실행합니다.';
    this.addLog('BASIC', '이벤트 리스너 등록됨');

    const element = document.createElement('button');
    element.textContent = '임시 버튼';
    element.style.padding = '10px 20px';
    element.style.marginTop = '10px';

    element.addEventListener('click', () => {
      this.basicLog += '\n\n이벤트 핸들러가 트리거되었습니다!\n변경 감지가 자동으로 실행됩니다.';
      this.addLog('BASIC', '버튼 클릭 이벤트 처리됨, 변경 감지 트리거됨');
      document.body.removeChild(element);
    });

    document.body.appendChild(element);
    setTimeout(() => element.click(), 500);
  }

  // ===== 2. NgZone API 상세 =====

  synchronousTask(): void {
    this.changeDetectionCount++;
    const startTime = performance.now();

    this.zoneLog = `\n[동기 작업 #1]\n시작 시간: ${startTime.toFixed(2)}ms`;
    this.addLog('SYNC', '동기 작업 시작됨');

    // CPU 작업
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += Math.sqrt(i);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    this.lastChangeDetectionTime = duration;

    this.zoneLog += `\n종료 시간: ${endTime.toFixed(2)}ms\n소요 시간: ${duration.toFixed(2)}ms\n합계: ${sum.toFixed(0)}`;
    this.addLog('SYNC', `동기 작업 완료 (${duration.toFixed(2)}ms), 변경 감지 발생`);
  }

  asyncTaskWithin(): void {
    this.changeDetectionCount++;

    this.zoneLog = `\n[비동기 작업]\nNgZone 내에서 비동기 작업을 실행합니다.`;
    this.addLog('ASYNC', 'NgZone 내 비동기 작업 시작');

    this.ngZone.run(() => {
      setTimeout(() => {
        this.zoneLog += `\n비동기 작업 완료 - 변경 감지 자동 실행됨`;
        this.addLog('ASYNC', 'NgZone 내 비동기 작업 완료, 변경 감지 발생');
      }, 200);
    });
  }

  // ===== 3. 변경 감지 추적 =====

  triggerChangeDetection(): void {
    this.changeDetectionLog = `\n[변경 감지 추적]\nNgZone.onStable 이벤트를 모니터링합니다.`;
    this.addLog('DETECT', 'onStable 이벤트 모니터링 시작');

    const startTime = performance.now();

    // onStable은 모든 비동기 작업이 완료된 후 발생
    const subscription = this.ngZone.onStable.subscribe(() => {
      const endTime = performance.now();
      this.changeDetectionCount++;

      this.changeDetectionLog += `\nonStable 이벤트 발생\n변경 감지 완료\n시간: ${(endTime - startTime).toFixed(2)}ms`;
      this.addLog('DETECT', `onStable 이벤트 감지됨 (${this.changeDetectionCount}번째)`);

      subscription.unsubscribe();
    });

    // 비동기 작업 시뮬레이션
    Promise.resolve().then(() => {
      this.changeDetectionLog += `\n비동기 작업 완료됨`;
      this.addLog('DETECT', '비동기 작업 완료');
    });
  }

  resetChangeDetectionCounter(): void {
    this.changeDetectionCount = 0;
    this.changeDetectionLog = '\n[카운터 리셋]\n변경 감지 횟수가 0으로 초기화되었습니다.';
    this.addLog('DETECT', '변경 감지 카운터 리셋됨');
  }

  // ===== 4. runOutsideAngular는 별도 컴포넌트에서 처리 =====

  // ===== 5. 성능 최적화는 별도 컴포넌트에서 처리 =====

  // ===== 6. 고급 Zone API =====

  registerZoneListeners(): void {
    this.advancedLog = `\n[Zone 리스너 등록]\n Zone 이벤트를 모니터링합니다.`;
    this.addLog('ADVANCED', 'Zone 리스너 등록 중...');

    // onStable: 모든 마이크로태스크 및 매크로태스크 완료 후
    const stableSubscription = this.ngZone.onStable.subscribe(() => {
      this.advancedLog += `\n✓ onStable: 모든 작업 완료`;
      this.addLog('ADVANCED', 'onStable 트리거됨');
    });

    // onUnstable: 새로운 비동기 작업 시작 시
    const unstableSubscription = this.ngZone.onUnstable.subscribe(() => {
      this.advancedLog += `\n✗ onUnstable: 비동기 작업 시작`;
      this.addLog('ADVANCED', 'onUnstable 트리거됨');
    });

    // 비동기 작업 시뮬레이션
    Promise.resolve().then(() => {
      this.advancedLog += `\n작업 진행 중...`;
    });

    setTimeout(() => {
      stableSubscription.unsubscribe();
      unstableSubscription.unsubscribe();
    }, 2000);
  }

  checkZoneEvents(): void {
    this.advancedLog = `\n[Zone 이벤트 확인]\n`;
    this.addLog('ADVANCED', 'Zone 이벤트 확인 중...');

    // Zone.current 정보
    const currentZone = (Zone as any).current;
    this.advancedLog += `Zone.current: ${currentZone.name || 'Angular Zone'}`;

    // Zone의 태스크 추적
    if (currentZone.onUnstable) {
      this.advancedLog += `\n- onUnstable: 활성화됨`;
    }

    if (currentZone.onStable) {
      this.advancedLog += `\n- onStable: 활성화됨`;
    }

    this.addLog('ADVANCED', 'Zone 이벤트 정보 업데이트됨');
  }

  // ===== 7. Zone 마이크로태스크 =====

  microtaskExample(): void {
    this.microtaskLog = `\n[마이크로태스크 예제]\n\n실행 순서:\n1. 동기 코드\n2. 마이크로태스크 (Promise, async/await)\n3. 매크로태스크 (setTimeout)`;
    this.addLog('MICROTASK', '마이크로태스크 예제 시작');

    console.log('1. 동기 코드 실행');
    this.microtaskLog += `\n✓ 동기 코드 실행됨`;

    Promise.resolve()
      .then(() => {
        console.log('2. 마이크로태스크 (Promise) 실행');
        this.microtaskLog += `\n✓ 마이크로태스크 실행됨`;
        this.addLog('MICROTASK', '마이크로태스크 (Promise) 실행됨');
      });

    setTimeout(() => {
      console.log('3. 매크로태스크 (setTimeout) 실행');
      this.microtaskLog += `\n✓ 매크로태스크 실행됨\n\n(변경 감지는 마이크로태스크 후 실행)`;
      this.addLog('MICROTASK', '매크로태스크 (setTimeout) 실행됨');
    }, 0);
  }

  macrotaskExample(): void {
    this.microtaskLog = `\n[매크로태스크 예제]\n\n여러 매크로태스크는 각각 독립적으로 처리됩니다.`;
    this.addLog('MACROTASK', '매크로태스크 예제 시작');

    const tasks = [
      { name: '첫 번째', delay: 100 },
      { name: '두 번째', delay: 200 },
      { name: '세 번째', delay: 300 }
    ];

    tasks.forEach((task, index) => {
      setTimeout(() => {
        this.microtaskLog += `\n✓ ${task.name} 매크로태스크 완료`;
        this.addLog('MACROTASK', `${task.name} 매크로태스크 실행됨`);
      }, task.delay);
    });
  }

  // ===== 유틸리티 메서드 =====

  private initializeZoneMonitoring(): void {
    // onUnstable: Zone으로 들어올 때
    this.ngZone.onUnstable.subscribe(() => {
      this.isInsideAngularZone = true;
    });

    // onStable: Zone에서 나올 때
    this.ngZone.onStable.subscribe(() => {
      this.isInsideAngularZone = false;
      this.changeDetectionCount++;
    });
  }

  private updateZoneInfo(): void {
    this.ngZoneInfo = `NgZone이 활성화되었습니다.\nAngular의 변경 감지 시스템을 제어합니다.`;

    const currentZone = (Zone as any).current;
    this.zoneCurrentInfo = `Zone.current: ${currentZone.name || 'Angular Zone'}\n상태: 활성화됨\nZone.js 버전: Zone.js enabled`;
  }

  private addLog(type: string, message: string): void {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });

    this.allLogs.push({
      time: timeStr,
      type: type.padEnd(10),
      message: message
    });

    // 로그 최대 100개 유지
    if (this.allLogs.length > 100) {
      this.allLogs.shift();
    }

    // 자동 스크롤
    if (this.autoScroll && this.logContainer) {
      setTimeout(() => {
        if (this.logContainer) {
          this.logContainer.nativeElement.scrollTop =
            this.logContainer.nativeElement.scrollHeight;
        }
      }, 0);
    }
  }

  clearAllLogs(): void {
    this.allLogs = [];
    this.addLog('LOG', '모든 로그가 삭제되었습니다.');
  }

  toggleAutoScroll(): void {
    this.autoScroll = !this.autoScroll;
    this.addLog('LOG', `자동 스크롤: ${this.autoScroll ? '켜짐' : '꺼짐'}`);
  }
}
