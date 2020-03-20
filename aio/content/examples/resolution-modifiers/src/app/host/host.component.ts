import { Component, Host, Optional } from '@angular/core';
import { FlowerService } from '../flower.service';

// #docregion host-component
@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css'],
  //  서비스 프로바이더를 등록합니다.
  providers: [{ provide: FlowerService, useValue: { emoji: '🌼' } }]
})
export class HostComponent {
  // 생성자에 @Host()를 사용했습니다.
  constructor(@Host() @Optional() public flower?: FlowerService) { }

}
// #enddocregion host-component

// if you take out @Host() and the providers array, flower will be red hibiscus


