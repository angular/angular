import {Component} from '@angular/core';
import {MatChipInputEvent, MatSnackBar} from '@angular/material';


export interface Person {
  name: string;
}

@Component({
  moduleId: module.id,
  selector: 'chips-a11y',
  templateUrl: 'chips-a11y.html',
  styleUrls: ['chips-a11y.css'],
})
export class ChipsAccessibilityDemo {
  visible: boolean = true;
  color: string = '';
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = true;
  message: string = '';

  people: Person[] = [
    { name: 'Kara' },
    { name: 'Jeremy' },
    { name: 'Topher' },
    { name: 'Elad' },
    { name: 'Kristiyan' },
    { name: 'Paul' }
  ];

  availableColors = [
    { name: 'none', color: '' },
    { name: 'Primary', color: 'primary' },
    { name: 'Accent', color: 'accent' },
    { name: 'Warn', color: 'warn' }
  ];

  constructor(public snackBar: MatSnackBar) {}

  displayMessage(message: string): void {
    this.message = message;
  }

  add(event: MatChipInputEvent): void {
    let input = event.input;
    let value = event.value;

    // Add our person
    if ((value || '').trim()) {
      const name = value.trim();
      this.people.push({ name: name });
      this.snackBar.open(`${name} added`, '', {duration: 2000});
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

  }

  remove(person: Person): void {
    let index = this.people.indexOf(person);

    if (index >= 0) {
      this.people.splice(index, 1);
      this.snackBar.open(`${person.name} deleted`, '', {duration: 2000});
    }
  }

  toggleVisible(): void {
    this.visible = false;
  }


}
