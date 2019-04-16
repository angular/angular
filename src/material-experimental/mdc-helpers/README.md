[MDC Web](https://github.com/material-components/material-components-web) is a vanilla JS library
that implements Material Design components. We are experimenting with what it would look like to
build Angular Material components on top of MDC Web. The current best practices for working with MDC
in the Angular Material repo are tracked here.

## Importing from MDC Web
TypeScript imports should import from the top-level of the appropriate package (e.g.
`import {MDCCheckboxAdapter} from '@material/checkbox'`). This ensures that the import works
regardless of whether we are importing from the ES Modules or the bundled MDC code.

## CSS overrides
Ideally Angular Material will not override any of MDC Web's CSS. However there may be times when it
is necessary. If a CSS override is necessary, clearly document in a comment why that is the case.
Also note if there is an open issue in the MDC repo to make changes so that the override won't be
needed.
