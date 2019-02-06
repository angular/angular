import {Component} from '@angular/core';

/**
 * Component for toggling between two different views (e.g., "right" / "left").
 */
@Component({
  selector: 'toggle-panel',
  templateUrl: './toggle_panel.ng.html',
  styles: ['diag']
})
export class TogglePanel {
  showingLeft = true;
  get showingRight(): boolean { return !this.showingLeft; }
  toggle() { this.showingLeft = !this.showingLeft; }
}
