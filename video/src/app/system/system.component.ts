import { Component } from '@angular/core';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrl: './system.component.css'
})
export class SystemComponent {
  systemName = 'System 1';
  lines = ['Temperatur','Luftfeuchtigkeit'];

  onChangeSystem(name: string) {
    this.systemName = name;
  }
}
