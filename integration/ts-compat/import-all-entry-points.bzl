load("//src/cdk:config.bzl", "CDK_ENTRYPOINTS")
load("//src/cdk-experimental:config.bzl", "CDK_EXPERIMENTAL_ENTRYPOINTS")
load("//src/material:config.bzl", "MATERIAL_ENTRYPOINTS", "MATERIAL_TESTING_ENTRYPOINTS")
load("//src/material-experimental:config.bzl", "MATERIAL_EXPERIMENTAL_ENTRYPOINTS", "MATERIAL_EXPERIMENTAL_TESTING_ENTRYPOINTS")

"""Converts the given string to an identifier."""

def convert_to_identifier(name):
    return name.replace("/", "_").replace("-", "_")

"""Creates imports and exports for the given entry-point and package."""

def create_import_export(entry_point, pkg_name):
    identifier = "%s_%s" % (convert_to_identifier(pkg_name), convert_to_identifier(entry_point))
    return """
    import * as {0} from "@angular/{1}/{2}";
    export {{ {0} }};
  """.format(identifier, pkg_name, entry_point)

"""
  Creates a file that imports all entry-points as namespace. The namespaces will be
  re-exported. This ensures that all entry-points can successfully compile.
"""

def generate_import_all_entry_points_file():
    output = """
    import * as cdk from "@angular/cdk";
    import * as cdk_experimental from "@angular/cdk-experimental";
    // Note: The primary entry-point for Angular Material does not have
    // any exports, so it cannot be imported as module.
    import * as material_experimental from "@angular/material-experimental";
    import * as google_maps from "@angular/google-maps";
    import * as youtube_player from "@angular/youtube-player";
    export {cdk, cdk_experimental, material_experimental, google_maps, youtube_player};
  """
    for ep in CDK_ENTRYPOINTS:
        output += create_import_export(ep, "cdk")
    for ep in CDK_EXPERIMENTAL_ENTRYPOINTS:
        output += create_import_export(ep, "cdk-experimental")
    for ep in MATERIAL_ENTRYPOINTS + MATERIAL_TESTING_ENTRYPOINTS:
        output += create_import_export(ep, "material")
    for ep in MATERIAL_EXPERIMENTAL_ENTRYPOINTS + MATERIAL_EXPERIMENTAL_TESTING_ENTRYPOINTS:
        output += create_import_export(ep, "material-experimental")
    return output
