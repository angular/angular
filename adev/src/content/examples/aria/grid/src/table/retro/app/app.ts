import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Grid, GridRow, GridCell, GridCellWidget} from '@angular/aria/grid';

type Rank = 'S' | 'A' | 'B' | 'C';

interface Task {
  reward: number;
  target: string;
  rank: Rank;
  hunter: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [Grid, GridRow, GridCell, GridCellWidget, FormsModule],
})
export class App {
  private readonly _headerCheckbox = viewChild<ElementRef<HTMLInputElement>>('headerCheckbox');

  readonly allSelected = computed(() => this.data().every((t) => t.selected()));
  readonly partiallySelected = computed(
    () => !this.allSelected() && this.data().some((t) => t.selected()),
  );
  readonly data = signal<(Task & {selected: WritableSignal<boolean>})[]>([
    {
      selected: signal(false),
      reward: 50,
      target: '10 Goblins',
      rank: 'C',
      hunter: 'KB Smasher',
    },
    {
      selected: signal(false),
      reward: 999,
      target: '1 Dragon',
      rank: 'S',
      hunter: 'Donkey',
    },
    {
      selected: signal(false),
      reward: 150,
      target: '2 Trolls',
      rank: 'B',
      hunter: 'Meme Spammer',
    },
    {
      selected: signal(false),
      reward: 500,
      target: '1 Demon',
      rank: 'A',
      hunter: 'Dante',
    },
    {
      selected: signal(false),
      reward: 10,
      target: '5 Slimes',
      rank: 'C',
      hunter: '[Help Wanted]',
    },
  ]);

  sortAscending: boolean = true;
  tempInput: string = '';

  constructor() {
    afterRenderEffect(() => {
      this._headerCheckbox()!.nativeElement.indeterminate = this.partiallySelected();
    });
  }

  startEdit(
    event: KeyboardEvent | FocusEvent | undefined,
    task: Task,
    inputEl: HTMLInputElement,
  ): void {
    this.tempInput = task.hunter;
    inputEl.focus();

    if (!(event instanceof KeyboardEvent)) return;

    // Start editing with an alphanumeric character.
    if (event.key.length === 1) {
      this.tempInput = event.key;
    }
  }

  onClickEdit(widget: GridCellWidget, task: Task, inputEl: HTMLInputElement) {
    if (widget.isActivated()) return;

    widget.activate();
    setTimeout(() => this.startEdit(undefined, task, inputEl));
  }

  completeEdit(event: KeyboardEvent | FocusEvent | undefined, task: Task): void {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    if (event.key === 'Enter') {
      task.hunter = this.tempInput;
    }
  }

  updateSelection(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.data().forEach((t) => t.selected.set(checked));
  }

  sortTaskById(): void {
    this.sortAscending = !this.sortAscending;
    if (this.sortAscending) {
      this.data.update((tasks) => tasks.sort((a, b) => a.reward - b.reward));
    } else {
      this.data.update((tasks) => tasks.sort((a, b) => b.reward - a.reward));
    }
  }
}
