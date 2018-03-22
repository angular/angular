load("//:packages.bzl", "CDK_PACKAGES")

# Base rollup globals for dependencies and the root entry-point.
CDK_ROLLUP_GLOBALS = {
  'tslib': 'tslib',
  '@angular/cdk': 'ng.cdk',
}

# Rollup globals for subpackages in the form of, e.g., {"@angular/cdk/table": "ng.cdk.table"}
CDK_ROLLUP_GLOBALS.update({
  "@angular/cdk/%s" % p: "ng.cdk.%s" % p for p in CDK_PACKAGES
})
