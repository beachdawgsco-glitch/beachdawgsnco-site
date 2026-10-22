# Beach Dawgs & Co — prelaunch handoff (October 22, 2026)

## Source of truth and goal
Do not publish or repoint DNS before the owner's final review. Keep the existing site accessible. Preserve customer and staff portal content and all connected Supabase records. The website has a pre-launch preview/review branch: `prelaunch/drive-handoff-cms-audit-2026-10-22`.

Original October 21 ZIP handoff lives in the owner's Google Drive as `beach-dawgs-website-handoff.zip`. **The current GitHub repository is newer** and has Pages CMS, portal, policies, and other features absent from the ZIP. Do not overwrite the current repository with the older archive or replay generator scripts.

## Confirmed user decisions
- Address: **16881 US-17, Unit F, Hampstead, NC 28443** (supersedes 16202 US-17 from the old handoff).
- Branding: premium black and orange; preserve current logo and surfer imagery.
- Urable Enterprise is the booking and authoritative pricing/service catalog. Do not change Urable records, customer data, bookings, subscriptions, deposits or warranties while publishing website content.
- Place images where supported by their **visible subject**. Do not imply that glossy vehicles were ceramic-coated, PPF-wrapped or tinted when photo provenance is unknown.
- Owner wants a visual review, security and end-to-end checks before launch.

## Current inspected results
- Repository contains .pages.yml, data/site.json, data/packages.json, data/faq.json, data/gallery.json and cms.js.
- 61 existing gallery assets were confirmed to be present on GitHub and imported into the CMS gallery data on this branch; other site image assets remain intact.
- Portfolio was organized into: Vehicle Showcase, Interior, Wheels & Tires, Detailing in Action, Paint Polishing, Motorcycles, Behind the Scenes. Featured items are managed with booleans in Pages CMS.
- The October 19 Urable transfer snapshot contains 76 services in 12 categories with size variants. This is **not** a live authenticated Urable check.
- Homepage detail starting prices $200, $325, $550 match the transfer snapshot numerically. Name mismatch: website 'Beach Dawgs Express' vs Urable 'Beach Dawgs Express Full Detail'. More nuanced ceramic, PPF, tint, correction and add-on prices must be approved against the **current Urable Enterprise catalog**.
- Confirmed connected Supabase project `gxjgqxqcvkfanvydbztv`. All five exposed public tables have RLS enabled; Supabase security advisor returned no lints (not a penetration test). Portal user permissions, auth/MFA, and full backup/restore require separate authenticated testing.
- Gallery images are editorially classified from visible subject. The exact vehicle service and customer consent have not been independently confirmed.

## Before merging or deploying
1. On this branch run `node tests/prelaunch.mjs` and inspect GitHub Actions results. Verify every image, CSS/JS, internal link, mobile layout and load performance. Fix failed tests.
2. Sign into Pages CMS via the repo owner account. Check category filters, save/edit/delete/reorder, photo upload, captions, featured toggles, and publishing back to the target branch (CMS may write directly to main; use care).
3. Compare all public service labels, package descriptions, booking URLs, vehicle-size variants, starting prices, terms, coatings, curing periods, and PPF/tint offering with the current authenticated Urable catalog. Never represent $0 quotes as free services.
4. Review photo selections and service-to-photo accuracy; get owner approval for any specific coating/PPF/tint claims.
5. Audit RLS with actual test users (anonymous, customer A, customer B, staff, owner with/without MFA). Test staff permissions and rate-limiting. Test encrypted backup/restore in isolated test data, not production.
6. Verify domain, redirect policies, SEO and sitemap, accessibility, responsive layout, privacy and deposit policies, and email inquiry behavior. Explicitly verify booking handoff to Urable without creating a real order.
7. Keep the business domain unchanged until a preview is fully approved. Obtain final publish authorization.

## Edit photos yourself
Visit https://app.pagescms.org/beachdawgsco-glitch/beachdawgsnco-site/main after GitHub OAuth, choose Gallery photos, open a Photo row, select or replace the image, update description, select category and Featured checkbox, save. All 61 existing gallery images have stable local asset paths. For newly uploaded photographs, verify their rights and customer consent first.

## Known limitations
CMS categorization and homepage featured controls are staged on a review branch. Live current site has not been switched. Drive Photos & Video folder listing was capped at 100 items and includes large MOVs and HEIC images; importing all raw media unreviewed is not advised. Use web-optimized JPG/WebP images with verified consent and context.
