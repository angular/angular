def compute_module_name(testonly):
    """ Provide better defaults for package names.

    e.g. rather than angular/packages/core/testing we want @angular/core/testing
    """
    pkg = native.package_name()

    if testonly:
        # Some tests currently rely on the long-form package names
        return None

    if pkg.startswith("packages/"):
        return "@angular/" + pkg[len("packages/"):]

    return None
