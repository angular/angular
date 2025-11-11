import { Component, ChangeDetectorRef, NgZone, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnPushComponent } from './onpush.component';
import { DefaultComponent } from './default.component';

/**
 * 변경 감지(Change Detection) 예제의 메인 컴포넌트
 *
 * 이 컴포넌트는 다음을 시연합니다:
 * 1. OnPush vs Default 변경 감지 전략 비교
 * 2. 성능 측정 및 비교
 * 3. 수동 변경 감지 제어 (ChangeDetectorRef)
 * 4. Zone.js와의 통합
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, OnPushComponent, DefaultComponent],
  template: `
    <div>
      <h1>Angular 변경 감지 (Change Detection) 예제</h1>

      <!-- 개요 섹션 -->
      <div class="section">
        <h2>변경 감지란?</h2>
        <p>
          변경 감지는 Angular의 핵심 메커니즘으로, 컴포넌트의 상태가 변경되었을 때
          템플릿을 업데이트하는 프로세스입니다. Angular는 Zone.js를 사용하여
          모든 비동기 이벤트를 감지하고 변경 감지를 트리거합니다.
        </p>

        <h3>주요 개념</h3>
        <ul class="list-items">
          <li><strong>변경 감지 전략:</strong> 어떤 조건에서 변경을 확인할지 결정</li>
          <li><strong>Zone.js:</strong> 비동기 작업을 감시하고 Angular 영역으로 진입/퇴출</li>
          <li><strong>ChangeDetectorRef:</strong> 수동으로 변경 감지를 제어하는 API</li>
          <li><strong>OnPush:</strong> 입력 변경 시에만 확인 (성능 최적화)</li>
          <li><strong>Default:</strong> 모든 이벤트 후 확인 (더 빈번한 확인)</li>
        </ul>
      </div>

      <!-- 전략 비교 섹션 -->
      <div class="section">
        <h2>1. OnPush vs Default 전략 비교</h2>

        <div class="demo-container">
          <app-onpush [inputValue]="sharedInputValue"></app-onpush>
          <app-default [inputValue]="sharedInputValue"></app-default>
        </div>

        <h3>전략 비교 테이블</h3>
        <table class="comparison-table">
          <thead>
            <tr>
              <th>기능</th>
              <th>Default 전략</th>
              <th>OnPush 전략</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="feature">@Input 변경</td>
              <td class="yes">✓ 확인</td>
              <td class="yes">✓ 확인</td>
            </tr>
            <tr>
              <td class="feature">이벤트 리스너</td>
              <td class="yes">✓ 확인</td>
              <td class="yes">✓ 확인</td>
            </tr>
            <tr>
              <td class="feature">setTimeout</td>
              <td class="yes">✓ 확인</td>
              <td class="no">✗ 확인 안 함</td>
            </tr>
            <tr>
              <td class="feature">Promise.then()</td>
              <td class="yes">✓ 확인</td>
              <td class="no">✗ 확인 안 함</td>
            </tr>
            <tr>
              <td class="feature">Observable</td>
              <td class="yes">✓ 확인</td>
              <td class="no">✗ 확인 안 함</td>
            </tr>
            <tr>
              <td class="feature">일반 JavaScript</td>
              <td class="yes">✓ 확인</td>
              <td class="no">✗ 확인 안 함</td>
            </tr>
            <tr>
              <td class="feature">성능 효율성</td>
              <td class="no">낮음</td>
              <td class="yes">높음</td>
            </tr>
          </tbody>
        </table>

        <div class="note">
          <strong>팁:</strong> 입력 속성을 변경해보세요. 양쪽 컴포넌트가 모두 업데이트됩니다.
          타이머를 시작하면 Default 컴포넌트는 업데이트되지만 OnPush는 업데이트 되지 않습니다.
        </div>
      </div>

      <!-- 수동 제어 섹션 -->
      <div class="section">
        <h2>2. 수동 변경 감지 제어</h2>

        <h3>ChangeDetectorRef 사용 예제</h3>
        <p>다음은 수동으로 변경 감지를 제어하는 여러 방법입니다:</p>

        <div style="background: #f4f4f4; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
          <p style="margin: 0 0 1rem 0;"><strong>현재 상태: {{ manualDetectionStatus }}</strong></p>

          <div class="button-group">
            <button (click)="triggerManualDetection()">
              detectChanges() - 즉시 감지
            </button>
            <button (click)="triggerMarkForCheck()">
              markForCheck() - 다음 사이클에서 확인
            </button>
            <button (click)="triggerDetach()">
              detach() - 자동 감지 비활성화
            </button>
            <button (click)="triggerReattach()">
              reattach() - 자동 감지 재활성화
            </button>
          </div>

          <div style="margin-top: 1rem;">
            <p><strong>설명:</strong></p>
            <ul class="list-items">
              <li><code>detectChanges()</code>: 이 컴포넌트와 자식들에 대해 즉시 변경 감지 실행</li>
              <li><code>markForCheck()</code>: 이 컴포넌트와 부모들을 다음 변경 감지 사이클에 포함</li>
              <li><code>detach()</code>: 자동 변경 감지를 비활성화 (성능 최적화용)</li>
              <li><code>reattach()</code>: 자동 변경 감지를 다시 활성화</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Zone.js 섹션 -->
      <div class="section">
        <h2>3. Zone.js 통합</h2>

        <p>
          Angular는 <code>Zone.js</code>를 사용하여 모든 비동기 작업을 감시합니다.
          <code>NgZone</code>을 사용하여 코드를 Angular 영역 내/외에서 실행할 수 있습니다.
        </p>

        <div class="button-group">
          <button (click)="runInsideAngularZone()">Angular Zone에서 실행</button>
          <button (click)="runOutsideAngularZone()">Angular Zone 밖에서 실행</button>
        </div>

        <div *ngIf="zoneTestResult" class="output">
          {{ zoneTestResult }}
        </div>

        <div style="margin-top: 1rem;">
          <h4>언제 Zone 밖에서 실행해야 할까?</h4>
          <ul class="list-items">
            <li>마우스 움직임 추적 (매우 빈번한 이벤트)</li>
            <li>고성능 애니메이션</li>
            <li>웹소켓 메시지 처리 (대량의 메시지)</li>
            <li>자주 업데이트되는 센서 데이터</li>
            <li>필요할 때만 수동으로 변경 감지 트리거</li>
          </ul>
        </div>
      </div>

      <!-- 성능 비교 섹션 -->
      <div class="section">
        <h2>4. 성능 고려 사항</h2>

        <p>
          <strong>권장사항:</strong> 대부분의 경우 Default 전략을 사용하세요.
          다음 경우에만 최적화를 고려하세요:
        </p>

        <ul class="list-items">
          <li>애플리케이션의 성능 프로파일링을 통해 병목 지점 확인</li>
          <li>많은 컴포넌트가 있는 큰 리스트 렌더링</li>
          <li>실시간 데이터 업데이트가 많은 경우</li>
          <li>모바일 기기에서 높은 성능 요구</li>
        </ul>

        <div class="note">
          <strong>주의:</strong> OnPush 전략을 사용할 때는 불변성(immutability)을 따르세요.
          객체의 참조가 바뀌지 않으면 변경을 감지하지 않습니다.
        </div>
      </div>

      <!-- 소스 코드 참조 섹션 -->
      <div class="section">
        <h2>소스 코드 참조</h2>
        <p>Angular 소스 코드에서 변경 감지 관련 파일:</p>
        <ul class="list-items">
          <li><code>packages/core/src/change_detection/change_detector_ref.ts</code> - ChangeDetectorRef</li>
          <li><code>packages/core/src/change_detection/differs/default_keyvalue_differ.ts</code> - 변경 감지 알고리즘</li>
          <li><code>packages/core/src/zone/ng_zone.ts</code> - NgZone</li>
          <li><code>packages/core/src/render3/view/view.ts</code> - 컴포넌트 뷰와 변경 감지</li>
          <li><code>packages/core/src/change_detection/constants.ts</code> - ChangeDetectionStrategy 정의</li>
        </ul>
      </div>

      <!-- 학습 포인트 -->
      <div class="section">
        <h2>학습 포인트 정리</h2>
        <ul class="list-items">
          <li>✅ Default 전략은 모든 비동기 이벤트 후 변경 감지 실행</li>
          <li>✅ OnPush 전략은 @Input 변경 또는 이벤트 발생 시에만 실행</li>
          <li>✅ ChangeDetectorRef를 사용하여 수동으로 변경 감지 제어</li>
          <li>✅ NgZone을 사용하여 Angular 영역 내/외에서 코드 실행</li>
          <li>✅ Zone.js가 모든 비동기 작업을 감시하고 Angular 진입/퇴출 감지</li>
          <li>✅ 성능 최적화는 필요할 때만 하고, 측정을 통해 검증</li>
          <li>✅ OnPush 사용 시 불변성 원칙 준수</li>
        </ul>
      </div>

      <!-- 다음 단계 -->
      <div class="section">
        <h2>다음 단계</h2>
        <p>이 개념들을 더 자세히 학습하려면:</p>
        <ul class="list-items">
          <li>Angular 공식 문서: <code>ChangeDetectionStrategy</code></li>
          <li>Angular DevTools를 사용한 성능 프로파일링</li>
          <li>Chrome DevTools의 Performance 탭으로 변경 감지 추적</li>
          <li>실제 프로젝트에서 OnPush 전략 적용 및 성능 측정</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  // 자식 컴포넌트와 공유할 입력값
  sharedInputValue: string = '';

  // 수동 감지 제어 상태
  manualDetectionStatus: string = 'normal';

  // Zone 테스트 결과
  zoneTestResult: string = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    console.log('변경 감지 예제 앱 초기화됨');
  }

  ngOnInit() {
    // 초기화 작업
    console.log('변경 감지 예제 앱 시작');
  }

  ngOnDestroy() {
    console.log('변경 감지 예제 앱 종료');
  }

  /**
   * 입력값 변경 (자식 컴포넌트의 @Input 변경 테스트)
   */
  changeInputValue() {
    this.sharedInputValue = `입력값 변경됨: ${new Date().toLocaleTimeString('ko-KR')}`;
  }

  /**
   * 수동 변경 감지 트리거: detectChanges()
   * 즉시 이 컴포넌트와 자식 컴포넌트에 대해 변경 감지 실행
   */
  triggerManualDetection() {
    console.log('ChangeDetectorRef.detectChanges() 호출');
    this.manualDetectionStatus = `detectChanges() 실행됨: ${new Date().toLocaleTimeString('ko-KR')}`;
    this.cdr.detectChanges();
  }

  /**
   * 수동 변경 감지 트리거: markForCheck()
   * 이 컴포넌트와 부모들을 다음 변경 감지 사이클에 표시
   */
  triggerMarkForCheck() {
    console.log('ChangeDetectorRef.markForCheck() 호출');
    this.manualDetectionStatus = `markForCheck() 실행됨: ${new Date().toLocaleTimeString('ko-KR')}`;
    this.cdr.markForCheck();
  }

  /**
   * 자동 변경 감지 비활성화: detach()
   * 이 컴포넌트를 변경 감지 트리로에서 분리
   */
  triggerDetach() {
    console.log('ChangeDetectorRef.detach() 호출 - 자동 변경 감지 비활성화');
    this.manualDetectionStatus = `detach() 실행됨 - 자동 감지 비활성화됨: ${new Date().toLocaleTimeString('ko-KR')}`;
    this.cdr.detach();
  }

  /**
   * 자동 변경 감지 재활성화: reattach()
   * detach()로 분리된 컴포넌트를 다시 연결
   */
  triggerReattach() {
    console.log('ChangeDetectorRef.reattach() 호출 - 자동 변경 감지 재활성화');
    this.manualDetectionStatus = `reattach() 실행됨 - 자동 감지 재활성화됨: ${new Date().toLocaleTimeString('ko-KR')}`;
    this.cdr.reattach();
  }

  /**
   * Angular Zone 내에서 코드 실행
   * 모든 비동기 작업이 변경 감지를 트리거함
   */
  runInsideAngularZone() {
    this.zoneTestResult = '로딩 중...';
    console.log('Angular Zone 내에서 실행 시작');

    this.ngZone.run(() => {
      // 이 코드는 Angular Zone 내에서 실행됨
      setTimeout(() => {
        this.zoneTestResult = `
Angular Zone 내에서 실행됨 (${new Date().toLocaleTimeString('ko-KR')})

setTimeout은 이미 완료되었고, 변경 감지가 자동으로 트리거되었습니다.
페이지가 자동으로 업데이트됩니다.
        `;
        console.log('Angular Zone 내부: setTimeout 완료 - 변경 감지 트리거됨');
      }, 1000);
    });
  }

  /**
   * Angular Zone 외부에서 코드 실행
   * 비동기 작업이 변경 감지를 트리거하지 않음
   */
  runOutsideAngularZone() {
    this.zoneTestResult = '로딩 중...';
    console.log('Angular Zone 외부에서 실행 시작');

    // Angular Zone 외부에서 코드 실행
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        // Zone 외부에서 setTimeout이 완료되었지만 아직 변경 감지 안 됨
        // 수동으로 Angular Zone으로 진입해야 함
        this.ngZone.run(() => {
          this.zoneTestResult = `
Angular Zone 외부에서 실행됨 (${new Date().toLocaleTimeString('ko-KR')})

setTimeout이 완료되었지만, Zone 외부에서 실행되어 자동 변경 감지가 없었습니다.
ngZone.run()을 사용하여 수동으로 Zone으로 진입했습니다.

이는 성능 최적화에 유용합니다:
- 마우스 움직임, 스크롤 등 빈번한 이벤트는 Zone 외부에서 처리
- 필요한 순간에만 ngZone.run()으로 Zone 진입
- 불필요한 변경 감지 사이클 제거
          `;
          console.log('Zone 외부: setTimeout 완료 후 Zone으로 재진입 - 변경 감지 트리거됨');
        });
      }, 1000);
    });
  }
}
