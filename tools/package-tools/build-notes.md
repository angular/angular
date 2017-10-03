In order to ensure our source maps trace back properly (and code 
size analysis tools can use these maps), we have made some changes 
to our build process. These changes will align with angular/angular's 
build process while we wait to update to Angular 5.x.

* Instead of downleveling to ES2015, creating a Rollup bundle, then 
transpiling that bundle down to ES5, we now downlevel to both ES2015 
and ES5, then create separate Rollup bundles for each. Note: We have to 
use NGC for both ES2015 and ES5 downleveling (rather than using TSC for 
the second pass and copying over flat files) because TSC generates 
decorator code that build-optimizer is not designed to support. For now, 
decorators must be passed through NGC.

* We are removing sorcery until we can upgrade tsickle and ngc to latest. 
Our versions of these break when mapping all the way back to TS. 
(temporary)

* We have to add separate tsconfigs for transpiling to ES5 because our 
version of ngc doesn't allow overrides. When we update to compiler-cli 
5.x, we should be able to remove these files. (temporary)
