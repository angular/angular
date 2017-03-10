import {Component} from '@angular/core';

export interface Person {
  name: string;
}

export interface DemoColor {
  name: string;
  color: string;
}

@Component({
  moduleId: module.id,
  selector: 'chips-demo',
  templateUrl: 'chips-demo.html',
  styleUrls: ['chips-demo.css']
})
export class ChipsDemo {
  visible: boolean = true;
  color: string = '';

  people: Person[] = [
    { name: 'Kara' },
    { name: 'Jeremy' },
    { name: 'Topher' },
    { name: 'Elad' },
    { name: 'Kristiyan' },
    { name: 'Paul' }
  ];

  availableColors: DemoColor[] = [
    { name: 'none', color: '' },
    { name: 'Primary', color: 'primary' },
    { name: 'Accent', color: 'accent' },
    { name: 'Warn', color: 'warn' }
  ];

  alert(message: string): void {
    alert(message);
  }

  add(input: HTMLInputElement): void {
    if (input.value && input.value.trim() != '') {
      this.people.push({ name: input.value.trim() });
      input.value = '';
    }
  }

  toggleVisible(): void {
    this.visible = false;
  }
}
