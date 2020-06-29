import { Component } from '@angular/core';
import { FlowerService } from '../flower.service';


@Component({
  selector: 'app-host-parent',
  templateUrl: './host-parent.component.html',
  styleUrls: ['./host-parent.component.css'],
  providers: [{ provide: FlowerService, useValue: { emoji: '🌺' } }]

})
export class HostParentComponent {

  constructor(public flower: FlowerService) { }

}
