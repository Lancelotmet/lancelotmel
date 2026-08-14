# Grammar Play · Implementation status

| Area | Status | Evidence |
| --- | --- | --- |
| Lancelot prompt sources | SOURCE_ANALYZED | Source manifest and curriculum map |
| Betty Azar scan | OCR_IN_PROGRESS | Local OCR job for all 567 pages; chapter map used for this first published catalog |
| Curriculum data | MAPPED | `lib/grammar/curriculum.ts` |
| Capsule engine and response validation | INTEGRATED | `lib/grammar/engine.ts` |
| Catalog, player, search, filters, rails | INTEGRATED | `components/grammar/GrammarPlay.tsx` |
| Authenticated persistence plus local fallback | INTEGRATED | Supabase metadata key `lancelot_grammar_play_v1` |
| Content validation and unit tests | TESTED | `tests/grammar-play.test.mjs` |
| Full browser QA and production deployment | PENDING | Run after build succeeds in the complete dependency environment |

The status deliberately does not claim that the scanned PDF has been fully read until its OCR output is complete and audited.
