## The boilerplate Karma configuration won't work with AngularJS tests
## which require their own special loading configuration, `karma.conf.ng1.js`.
## This scripts runs the AngularJS tests with that AngularJS config.

PATH=$(npm bin):$PATH
tsc && karma start karma.conf.ng1.js
