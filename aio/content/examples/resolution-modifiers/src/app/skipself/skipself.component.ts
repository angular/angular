import { Component, SkipSelf } from '@angular/core';
import { LeafService } from '../leaf.service';

// #docregion skipself-component
@Component({
  selector: 'app-skipself',
  templateUrl: './skipself.component.html',
  styleUrls: ['./skipself.component.css'],
  // 이 계층에 선언된 LeafService 인스턴스는 무시됩니다.
  providers: [{ provide: LeafService, useValue: { emoji: '🍁' } }]
})
export class SkipselfComponent {
  // 생성자에 @SkipSelf()를 사용했습니다.
  constructor(@SkipSelf() public leaf: LeafService) { }
}
// #enddocregion skipself-component

// @SkipSelf(): Specifies that the dependency resolution should start from the parent injector, not here.
