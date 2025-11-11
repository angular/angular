import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * 카운터 컴포넌트 - 기본 Signal 예제
 *
 * Signal의 기본 사용법을 보여줍니다:
 * - signal() 함수로 반응형 상태 생성
 * - signal.set() 으로 값 설정
 * - signal.update()로 값 업데이트
 * - 템플릿에서 signal() 호출로 값 읽기
 */
@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="counter-container">
      <!-- Signal 값 표시 -->
      <div class="value-display">
        <strong>현재 카운트:</strong> {{ count() }}
      </div>

      <!-- 기본 컨트롤 버튼 -->
      <div class="button-group">
        <button (click)="decrement()" class="btn-primary">
          ➖ 감소 (-1)
        </button>
        <button (click)="resetCounter()" class="btn-reset">
          🔄 초기화
        </button>
        <button (click)="increment()" class="btn-primary">
          ➕ 증가 (+1)
        </button>
      </div>

      <!-- 증가량 입력 -->
      <div class="input-group">
        <label for="increment-value">증가량 입력:</label>
        <input
          #incrementInput
          id="increment-value"
          type="number"
          [(ngModel)]="incrementValue"
          placeholder="증가량 입력"
        />
        <button (click)="incrementByValue()" class="btn-secondary">
          ➕ 추가 증가
        </button>
      </div>

      <!-- 통계 정보 -->
      <div class="stats-container">
        <h3>📊 통계</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">총 증가 횟수:</span>
            <span class="stat-value">{{ incrementCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">총 감소 횟수:</span>
            <span class="stat-value">{{ decrementCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">현재 상태:</span>
            <span class="stat-value">{{ statusMessage() }}</span>
          </div>
        </div>
      </div>

      <!-- 설명 -->
      <div class="info-box">
        <h4>💡 어떻게 작동하는가?</h4>
        <ul>
          <li><code>count = signal(0)</code>: 기본값이 0인 signal 생성</li>
          <li><code>count()</code>: 현재 signal 값을 읽음</li>
          <li><code>count.set(value)</code>: signal 값을 새로운 값으로 설정</li>
          <li><code>count.update(fn)</code>: 현재 값을 기반으로 signal 값을 업데이트</li>
          <li>Signal 값이 변경되면 템플릿이 자동으로 업데이트됩니다</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .counter-container {
      padding: 0;
    }

    .value-display {
      background-color: #e7f3ff;
      border-left: 4px solid #007bff;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
      font-size: 18px;
      font-weight: bold;
    }

    .button-group {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    button {
      padding: 10px 20px;
      font-size: 14px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 600;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background-color: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
    }

    .btn-reset {
      background-color: #6c757d;
      color: white;
    }

    .btn-reset:hover {
      background-color: #545b62;
    }

    .btn-secondary {
      background-color: #28a745;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #218838;
    }

    .input-group {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      align-items: center;
      flex-wrap: wrap;
    }

    .input-group label {
      font-weight: 600;
      color: #333;
    }

    .input-group input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 150px;
    }

    .input-group input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
    }

    .stats-container {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
      border-left: 4px solid #28a745;
    }

    .stats-container h3 {
      margin-top: 0;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
    }

    .stat-item {
      background-color: white;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #ddd;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stat-label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
    }

    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #007bff;
      font-family: 'Courier New', monospace;
    }

    .info-box {
      background-color: #f0f8ff;
      border-left: 4px solid #17a2b8;
      padding: 15px;
      border-radius: 4px;
      margin-top: 20px;
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
      margin-bottom: 8px;
      line-height: 1.6;
    }

    code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      color: #d63384;
      font-size: 12px;
    }
  `]
})
export class CounterComponent {
  // Signal 생성: 기본값이 0인 카운터
  count = signal(0);

  // 통계를 위한 일반 변수 (Signal이 아닌 컴포넌트 상태)
  incrementCount = 0;
  decrementCount = 0;
  incrementValue = 1;

  /**
   * 카운터를 1 증가시킵니다
   *
   * update() 메서드는 현재 값에 접근하여 새로운 값을 반환하는 함수를 받습니다
   */
  increment(): void {
    this.count.update(current => current + 1);
    this.incrementCount++;
  }

  /**
   * 카운터를 1 감소시킵니다
   */
  decrement(): void {
    this.count.update(current => current - 1);
    this.decrementCount++;
  }

  /**
   * 카운터를 초기화합니다
   *
   * set() 메서드는 새로운 값으로 signal을 설정합니다
   */
  resetCounter(): void {
    this.count.set(0);
    this.incrementCount = 0;
    this.decrementCount = 0;
    this.incrementValue = 1;
  }

  /**
   * 사용자가 입력한 값만큼 증가시킵니다
   */
  incrementByValue(): void {
    const value = Number(this.incrementValue) || 1;
    this.count.update(current => current + value);
    this.incrementCount++;
  }

  /**
   * 현재 카운트 값에 기반한 상태 메시지를 반환합니다
   *
   * 이 메서드는 매번 호출될 때마다 계산됩니다
   * computed signal을 사용하면 더 효율적으로 만들 수 있습니다
   */
  statusMessage(): string {
    const current = this.count();
    if (current === 0) return '중립';
    if (current > 0) return `긍정 (+${current})`;
    return `부정 (${current})`;
  }
}
