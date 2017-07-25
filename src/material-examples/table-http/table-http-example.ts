import {Component, ViewChild} from '@angular/core';
import {Http, Response} from '@angular/http';
import {DataSource} from '@angular/cdk/table';
import {MdPaginator, MdSort} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';

@Component({
  selector: 'table-http-example',
  styleUrls: ['table-http-example.css'],
  templateUrl: 'table-http-example.html',
})
export class TableHttpExample {
  displayedColumns = ['created', 'state', 'number', 'title'];
  exampleDatabase: ExampleHttpDao | null;
  dataSource: ExampleDataSource | null;

  @ViewChild(MdPaginator) paginator: MdPaginator;
  @ViewChild(MdSort) sort: MdSort;

  constructor(http: Http) {
    this.exampleDatabase = new ExampleHttpDao(http);
  }

  ngOnInit() {
    this.dataSource = new ExampleDataSource(this.exampleDatabase!,
        this.sort, this.paginator);
  }
}

export interface GithubIssue {
  number: string;
  state: string;
  title: string;
  created: Date;
}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDao {
  constructor(private http: Http) {}

  getRepoIssues(sort: string, order: string, page: number): Observable<Response> {
    const href = 'https://api.github.com/search/issues';
    const requestUrl =
        `${href}?q=repo:angular/material2&sort=${sort}&order=${order}&page=${page + 1}`;
    return this.http.get(requestUrl);
  }
}

/**
 * Data source to provide what data should be rendered in the table. Note that the data source
 * can retrieve its data in any way. In this case, the data source is provided a reference
 * to a common data base, ExampleHttpDao. It is not the data source's responsibility to manage
 * the underlying data. Instead, it only needs to take the data and send the table exactly what
 * should be rendered.
 */
export class ExampleDataSource extends DataSource<GithubIssue> {
  // The number of issues returned by github matching the query.
  resultsLength: number = 0;
  isLoadingResults: boolean;
  isRateLimitReached: boolean;

  constructor(private _exampleDatabase: ExampleHttpDao,
              private _sort: MdSort,
              private _paginator: MdPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<GithubIssue[]> {
    const displayDataChanges = [
      this._sort.mdSortChange,
      this._paginator.page,
    ];

    // If the user changes the sort order, reset back to the first page.
    this._sort.mdSortChange.subscribe(() => {
      this._paginator.pageIndex = 0;
    });

    return Observable.merge(...displayDataChanges)
        .startWith(null)
        .switchMap(() => {
          this.isLoadingResults = true;
          return this._exampleDatabase.getRepoIssues(
              this._sort.active, this._sort.direction, this._paginator.pageIndex);
        })
        .catch(() => {
          // Catch if the GitHub API has reached its rate limit. Return empty result.
          this.isRateLimitReached = true;
          return Observable.of(null);
        })
        .map(result => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          return result;
        })
        .map(result => {
          if (!result) { return []; }

          this.isRateLimitReached = false;
          this.resultsLength = result.json().total_count;

          return this.readGithubResult(result);
        });


  }

  disconnect() {}

  private readGithubResult(result: Response): GithubIssue[] {
    return result.json().items.map(issue => {
      return {
        number: issue.number,
        created: new Date(issue.created_at),
        state: issue.state,
        title: issue.title,
      };
    });
  }
}
