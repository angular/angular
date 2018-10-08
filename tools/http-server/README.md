# http-server

This is a simple Bazel wrapper around the http-server npm package.

A typical frontend project is served by a specific server.
For Angular's example applications, our needs are simple so we can just use http-server.
Real projects might need history-server (for router support) or even better a full-featured production server like express.

We modify http-server to support serving Brotli-compressed files, which end with a `.br` extension.
This is equivalent to gzip-compression support.
See https://github.com/alexeagle/http-server/commits/master which points to a modified ecstatic library.
