import {Component} from '@angular/core';


const itemSizeSample = [100, 25, 50, 50, 100, 200, 75, 100, 50, 250];


@Component({
  moduleId: module.id,
  selector: 'virtual-scroll-e2e',
  templateUrl: 'virtual-scroll-e2e.html',
  styleUrls: ['virtual-scroll-e2e.css'],
})
export class VirtualScrollE2E {
  uniformItems = Array(1000).fill(50);
  variableItems = Array(100).fill(0).reduce(acc => acc.concat(itemSizeSample), []);
}
