"""Static list of test files in this package."""

TEST_FILES = [
    "dom_property_bindings.spec.ts",
    "dom_property_interpolation.spec.ts",
    "input_bindings.spec.ts",
    "input_interpolation.spec.ts",
    "listeners.spec.ts",
    "output.spec.ts",
    "queries.spec.ts",
]

def assertTestsInSync(globbed_files):
    for v in globbed_files:
        if not v in TEST_FILES:
            fail("TEST_FILES constant is not in sync: %s" % v)
