import {Component, signal} from '@angular/core';
import {Grid, GridRow, GridCell, GridCellWidget} from '@angular/aria/grid';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.css',
  imports: [Grid, GridRow, GridCell, GridCellWidget],
})
export class App {
  tags = signal(['Unleash', 'Your', 'Creativity', 'With', 'Angular', 'Aria']);

  removeTag(index: number) {
    this.tags.update((tags) => [...tags.slice(0, index), ...tags.slice(index + 1)]);
  }
}
