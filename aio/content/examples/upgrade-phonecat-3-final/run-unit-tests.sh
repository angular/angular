## The boilerplate Karma configuration won't work with Angular 1 tests since
## a specific loading configuration is needed for them.
## We keep one in karma.conf.ng1.js. This scripts runs the ng1 tests with
## that config.

PATH=$(npm bin):$PATH
tsc && karma start karma.conf.ng1.js
