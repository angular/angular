import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Computed 예제 컴포넌트
 *
 * Computed signal의 사용법을 보여줍니다:
 * - computed() 함수로 반응형 계산 값 생성
 * - 다른 signal에 의존하는 signal 생성
 * - 읽기 전용 signal
 * - 자동 메모이제이션과 캐싱
 */
interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-computed-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="computed-container">
      <!-- 제품 목록 -->
      <div class="products-section">
        <h3>🛒 제품 목록</h3>

        <!-- 제품 항목 -->
        <div class="product-list">
          <div *ngFor="let product of products()" class="product-item">
            <div class="product-info">
              <span class="product-name">{{ product.name }}</span>
              <span class="product-price">₩{{ product.price.toLocaleString() }}</span>
            </div>
            <div class="product-controls">
              <button (click)="decreaseQuantity(product.id)" class="btn-sm">-</button>
              <span class="quantity-display">{{ getProductQuantity(product.id) }}</span>
              <button (click)="increaseQuantity(product.id)" class="btn-sm">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Computed 값 표시 -->
      <div class="computed-section">
        <h3>📊 계산된 값 (Computed)</h3>

        <div class="stats-cards">
          <!-- 총 개수 -->
          <div class="stat-card">
            <div class="stat-label">총 항목 수</div>
            <div class="stat-value">{{ totalQuantity() }}</div>
            <div class="stat-desc">모든 제품의 수량 합계</div>
          </div>

          <!-- 총 가격 -->
          <div class="stat-card">
            <div class="stat-label">총 가격</div>
            <div class="stat-value">₩{{ totalPrice().toLocaleString() }}</div>
            <div class="stat-desc">수량별 가격 합계</div>
          </div>

          <!-- 평균 가격 -->
          <div class="stat-card">
            <div class="stat-label">평균 가격</div>
            <div class="stat-value">₩{{ averagePrice().toLocaleString() }}</div>
            <div class="stat-desc">{{ averagePrice() === 0 ? '상품 없음' : '계산됨' }}</div>
          </div>

          <!-- 가장 비싼 제품 -->
          <div class="stat-card">
            <div class="stat-label">가장 비싼 제품</div>
            <div class="stat-value">{{ mostExpensive() }}</div>
            <div class="stat-desc">최고 가격 제품명</div>
          </div>
        </div>
      </div>

      <!-- 데이터 소스 표시 -->
      <div class="source-section">
        <h3>📝 Signal 상태</h3>

        <div class="signal-display">
          <h4>products signal (기본 데이터)</h4>
          <div class="json-display">
            <pre>{{ products() | json }}</pre>
          </div>
        </div>

        <div class="signal-display">
          <h4>quantities signal (수량 맵)</h4>
          <div class="json-display">
            <pre>{{ quantities() | json }}</pre>
          </div>
        </div>
      </div>

      <!-- 설명 -->
      <div class="info-box">
        <h4>💡 Computed Signal의 특징</h4>
        <ul>
          <li><strong>자동 의존성 추적:</strong> computed 함수에서 읽는 signal을 자동으로 추적합니다</li>
          <li><strong>메모이제이션:</strong> 의존 signal이 변경되지 않으면 캐시된 값을 반환합니다</li>
          <li><strong>읽기 전용:</strong> computed signal은 set() 또는 update() 메서드가 없습니다</li>
          <li><strong>체이닝:</strong> computed signal은 다른 computed signal에 의존할 수 있습니다</li>
          <li><strong>성능:</strong> 불필요한 재계산을 피하므로 성능이 좋습니다</li>
          <li><strong>선언적:</strong> 값의 계산 방식을 명확하게 선언합니다</li>
        </ul>
      </div>

      <!-- 성능 모니터링 -->
      <div class="performance-section">
        <h3>⚡ 성능 정보</h3>
        <div class="value-display">
          <p><strong>totalQuantity() 호출 횟수:</strong> {{ computedCallCount }}</p>
          <p><strong>설명:</strong> Computed signal은 의존 값이 변경될 때만 재계산됩니다. 템플릿 렌더링 시마다 함수가 실행되지만, 내부 계산은 필요한 경우에만 수행됩니다.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .computed-container {
      padding: 0;
    }

    .products-section,
    .computed-section,
    .source-section,
    .performance-section {
      margin-bottom: 25px;
    }

    h3 {
      margin-top: 0;
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
    }

    .product-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .product-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f9f9f9;
      padding: 12px;
      border-radius: 4px;
      border-left: 4px solid #007bff;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .product-name {
      font-weight: 600;
      color: #333;
    }

    .product-price {
      font-size: 12px;
      color: #666;
    }

    .product-controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 12px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-sm:hover {
      background-color: #0056b3;
    }

    .quantity-display {
      min-width: 30px;
      text-align: center;
      font-weight: 600;
      color: #333;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .stat-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #ddd;
      text-align: center;
    }

    .stat-label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 22px;
      font-weight: bold;
      color: #007bff;
      font-family: 'Courier New', monospace;
      margin-bottom: 8px;
    }

    .stat-desc {
      font-size: 11px;
      color: #999;
    }

    .source-section {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #28a745;
    }

    .signal-display {
      margin-bottom: 15px;
    }

    .signal-display h4 {
      margin-top: 0;
      color: #333;
      font-size: 14px;
    }

    .json-display {
      background-color: #1e1e1e;
      color: #00ff00;
      padding: 12px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      overflow-x: auto;
      max-height: 150px;
      overflow-y: auto;
    }

    .json-display pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
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

    strong {
      color: #007bff;
    }

    .performance-section {
      background-color: #fff3cd;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #ffc107;
    }

    .value-display {
      background-color: white;
      border: 1px solid #ffc107;
      padding: 12px;
      border-radius: 4px;
      margin-top: 10px;
    }

    .value-display p {
      margin: 8px 0;
      font-size: 13px;
    }
  `]
})
export class ComputedExampleComponent {
  // 기본 데이터
  products = signal<Product[]>([
    { id: 1, name: '노트북', price: 1500000, quantity: 0 },
    { id: 2, name: '마우스', price: 50000, quantity: 0 },
    { id: 3, name: '키보드', price: 150000, quantity: 0 },
    { id: 4, name: '모니터', price: 400000, quantity: 0 },
    { id: 5, name: '헤드폰', price: 200000, quantity: 0 }
  ]);

  // 각 제품의 수량을 추적하는 signal
  // 맵 형식으로 ID => 수량
  quantities = signal<Map<number, number>>(new Map());

  // 총 수량 (computed)
  totalQuantity = computed(() => {
    const quantitiesMap = this.quantities();
    let total = 0;
    quantitiesMap.forEach(qty => {
      total += qty;
    });
    return total;
  });

  // 총 가격 (computed)
  totalPrice = computed(() => {
    const prods = this.products();
    const quantitiesMap = this.quantities();
    let total = 0;

    prods.forEach(product => {
      const qty = quantitiesMap.get(product.id) || 0;
      total += product.price * qty;
    });

    return total;
  });

  // 평균 가격 (computed)
  // 이 computed는 다른 computed에 의존합니다
  averagePrice = computed(() => {
    const total = this.totalPrice();
    const quantity = this.totalQuantity();

    return quantity > 0 ? Math.round(total / quantity) : 0;
  });

  // 가장 비싼 제품명 (computed)
  mostExpensive = computed(() => {
    const prods = this.products();
    const quantitiesMap = this.quantities();

    let maxPrice = 0;
    let maxName = '없음';

    prods.forEach(product => {
      const qty = quantitiesMap.get(product.id) || 0;
      if (qty > 0 && product.price > maxPrice) {
        maxPrice = product.price;
        maxName = product.name;
      }
    });

    return maxName;
  });

  // 성능 모니터링을 위한 카운터
  computedCallCount = 0;

  /**
   * 특정 제품의 수량을 증가시킵니다
   */
  increaseQuantity(productId: number): void {
    this.quantities.update(map => {
      const newMap = new Map(map);
      newMap.set(productId, (newMap.get(productId) || 0) + 1);
      return newMap;
    });
  }

  /**
   * 특정 제품의 수량을 감소시킵니다 (0 이하로 가지 않음)
   */
  decreaseQuantity(productId: number): void {
    this.quantities.update(map => {
      const newMap = new Map(map);
      const current = newMap.get(productId) || 0;
      if (current > 0) {
        newMap.set(productId, current - 1);
      }
      return newMap;
    });
  }

  /**
   * 특정 제품의 현재 수량을 반환합니다
   */
  getProductQuantity(productId: number): number {
    return this.quantities().get(productId) || 0;
  }

  /**
   * 카운터를 증가시키는 메서드
   * (성능 모니터링 용도)
   */
  constructor() {
    // 초기 quantities 설정
    const initialMap = new Map<number, number>();
    this.products().forEach(p => {
      initialMap.set(p.id, 0);
    });
    this.quantities.set(initialMap);
  }
}
