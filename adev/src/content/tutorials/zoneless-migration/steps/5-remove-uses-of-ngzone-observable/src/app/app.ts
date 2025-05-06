import {
  Component,
  afterNextRender,
  Injector,
  computed,
  signal,
  inject,
  NgZone,
  viewChild,
  ElementRef,
  DestroyRef,
} from '@angular/core';
import {take} from 'rxjs';
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
  private readonly ngZone: NgZone = inject(NgZone);
  private readonly injector = inject(Injector);

  rows = signal<number[]>([]);
  rowCount = computed(() => this.rows().length);
  totalHeight = computed(() => this.rowCount() * this.rowHeight);
  calculatedHeight = signal(0);

  addRow(): void {
    this.rows.update((rows: number[]) => [...rows, this.rowCount() + 1]);
  }

  removeRow(): void {
    this.rows.update((rows: number[]) => [...rows.slice(0, -1)]);
  }

  ngAfterViewChecked() {
    this.ngZone.onStable.pipe(take(1)).subscribe(() => {
      this.calculatedHeight.set(this.rowContainer().nativeElement.clientHeight);
    });
  }
}
