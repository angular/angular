import { Component, Input } from '@angular/core';
import { IndexedNode } from '../../directive-forest/index-forest';

@Component({
  templateUrl: './property-tab-body.component.html',
  selector: 'ng-property-tab-body',
  styleUrls: ['./property-tab-body.component.scss'],
})
export class PropertyTabBodyComponent {
  @Input() currentSelectedElement: IndexedNode | null;

  getCurrentDirectives(): string[] | undefined {
    if (!this.currentSelectedElement) {
      return;
    }
    const directives = this.currentSelectedElement.directives.map((d) => d.name);
    if (this.currentSelectedElement.component) {
      directives.push(this.currentSelectedElement.component.name);
    }
    return directives;
  }
}
