import {Component} from '@angular/core';
import {ArticleComments} from './article-comments';

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

      @defer {
        <article-comments />
      }

    </div>
  `,
  imports: [ArticleComments],
})
export class App {}
