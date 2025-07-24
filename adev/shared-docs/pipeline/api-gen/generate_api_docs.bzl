load("//adev/shared-docs/pipeline/api-gen/extraction:extract_api_to_json.bzl", "extract_api_to_json")
load("//adev/shared-docs/pipeline/api-gen/rendering:render_api_to_html.bzl", "render_api_to_html")

def generate_api_docs(name, module_name, entry_point, srcs, repo = "angular/angular", private_modules = [""], module_label = None, import_map = {}, extra_entries = []):
    """Generates API documentation reference pages for the given sources."""
    json_outfile = name + "_api.json"

    extract_api_to_json(
        name = name + "_extraction",
        repo = repo,
        module_name = module_name,
        module_label = module_label,
        entry_point = entry_point,
        srcs = srcs,
        output_name = json_outfile,
        import_map = import_map,
        extra_entries = extra_entries,
        private_modules = private_modules,
    )

    render_api_to_html(
        name = name,
        srcs = [json_outfile],
    )
