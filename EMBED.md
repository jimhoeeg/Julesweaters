# Jule-Sweaters · B2B Jule-Konfigurator — integrationsguide

Et selvstændigt, responsivt multi-step lead-modul i **ren HTML, CSS og vanilla JS**.
Ingen frameworks, ingen build, ingen afhængigheder.

## Filer
| Fil | Indhold |
|---|---|
| `index.html` | Komplet demo-side — åbn i browseren for at se modulet live |
| `assets/julekonfigurator.css` | Al styling (scopet under `.jsk` — kolliderer ikke med dit tema) |
| `assets/julekonfigurator.js` | Al logik (auto-initialiserer alle `[data-jsk]`-elementer) |
| `assets/happy-seasons-logo.png` | Brand-logo vist venstrestillet over boksen (skift stien i `<img class="jsk__logo">`) |

## Flow (5 trin + resultat)
1. **Formål & volumen** — virksomhed (medarbejdere) vs. sportsklub (fans), antals-slider
2. **Produkt** — julesweater · jule-/nattøjssæt · påske · sommer & hyggetøj
3. **Kvalitet & CSR** — GOTS-bomuld vs. rPET (+ Red Barnet-vinkel)
4. **Timing** — Q1/Q2 + enkeltmåneder
5. **Design** — brandfarve + valgfri logo-upload
→ **Resultat:** pris pr. stk., klima-impact, Red Barnet-måltider, klub-profit (kun klub) + rig B2B-formular (CVR, EAN, rolle, budget, leveringsperiode, kommentar, samtykke).

## Sådan tester du lokalt
Åbn `index.html` direkte i en browser — eller kør en lille server:
```bash
python3 -m http.server 8000   # → http://localhost:8000
```

## Indsæt i et CMS (3 trin)
1. **Upload** `julekonfigurator.css` og `julekonfigurator.js` til dit temas assets.
2. **Indlæs dem** (CSS i `<head>`, JS før `</body>`):
   ```html
   <link rel="stylesheet" href="{{ 'julekonfigurator.css' | asset_url }}">  <!-- Shopify -->
   <script src="{{ 'julekonfigurator.js' | asset_url }}" defer></script>
   ```
   (WordPress: brug temaets `wp_enqueue_style/script` eller indsæt URL'erne direkte.)
3. **Indsæt markuppen** — kopiér blokken mellem
   `<!-- KONFIGURATOR-MODUL START -->` og `<!-- KONFIGURATOR-MODUL SLUT -->`
   fra `index.html` ind i en Custom Liquid-sektion / WordPress Custom-HTML-blok.

Modulet starter automatisk. Flere instanser på samme side understøttes.

## Tilpasning
- **Farver/spacing:** alle CSS-variabler ligger i toppen af `.jsk { … }` (`--jsk-red`, `--jsk-coral`, `--jsk-teal`, `--jsk-radius`, …).
- **Prisformel:** `basePrice(vol)` (249→135 kr) ganget med `PRODUCT_FACTOR` pr. produkt i `pricePerUnit(vol, product)`.
- **Lead-aflevering:** i `submit`-handleren (markeret med `>>> Her sendes lead'et <<<`) ligger en
  færdig `fetch()`-skabelon. Peg den mod din egen endpoint / Klaviyo / HubSpot / Shopify-formular.
  Indtil da logges lead'et til konsollen, og brugeren ser en kvittering.

## Tilgængelighed & robusthed
- Semantisk markup, `aria-label` på trin og felter, fuld tastatur-navigation.
- `prefers-reduced-motion` respekteres.
- Knapper er deaktiveret indtil trinnet er udfyldt — ingen ufuldstændige beregninger.
