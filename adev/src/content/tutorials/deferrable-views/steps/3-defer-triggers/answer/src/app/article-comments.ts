import {Component} from '@angular/core';

@Component({
  selector: 'article-comments',
  template: `
    <h2>Comments</h2>
    <p class="comment">
      Building for the web is fantastic!
    </p>
    <p class="comment">
      The new template syntax is great
    </p>
    <p class="comment">
      I agree with the other comments!
    </p>
  `,
  styles: [
    `
    .comment {
      padding: 15px;
      margin-left: 30px;
      background-color: paleturquoise;
      border-radius: 20px;
    }
  `,
  ],
})
export class ArticleComments {}
