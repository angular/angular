import { Component, Directive, Input, TemplateRef, ContentChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {}

@Directive({
  selector: 'button[exampleZippyToggle]',
  host: {
    '[attr.aria-expanded]': 'zippy.expanded',
    '[attr.aria-controls]': 'zippy.contentId',
    '(click)': 'zippy.expanded = !zippy.expanded'
  }
})
export class ZippyToggle {
  constructor(public zippy: Zippy) {}
}

// #docregion zippycontentdirective
@Directive({
  selector: '[exampleZippyContent]'
})
export class ZippyContent {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
// #enddocregion zippycontentdirective

let nextId = 0;

@Component({
  selector: 'example-zippy',
  templateUrl: 'example-zippy.template.html',
})
export class Zippy {
  contentId = `zippy-${nextId++}`;
  @Input() expanded: boolean = false;
  // #docregion contentchild
  @ContentChild(ZippyContent) content: ZippyContent;
  // #enddocregion contentchild
}
