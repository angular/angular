# Usage Metrics Gathering
You can help the Angular Team to prioritize features and improvements by permitting the Angular
team to send command-line command usage statistics to Google. The Angular Team does not collect
usage statistics unless you explicitly opt in during the Angular CLI installation or upgrade.

## What is collected?
Usage analytics include the commands and selected flags for each execution. Usage analytics may
include the following information:

- Your operating system (Mac, Linux distribution, Windows) and its version.
- Number of CPUs, amount of RAM.
- Node and Angular CLI version (local version only).
- How long each command took to initialize and execute.
- Command name that was run.
- For Schematics commands (add, generate, new and update), a list of whitelisted flags.
- For build commands (build, serve), the number and size of bundles (initial and lazy),
  compilation units, the time it took to build and rebuild, and basic Angular-specific
  API usage. *This data is collected only if usage analytics gathering is enabled for
  the project.*
- Error code of exceptions and crash data. No stack trace is collected.

Only Angular owned and developed schematics and builders are reported. Third-party schematics and
builders do not send data to the Angular Team.

## Opting in
When installing the Angular CLI or upgrading an existing version, you are prompted to allow global
collection of usage statistics. If you say no or skip the prompt, no data is collected.

The first time a command affecting the project is run, you are prompted to allow collection of data
related to the project. If you say no or skip the prompt, no data is collected for that project.

Starting with version 8, we added the `analytics` command to the CLI. You can change your opt-in
decision at any time using this command.

### Disabling usage analytics
To disable analytics gathering, run the following command:

```bash
# Disable all usage analytics.
ng analytics off

# Disable project-specific usage analytics.
ng analytics project off
```

### Enabling usage analytics
To enable usage analytics, run the following command:

```bash
# Enable all usage analytics.
ng analytics on

# Enable project-specific usage analytics.
ng analytics project on
```

### Prompting
To prompt the user again about usage analytics, run the following command:

```bash
# Prompt for all usage analytics.
ng analytics prompt

# Prompt for project-specific usage analytics.
ng analytics project prompt
```
