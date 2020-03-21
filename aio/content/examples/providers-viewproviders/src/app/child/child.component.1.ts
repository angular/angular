import { Component, OnInit, Host, SkipSelf, Optional } from '@angular/core';
import { FlowerService } from '../flower.service';

// #docregion flowerservice
@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.css'],
  // providers 배열을 사용해서 서비스 프로바이더를 등록합니다.
  providers: [{ provide: FlowerService, useValue: { emoji: '🌻' } }]
})

export class ChildComponent {
  // 서비스를 의존성으로 주입합니다.
  constructor( public flower: FlowerService) { }
}

// #enddocregion flowerservice

