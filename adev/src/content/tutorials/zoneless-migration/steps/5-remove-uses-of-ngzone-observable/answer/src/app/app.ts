import {
  Component,
  computed,
  signal,
  inject,
  viewChild,
  ElementRef,
  DestroyRef,
  afterNextRender,
} from '@angular/core';
import {ZonelessToggle} from './zoneless-toggle';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [ZonelessToggle, MatButtonModule, MatCardModule],
  styleUrl: `./app.css`,
})
export class App {
  readonly rowHeight = 20;
  private readonly rowContainer = viewChild.required<ElementRef>('rowContainer');

  rows = signal<number[]>([]);
  rowCount = computed(() => this.rows().length);
  totalHeight = computed(() => this.rowCount() * this.rowHeight);
  calculatedHeight = signal(0);

  constructor() {
    const observer = new ResizeObserver((entries) => {
      this.calculatedHeight.set(entries[0].contentRect.height);
    });
    inject(DestroyRef).onDestroy(() => observer.disconnect());
    afterNextRender({
      read: () => {
        observer.observe(this.rowContainer().nativeElement);
      },
    });
  }

  addRow(): void {
    this.rows.update((rows: number[]) => [...rows, this.rowCount() + 1]);
  }

  removeRow(): void {
    this.rows.update((rows: number[]) => [...rows.slice(0, -1)]);
  }
}
