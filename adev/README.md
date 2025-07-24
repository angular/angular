# [Angular.dev](https://www.angular.dev)

This site is built with Angular.

The content is written primarily in Markdown format located in `src/content`. For simple edits, you can directly edit the file on GitHub and generate a Pull Request.

## Local Development

For local development, [yarn](https://yarnpkg.com/) is the preferred package manager. You can set up a local environment with the following commands
:

```bash
# Clone Angular repo
git clone https://github.com/angular/angular.git

# Navigate to project directory
cd angular

# Install dependencies
yarn

# Build and run local dev server
# NOTE: Initial build will take some time
yarn docs
```

If you are having issues with the docs building, see the [FAQs](#faqs) section.

## Contributing

Want to report a bug, contribute some code, or improve the documentation? Excellent!

Read through our [contributing guidelines](/CONTRIBUTING.md) to learn about our submission process, coding rules, and more.

And if you're new, check out one of our issues labeled as <kbd>[help wanted](https://github.com/angular/angular/labels/help%20wanted)</kbd> or <kbd>[good first issue](https://github.com/angular/angular/labels/good%20first%20issue)</kbd>.

### Code of Conduct

Help us keep Angular open and inclusive. Please read and follow our [Code of Conduct](/CODE_OF_CONDUCT.md).

## FAQs

### The build is failing and I'm seeing `bazel:bazel failed: missing input file` messages.

This is most likely due to a bazel dependency / caching issue. To resolve this, run the following command:

```
# Try this first
yarn bazel clean

# If that doesn't work, try it with the expunge flag
yarn bazel clean --expunge
```
