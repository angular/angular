import { Component, effect, signal, computed, toObservable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error';
}

/**
 * Effects 예제 컴포넌트
 *
 * Effect의 사용법과 RxJS 상호운용성을 보여줍니다:
 * - effect() 함수로 부수 효과 생성
 * - Signal 변경 감지
 * - 여러 signal에 대한 effect
 * - toObservable()을 사용한 RxJS 변환
 * - 이펙트 정리 및 구독 관리
 */
@Component({
  selector: 'app-effects-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="effects-container">
      <!-- 입력 폼 -->
      <div class="input-section">
        <h3>✍️ 입력</h3>
        <div class="input-group">
          <label for="user-name">사용자 이름:</label>
          <input
            #nameInput
            id="user-name"
            type="text"
            [(ngModel)]="userName"
            (change)="onNameChange()"
            placeholder="이름을 입력하세요"
          />
        </div>

        <div class="input-group">
          <label for="email">이메일:</label>
          <input
            #emailInput
            id="email"
            type="email"
            [(ngModel)]="userEmail"
            (change)="onEmailChange()"
            placeholder="이메일을 입력하세요"
          />
        </div>

        <div class="input-group">
          <label for="count">카운트:</label>
          <input
            id="count"
            type="number"
            [(ngModel)]="countValue"
            (change)="onCountChange()"
            min="0"
          />
        </div>

        <button (click)="triggerAction()" class="btn-action">
          🎬 액션 실행
        </button>
      </div>

      <!-- 상태 표시 -->
      <div class="status-section">
        <h3>📊 현재 상태</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="label">사용자 이름:</span>
            <span class="value">{{ currentName() || '(미입력)' }}</span>
          </div>
          <div class="stat-item">
            <span class="label">이메일:</span>
            <span class="value">{{ currentEmail() || '(미입력)' }}</span>
          </div>
          <div class="stat-item">
            <span class="label">카운트:</span>
            <span class="value">{{ currentCount() }}</span>
          </div>
          <div class="stat-item">
            <span class="label">생성된 아이디:</span>
            <span class="value">{{ generatedId() || '(없음)' }}</span>
          </div>
        </div>
      </div>

      <!-- Effect 로그 -->
      <div class="log-section">
        <h3>📋 Effect 로그</h3>
        <div class="log-controls">
          <button (click)="clearLogs()" class="btn-clear">🗑️ 로그 초기화</button>
        </div>
        <div class="log-container">
          <div *ngIf="logs().length === 0" class="empty-message">
            아직 로그가 없습니다. 입력을 변경하면 로그가 표시됩니다.
          </div>
          <div *ngFor="let log of logs(); let last = last" [ngClass]="'log-entry ' + log.type">
            <span class="timestamp">{{ log.timestamp }}</span>
            <span class="message">{{ log.message }}</span>
          </div>
        </div>
      </div>

      <!-- RxJS 상호운용성 -->
      <div class="rxjs-section">
        <h3>🔄 RxJS 상호운용성</h3>
        <div class="info-box">
          <p>
            <strong>toObservable():</strong> Signal을 Observable로 변환할 수 있습니다.
            아래는 currentName signal을 Observable로 변환한 후, 변경을 감지하는 예제입니다.
          </p>
          <div class="code-block">
            <code>const nameObservable = toObservable(this.currentName);</code>
          </div>
        </div>

        <div class="observable-display">
          <strong>마지막 Observable 이벤트:</strong>
          <div class="value-display">
            {{ lastObservableEvent() || '(이벤트 없음)' }}
          </div>
        </div>
      </div>

      <!-- Effect 설명 -->
      <div class="info-box">
        <h4>💡 Effect의 주요 특징</h4>
        <ul>
          <li><strong>자동 추적:</strong> effect() 내에서 읽는 signal을 자동으로 추적합니다</li>
          <li><strong>즉시 실행:</strong> 등록된 effect는 즉시 한 번 실행됩니다</li>
          <li><strong>의존성 변경 감지:</strong> 추적된 signal이 변경되면 다시 실행됩니다</li>
          <li><strong>부수 효과:</strong> API 호출, 로깅, DOM 조작 등의 작업을 수행합니다</li>
          <li><strong>컴포넌트 정리:</strong> 컴포넌트가 제거되면 effect도 자동으로 정리됩니다</li>
          <li><strong>다중 effect:</strong> 하나의 컴포넌트에서 여러 effect를 정의할 수 있습니다</li>
          <li><strong>일회성:</strong> effect()에 { once: true }를 전달하면 한 번만 실행합니다</li>
        </ul>
      </div>

      <div class="info-box" style="background-color: #fff3cd; border-left-color: #ffc107;">
        <h4>⚠️ 주의사항</h4>
        <ul>
          <li><strong>무한 루프 방지:</strong> effect에서 의존하는 signal을 수정하면 무한 루프가 될 수 있습니다</li>
          <li><strong>비동기 작업:</strong> effect에서 setTimeout()이나 Promise를 사용할 때는 메모리 누수에 주의하세요</li>
          <li><strong>성능:</strong> 복잡한 계산이 필요하면 computed signal을 사용하는 것이 낫습니다</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .effects-container {
      padding: 0;
    }

    .input-section,
    .status-section,
    .log-section,
    .rxjs-section {
      margin-bottom: 25px;
    }

    h3 {
      margin-top: 0;
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
    }

    .input-group {
      margin-bottom: 15px;
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }

    .input-group label {
      min-width: 120px;
      font-weight: 600;
      color: #333;
    }

    .input-group input {
      flex: 1;
      min-width: 200px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .input-group input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
    }

    .btn-action {
      padding: 8px 16px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: background-color 0.3s;
    }

    .btn-action:hover {
      background-color: #218838;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .stat-item {
      background-color: #f9f9f9;
      padding: 12px;
      border-radius: 4px;
      border-left: 4px solid #007bff;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
    }

    .value {
      font-size: 16px;
      font-weight: bold;
      color: #007bff;
      font-family: 'Courier New', monospace;
    }

    .log-section {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #28a745;
    }

    .log-controls {
      margin-bottom: 10px;
    }

    .btn-clear {
      padding: 6px 12px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .btn-clear:hover {
      background-color: #c82333;
    }

    .log-container {
      background-color: #1e1e1e;
      color: #00ff00;
      padding: 12px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      max-height: 250px;
      overflow-y: auto;
      min-height: 80px;
    }

    .empty-message {
      color: #888;
      font-style: italic;
      text-align: center;
      padding: 20px;
    }

    .log-entry {
      margin: 4px 0;
      padding: 4px 8px;
      border-radius: 2px;
    }

    .log-entry.info {
      background-color: rgba(0, 255, 0, 0.1);
      color: #00ff00;
    }

    .log-entry.warning {
      background-color: rgba(255, 255, 0, 0.1);
      color: #ffff00;
    }

    .log-entry.error {
      background-color: rgba(255, 107, 107, 0.1);
      color: #ff6b6b;
    }

    .timestamp {
      color: #888;
      margin-right: 10px;
      font-size: 10px;
    }

    .message {
      flex: 1;
    }

    .rxjs-section {
      background-color: #f0f8ff;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #17a2b8;
    }

    .info-box {
      background-color: #f0f8ff;
      border-left: 4px solid #17a2b8;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }

    .info-box h4 {
      margin-top: 0;
      color: #17a2b8;
    }

    .info-box ul {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      color: #333;
    }

    .info-box li {
      margin-bottom: 10px;
      line-height: 1.6;
    }

    .code-block {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
      font-family: 'Courier New', monospace;
    }

    code {
      color: #d63384;
      font-size: 12px;
    }

    .observable-display {
      background-color: white;
      padding: 12px;
      border-radius: 4px;
      margin-top: 10px;
    }

    .value-display {
      background-color: #1e1e1e;
      color: #00ff00;
      padding: 12px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      margin-top: 8px;
      min-height: 40px;
      word-break: break-all;
    }
  `]
})
export class EffectsExampleComponent {
  // Signal 정의
  currentName = signal('');
  currentEmail = signal('');
  currentCount = signal(0);
  generatedId = signal('');

  // 컴포넌트 로그
  logs = signal<LogEntry[]>([]);

  // RxJS 상호운용성을 위한 signal
  lastObservableEvent = signal('');

  // 템플릿 바인딩용 변수
  userName = '';
  userEmail = '';
  countValue = 0;

  // RxJS 구독 관리
  private nameSubscription: Subscription | null = null;

  /**
   * 컴포넌트 생성자
   *
   * 다양한 effect를 정의합니다
   */
  constructor() {
    // Effect 1: currentName이 변경될 때마다 로그에 추가
    effect(() => {
      const name = this.currentName();
      if (name) {
        this.addLog(`이름이 변경됨: "${name}"`, 'info');
      }
    });

    // Effect 2: currentEmail이 변경될 때마다 검증
    effect(() => {
      const email = this.currentEmail();
      if (email) {
        // 간단한 이메일 검증
        const isValid = email.includes('@') && email.includes('.');
        if (isValid) {
          this.addLog(`유효한 이메일: ${email}`, 'info');
        } else {
          this.addLog(`유효하지 않은 이메일: ${email}`, 'warning');
        }
      }
    });

    // Effect 3: currentCount가 변경될 때마다 반응
    effect(() => {
      const count = this.currentCount();
      if (count > 0) {
        this.addLog(`카운트가 증가됨: ${count}`, 'info');

        // 특정 조건에서 ID 생성
        if (count % 5 === 0) {
          this.generatedId.set(`ID-${Date.now()}`);
          this.addLog(`새 ID 생성됨: ${this.generatedId()}`, 'warning');
        }
      }
    });

    // Effect 4: 여러 signal에 의존하는 effect
    effect(() => {
      const name = this.currentName();
      const email = this.currentEmail();
      const count = this.currentCount();

      if (name && email && count > 0) {
        const message = `사용자 프로필: ${name} (${email}) - 액션 카운트: ${count}`;
        this.addLog(message, 'info');
      }
    });

    // RxJS 상호운용성: Signal을 Observable로 변환
    const nameObservable = toObservable(this.currentName);
    this.nameSubscription = nameObservable.subscribe(name => {
      if (name) {
        this.lastObservableEvent.set(`Observable이 감지함: "${name}"`);
        this.addLog(`[Observable] Signal 변경 감지: "${name}"`, 'info');
      }
    });
  }

  /**
   * 사용자 이름 변경 처리
   */
  onNameChange(): void {
    this.currentName.set(this.userName);
  }

  /**
   * 이메일 변경 처리
   */
  onEmailChange(): void {
    this.currentEmail.set(this.userEmail);
  }

  /**
   * 카운트 변경 처리
   */
  onCountChange(): void {
    this.currentCount.set(this.countValue);
  }

  /**
   * 액션 실행
   * 카운트를 증가시키고 로그를 추가합니다
   */
  triggerAction(): void {
    this.currentCount.update(current => current + 1);
    this.addLog('👆 사용자가 액션을 실행했습니다', 'info');
  }

  /**
   * 로그 항목 추가
   */
  private addLog(message: string, type: 'info' | 'warning' | 'error'): void {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR');

    this.logs.update(currentLogs => {
      // 최대 20개의 로그만 유지
      const newLogs = [...currentLogs];
      newLogs.push({
        timestamp: timeString,
        message: message,
        type: type
      });

      return newLogs.slice(-20);
    });
  }

  /**
   * 모든 로그 초기화
   */
  clearLogs(): void {
    this.logs.set([]);
    this.lastObservableEvent.set('');
    this.addLog('🗑️ 로그가 초기화되었습니다', 'info');
  }

  /**
   * 컴포넌트 제거 시 정리
   */
  ngOnDestroy(): void {
    // RxJS 구독 정리
    if (this.nameSubscription) {
      this.nameSubscription.unsubscribe();
    }
  }
}
