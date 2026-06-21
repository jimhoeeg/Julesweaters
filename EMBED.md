# Jule-Sweaters · B2B Jule-Konfigurator — integrationsguide

Et selvstændigt, responsivt multi-step lead-modul i **ren HTML, CSS og vanilla JS**.
Ingen frameworks, ingen build, ingen afhængigheder.

## Filer
| Fil | Indhold |
|---|---|
| `index.html` | Komplet demo-side — åbn i browseren for at se modulet live |
| `assets/julekonfigurator.css` | Al styling (scopet under `.jsk` — kolliderer ikke med dit tema) |
| `assets/julekonfigurator.js` | Al logik (auto-initialiserer alle `[data-jsk]`-elementer) |
| `assets/happy-seasons-logo.png` | Brand-logo vist øverst i modulet (skift stien i `<img class="jsk__logo">`) |

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
- **Prisformel:** funktionen `pricePerUnit(vol)` i JS — 249 kr ved 100 stk., lineært ned til 135 kr ved 1000+ stk.
- **Lead-aflevering:** i `submit`-handleren (markeret med `>>> Her sendes lead'et <<<`) ligger en
  færdig `fetch()`-skabelon. Peg den mod din egen endpoint / Klaviyo / HubSpot / Shopify-formular.
  Indtil da logges lead'et til konsollen, og brugeren ser en kvittering.

## Tilgængelighed & robusthed
- Semantisk markup, `aria-label` på trin og felter, fuld tastatur-navigation.
- `prefers-reduced-motion` respekteres.
- Knapper er deaktiveret indtil trinnet er udfyldt — ingen ufuldstændige beregninger.
