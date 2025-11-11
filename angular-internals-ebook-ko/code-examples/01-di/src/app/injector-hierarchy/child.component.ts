import { Component, Injectable, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

@Injectable()
export class ChildService {
  getValue(): string {
    return '자식 인젝터의 서비스';
  }
}

@Component({
  selector: 'app-child',
  standalone: true,
  imports: [CommonModule],
  providers: [ChildService],
  template: `
    <div class="section">
      <h4>자식 컴포넌트</h4>
      <p>자식 서비스: <code>{{ childService.getValue() }}</code></p>
      <p class="output">
        ✅ 자식 인젝터는 먼저 자신의 providers를 확인합니다
        ✅ 찾지 못하면 부모 인젝터로 올라갑니다
        ✅ 최종적으로 루트 인젝터까지 도달합니다
      </p>
    </div>
  `
})
export class ChildComponent {
  constructor(public childService: ChildService) {}
}
