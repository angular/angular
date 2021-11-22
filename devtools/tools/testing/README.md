The spec helper files here set up the global testing environment prior to the execution of specs.

There are 3 options:

* `init_node_spec` - configures a node environment to test Angular applications with
platform-server.
* `init_node_no_angular_spec` - configures a node environment for testing without setting up
Angular's testbed (no dependency on Angular packages is incurred).
* `init_browser_spec` - configures a browser environment to test Angular applications.