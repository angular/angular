import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * 리스트 렌더링 최적화 컴포넌트
 *
 * trackBy를 사용한 효율적인 리스트 렌더링을 시연합니다.
 *
 * 성능 비교:
 * - trackBy 없음: 리스트가 변경될 때 모든 DOM 요소가 재생성
 * - trackBy 있음: 변경된 항목만 업데이트, 주문 변경 시에만 DOM 재정렬
 */
@Component({
  selector: 'app-list-rendering',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="subsection">
      <h3>리스트 렌더링 성능 최적화</h3>

      <div class="controls">
        <button (click)="addItem()">항목 추가</button>
        <button (click)="removeItem()">마지막 항목 제거</button>
        <button (click)="shuffleItems()">섞기</button>
        <button (click)="updateRandomItem()">랜덤 항목 업데이트</button>
        <button (click)="clearRenderLog()">렌더링 로그 지우기</button>
      </div>

      <!-- trackBy가 없는 리스트 (비효율적) -->
      <div class="render-demo">
        <h4>
          trackBy 없음
          <span class="badge warning">비효율적</span>
        </h4>
        <p style="font-size: 0.9rem; color: #666;">
          모든 항목이 재생성되므로 <code>ngOnInit</code>이 매번 호출됩니다
        </p>
        <ul class="item-list" [attr.data-group]="'without-trackby'">
          <li *ngFor="let item of items()">
            <span>
              <strong>{{ item.id }}:</strong> {{ item.name }}
              <span class="badge info">{{ item.renderCount }}</span>
            </span>
            <button (click)="editItem(item)" class="small">편집</button>
          </li>
        </ul>
      </div>

      <!-- trackBy가 있는 리스트 (효율적) -->
      <div class="render-demo">
        <h4>
          trackBy 사용
          <span class="badge success">효율적</span>
        </h4>
        <p style="font-size: 0.9rem; color: #666;">
          변경된 항목만 업데이트되므로 성능이 훨씬 좋습니다
        </p>
        <ul class="item-list" [attr.data-group]="'with-trackby'">
          <li *ngFor="let item of items(); trackBy: trackByFn">
            <span>
              <strong>{{ item.id }}:</strong> {{ item.name }}
              <span class="badge success">{{ item.renderCount }}</span>
            </span>
            <button (click)="editItem(item)" class="small">편집</button>
          </li>
        </ul>
      </div>

      <p class="output">
        💡 <strong>trackBy의 중요성:</strong>
        trackBy 함수는 각 항목의 고유 식별자를 반환합니다.
        Angular는 이를 사용하여:
        - 항목이 추가/제거되었는지 감지
        - 항목의 위치가 변경되었는지 감지
        - 실제로 변경된 항목만 DOM을 업데이트

        결과적으로 성능 향상과 자식 컴포넌트의 상태 보존이 가능합니다.
      </p>
    </div>

    <!-- 성능 분석 섹션 -->
    <div class="subsection">
      <h3>성능 분석</h3>

      <div class="stats">
        <div class="stat-card">
          <h4>총 항목 수</h4>
          <div class="stat-value">{{ items().length }}</div>
        </div>
        <div class="stat-card">
          <h4>총 렌더링 횟수</h4>
          <div class="stat-value">{{ totalRenderCount() }}</div>
        </div>
        <div class="stat-card">
          <h4>평균 항목 렌더링</h4>
          <div class="stat-value">{{ averageRenderPerItem() }}</div>
        </div>
      </div>

      <p class="output">
        trackBy 없이 3개 항목을 추가하면:
        - 1번째: 1개 항목 렌더링 (새로 추가됨)
        - 2번째: 2개 항목 렌더링 (기존 항목도 재생성)
        - 3번째: 3개 항목 렌더링 (모두 재생성)

        trackBy 사용 시:
        - 1번째: 1개 항목만 렌더링
        - 2번째: 1개 항목만 렌더링 (새로 추가된 것)
        - 3번째: 1개 항목만 렌더링 (새로 추가된 것)
      </p>
    </div>

    <!-- 렌더링 로그 -->
    <div class="subsection" *ngIf="renderLog().length > 0">
      <h3>렌더링 로그 (최근 10개)</h3>
      <div class="output">
        <ul style="list-style: none; padding: 0;">
          <li *ngFor="let log of renderLog().slice(-10)">
            <small>
              {{ log.timestamp | date:'HH:mm:ss.SSS' }} - {{ log.message }}
            </small>
          </li>
        </ul>
      </div>
    </div>

    <!-- trackBy 패턴 설명 -->
    <div class="subsection">
      <h3>trackBy 구현 패턴</h3>
      <div class="lview-diagram">
        <code>
// trackBy 함수는 두 가지 매개변수를 받습니다:
// 1. index: 현재 항목의 배열 인덱스
// 2. item: 현재 항목 객체

trackByFn(index: number, item: Item): any {
  // 항목의 고유 식별자 반환
  // 일반적으로 id 필드를 사용합니다
  return item.id;

  // 또는 복합 키를 사용할 수 있습니다
  // return `{{ item.id }}-{{ item.version }}`;
}

// 템플릿에서 사용:
&lt;li *ngFor="let item of items; trackBy: trackByFn"&gt;
  {{ item.name }}
&lt;/li&gt;

// trackBy가 없으면:
&lt;li *ngFor="let item of items"&gt;
  {{ item.name }}
&lt;/li&gt;
        </code>
      </div>
    </div>

    <!-- 실제 사용 예시 -->
    <div class="subsection">
      <h3>실제 사용 사례</h3>
      <ul class="rendering-list">
        <li>
          <span><strong>API 응답 리스트:</strong> 서버에서 받은 데이터의 id를 trackBy로 사용</span>
          <span class="badge success">권장</span>
        </li>
        <li>
          <span><strong>사용자 입력 리스트:</strong> UUID 또는 고유 식별자 필요</span>
          <span class="badge success">권장</span>
        </li>
        <li>
          <span><strong>필터링된 리스트:</strong> 원본 id를 trackBy로 유지</span>
          <span class="badge success">권장</span>
        </li>
        <li>
          <span><strong>소수 항목 리스트:</strong> trackBy 선택적 (5개 이하)</span>
          <span class="badge info">선택적</span>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ListRenderingComponent {
  // 항목 인터페이스
  interface Item {
    id: number;
    name: string;
    renderCount: number;
  }

  // 항목 신호
  private itemsData = signal<Item[]>([
    { id: 1, name: '항목 1', renderCount: 1 },
    { id: 2, name: '항목 2', renderCount: 1 },
    { id: 3, name: '항목 3', renderCount: 1 },
  ]);

  items = computed(() => this.itemsData());

  // 렌더링 로그
  private logs = signal<Array<{ timestamp: Date; message: string }>>([]);
  renderLog = computed(() => this.logs());

  // 성능 메트릭
  totalRenderCount = computed(() => {
    return this.items().reduce((sum, item) => sum + item.renderCount, 0);
  });

  averageRenderPerItem = computed(() => {
    const items = this.items();
    if (items.length === 0) return 0;
    return Math.round((this.totalRenderCount() / items.length) * 100) / 100;
  });

  private nextId = 4;

  /**
   * trackBy 함수
   * 각 항목의 고유 식별자를 반환하여 Angular가 항목을 추적하게 함
   *
   * LView 관점에서:
   * - trackBy 없음: 매번 모든 항목을 새로 생성
   * - trackBy 있음: 동일한 id를 가진 항목은 재사용하고 필요한 부분만 업데이트
   */
  trackByFn(index: number, item: Item): any {
    // id를 기준으로 추적
    return item.id;
  }

  /**
   * 항목 추가
   */
  addItem() {
    const newItem: Item = {
      id: this.nextId++,
      name: `항목 ${this.nextId}`,
      renderCount: 1,
    };

    this.itemsData.set([...this.items(), newItem]);
    this.addLog(`항목 ${newItem.id} 추가됨`);
  }

  /**
   * 마지막 항목 제거
   */
  removeItem() {
    if (this.items().length > 0) {
      const removed = this.items()[this.items().length - 1];
      this.itemsData.set(this.items().slice(0, -1));
      this.addLog(`항목 ${removed.id} 제거됨`);
    }
  }

  /**
   * 항목 섞기
   * 이것은 trackBy 없이 liDER 변경을 테스트합니다
   */
  shuffleItems() {
    const items = [...this.items()];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    this.itemsData.set(items);
    this.addLog('항목이 섞였습니다');
  }

  /**
   * 랜덤 항목 업데이트
   */
  updateRandomItem() {
    if (this.items().length === 0) return;

    const items = this.items();
    const randomIndex = Math.floor(Math.random() * items.length);
    const updated = [...items];

    updated[randomIndex] = {
      ...updated[randomIndex],
      name: `항목 ${updated[randomIndex].id} (수정됨)`,
      renderCount: updated[randomIndex].renderCount + 1,
    };

    this.itemsData.set(updated);
    this.addLog(`항목 ${updated[randomIndex].id} 업데이트됨`);
  }

  /**
   * 항목 편집 (UI에서 호출)
   */
  editItem(item: Item) {
    const items = this.items();
    const index = items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        name: `${updated[index].name} (편집됨)`,
        renderCount: updated[index].renderCount + 1,
      };
      this.itemsData.set(updated);
      this.addLog(`항목 ${item.id} 편집됨`);
    }
  }

  /**
   * 로그 추가
   */
  private addLog(message: string) {
    const logs = [...this.logs()];
    logs.push({
      timestamp: new Date(),
      message: message,
    });
    if (logs.length > 50) logs.shift();
    this.logs.set(logs);
  }

  /**
   * 로그 지우기
   */
  clearRenderLog() {
    this.logs.set([]);
  }
}
