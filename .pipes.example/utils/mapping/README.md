# Mapping

This folder records how the live v1 source inventory is classified before Pipes target generation.

The map must contain one row for every current source file under `.pipes/`.

It must also contain one canonical `.pipes/` target for every staged starter file. Repository validation checks both source coverage and target coverage; clean-install validation checks target coverage without requiring the legacy source inventory to be installed beside the starter kit.
