import {animate, state, style, transition, trigger} from '@angular/animations';
import {Component} from '@angular/core';
@Component({
  selector: 'app-open-close',
  animations: [
    trigger('openClose', [
      // ...
      state('open', style({height: '200px', opacity: 1, backgroundColor: 'yellow'})),
      state('closed', style({height: '100px', opacity: 0.8, backgroundColor: 'blue'})),
      transition('open => closed', [animate('1s')]),
      transition('closed => open', [animate('0.5s')]),
    ]),
  ],
  template: `<nav>
    <button type="button" (click)="toggle()">Toggle Open/Close</button>
  </nav>
  
  <div [@openClose]="isOpen ? 'open' : 'closed'" class="open-close-container">
    <p>The box is now {{ isOpen ? 'Open' : 'Closed' }}!</p>
  </div>`,
  styles: [
    `:host {
        display: block;
        margin-top: 1rem;
      }
      
      .open-close-container {
        border: 1px solid #dddddd;
        margin-top: 1em;
        padding: 20px 20px 0px 20px;
        color: #000000;
        font-weight: bold;
        font-size: 20px;
      }`,
  ],
  standalone: true,
})
export class OpenCloseComponent {
  isOpen = true;

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
