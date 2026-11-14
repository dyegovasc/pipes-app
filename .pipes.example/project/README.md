# Project Records

Project records are concise Markdown memory. Create them only when the content will help future work.

| Area | Purpose |
| --- | --- |
| `00-notes/` | Research, source material, and exploratory thinking |
| `01-intents/` | Intents: one problem and its proposed outcome |
| `02-specs/` | Accepted requirements and design that plans cite |
| `03-missions/` | Concrete adaptive loop runs |
| `04-plans/` | Bounded executable specifications |
| `05-decisions/` | Durable choices and rejected alternatives |
| `06-outcomes/` | Factual closure and residual risk |
| `07-artifacts/` | Supporting evidence, exports, and generated assets |

Delivery follows the area order: an intent in `01-intents/` is accepted by the product owner (gate G1), a spec in `02-specs/` turns it into requirements `R1..Rn` and a design (gate G2), a mission in `03-missions/` orchestrates the work when several services or plans are involved, plans in `04-plans/` cite the spec requirement IDs (gate G3), and an outcome in `06-outcomes/` closes the work. Gates and their human deciders are listed in the Accountability Matrix in `.pipes/ai-instructions/accountability.md`.

All records use readable paths for relationships. Area `config.md` files define the small frontmatter contract for their records.
