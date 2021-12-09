import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

import {IndexedNode} from '../directive-forest/index-forest';

@Component({
  templateUrl: './property-tab-header.component.html',
  selector: 'ng-property-tab-header',
  styleUrls: ['./property-tab-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyTabHeaderComponent {
  @Input() currentSelectedElement: IndexedNode;
  @Input() currentDirectives: string[]|undefined;
  @Output() viewSource = new EventEmitter<void>();

  handleViewSource(event: MouseEvent): void {
    event.stopPropagation();
    this.viewSource.emit();
  }
}
