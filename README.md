# RAICHEM · Brand Book — Micrositio

Micrositio web ufficiale del **Brand Book di RAICHEM · BPO Systems**.
Il manuale operativo della marca: *identità · voce · sistema*.

> **Matisis Consultancy** · 2026 · Versione 1.0

---

## Cos'è

Un micrositio single-page, responsive e navigabile che presenta i **12 capitoli**
del brand book in formato interattivo, pronto per la consegna al cliente.

Riproduce fedelmente il sistema visivo definito nel brand book — estetica *scheda
tecnica / blueprint industriale*: griglia tecnica, *corner brackets*, numeri
fantasma, tick rossi e label tecniche in monospazio.

## Contenuti (12 capitoli)

| # | Capitolo |
|---|---|
| 01 | Fondamenti strategici |
| 02 | Posizionamento di marca |
| 03 | Identità verbale (personalità, voce, claim, vocabolario) |
| 04 | Architettura dei messaggi |
| 05 | Target group (buyer personas) |
| 06 · 07 | Usabilità interna & partner esterni |
| 08 | Identità visiva (palette, tipografia, logo, fotografia) |
| 09 | Contenuti per canale & applicazioni |
| 10 | Do's & Don'ts |
| 11 | Checklist di approvazione |
| 12 | Governance di marca |

## Sistema visivo

- **Colori** — Rosso Raichem `#C91517` (accento), Nero `#1A1A1A`, Grigio `#666666`, Grigio chiaro `#F2F2F2`, Bianco `#FFFFFF`
- **Tipografia** — Saira Condensed (display), Archivo (testo), IBM Plex Mono (dati/label)
- **Sistema grafico** — griglia blueprint 96px · corner brackets · tick rossi · numeri fantasma

## Struttura

```
.
├── index.html              # Micrositio (tutti i 12 capitoli)
├── assets/
│   ├── css/styles.css      # Sistema di design + layout
│   └── js/script.js        # Nav, scroll-spy, progress bar, reveal
└── README.md
```

## Uso locale

Nessuna dipendenza, nessun build. Apri `index.html` nel browser, oppure servi
la cartella:

```bash
python3 -m http.server 8080
# poi apri http://localhost:8080
```

## Pubblicazione

Sito statico: pubblicabile su qualsiasi hosting statico (GitHub Pages, Netlify,
Vercel, Cloudflare Pages) caricando la cartella così com'è.

## Spazi da completare

Alcune sezioni includono *placeholder* pronti per gli asset reali (mai stock):

- **08 · Fotografia** — impianti, processi, persone
- **08 · Iconografia** — set di icone dedicato (da definire)
- **09 · Mockup** — packaging Raipack, scheda tecnica TDS, deck, web, social, stand
- **09 · Motion** — logo in motion, animazione prodotto, video di processo
