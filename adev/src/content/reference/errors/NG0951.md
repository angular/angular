# Child query result is required but no value is available.

Required child query (`contentChild.required` or `viewChild.required`) result was accessed before query results were calculated or query has no matches.

This can happen in two distinct situations:
* query results were accessed before a given query could collect results;
* a query was executed but didn't match any nodes and has no results as a consequence.

Content queries and view queries each calculate their results at different points in time:
* `contentChild` results are available after a _host_ view (template where a directive declaring a query is used) is created;
* `viewChild` results are available after a template of a component declaring a query is created.

Accessing query results before they're available results in the error described on this page. Most notably, query results are _never_ available in a constructor of the component or directive declaring a query.

## Fixing the error

`contentChild` query results can be accessed in the `AfterContentChecked` lifecycle hook, or later.
`viewChild` query results can be accessed in the `AfterViewChecked` lifecycle hook, or later.

Make sure that a required query matches at least one node and has results at all. You can verify this by accessing query results in the lifecycle hooks listed above.
