import {Component} from '@angular/core';
import {LeafService} from './leaf.service';
import {FlowerService} from './flower.service';
import {HostComponent} from './host/host.component';
import {OptionalComponent} from './optional/optional.component';
import {SelfComponent} from './self/self.component';
import {HostParentComponent} from './host-parent/host-parent.component';
import {HostChildComponent} from './host-child/host-child.component';
import {SelfNoDataComponent} from './self-no-data/self-no-data.component';
import {SkipselfComponent} from './skipself/skipself.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    HostComponent,
    HostChildComponent,
    HostParentComponent,
    OptionalComponent,
    SelfComponent,
    SelfNoDataComponent,
    SkipselfComponent,
  ],
})
export class AppComponent {
  name = 'Angular';
  constructor(
    public flower: FlowerService,
    public leaf: LeafService,
  ) {}
}
