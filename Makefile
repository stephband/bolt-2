DEBUG=

# Tell make to ignore existing folders and allow overwriting existing files
.PHONY: modules literal slide-show overflow-toggle

# Must format with tabs not spaces
literal:
	deno run --allow-read --allow-write --allow-net --allow-env --allow-run --no-lock --reload --config ./deno.json https://cdn.jsdelivr.net/gh/stephband/literal@main/deno/make-literal.js ./
