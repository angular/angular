import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  actionName = 'Go for it';
  isSpecial = true;
  itemClearance = true;
  resetClasses = 'new-class';
  canSave = true;

}
