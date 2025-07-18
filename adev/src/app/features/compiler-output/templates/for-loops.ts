export const forLoopsTemplate = `<div>For loops examples</div>
@for(item of [1,2,3,4]; track $index) {
  <span>{{item}}</span>
}

<br>

<span *ngFor="let item of [1,2,3,4]">{{item}}</span>`;
