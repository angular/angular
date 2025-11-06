# Angular dev-app

For experimentation while developing Angular.

## Local Development

For local development, [pnpm](https://pnpm.io/) is the preferred package manager. You can set up a local environment with the following commands:

```bash
# Clone Angular repo
git clone https://github.com/angular/angular.git

# Navigate to project directory
cd angular

# Install dependencies
pnpm install

# Build and run local dev server
# NOTE: Initial build will take some time
pnpm dev
```

## FAQs

### The build is failing and I'm seeing `bazel:bazel failed: missing input file` messages.

This is most likely due to a bazel dependency / caching issue. To resolve this, run the following command:

```
# Try this first
pnpm bazel clean

# If that doesn't work, try it with the expunge flag
pnpm bazel clean --expunge
```
