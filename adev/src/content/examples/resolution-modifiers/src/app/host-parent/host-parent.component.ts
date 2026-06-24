import {Component, inject} from '@angular/core';
import {FlowerService} from '../flower.service';
import {HostComponent} from '../host/host.component';

@Component({
  selector: 'app-host-parent',
  templateUrl: './host-parent.component.html',
  styleUrls: ['./host-parent.component.css'],
  providers: [{provide: FlowerService, useValue: {emoji: '🌺'}}],
  imports: [HostComponent],
})
export class HostParentComponent {
  public flower = inject(FlowerService);
}
