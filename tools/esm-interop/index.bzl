"""ESM interop helpers."""

load("//tools/esm-interop:esm-node-module-loader.bzl", _enable_esm_node_module_loader = "enable_esm_node_module_loader")
load("//tools/esm-interop:nodejs-rules.bzl", _nodejs_binary = "nodejs_binary", _nodejs_test = "nodejs_test")

nodejs_binary = _nodejs_binary
nodejs_test = _nodejs_test
enable_esm_node_module_loader = _enable_esm_node_module_loader
