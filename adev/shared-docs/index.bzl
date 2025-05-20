load("//adev/shared-docs/pipeline:_guides.bzl", _generate_guides = "generate_guides")
load("//adev/shared-docs/pipeline:_navigation.bzl", _generate_nav_items = "generate_nav_items")
load("//adev/shared-docs/pipeline:_playground.bzl", _generate_playground = "generate_playground")
load("//adev/shared-docs/pipeline:_previews.bzl", _generate_previews = "generate_previews")
load("//adev/shared-docs/pipeline:_stackblitz.bzl", _generate_stackblitz = "generate_stackblitz")
load("//adev/shared-docs/pipeline:_tutorial.bzl", _generate_tutorial = "generate_tutorial")

generate_guides = _generate_guides
generate_stackblitz = _generate_stackblitz
generate_previews = _generate_previews
generate_playground = _generate_playground
generate_tutorial = _generate_tutorial
generate_nav_items = _generate_nav_items
