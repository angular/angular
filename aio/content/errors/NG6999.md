@name Invalid metadata
@category compiler
@shortDescription Invalid @NgModule() metadata

@description
This error represents the import or export of an `@NgModule()` that doesn't have valid metadata.

@debugging
The library might have been processed with `ngcc`.
If this is the case, try removing and reinstalling `node_modules`.
This error is likely due to the library being published for Angular Ivy, which cannot be used in this View Engine application.
If that is not the case then it might be a View Engine based library that was converted to Ivy by ngcc during a postinstall step.

Check the peer dependencies to ensure that you're using a compatible version of Angular.
