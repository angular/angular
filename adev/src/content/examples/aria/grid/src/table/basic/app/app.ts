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

type Priority = 'High' | 'Medium' | 'Low';

interface Task {
  taskId: number;
  summary: string;
  priority: Priority;
  assignee: string;
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
      taskId: 101,
      summary: 'Create Grid Aria Pattern',
      priority: 'High',
      assignee: 'Cyber Cat',
    },
    {
      selected: signal(false),
      taskId: 102,
      summary: 'Build a Pill List example',
      priority: 'Medium',
      assignee: 'Caffeinated Owl',
    },
    {
      selected: signal(false),
      taskId: 103,
      summary: 'Build a Calendar example',
      priority: 'Medium',
      assignee: 'Copybara',
    },
    {
      selected: signal(false),
      taskId: 104,
      summary: 'Build a Data Table example',
      priority: 'Low',
      assignee: 'Rubber Duck',
    },
    {
      selected: signal(false),
      taskId: 105,
      summary: 'Explore Grid possibilities',
      priority: 'High',
      assignee: '[Your Name Here]',
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
    this.tempInput = task.assignee;
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
      task.assignee = this.tempInput;
    }
  }

  updateSelection(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.data().forEach((t) => t.selected.set(checked));
  }

  sortTaskById(): void {
    this.sortAscending = !this.sortAscending;
    if (this.sortAscending) {
      this.data.update((tasks) => tasks.sort((a, b) => a.taskId - b.taskId));
    } else {
      this.data.update((tasks) => tasks.sort((a, b) => b.taskId - a.taskId));
    }
  }
}
