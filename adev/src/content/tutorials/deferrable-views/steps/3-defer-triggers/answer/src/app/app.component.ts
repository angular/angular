import {Component} from '@angular/core';
import {ArticleCommentsComponent} from './article-comments.component';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h1>How I feel about Angular</h1>
      <article>
        <p>
          Angular is my favorite framework, and
          this is why. Angular has the coolest
          deferrable view feature that makes defer
          loading content the easiest and most
          ergonomic it could possibly be.
        </p>
      </article>

      <button type="button" #showComments>Show all comments</button>

      @defer (on hover; on interaction(showComments)) {
        <article-comments />
      } @placeholder (minimum 1s) {
        <p>Placeholder for comments</p>
      } @loading (minimum 1s; after 500ms) {
        <p>Loading comments...</p>
      } @error {
        <p>Failed to load comments</p>
      }

    </div>
  `,
  imports: [ArticleCommentsComponent],
})
export class AppComponent {}
