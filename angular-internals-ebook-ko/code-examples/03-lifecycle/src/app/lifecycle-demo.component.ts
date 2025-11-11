// LifecycleDemoComponent - 모든 8가지 라이프사이클 훅을 시연하는 컴포넌트
import {
  Component,
  OnInit,
  OnChanges,
  DoCheck,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked,
  OnDestroy,
  Input,
  SimpleChanges,
  ViewChild,
  ElementRef,
  ContentChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lifecycle-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h3>라이프사이클 훅 데모</h3>

      <!-- 입력값 제어 -->
      <div class="controls">
        <label>
          입력 메시지:
          <input
            [(ngModel)]="inputMessage"
            placeholder="입력 메시지를 변경해보세요"
            type="text"
          />
        </label>
        <br /><br />
        <button (click)="triggerDetection()">
          변경 감지 강제 실행 (ngDoCheck 호출)
        </button>
        <button class="danger" (click)="destroyComponent()">
          컴포넌트 제거 (ngOnDestroy 호출)
        </button>
      </div>

      <!-- 상태 표시 -->
      <div class="status-section">
        <div class="status" [ngClass]="{ active: isInitialized }">
          초기화됨: {{ isInitialized }}
        </div>
        <div class="status" [ngClass]="{ active: isDestroyed }">
          제거됨: {{ isDestroyed }}
        </div>
        <div class="status processing">
          현재 메시지: {{ inputMessage }}
        </div>
      </div>

      <!-- 로그 표시 -->
      <div class="log-container">
        <h4>라이프사이클 훅 호출 로그</h4>
        <div *ngIf="logs.length === 0" class="log-entry">
          로그가 없습니다. 위의 버튼을 클릭하거나 입력값을 변경해보세요.
        </div>
        <div *ngFor="let log of logs; let i = index" [ngClass]="'log-entry ' + log.type">
          <span class="timestamp">[{{ i + 1 }}]</span>
          {{ log.message }}
        </div>
      </div>

      <!-- 상세 설명 -->
      <div class="description">
        <h4>현재 단계</h4>
        <p>{{ currentHook }}</p>

        <h4>훅별 설명</h4>
        <ul>
          <li>
            <strong>ngOnChanges:</strong>
            @Input 속성이 변경될 때마다 호출됩니다.
            부모 컴포넌트에서 자식 컴포넌트의 @Input 값을 변경하면 이 메서드가 호출됩니다.
            SimpleChanges 객체를 통해 변경된 속성과 이전 값, 현재 값을 확인할 수 있습니다.
          </li>
          <li>
            <strong>ngOnInit:</strong>
            컴포넌트의 데이터 바인딩이 완료되고 초기화될 때 한 번만 호출됩니다.
            일반적으로 HTTP 요청, 타이머 설정, 서비스 초기화 등을 여기서 수행합니다.
          </li>
          <li>
            <strong>ngDoCheck:</strong>
            Angular의 변경 감지(Change Detection)가 실행될 때마다 호출됩니다.
            매우 자주 호출되므로 성능에 주의해야 합니다.
          </li>
          <li>
            <strong>ngAfterContentInit:</strong>
            컴포넌트에 프로젝션된 콘텐츠가 초기화된 후 한 번 호출됩니다.
            @ContentChild를 사용하여 프로젝션된 콘텐츠에 처음 접근할 수 있는 시점입니다.
          </li>
          <li>
            <strong>ngAfterContentChecked:</strong>
            Angular가 프로젝션된 콘텐츠를 검사한 후 호출됩니다.
            ngAfterContentInit 이후부터는 변경 감지 사이클마다 호출됩니다.
          </li>
          <li>
            <strong>ngAfterViewInit:</strong>
            컴포넌트의 뷰와 자식 컴포넌트의 뷰가 초기화된 후 한 번 호출됩니다.
            @ViewChild를 사용하여 DOM 요소나 자식 컴포넌트에 처음 접근할 수 있는 시점입니다.
          </li>
          <li>
            <strong>ngAfterViewChecked:</strong>
            Angular가 컴포넌트의 뷰와 자식 뷰를 검사한 후 호출됩니다.
            ngAfterViewInit 이후부터는 변경 감지 사이클마다 호출됩니다.
          </li>
          <li>
            <strong>ngOnDestroy:</strong>
            컴포넌트가 제거되기 직전에 한 번 호출됩니다.
            구독(Subscription), 타이머, 이벤트 리스너 등을 정리하는 데 사용됩니다.
          </li>
        </ul>
      </div>

      <!-- 숨겨진 요소 (ViewChild 테스트용) -->
      <div #hiddenElement style="display: none">
        Hidden element for ViewChild test
      </div>
    </div>
  `,
  styles: [`
    .controls {
      margin-bottom: 20px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .controls label {
      display: block;
      margin-bottom: 10px;
      font-weight: 500;
    }

    .controls input {
      width: 100%;
      padding: 8px;
      margin: 5px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1em;
    }

    .controls input:focus {
      outline: none;
      border-color: #3f51b5;
      box-shadow: 0 0 0 3px rgba(63, 81, 181, 0.1);
    }

    .status-section {
      margin: 16px 0;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .status {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.9em;
      font-weight: 500;
      margin: 4px;
      background: #f5f5f5;
      color: #666;
    }

    .status.active {
      background: #c8e6c9;
      color: #2e7d32;
    }

    .status.processing {
      background: #fff3e0;
      color: #e65100;
    }

    .log-container {
      background: var(--light-bg);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 16px;
      margin: 16px 0;
      max-height: 300px;
      overflow-y: auto;
    }

    .log-container h4 {
      margin-top: 0;
      margin-bottom: 12px;
      color: #333;
    }

    .log-entry {
      padding: 8px;
      margin: 4px 0;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      line-height: 1.4;
    }

    .log-entry.init {
      background: #c8e6c9;
      color: #2e7d32;
      border-left: 3px solid #4caf50;
    }

    .log-entry.changes {
      background: #bbdefb;
      color: #1565c0;
      border-left: 3px solid #2196f3;
    }

    .log-entry.check {
      background: #fff9c4;
      color: #f57f17;
      border-left: 3px solid #fbc02d;
    }

    .log-entry.content {
      background: #f0f4c3;
      color: #827717;
      border-left: 3px solid #cddc39;
    }

    .log-entry.view {
      background: #ffe0b2;
      color: #e65100;
      border-left: 3px solid #ff9800;
    }

    .log-entry.destroy {
      background: #ffccbc;
      color: #bf360c;
      border-left: 3px solid #ff5722;
    }

    .log-entry.timestamp {
      font-size: 0.85em;
      color: #999;
      font-weight: bold;
    }

    .description {
      margin-top: 20px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .description h4 {
      color: #333;
      margin: 12px 0 8px 0;
    }

    .description ul {
      margin-left: 20px;
    }

    .description li {
      margin-bottom: 12px;
      line-height: 1.6;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
      background: #3f51b5;
      color: white;
      margin-right: 8px;
      margin-bottom: 8px;
      transition: all 0.3s;
    }

    button:hover {
      background: #303f9f;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }

    button.danger {
      background: #f44336;
    }

    button.danger:hover {
      background: #da190b;
    }
  `],
})
export class LifecycleDemoComponent
  implements
    OnInit,
    OnChanges,
    DoCheck,
    AfterContentInit,
    AfterContentChecked,
    AfterViewInit,
    AfterViewChecked,
    OnDestroy
{
  // @Input 속성
  @Input() message: string = '기본 메시지';

  // ViewChild 참조
  @ViewChild('hiddenElement') hiddenElement: ElementRef | undefined;

  // 컴포넌트 상태
  isInitialized: boolean = false;
  isDestroyed: boolean = false;
  inputMessage: string = '라이프사이클 훅';
  currentHook: string = '아직 어떤 훅도 호출되지 않았습니다.';

  // 로그 배열
  logs: Array<{ message: string; type: string }> = [];

  // 변경 감지 카운트
  private changeDetectionCount: number = 0;
  private checkCount: number = 0;
  private contentCheckCount: number = 0;
  private viewCheckCount: number = 0;

  // 로그 추가 메서드
  private addLog(message: string, type: string): void {
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    this.logs.unshift({
      message: `${timestamp} - ${message}`,
      type,
    });

    // 로그 최대 50개 유지
    if (this.logs.length > 50) {
      this.logs.pop();
    }

    // 콘솔에도 출력
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  // 1. ngOnChanges - @Input 속성이 변경될 때 호출
  ngOnChanges(changes: SimpleChanges): void {
    const message = `ngOnChanges 호출됨. 변경된 속성: ${Object.keys(changes).join(', ')}`;
    this.addLog(message, 'changes');
    this.currentHook = message;

    // 변경 세부사항 출력
    for (const propName in changes) {
      const change = changes[propName];
      const cur = JSON.stringify(change.currentValue);
      const prev = JSON.stringify(change.previousValue);
      this.addLog(
        `  - ${propName}: ${prev} -> ${cur}`,
        'changes'
      );
    }
  }

  // 2. ngOnInit - 컴포넌트 초기화 시 한 번 호출
  ngOnInit(): void {
    const message = `ngOnInit 호출됨 (초기화 완료)`;
    this.addLog(message, 'init');
    this.currentHook = message;
    this.isInitialized = true;

    // 초기화 작업 예시
    this.addLog(`  - 컴포넌트 초기화 시작: ${new Date().toLocaleTimeString('ko-KR')}`, 'init');
    this.addLog(`  - 입력 메시지: ${this.inputMessage}`, 'init');
  }

  // 3. ngDoCheck - 변경 감지 실행 시마다 호출
  ngDoCheck(): void {
    this.changeDetectionCount++;

    // 로그를 과도하게 남기지 않기 위해 5번마다만 로그
    if (this.changeDetectionCount % 5 === 1) {
      const message = `ngDoCheck 호출됨 (${this.changeDetectionCount}번째)`;
      this.addLog(message, 'check');
      this.currentHook = message;
    }
  }

  // 4. ngAfterContentInit - 프로젝션된 콘텐츠 초기화 완료 후
  ngAfterContentInit(): void {
    const message = `ngAfterContentInit 호출됨 (콘텐츠 초기화 완료)`;
    this.addLog(message, 'content');
    this.currentHook = message;
    this.addLog(`  - @ContentChild 참조 가능`, 'content');
  }

  // 5. ngAfterContentChecked - 프로젝션된 콘텐츠 검사 후
  ngAfterContentChecked(): void {
    this.contentCheckCount++;

    // 로그를 과도하게 남기지 않기 위해 5번마다만 로그
    if (this.contentCheckCount % 5 === 1) {
      const message = `ngAfterContentChecked 호출됨 (${this.contentCheckCount}번째)`;
      this.addLog(message, 'content');
      this.currentHook = message;
    }
  }

  // 6. ngAfterViewInit - 뷰 초기화 완료 후
  ngAfterViewInit(): void {
    const message = `ngAfterViewInit 호출됨 (뷰 초기화 완료)`;
    this.addLog(message, 'view');
    this.currentHook = message;
    this.addLog(`  - @ViewChild 참조 가능`, 'view');

    // ViewChild 접근 테스트
    if (this.hiddenElement) {
      this.addLog(`  - 숨겨진 요소 참조 확인: ${this.hiddenElement.nativeElement.textContent}`, 'view');
    }
  }

  // 7. ngAfterViewChecked - 뷰 검사 후
  ngAfterViewChecked(): void {
    this.viewCheckCount++;

    // 로그를 과도하게 남기지 않기 위해 5번마다만 로그
    if (this.viewCheckCount % 5 === 1) {
      const message = `ngAfterViewChecked 호출됨 (${this.viewCheckCount}번째)`;
      this.addLog(message, 'view');
      this.currentHook = message;
    }
  }

  // 8. ngOnDestroy - 컴포넌트 제거 전
  ngOnDestroy(): void {
    const message = `ngOnDestroy 호출됨 (컴포넌트 제거)`;
    this.addLog(message, 'destroy');
    this.currentHook = message;
    this.isDestroyed = true;

    // 정리 작업 예시
    this.addLog(`  - 구독 정리`, 'destroy');
    this.addLog(`  - 타이머 제거`, 'destroy');
    this.addLog(`  - 이벤트 리스너 제거`, 'destroy');
  }

  // 변경 감지 강제 실행
  triggerDetection(): void {
    this.addLog('변경 감지 강제 실행 요청', 'check');
    // 상태를 변경하여 변경 감지 트리거
    this.inputMessage = this.inputMessage + ' (변경)';
  }

  // 컴포넌트 제거
  destroyComponent(): void {
    // 실제로는 부모 컴포넌트에서 *ngIf를 false로 설정해야 제거됨
    // 여기서는 제거 메시지만 표시
    this.addLog('컴포넌트 제거 요청', 'destroy');
  }
}
