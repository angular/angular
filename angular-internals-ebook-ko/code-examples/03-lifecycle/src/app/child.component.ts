// ChildComponent - 부모-자식 라이프사이클 관계를 보여주는 자식 컴포넌트
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  AfterViewInit,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-child',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="child-container card">
      <h4>자식 컴포넌트 ({{ childId }})</h4>

      <!-- 입력받은 데이터 표시 -->
      <div class="info-section">
        <p><strong>부모로부터 받은 메시지:</strong> {{ childMessage }}</p>
        <p><strong>부모로부터 받은 항목:</strong> {{ childItem }}</p>
        <p><strong>생성 시간:</strong> {{ createdAt }}</p>
      </div>

      <!-- 라이프사이클 상태 -->
      <div class="status-display">
        <div class="status" [ngClass]="{ active: isInitialized }">
          초기화됨: {{ isInitialized }}
        </div>
        <div class="status" [ngClass]="{ active: isViewInitialized }">
          뷰 초기화됨: {{ isViewInitialized }}
        </div>
        <div class="status" [ngClass]="{ active: changeCount > 0 }">
          변경 감지됨: {{ changeCount }}회
        </div>
      </div>

      <!-- 로그 -->
      <div class="mini-log">
        <h5>라이프사이클 이벤트</h5>
        <div *ngFor="let event of events" class="event-item">
          {{ event }}
        </div>
      </div>

      <!-- 숨겨진 요소 (ViewChild 테스트용) -->
      <div #childElement style="display: none">
        Child element
      </div>
    </div>
  `,
  styles: [`
    .child-container {
      background: #fff;
      border: 2px solid #ff9800;
      margin-bottom: 12px;
      padding: 16px;
    }

    .child-container h4 {
      color: #ff9800;
      margin: 0 0 12px 0;
    }

    .info-section {
      background: #fff3e0;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 12px;
      font-size: 0.9em;
    }

    .info-section p {
      margin: 6px 0;
    }

    .status-display {
      display: flex;
      gap: 8px;
      margin: 12px 0;
      flex-wrap: wrap;
    }

    .status {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 0.8em;
      background: #f5f5f5;
      color: #666;
      transition: all 0.3s;
    }

    .status.active {
      background: #c8e6c9;
      color: #2e7d32;
    }

    .mini-log {
      background: #ffe0b2;
      padding: 10px;
      border-radius: 4px;
      max-height: 150px;
      overflow-y: auto;
    }

    .mini-log h5 {
      margin: 0 0 8px 0;
      color: #e65100;
      font-size: 0.9em;
    }

    .event-item {
      font-size: 0.8em;
      padding: 3px 0;
      border-bottom: 1px solid rgba(230, 81, 0, 0.2);
      font-family: 'Courier New', monospace;
    }

    .event-item:last-child {
      border-bottom: none;
    }
  `],
})
export class ChildComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  // @Input 속성들
  @Input() childMessage: string = '기본 자식 메시지';
  @Input() childItem: string = '항목';

  // ViewChild 참조
  @ViewChild('childElement') childElement: ElementRef | undefined;

  // 컴포넌트 상태
  childId: string = '';
  createdAt: string = '';
  isInitialized: boolean = false;
  isViewInitialized: boolean = false;
  changeCount: number = 0;

  // 이벤트 로그
  events: string[] = [];

  // 생성자
  constructor() {
    // 생성자에서는 아직 @Input 값이 설정되지 않음
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    console.log(`[생성자] 자식 컴포넌트 생성됨 - ${timestamp}`);
    this.childId = `자식-${Math.random().toString(36).substring(7)}`;
    this.createdAt = timestamp;
  }

  // 로그 추가 메서드
  private addEvent(event: string): void {
    const timestamp = new Date().toLocaleTimeString('ko-KR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
    this.events.unshift(`${timestamp} - ${event}`);
    if (this.events.length > 10) {
      this.events.pop();
    }
    console.log(`[자식] ${event}`);
  }

  // 1. ngOnChanges - @Input 속성 변경 시
  ngOnChanges(changes: SimpleChanges): void {
    this.changeCount++;
    const changeInfo = Object.keys(changes)
      .map((key) => `${key}`)
      .join(', ');
    this.addEvent(`ngOnChanges - ${changeInfo} 변경됨`);
  }

  // 2. ngOnInit - 초기화
  ngOnInit(): void {
    this.isInitialized = true;
    this.addEvent(`ngOnInit - 자식 컴포넌트 초기화 완료`);
    this.addEvent(`  메시지: "${this.childMessage}", 항목: "${this.childItem}"`);
  }

  // 3. ngAfterViewInit - 뷰 초기화 완료
  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.addEvent(`ngAfterViewInit - 뷰 초기화 완료`);

    // ViewChild 접근 테스트
    if (this.childElement) {
      this.addEvent(`  요소 참조 확인`);
    }
  }

  // 4. ngOnDestroy - 컴포넌트 제거
  ngOnDestroy(): void {
    this.addEvent(`ngOnDestroy - 자식 컴포넌트 제거됨`);
  }
}
