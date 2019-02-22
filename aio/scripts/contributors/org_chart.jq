# Produces a GraphViz Dot file from the data in the contributors.json file.
# Documentation for this syntax at https://stedolan.github.io/jq/manual
to_entries 
| map(select(.value.group=="Angular" or .value.group=="Collaborator"))
| map(.value |= {name: .name, lead: (.lead // .mentor // "")})
| map(
   "\(.key|tojson) [ label = \(.value.name|tojson) ] ",
   "\(.key|tojson) -> \(.value.lead|tojson)"
  )
[]

