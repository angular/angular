import {Component} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  template: `
    <form [formGroup]="form">
      <label>User : </label>
      <input type="text" formControlName="username" />

      <fieldset>
        <legend>Articles : </legend>

        @for(articleForm of articles.controls; track articleForm) {
          <div class="article-container" [formGroup]="articleForm">

            <label>Article name : </label>
            <input type="text" formControlName="articleName" />

            <label>Quantity : </label>
            <input type="number" formControlName="quantity" />

            <button type="button" (click)="delete($index)">delete article</button> <br />
          </div>
        }
      </fieldset>

      <button type="submit">Purchase !</button>
    </form>

    <button type="button" (click)="addArticle()">Add article</button>`,
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class AppComponent {
  form : FormGroup = new FormGroup({
    user : new FormControl('', {nonNullable: true}),
    articles: new FormArray<FormGroup>([
      new FormGroup<any>({
        articleName : new FormControl('article 1'),
        quantity: new FormControl(1),
      })
    ])
  });

  get articles() : FormArray<FormGroup> {
    return this.form.get('articles') as FormArray;
  }

  addArticle() : void {
    (this.form.get('articles') as FormArray).push(new FormGroup({
      articleName: new FormControl(''),
      quantity: new FormControl(1),
    }));
  }

  delete(id : number): void {
    this.articles.removeAt(id);
  }
}
