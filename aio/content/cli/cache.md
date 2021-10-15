
# Persistent disk cache
Angular CLI by default will save a number of cachable operations on disk.

When the same build is re-run, the state of the previous build is restored from disk and re-uses previously performed operations which causes a decrease in the time taken to build and test your applications and libraries.

To amend the default cache settings, add the `cli.cache` object to your [Workspace Configuration](guide/workspace-config).
The object goes under `cli.cache` at the top level of the file, outside the `projects` sections.

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "cli": {
    "cache": {
      ...
    }
  },
  "projects": {}
}
```

To learn more about all the options, see [cache options](guide/workspace-config#cache-options).

### Enabling and disabling the cache
Caching is enabled by default, to disable caching run the following command:

```bash
ng config cli.cache.enabled false
```

To re-enable, use the same command with a value of `true`.

### Cache environments
By default, disk cache is only enabled for local environments.

To enable caching for all environments run the following command:

```bash
ng config cli.cache.environment all
```

To learn more about all possible values, see `environment` in [cache options](guide/workspace-config#cache-options).

<div class="alert is-helpful">

The Angular CLI, checks for the presence and value of the `CI` environment variable to determine in which environment it is running.

</div>

### Cache path

By default, `.angular/cache` is used as base directory to store cache results. To change this path, run the following command:

```bash
ng config cli.cache.path ".cache/ng"
```

### Clearing the cache

In some cases you may want to clear the cache. To do so, run the following command:

#### Unix based operating systems

```bash
rm -rf .angular/cache
```

#### Windows
```bash
rmdir /s /q .angular/cache
```

To learn more about the above commands, see [rm command](https://man7.org/linux/man-pages/man1/rm.1.html) and [rmdir command](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/rmdir).