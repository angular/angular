import { Component, Directive, Input, TemplateRef, ContentChild, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: 'button[appExampleZippyToggle]',
})
export class ZippyToggleDirective {
  @HostBinding('attr.aria-expanded') ariaExpanded = this.zippy.expanded;
  @HostBinding('attr.aria-controls') ariaControls = this.zippy.contentId;
  @HostListener('click') toggleZippy() {
    this.zippy.expanded = !this.zippy.expanded;
  }
  constructor(public zippy: ZippyComponent) {}
}

let nextId = 0;

// #docregion zippycontentdirective
@Directive({
  selector: '[appExampleZippyContent]'
})
export class ZippyContentDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
// #enddocregion zippycontentdirective

@Component({
  selector: 'app-example-zippy',
  templateUrl: 'example-zippy.template.html',
})
export class ZippyComponent {
  contentId = `zippy-${nextId++}`;
  @Input() expanded = false;
  // #docregion contentchild
  @ContentChild(ZippyContentDirective) content!: ZippyContentDirective;
  // #enddocregion contentchild
}
