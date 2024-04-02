# GitHub

## GitHub Repository

- activate Issues on the Settings tab.


## GitHub Issues

- Only keep the bug-report and the feature-request templates. The rest of the templates are not needed for the localization project.
- Update the .github/ISSUE_TTEMPLATE/config.yml` file to remove links.
- Update the `.github/ISSUE_TEMPLATE.md` file to the fork url.


# Deployment

Build command: `yarn docs:build`
Publish directory: `dist/bind/adev/build/browser`




# Errors

## Deployment

Stuck at 

```bash
11:26:37 AM: INFO: From Action aio/content/cli/help/cli_docs_html:
11:26:37 AM: Could not find the language "jsonc", did you forget to load/include a language module?
```

```bash
11:38:57 AM: ERROR: /opt/build/repo/adev/src/content/introduction/essentials/BUILD.bazel:3:16: Action adev/src/content/introduction/essentials/components.md.html failed: (Exit 1): markdown.sh failed: error executing command bazel-out/k8-opt-exec-2B5CBBC6/bin/external/npm/@angular/docs/markdown/markdown.sh bazel-out/k8-fastbuild/bin/adev/src/content/introduction/essentials/components.md.html-0.params ... (remaining 1 argument skipped)
11:38:57 AM: Use --sandbox_debug to see verbose messages from the sandbox
11:38:57 AM: /opt/buildhome/.cache/bazel/_bazel_buildbot/9a72ce7fe51e5e46a147640bcd3de03b/external/npm/@angular/docs/markdown/guides.mjs:48768
11:38:57 AM:     await page.goto(`data:text/html,<html></html>`);
11:38:57 AM:                ^
11:38:57 AM: page.goto: Timeout 30000ms exceeded.
11:38:57 AM: Call log:
11:38:57 AM:   - navigating to "data:text/html,<html></html>", waiting until "load"
11:38:57 AM:     at Object.processMermaidCodeBlock (/opt/buildhome/.cache/bazel/_bazel_buildbot/9a72ce7fe51e5e46a147640bcd3de03b/external/npm/@angular/docs/markdown/guides.mjs:48768:16)
11:38:57 AM:     at main (/opt/buildhome/.cache/bazel/_bazel_buildbot/9a72ce7fe51e5e46a147640bcd3de03b/external/npm/@angular/docs/markdown/guides.mjs:52296:31)
11:39:01 AM: Target //adev:build failed to build
11:39:01 AM: Use --verbose_failures to see the command lines of failed build steps.
11:39:01 AM: ERROR: /opt/build/repo/adev/src/assets/BUILD.bazel:5:18 Copying files to directory failed: (Exit 1): markdown.sh failed: error executing command bazel-out/k8-opt-exec-2B5CBBC6/bin/external/npm/@angular/docs/markdown/markdown.sh bazel-out/k8-fastbuild/bin/adev/src/content/introduction/essentials/components.md.html-0.params ... (remaining 1 argument skipped)
```