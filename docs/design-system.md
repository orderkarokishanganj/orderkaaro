# Order Kaaro design system: Sage & Oat

Chosen by the owner on 2026-10-16. Mockups: [design canvas](https://claude.ai/artifact/UzTQbzBfTqPEpNg1uHKr5J), page "Aesthetic palettes", board "1 · Sage & Oat".

The look: a calm, soft neighbourhood store. Lots of breathing room, thin borders instead of heavy outlines, rounded pills, and one gentle accent reserved for discount tags.

## Colour

| Token | Hex | Use |
|---|---|---|
| `oat` | `#F4EFE7` | Page background |
| `white` | `#FFFFFF` | Cards, search bar, chips |
| `sage-mist` | `#E3E9DF` | Hero banner, help card, language toggle track, step numbers |
| `sage-plate` | `#EEF1EA` | Product image backdrop |
| `sage` | `#4E6E58` | Primary buttons, stepper, cart bar, links, icons |
| `sage-dark` | `#36503F` | Hover and pressed state for `sage` |
| `ink` | `#2C2A25` | Body text and headings |
| `ink-soft` | `#45433D` | Secondary paragraphs |
| `stone` | `#6B675E` | Units, struck-through MRP, captions |
| `line` | `#E4DDD1` | Card and input borders, dividers |
| `peach` | `#F3DCCF` | Discount tag background |
| `clay` | `#8A4630` | Discount tag text |
| `out-bg` | `#EEEAE3` | Out-of-stock button background |
| `out-ink` | `#4A463F` | Out-of-stock button text |
| `on-sage-soft` | `#E8EFE9` | Small secondary text on `sage` (cart bar subline) |
| `chart` | `#2F7A50` | Chart bars and lines only (validated: lightness band, chroma floor; 5.2:1 on white) |
| `danger-bg` / `danger-ink` | `#FBE3DE` / `#8C2F1E` | Reserved for destructive admin actions (6.8:1) |

Contrast (WCAG AA needs 4.5:1 for body text):
- White on `sage`: 5.7:1
- `clay` on `peach`: 5.3:1
- `stone` on `oat`: 4.9:1, and 5.6:1 on white
- `ink` on `oat`: 12.5:1
- `on-sage-soft` on `sage`: 4.9:1

Do not put `stone` text on `sage-mist` or smaller than 13px.

## Type

| Role | Font | Size and weight |
|---|---|---|
| Wordmark | Fraunces SemiBold | 34px, letter-spacing −0.5px |
| Page title (h1) | Fraunces SemiBold, Hindi in Tiro Devanagari Hindi | 29px, line-height 1.2 |
| Section title (h2) | Same stack | 20–22px, line-height 1.3 |
| Price | Fraunces SemiBold | 20px on cards, 30px on product page |
| Body | Hind Regular, Medium, SemiBold | 16px, line-height 1.5 |
| Small | Hind | 13px minimum |

Heading stack: `'Fraunces', 'Tiro Devanagari Hindi', serif`. Body stack: `'Hind', sans-serif` (Hind covers both Latin and Devanagari).

Hindi needs room for matras: keep body line-height at 1.5 and headings at 1.2 or more.

Performance (3G): self-host the fonts as WOFF2 instead of loading Google Fonts.
- Fraunces 600: Latin subset only, without the optical-size axis.
- Tiro Devanagari Hindi 400: Devanagari subset only.
- Hind 400 and 600.
- Use `font-display: swap` and preload only Hind 400.

## Shape and spacing

- Side gutter 16px. Section gap 28px.
- Radius: pills and buttons `999px`, product cards `22px`, banners and panels `24–28px`, image plates `16px`.
- Borders: `1px solid line`. Outline buttons use `1.5px solid sage`.
- Shadows only on floating things (cart bar): `0 10px 30px rgba(44, 42, 37, 0.22)`.

## Components

- **Touch targets:** every tappable thing is at least 44px tall.
- **Search:** white pill, 54px tall, `line` border, search icon in `stone`.
- **Language toggle:** `sage-mist` track. The active option is `sage` with white text. Labels are "EN" and "हिंदी".
- **Category chips:** white pills with a `line` border, wrapping onto new lines.
- **Product card:** white with a `line` border. Image on a `sage-plate` backdrop, discount tag top-left (`peach` / `clay`), name clamped to 2 lines, unit in `stone`, price in Fraunces with the MRP struck through. The button shows one of three states:
  - Add: outline pill.
  - In cart: filled `sage` stepper with − qty +.
  - Out of stock: `out-bg` / `out-ink` with the product image at 40% opacity.
- **Cart bar (mobile):** floating `sage` pill, 12px from the screen edges, pinned to the bottom of every shopping screen. It shows item count and subtotal, the delivery fee, the amount left for free delivery, a thin white progress line, and a white "View cart" pill.
- **Icons:** 2px-stroke line icons (lucide-react). Never emoji.

## Copy

- English and Hindi everywhere. Product names, units and category names have both versions.
- Only make promises the owner has confirmed: free delivery on ₹800+, cash or UPI on delivery, hours Mon–Sat 9 AM–9 PM and Sun 10 AM–6 PM. No delivery-time, minimum-order or delivery-area promises.
