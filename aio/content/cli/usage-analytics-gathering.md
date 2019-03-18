# Gathering Usage Analytics
Administrators can configure their instances of Angular CLI to share usage analytics with
third parties. This sharing is separate from and in addition to usage analytics shared
with Google. It is disabled by default and cannot be enabled at the project level for
all users. It must be set at the global configuration level for each user to allow
managed users to opt in and share usage analytics.  

To configure usage analytics sharing, use the `ng config` command to add both the user ID
and the third-party ID to the user's global Angular CLI configuration. 

- The third-party ID is the tracking identifier of the third-party Google Analytics
  account. This ID is a string that looks like `UA-123456-12`.
- You can choose a user ID, or be assigned a random user ID when you run the CLI command.  

Once you have the third-party tracking ID, add it to your global configuration using the  following command:

```
ng config --global cli.analyticsSharing.tracking UA-123456-12
```

To add a custom user ID to the global configuration using the following command. This
should be unique per users to identify unique usage of commands and flags.

```
ng config --global cli.analyticsSharing.user SOME_USER_NAME
```

To generate a new random user ID, run the following command:

```
ng config --global cli.analyticsSharing.user ""
```

To turn off this feature, run the following command:

```
ng config --global --remove cli.analyticsSharing
```
