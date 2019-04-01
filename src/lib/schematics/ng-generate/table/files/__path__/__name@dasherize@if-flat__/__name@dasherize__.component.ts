import { AfterViewInit, Component, ViewChild<% if(!!viewEncapsulation) { %>, ViewEncapsulation<% }%><% if(changeDetection !== 'Default') { %>, ChangeDetectionStrategy<% }%> } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { <%= classify(name) %>DataSource } from './<%= dasherize(name) %>-datasource';

@Component({
  selector: '<%= selector %>',<% if(inlineTemplate) { %>
  template: `
    <%= indentTextContent(resolvedFiles.template, 4) %>
  `,<% } else { %>
  templateUrl: './<%= dasherize(name) %>.component.html',<% } if(inlineStyle) { %>
  styles: [`
    <%= indentTextContent(resolvedFiles.stylesheet, 4) %>
  `]<% } else { %>
  styleUrls: ['./<%= dasherize(name) %>.component.<%= style %>']<% } %><% if(!!viewEncapsulation) { %>,
  encapsulation: ViewEncapsulation.<%= viewEncapsulation %><% } if (changeDetection !== 'Default') { %>,
  changeDetection: ChangeDetectionStrategy.<%= changeDetection %><% } %>
})
export class <%= classify(name) %>Component implements AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: <%= classify(name) %>DataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'name'];

  ngAfterViewInit() {
    this.dataSource = new <%= classify(name) %>DataSource(this.paginator, this.sort);
  }
}
