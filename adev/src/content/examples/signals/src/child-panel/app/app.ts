import {Component, computed, viewChild} from '@angular/core';
import {Child} from './child';

@Component({
  selector: 'app-child-panel',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Child],
})
export class ChildPanel {
  childPanel = viewChild.required<Child>('panel');

  childStatus = computed(() => {
    const panel = this.childPanel();
    return panel.isExpanded() ? 'Expanded' : 'Collapsed';
  });

  toggleChild() {
    this.childPanel().toggle();
  }
}
