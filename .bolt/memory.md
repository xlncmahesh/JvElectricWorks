# Project memory

## Product intent & audience

- Application with e-commerce and customer support features: orders, products, conversations, tickets, and user profiles.
- Likely a marketplace or storefront platform with embedded support/messaging workflows.

## Brand personality & voice

- Not yet inferred from user input.

## Visual design & UX direction

- Stack: Vite + React (JSX), Tailwind CSS, Lucide React icons.
- Path alias `@/` maps to `src/`; prefer it over deep relative imports.
- User expects production-quality, non-cookie-cutter UI designs.

## Decisions, constraints & rationale

- Backend: Supabase (PostgreSQL relational database with row-level security).
- Decision: Stay with Supabase rather than migrating to Firebase.
  - Rationale: Data model is relational and deeply integrated (orders, products, conversations, tickets, profiles, RLS). Firebase is NoSQL and would require near-complete rewrite for limited gain.
  - Firebase only reconsidered if starting fresh or needing Google mobile SDK ecosystem.
- Avoid installing extra UI/icon/theme packages unless explicitly requested.

## Open questions & assumptions

- Specific pain point behind the Firebase question is unknown (real-time, pricing, or a particular feature may be motivating it).
- Brand voice, visual aesthetic, color/typography preferences not yet specified by user.
- Exact target audience and business model not yet confirmed.