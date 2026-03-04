# Village Market — Product Specification & MVP Build Prompt

**Part of the Village Collective ecosystem**
*A geo-fenced, verified local maker marketplace for Coeur d'Alene and North Idaho*

---

## 1. Project Overview

Village Market is a hyperlocal, verified marketplace connecting real local makers, growers, crafters, and producers with buyers who are physically present in the Coeur d'Alene / North Idaho region. It is a feature of and tightly integrated with Village Collective (village-collective.com), a North Idaho vacation rental management company.

The platform is explicitly NOT:
- A national or global marketplace
- Open to print-on-demand, dropshipping, or automated sellers
- A subscription-based service
- An ad-supported platform

The platform IS:
- Geo-fenced — full interaction requires physical presence in the region
- Verified — every seller is personally approved by the admin
- Community-first — designed to feel like a digital year-round farmers market
- Part of the Village Collective brand ecosystem

---

## 2. Brand & Design

### Identity
- **Platform name:** Village Market
- **Parent brand:** Village Collective
- **URL pattern:** market.village-collective.com (or village-market.com)
- **Tagline:** *Real people. Real goods. Right here.*

### Visual Design
Match the Village Collective aesthetic at village-collective.com:
- Warm, Pacific Northwest / North Idaho palette
- Clean, modern layout with earthy, nature-forward accents
- Premium but approachable — not rustic/kitschy, not corporate
- Typography: clean sans-serif headers, readable body
- Photography-forward — large vendor images, product photos
- Color palette: pull from village-collective.com (warm neutrals, deep greens, natural tones)
- The platform should feel like it belongs in the same family as VC — a sibling product, not a separate brand

---

## 3. User Types

### Buyers / Community Members
- Browse freely if geo-verified (within ~50 mile radius of CDA OR physically present per GPS)
- Outside radius = browse-only mode (can see listings, cannot message, buy, or barter)
- Free account to save favorites, follow sellers, message sellers (geo-gated)

### Sellers
- **Onboarding fee: $50 one-time** (paid on approval, non-refundable)
- Manual approval by admin — no automated seller signups
- Full storefront with products, accepted payments, barter listings
- Optional **Community Contributor** status (see Monetization)

### Village Collective Guests
- Arrive via dedicated VC landing page / QR code in rental properties
- GPS confirms physical presence — automatic full access for duration of stay
- Shown curated "Guest Picks" and a welcome message
- Prompted to explore Village Market as part of their North Idaho experience

### Admin (You)
- Full control over seller approvals, featured placements, contributor status
- Can post announcements, seasonal spotlights, curated collections
- Dashboard showing platform activity, revenue, new applications

---

## 4. Geo-Fence System

### Access Tiers

| Tier | Who | Access |
|------|-----|--------|
| Full Access | GPS within ~50mi of CDA | Browse, buy, message, barter, post |
| Visitor Pass | GPS confirms physical presence anywhere in region | Full access for duration of stay |
| Browse Only | Outside radius | View listings and storefronts only, no interaction |
| Seller Verified | Real address within zone + admin approval | Full seller capabilities |

### Implementation Notes
- Use browser Geolocation API (HTML5) as primary method
- IP geolocation as fallback / secondary check
- On first visit, prompt user for location permission with friendly explanation of why
- Frame the geo-fence positively: "This market is for people who are here"
- Do not use aggressive blocking — make it feel like an invitation, not a wall
- Store verification status in localStorage with 24-hour TTL so users don't re-verify every visit

---

## 5. Core Pages & Features

### 5.1 Homepage
- Hero section with tagline and search bar
- Map view / Grid view toggle for all active sellers
- Category filter bar (horizontal scroll on mobile)
- "Community Contributor" toggle filter
- Featured sellers section (paid placement, admin-curated)
- "What's Fresh Right Now" seasonal spotlight (admin-curated)
- Recent listings / new arrivals feed
- Subtle tip jar widget — never pushy ("Keep the market running")
- Link/banner promoting Village Collective for visitors who need a place to stay

### 5.2 Browse & Discovery
- Full seller directory with filters: Category, Payment types, Delivery available, Custom orders open, Barter-friendly, Community Contributor
- Sort: Newest, Most Active, Closest to Me, Community Contributors First
- Keyword search across seller names, product titles, descriptions
- Mobile-first responsive grid

### 5.3 Seller Storefront
Each seller gets a dedicated page with:
- Cover photo header (full width)
- Profile photo, name, tagline, location (neighborhood level), badges
- Bio/story section
- Product listings grid with photos, titles, prices, availability status
- Accepted payments displayed as icon badges
- Barter section: "I'll trade for:" list
- Delivery radius on a small embedded map
- Custom orders toggle
- Message/Contact button (geo-gated)

### 5.4 Barter Board
- Standalone community page — sellers only
- Post format: "Have: [item/service] — Want: [item/service]"
- Posts expire after 30 days
- Filterable by category and area
- Feels like a community bulletin board, not a formal listing system

### 5.5 Village Collective Guest Landing Page (/for-guests)
- Warm welcome: "Welcome to North Idaho — here's how to support local during your stay"
- Auto-attempt GPS verification on page load
- Curated "Guest Picks" section
- "Order before you arrive" callout for delivery sellers
- VC branding throughout
- Categories most useful to visitors: Food & Farm, Art & Gifts, Apothecary & Wellness, Garden & Plant

### 5.6 Seller Application & Onboarding
- Simple application form (name, location, what they make, experience, photos/social links)
- Admin reviews and manually approves
- Approval triggers email with $50 payment link
- After payment: seller gets storefront dashboard access

### 5.7 Admin Dashboard
- Seller application queue (approve / reject / request info)
- Active seller management
- Featured placement management
- Community Contributor tracking
- Platform tip jar totals
- Seasonal spotlight editor

---

## 6. Monetization

No recurring subscriptions for standard sellers.

| Stream | Details |
|--------|---------|
| Seller onboarding fee | $50 one-time on approval. Non-refundable. |
| Community Contributor | Voluntary monthly contribution (~$5-15). Gets: badge, boosted search ranking, "Contributor" filter visibility, seasonal spotlight inclusion. Badge removes if they stop — no penalty. |
| Featured placement | One-time fee (~$10-25/week) for homepage or category spotlight. Admin-managed. |
| Platform tip jar | Buyer-initiated, optional. "Keep the market independent." |
| VC integration | Indirect — drives local spending and strengthens Village Collective's community brand. |

---

## 7. Payments Between Users

Village Market does NOT process buyer-to-seller payments. All transactions are peer-to-peer. The platform displays accepted payment methods and facilitates introductions — the transaction itself is between neighbors.

Accepted payment types (seller selects all that apply): Cash, Venmo, PayPal, Cash App, Crypto, Barter, Other

---

## 8. Product Categories

- Food & Farm (eggs, produce, honey, meat, preserves, baked goods)
- Wood & Craft (furniture, cutting boards, signs, decor, toys)
- Apothecary & Wellness (candles, tinctures, soaps, salves, herbal products)
- Art & Photography (paintings, prints, ceramics, sculpture)
- Fiber & Textile (quilts, knitting, weaving, macrame, clothing)
- Metal & Forge (blacksmithing, jewelry, hardware, tools)
- Garden & Plant (seedlings, plants, garden art, landscaping)
- Services (repair, custom work, lessons, farm labor, trades)
- Other / Miscellaneous

---

## 9. Technical Stack

### Hosting: Render (render.com)

All services hosted on Render — you are already using this platform and it is the right choice for this project. Render supports full-stack applications end-to-end: frontend, backend, database, and scheduled tasks in one dashboard with predictable flat-rate pricing and no surprise bills.

**Why Render works well here:**
- Everything in one platform and one billing account
- Predictable pricing (~$7/month per service) vs Vercel's usage-based model that can spike unexpectedly
- Built-in Cron Jobs for scheduled tasks — Vercel severely limits these on lower tiers
- Render PostgreSQL database available alongside your app
- Works well with Next.js as a Web Service deployment

**The honest trade-off vs Vercel:** Vercel (built by the Next.js team) has slightly more polished automatic frontend optimizations out of the box. For a local community marketplace at Village Market's scale this difference is minor and not worth the added complexity of a second platform.

### Frontend
- **Next.js 14** (App Router) — SEO-friendly, handles server-side rendering for geo-logic and dynamic pages
- **Tailwind CSS** — utility-first styling
- Deploy as a **Render Web Service** (NOT as a static site — the app needs SSR)

### Database — Two Options

**Option A: Render PostgreSQL (All-in-One)**
- Managed Postgres lives directly in your Render dashboard (~$7/month)
- Auth via NextAuth.js or Lucia (lightweight libraries inside your Next.js app)
- Image storage via Cloudflare R2 or Render Disk
- Single dashboard for everything

**Option B: Render + Supabase (Recommended for Non-Developers)**
- Supabase handles database, authentication, and image storage
- Supabase's dashboard is visual and approachable — browse your data like a spreadsheet, manage users, view uploaded images without writing code
- Built-in auth with no extra setup
- Generous free tier sufficient for MVP
- Next.js app runs on Render; Supabase is a separate managed service

**Recommendation:** Use Option B (Render + Supabase). Supabase is genuinely easier for a non-developer to understand and manage. Host the Next.js app on Render as a Web Service. This is a well-documented, widely-used combination.

### Maps & Geo
- **Leaflet** (free, open source) for interactive maps
- Browser **Geolocation API** for user location detection
- **@turf/turf** for distance calculations (geo-fence logic)

### Image Storage
- Supabase Storage (1GB free tier — plenty for MVP)

### Payments
- **Stripe** for onboarding fees, featured placements, tip jar
- One-time payments only for MVP — no recurring billing needed yet

### Email
- **Resend** for transactional email (confirmations, approvals, receipts) — simple, modern, generous free tier

### Scheduled Tasks
- **Render Cron Jobs** — built into Render, no extra service needed
- Use for: expiring 30-day barter posts, weekly digest reminders, etc.

---

## 10. MVP Scope (Phase 1 — Build First)

1. Buyer browse experience — homepage, seller grid, filters, seller storefront pages
2. Geo-fence system — location prompt, access tiers, browse-only mode
3. Seller application form — intake form, admin review queue
4. Seller dashboard — storefront editor, product listings, payment methods, barter section
5. Village Collective guest page — dedicated entry with welcome messaging
6. Admin dashboard — approvals, featured placements, basic stats
7. Stripe integration — onboarding fee and tip jar

### Phase 2 (Defer)
- In-app messaging
- Full standalone Barter Board page
- Seller availability calendar
- Subscription listings
- Community Contributor monthly contributions
- PWA / mobile app
- Seller analytics dashboard

---

## 11. Messaging Principles

- Sellers are "makers," "growers," "creators" — not "vendors"
- Buyers are "neighbors" and "guests" — not "customers"
- Geo-fence framing: "Made here. Sold here. For people who are here."
- Verification framing: "Every maker on Village Market is personally known to us."
- Tip jar framing: "Keep the market independent."
- Contributors framing: "These makers invest in keeping this community strong."

---

## 12. Village Collective Integration

- Village Market linked in VC website header and footer
- QR codes in every VC rental property linking to /for-guests
- VC booking confirmation emails mention Village Market
- VC local guides reference Village Market makers
- Shared brand identity — same palette, typography, photography style
- "Powered by Village Collective" in Village Market footer

---

## 13. Claude Build Prompt

Paste the following into a new Claude conversation to begin building the MVP.
Before sending, add your Village Collective hex color codes, font names, and optionally a screenshot of village-collective.com for best design results.

---

Build the MVP for Village Market, a hyperlocal verified maker marketplace that is part of the Village Collective (village-collective.com) brand ecosystem based in Coeur d'Alene, North Idaho.

STACK:
- Next.js 14 (App Router) as a Render Web Service — NOT a static site, SSR is required
- Tailwind CSS
- Supabase for database, auth, and image storage
- Leaflet for maps
- @turf/turf for geo-fence distance calculations
- Stripe for payments (placeholders for now)
- Resend for transactional email (placeholders for now)
- Deploy target: Render Web Service

DESIGN:
Match the Village Collective visual identity at village-collective.com. Warm Pacific Northwest / North Idaho aesthetic, clean modern layout, earthy natural color palette, photography-forward, premium but approachable. Sibling product feel — same family, same values.
[INSERT YOUR HEX COLOR CODES AND FONT NAMES HERE]

BUILD (Phase 1 MVP):

1. HOMEPAGE
- Hero with tagline "Real people. Real goods. Right here." and search bar
- Category filter bar (horizontal scroll on mobile): Food & Farm, Wood & Craft, Apothecary & Wellness, Art & Photography, Fiber & Textile, Metal & Forge, Garden & Plant, Services, Other
- "Community Contributors only" toggle filter
- Featured sellers section (3 slots, admin-curated)
- Seller grid with map/list toggle (Leaflet for map view)
- "What's Fresh Right Now" seasonal spotlight section (admin content)
- Subtle tip jar widget in footer

2. SELLER CARDS
Each card shows: cover photo, seller name, tagline, location label (neighborhood level), category badges, "Verified Local Maker" badge, "Community Contributor" badge if applicable, delivery indicator, accepted payment icons

3. SELLER STOREFRONT PAGE (/sellers/[slug])
- Full-width cover photo header
- Profile photo, name, tagline, location, badges
- Bio/story section
- Product listings grid: photo, title, price, price label, availability status (Available Now / Seasonal / Made to Order)
- Accepted payments as icon badges
- Barter section: "I'll trade for:" free text
- Delivery radius on small embedded Leaflet map
- Custom orders open/closed indicator
- Message/Contact button — geo-gated (visible but disabled with tooltip for unverified users)

4. GEO-FENCE SYSTEM
- On first visit: prompt for location with message "Village Market is a local-only marketplace. Share your location to unlock full access — this market is made for people who are here."
- Use browser Geolocation API + @turf/turf
- CDA center coordinates: 47.6777 N, 116.7805 W
- Within 80km (~50mi): grant full access, store in localStorage with 24-hour TTL
- Outside radius: browse-only mode with friendly banner "You're browsing from outside the area. Visit North Idaho and you'll unlock the ability to connect with local makers."
- /for-guests page: auto-attempt geo-verify on load, show unlocked confirmation if successful

5. SELLER APPLICATION FORM (/apply)
Fields: full name, email, phone, neighborhood (dropdown: CDA, Post Falls, Hayden, Rathdrum, Sandpoint, Other North Idaho), what they make (category multi-select + description), experience (dropdown), social/photo links (optional), accepted payment methods (checkboxes), delivery available (yes/no + radius if yes), how they heard about Village Market
On submit: thank you message + store in Supabase seller_applications table

6. VILLAGE COLLECTIVE GUEST PAGE (/for-guests)
- VC branding header
- Warm intro: "During your stay, these are your neighbors. Here's how to support local."
- Auto-attempt GPS verification on load — show "You're in! Full access unlocked." if successful
- Curated Guest Picks (3-4 seller cards, admin-selected)
- "Order before you arrive" callout box
- Category highlights: Food & Farm, Art & Gifts, Apothecary & Wellness, Garden & Plant
- Link back to village-collective.com

7. ADMIN ROUTE (/admin) — protected by env variable password
- Pending applications queue with Approve / Reject / Request Info buttons
- Active sellers list with edit/suspend controls
- Featured seller slot manager (3 slots)
- Basic stats: total sellers, pending applications, tip jar total

SUPABASE SCHEMA:

sellers: id, created_at, name, slug, tagline, bio, location_label, lat, lng, categories (text[]), cover_photo_url, profile_photo_url, accepted_payments (text[]), payment_other_label, barter_accepts, delivery_available (bool), delivery_radius_miles (int), custom_orders_open (bool), community_contributor (bool), featured (bool), verified (bool), approved_at, contact_email

products: id, seller_id (FK), title, description, price (numeric), price_label, photo_urls (text[]), category, availability_status (available/seasonal/made_to_order), is_custom_order (bool), is_subscription (bool), created_at, updated_at, is_active (bool)

seller_applications: id, created_at, name, email, phone, location, categories (text[]), description, experience, payment_methods (text[]), social_links, referral_source, status (pending/approved/rejected), admin_notes

SEED DATA:
Create 8 realistic placeholder sellers for North Idaho. Make them feel genuinely local:
1. Woodworker in Post Falls — custom furniture, cutting boards, signs
2. Family farm in Rathdrum — eggs, seasonal produce, honey
3. Apothecary maker in CDA — candles, herbal tinctures, soaps
4. Blacksmith in Hayden — tools, garden art, custom hardware
5. Fiber artist in Sandpoint — quilts, hand-dyed yarn, weavings
6. Ceramicist/potter in CDA — mugs, bowls, planters, custom pieces
7. Market gardener near Post Falls — seedlings, potted herbs, garden starts
8. Beekeeper in Rathdrum — raw honey, beeswax candles, pollen

Each needs: name, tagline, location label, 2-3 sentence bio, 2-4 products with realistic prices, accepted payments, and a barter section entry.

IMPORTANT:
- Mobile-first responsive design throughout — most users will be on phones
- All interaction buttons must be geo-gated: visible but disabled with explanation for unverified users
- Photography-forward — large images, minimal clutter
- Warm and community-rooted feel — not a generic marketplace template
- Admin route protected by hardcoded password in env variable (ADMIN_PASSWORD) for MVP

---

*Document version 1.1 — March 2026*
*Updated: Render hosting, Render vs Vercel context, Supabase Option A/B guidance*
*Village Collective — Coeur d'Alene, Idaho*
