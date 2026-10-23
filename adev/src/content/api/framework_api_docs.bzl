load("//adev/shared-docs/pipeline/api-gen:generate_api_docs.bzl", _generate_api_docs = "generate_api_docs")

def generate_framework_api_docs(**kwargs):
    _generate_api_docs(
        # We need to specify import mappings for Angular packages that import other Angular
        # packages.
        import_map = {
            # We only need to specify top-level entry-points, and only those that
            # are imported from other packages.
            "//packages/animations:index.ts": "@angular/animations",
            "//packages/common:index.ts": "@angular/common",
            "//packages/core:index.ts": "@angular/core",
            "//packages/forms:index.ts": "@angular/forms",
            "//packages/localize:index.ts": "@angular/localize",
            "//packages/platform-browser-dynamic:index.ts": "@angular/platform-browser-dynamic",
            "//packages/platform-browser:index.ts": "@angular/platform-browser",
            "//packages/platform-server:index.ts": "@angular/platform-server",
            "//packages/router:index.ts": "@angular/router",
            "//packages/upgrade:index.ts": "@angular/upgrade",
        },
        **kwargs
    )
