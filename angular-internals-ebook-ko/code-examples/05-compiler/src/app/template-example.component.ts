import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 다양한 템플릿 문법을 보여주는 컴포넌트
// 이 모든 문법은 컴파일러에 의해 처리됩니다
@Component({
  selector: 'app-template-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="template-demo">
      <h3>템플릿 예제 - 컴파일러가 처리하는 다양한 문법</h3>

      <!-- 1. 인터폴레이션 (Interpolation) -->
      <div>
        <p><strong>1. 데이터 인터폴레이션:</strong></p>
        <p>메시지: {{ message }}</p>
        <p>계산식: {{ 2 + 3 }} = 5</p>
        <p>메서드 호출: {{ getGreeting() }}</p>
      </div>

      <!-- 2. 프로퍼티 바인딩 -->
      <div>
        <p><strong>2. 프로퍼티 바인딩:</strong></p>
        <button [disabled]="isDisabled">
          {{ isDisabled ? '비활성화됨' : '활성화됨' }}
        </button>
        <p [style.color]="dynamicColor">동적 색상 텍스트</p>
        <p [style.font-weight]="fontSize > 16 ? 'bold' : 'normal'">
          동적 폰트 크기
        </p>
      </div>

      <!-- 3. 이벤트 바인딩 -->
      <div>
        <p><strong>3. 이벤트 바인딩:</strong></p>
        <button (click)="handleClick()">클릭하세요</button>
        <input (keyup)="handleKeyup($event)" placeholder="입력해보세요">
        <p *ngIf="lastAction">마지막 동작: {{ lastAction }}</p>
      </div>

      <!-- 4. 양방향 바인딩 -->
      <div>
        <p><strong>4. 양방향 바인딩 (ngModel):</strong></p>
        <input [(ngModel)]="twoWayValue" placeholder="양방향 바인딩">
        <p>입력된 값: {{ twoWayValue }}</p>
      </div>

      <!-- 5. 구조적 디렉티브 - *ngIf -->
      <div>
        <p><strong>5. 조건부 렌더링 (*ngIf):</strong></p>
        <button (click)="toggleVisible()">보이기/숨기기</button>
        <p *ngIf="isVisible">이것은 조건부로 표시되는 텍스트입니다</p>
        <p *ngIf="!isVisible">아, 숨겨졌어요!</p>
      </div>

      <!-- 6. 구조적 디렉티브 - *ngFor -->
      <div>
        <p><strong>6. 리스트 렌더링 (*ngFor):</strong></p>
        <ul>
          <li *ngFor="let item of items; let i = index; let isLast = last">
            {{ i + 1 }}. {{ item }}
            <span *ngIf="isLast"> (마지막)</span>
          </li>
        </ul>
      </div>

      <!-- 7. 구조적 디렉티브 - *ngSwitch -->
      <div>
        <p><strong>7. 조건 분기 (*ngSwitch):</strong></p>
        <select [(ngModel)]="selectedOption">
          <option value="option1">옵션 1</option>
          <option value="option2">옵션 2</option>
          <option value="option3">옵션 3</option>
        </select>

        <div [ngSwitch]="selectedOption">
          <p *ngSwitchCase="'option1'">옵션 1을 선택했습니다</p>
          <p *ngSwitchCase="'option2'">옵션 2를 선택했습니다</p>
          <p *ngSwitchCase="'option3'">옵션 3을 선택했습니다</p>
          <p *ngSwitchDefault>기본 옵션</p>
        </div>
      </div>

      <!-- 8. 클래스 바인딩 -->
      <div>
        <p><strong>8. 클래스 바인딩:</strong></p>
        <div [class.highlight]="isHighlighted"
             [class.active]="isActive">
          클래스가 동적으로 적용됩니다
        </div>
      </div>

      <!-- 9. 스타일 바인딩 -->
      <div>
        <p><strong>9. 스타일 바인딩:</strong></p>
        <div [ngStyle]="{ 'background-color': bgColor, 'padding': '1rem' }">
          ngStyle로 스타일을 동적으로 적용
        </div>
      </div>

      <!-- 10. 템플릿 참조 변수 -->
      <div>
        <p><strong>10. 템플릿 참조 변수 (#ref):</strong></p>
        <input #nameInput type="text" placeholder="이름 입력">
        <button (click)="greetUser(nameInput.value)">인사하기</button>
        <p *ngIf="userGreeting">{{ userGreeting }}</p>
      </div>

      <!-- 11. 파이프 -->
      <div>
        <p><strong>11. 파이프 변환:</strong></p>
        <p>대문자: {{ message | uppercase }}</p>
        <p>소문자: {{ message | lowercase }}</p>
        <p>현재 날짜: {{ currentDate | date:'short' }}</p>
      </div>

      <!-- 12. 안전 네비게이션 -->
      <div>
        <p><strong>12. 안전 네비게이션 (?.)</strong></p>
        <p>옵셔널 객체: {{ optionalObj?.property }}</p>
      </div>
    </div>

    <!-- 컴파일러 설명 -->
    <div class="info-box">
      <strong>📝 컴파일러의 처리:</strong>
      <p>
        위의 모든 템플릿 문법은 컴파일 타임에 다음과 같이 처리됩니다:
      </p>
      <ol style="margin-left: 2rem; margin-top: 1rem;">
        <li>✅ 문법 분석 (Parsing) - 템플릿을 AST로 변환</li>
        <li>✅ 표현식 검사 - 변수/메서드 존재 여부 확인</li>
        <li>✅ 타입 검사 - strictTemplates 옵션 적용</li>
        <li>✅ 코드 생성 - TypeScript 코드로 변환</li>
        <li>✅ 최적화 - 불필요한 코드 제거</li>
      </ol>
    </div>

    <div class="success-box">
      <strong>💡 AOT의 장점:</strong>
      이 모든 검사가 <strong>빌드 타임</strong>에 발생하므로,
      사용자는 오류 없이 완벽하게 컴파일된 코드만 다운로드합니다!
    </div>
  `
})
export class TemplateExampleComponent {
  // ===== 데이터 프로퍼티 =====
  message = '안녕하세요, Angular 컴파일러!';
  twoWayValue = '';
  isDisabled = false;
  isVisible = true;
  isHighlighted = false;
  isActive = true;
  dynamicColor = '#dd0031';
  fontSize = 16;
  bgColor = '#e3f2fd';
  selectedOption = 'option1';
  lastAction = '';
  userGreeting = '';
  currentDate = new Date();

  // ===== 리스트 데이터 =====
  items = [
    'TypeScript 분석',
    '템플릿 파싱',
    '타입 검사',
    '코드 생성',
    '최적화'
  ];

  // ===== 옵셔널 객체 =====
  optionalObj = {
    property: '안전한 접근'
  };

  // ===== 메서드 =====

  /**
   * 인사말을 반환합니다.
   * 컴파일러는 이 메서드를 템플릿에서 호출할 수 있는지 검증합니다.
   */
  getGreeting(): string {
    return '컴파일러 예제를 환영합니다!';
  }

  /**
   * 클릭 이벤트 처리
   */
  handleClick(): void {
    this.lastAction = '클릭이 감지되었습니다';
  }

  /**
   * 키업 이벤트 처리
   */
  handleKeyup(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.lastAction = `입력됨: ${target.value}`;
  }

  /**
   * 보이기/숨기기 토글
   */
  toggleVisible(): void {
    this.isVisible = !this.isVisible;
  }

  /**
   * 사용자에게 인사하기
   */
  greetUser(name: string): void {
    if (name.trim()) {
      this.userGreeting = `안녕하세요, ${name}님!`;
    }
  }
}
