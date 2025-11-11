// ParentComponent - 부모-자식 라이프사이클 관계를 보여주는 부모 컴포넌트
import {
  Component,
  OnInit,
  OnChanges,
  AfterViewInit,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChildComponent } from './child.component';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [CommonModule, FormsModule, ChildComponent],
  template: `
    <div class="parent-container card">
      <h3>부모-자식 라이프사이클 관계</h3>

      <!-- 설명 -->
      <div class="info-box">
        <p>
          <strong>부모 컴포넌트의 입력값을 변경하면 자식 컴포넌트의 ngOnChanges가 호출됩니다.</strong>
          자식을 추가/제거하여 생성과 소멸 시점을 확인할 수 있습니다.
        </p>
      </div>

      <!-- 부모 컴포넌트 제어 -->
      <div class="controls-section">
        <h4>부모 컴포넌트 제어</h4>

        <div class="control-group">
          <label>
            자식 메시지:
            <input
              [(ngModel)]="parentMessage"
              placeholder="자식에게 전달할 메시지"
              type="text"
            />
          </label>
        </div>

        <div class="control-group">
          <label>
            자식 항목:
            <input
              [(ngModel)]="parentItem"
              placeholder="자식에게 전달할 항목"
              type="text"
            />
          </label>
        </div>

        <div class="control-group">
          <label>
            자식 컴포넌트 개수:
            <input
              type="number"
              [(ngModel)]="childCount"
              min="0"
              max="5"
            />
          </label>
        </div>

        <button (click)="addChild()">자식 추가</button>
        <button (click)="removeChild()" class="warning">자식 제거</button>
        <button (click)="clearAllChildren()" class="danger">
          모든 자식 제거
        </button>
      </div>

      <!-- 부모 상태 -->
      <div class="parent-status-section">
        <h4>부모 컴포넌트 상태</h4>
        <div class="status-grid">
          <div class="status-item">
            <span>초기화됨:</span>
            <strong [ngClass]="{ active: isInitialized }">
              {{ isInitialized }}
            </strong>
          </div>
          <div class="status-item">
            <span>뷰 초기화됨:</span>
            <strong [ngClass]="{ active: isViewInitialized }">
              {{ isViewInitialized }}
            </strong>
          </div>
          <div class="status-item">
            <span>자식 개수:</span>
            <strong>{{ childCount }}</strong>
          </div>
          <div class="status-item">
            <span>현재 메시지:</span>
            <strong>"{{ parentMessage }}"</strong>
          </div>
        </div>
      </div>

      <!-- 부모 라이프사이클 로그 -->
      <div class="parent-log-section">
        <h4>부모 컴포넌트 라이프사이클 로그</h4>
        <div class="log-container">
          <div *ngFor="let log of parentLogs" class="log-item">
            {{ log }}
          </div>
        </div>
      </div>

      <!-- 자식 컴포넌트들 -->
      <div class="children-section">
        <h4>자식 컴포넌트들</h4>
        <p class="children-info">
          아래는 동적으로 생성된 자식 컴포넌트입니다.
          자식들의 라이프사이클 이벤트를 관찰할 수 있습니다.
        </p>

        <div *ngIf="childCount === 0" class="empty-state">
          <p>자식 컴포넌트가 없습니다. 위의 "자식 추가" 버튼을 클릭하세요.</p>
        </div>

        <div *ngFor="let child of children">
          <app-child
            [childMessage]="parentMessage"
            [childItem]="parentItem"
          ></app-child>
        </div>
      </div>

      <!-- 부모-자식 라이프사이클 실행 순서 -->
      <div class="sequence-info card success" style="margin-top: 20px;">
        <h4>라이프사이클 실행 순서</h4>
        <h5>초기화 단계</h5>
        <ol>
          <li>부모: ngOnChanges (초기화 시)</li>
          <li>부모: ngOnInit</li>
          <li>부모: ngDoCheck</li>
          <li><strong>자식: ngOnChanges</strong></li>
          <li><strong>자식: ngOnInit</strong></li>
          <li><strong>자식: ngDoCheck</strong></li>
          <li>부모: ngAfterContentInit</li>
          <li>부모: ngAfterContentChecked</li>
          <li><strong>자식: ngAfterViewInit</strong></li>
          <li><strong>자식: ngAfterViewChecked</strong></li>
          <li>부모: ngAfterViewInit</li>
          <li>부모: ngAfterViewChecked</li>
        </ol>

        <h5>변경 감지 단계</h5>
        <p>
          부모 컴포넌트의 @Input 값을 변경하면:
        </p>
        <ol>
          <li>부모: ngDoCheck</li>
          <li><strong>자식: ngOnChanges</strong></li>
          <li><strong>자식: ngDoCheck</strong></li>
          <li>부모: ngAfterContentChecked</li>
          <li><strong>자식: ngAfterViewChecked</strong></li>
          <li>부모: ngAfterViewChecked</li>
        </ol>

        <h5>제거 단계</h5>
        <p>
          부모 컴포넌트에서 자식을 제거하면:
        </p>
        <ol>
          <li><strong>자식: ngOnDestroy</strong></li>
        </ol>
      </div>
    </div>
  `,
  styles: [`
    .parent-container {
      background: #f0f4c3;
      border-left: 4px solid #9ccc65;
    }

    .parent-container h3 {
      color: #558b2f;
    }

    .info-box {
      background: #e8f5e9;
      border-left: 4px solid #4caf50;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .controls-section {
      background: #fff;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      border: 1px solid #ddd;
    }

    .controls-section h4 {
      margin-top: 0;
      color: #333;
    }

    .control-group {
      margin-bottom: 12px;
    }

    .control-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      color: #555;
    }

    .control-group input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9em;
    }

    .control-group input:focus {
      outline: none;
      border-color: #9ccc65;
      box-shadow: 0 0 0 3px rgba(156, 204, 101, 0.2);
    }

    .parent-status-section {
      background: #fff;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      border: 1px solid #ddd;
    }

    .parent-status-section h4 {
      margin-top: 0;
      color: #333;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .status-item {
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-item span {
      font-weight: 500;
      color: #666;
    }

    .status-item strong {
      color: #333;
    }

    .status-item strong.active {
      color: #4caf50;
      font-weight: bold;
    }

    .parent-log-section {
      background: #fff;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      border: 1px solid #ddd;
    }

    .parent-log-section h4 {
      margin-top: 0;
      color: #333;
    }

    .log-container {
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 10px;
      max-height: 200px;
      overflow-y: auto;
    }

    .log-item {
      padding: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.85em;
      border-bottom: 1px solid #eee;
      color: #555;
    }

    .log-item:last-child {
      border-bottom: none;
    }

    .children-section {
      background: #fff;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      border: 1px solid #ddd;
    }

    .children-section h4 {
      margin-top: 0;
      color: #333;
    }

    .children-info {
      color: #666;
      font-size: 0.9em;
      margin: 8px 0;
    }

    .empty-state {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      text-align: center;
      color: #999;
    }

    .sequence-info h5 {
      margin-top: 16px;
      margin-bottom: 8px;
      color: #333;
    }

    .sequence-info ol {
      margin-left: 20px;
      padding-left: 10px;
    }

    .sequence-info li {
      margin-bottom: 6px;
      line-height: 1.4;
      font-size: 0.9em;
    }

    .sequence-info li strong {
      color: #f44336;
      background: #ffebee;
      padding: 1px 4px;
      border-radius: 2px;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
      background: #9ccc65;
      color: white;
      margin-right: 8px;
      margin-bottom: 8px;
      transition: all 0.3s;
    }

    button:hover {
      background: #7cb342;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }

    button.warning {
      background: #ff9800;
    }

    button.warning:hover {
      background: #f57c00;
    }

    button.danger {
      background: #f44336;
    }

    button.danger:hover {
      background: #da190b;
    }
  `],
})
export class ParentComponent implements OnInit, AfterViewInit, OnDestroy {
  // 부모 상태
  parentMessage: string = '자식에게 전달할 메시지';
  parentItem: string = '중요한 항목';
  childCount: number = 1;
  isInitialized: boolean = false;
  isViewInitialized: boolean = false;

  // 자식 컴포넌트 관리
  children: any[] = [];

  // 로그
  parentLogs: string[] = [];

  // 변경 감지 카운트
  private doCheckCount: number = 0;

  // 로그 추가 메서드
  private addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString('ko-KR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
    this.parentLogs.unshift(`${timestamp} - ${message}`);
    if (this.parentLogs.length > 20) {
      this.parentLogs.pop();
    }
    console.log(`[부모] ${message}`);
  }

  // ngOnInit
  ngOnInit(): void {
    this.isInitialized = true;
    this.addLog('ngOnInit - 부모 컴포넌트 초기화');
    this.addLog(`  - 초기 자식 개수: ${this.childCount}`);

    // 초기 자식 생성
    this.updateChildren();
  }

  // ngDoCheck
  ngDoCheck(): void {
    this.doCheckCount++;
    if (this.doCheckCount % 10 === 1) {
      // 로그를 과도하게 남기지 않기 위해 10번마다만 로그
      this.addLog(`ngDoCheck (${this.doCheckCount}번째 호출)`);
    }
  }

  // ngAfterViewInit
  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.addLog('ngAfterViewInit - 부모 뷰 초기화 완료');
  }

  // ngOnDestroy
  ngOnDestroy(): void {
    this.addLog('ngOnDestroy - 부모 컴포넌트 제거');
  }

  // 자식 추가
  addChild(): void {
    if (this.childCount < 5) {
      this.childCount++;
      this.updateChildren();
      this.addLog(`자식 추가 - 현재 자식 개수: ${this.childCount}`);
    }
  }

  // 자식 제거
  removeChild(): void {
    if (this.childCount > 0) {
      this.childCount--;
      this.updateChildren();
      this.addLog(`자식 제거 - 현재 자식 개수: ${this.childCount}`);
    }
  }

  // 모든 자식 제거
  clearAllChildren(): void {
    if (this.childCount > 0) {
      this.childCount = 0;
      this.updateChildren();
      this.addLog('모든 자식 제거');
    }
  }

  // 자식 배열 업데이트
  private updateChildren(): void {
    this.children = Array(this.childCount)
      .fill(null)
      .map((_, i) => ({ id: i }));
  }
}
