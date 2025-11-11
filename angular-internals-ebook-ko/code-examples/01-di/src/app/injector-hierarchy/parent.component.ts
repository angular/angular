import { Component, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildComponent } from './child.component';

@Injectable()
export class ParentService {
  getValue(): string {
    return '부모 인젝터의 서비스';
  }
}

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [CommonModule, ChildComponent],
  providers: [ParentService],
  template: `
    <div class="section">
      <h3>부모 컴포넌트</h3>
      <p>서비스 값: <code>{{ parentService.getValue() }}</code></p>
      <div class="injector-level">
        <app-child></app-child>
      </div>
    </div>
  `
})
export class ParentComponent {
  constructor(public parentService: ParentService) {}
}
