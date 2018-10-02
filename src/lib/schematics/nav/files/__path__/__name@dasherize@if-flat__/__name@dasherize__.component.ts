import { Component, OnDestroy<% if(!!viewEncapsulation) { %>, ViewEncapsulation<% }%><% if(changeDetection !== 'Default') { %>, ChangeDetectionStrategy<% }%> } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: '<%= selector %>',<% if(inlineTemplate) { %>
  template: `
    <%= indentTextContent(resolvedFiles.template, 4) %>
  `,<% } else { %>
  templateUrl: './<%= dasherize(name) %>.component.html',<% } if(inlineStyle) { %>
  styles: [`
    <%= indentTextContent(resolvedFiles.stylesheet, 4) %>
  `],<% } else { %>
  styleUrls: ['./<%= dasherize(name) %>.component.<%= styleext %>'],<% } %><% if(!!viewEncapsulation) { %>
  encapsulation: ViewEncapsulation.<%= viewEncapsulation %><% } if (changeDetection !== 'Default') { %>,
  changeDetection: ChangeDetectionStrategy.<%= changeDetection %><% } %>
})
export class <%= classify(name) %>Component implements OnDestroy {

  isHandset: boolean;

  /** Emits when the component is destroyed. */
  private readonly _destroyed = new Subject<void>();

  constructor(breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        takeUntil(this._destroyed)
      ).subscribe(result => {
        this.isHandset = result.matches;
      });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

}
