load("@devinfra//bazel/api-golden:index.bzl", _api_golden_test = "api_golden_test", _api_golden_test_npm_package = "api_golden_test_npm_package")

api_golden_test_npm_package = _api_golden_test_npm_package
api_golden_test = _api_golden_test
