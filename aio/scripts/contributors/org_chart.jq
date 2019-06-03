# Produces a GraphViz Dot file from the data in the contributors.json file.
# Documentation for this syntax at https://stedolan.github.io/jq/manual
to_entries
| map(select(
  (.value.groups | index("Angular")) or
  (.value.groups | index("Collaborators"))))
| map(.value |= {
  name: .name,
  lead: (.lead // .mentor // ""),
  fillcolor: (if .groups | index("Collaborators") then "aquamarine" else "beige" end),
})
| map(
   "\(.key|tojson) [ label=\(.value.name|tojson) fillcolor=\(.value.fillcolor|tojson) style=filled ] ",
   (if .value.lead != "" then "\(.key|tojson) -> \(.value.lead|tojson)" else "" end)
  )
[]

