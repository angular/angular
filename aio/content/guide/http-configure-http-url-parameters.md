# HTTP - Configure URL parameters

Use the `HttpParams` class with the `params` request option to add URL query strings in your `HttpRequest`.

## Create URL parameter using the search method

The following example, the `searchHeroes()` method queries for heroes whose names contain the search term.

Start by importing `HttpParams` class.

<code-example hideCopy language="typescript">

import {HttpParams} from "&commat;angular/common/http";

</code-example>

<code-example linenums="false" path="http/src/app/heroes/heroes.service.ts" region="searchHeroes"></code-example>

If there is a search term, the code constructs an options object with an HTML URL-encoded search parameter.
If the term is "cat", for example, the GET request URL would be `api/heroes?name=cat`.

The `HttpParams` object is immutable.
If you need to update the options, save the returned value of the `.set()` method.

## Create URL parameters from a query

You can also create HTTP parameters directly from a query string by using the `fromString` variable:

<code-example hideCopy language="typescript">

const params = new HttpParams({fromString: 'name=foo'});

</code-example>

<a id="intercepting-requests-and-responses"></a>

@reviewed 2022-11-08
