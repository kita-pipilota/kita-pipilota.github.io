# Kita Pipilota – Website

Website der spanisch-deutschen Kita Pipilota (Berlin-Friedrichshain),
erstellt mit [Astro](https://astro.build) und veröffentlicht über GitHub Pages
unter [pipilota.de](https://pipilota.de).

## Inhalt bearbeiten

Alle Texte liegen als Markdown-Dateien unter `src/content/pages/`:

- `src/content/pages/de/…` – deutsche Seiten
- `src/content/pages/es/…` – spanische Seiten

Jede Datei beginnt mit einem Kopfbereich (Frontmatter). **Nur den Text unterhalb
des zweiten `---` ändern.** Überschriften beginnen mit `##`, Aufzählungen mit
`- `, Links sehen so aus: `[Text](https://beispiel.de)`.

Beispiel:

```markdown
---
title: "Termine"
description: "Termine und Veranstaltungen der Kita Pipilota für 2026."
translationKey: "dates"
---

## Termine 2026

| Veranstaltung | Datum |
| --- | --- |
| Sommerfest | 03. Juli |
```

- `title` erscheint im Browser-Tab und als Überschrift.
- `description` wird für Suchmaschinen verwendet.
- `translationKey` verbindet die deutsche und die spanische Seite. **Nicht ändern.**

### Neue Seite hinzufügen

1. Datei in `src/content/pages/de/` und `src/content/pages/es/` anlegen.
2. Denselben neuen `translationKey` in beiden Dateien verwenden.
3. Seite in `src/i18n/config.ts` registrieren (Slug, Label und Navigation).

## Bilder

Bilder liegen in `public/images/`, PDFs in `public/downloads/`. Im Text werden sie
so eingebunden: `![Beschreibung](/images/dateiname.jpg)`.

## Lokal starten

```sh
nvm use            # Node-Version aus .nvmrc
npm install
npm run dev        # http://localhost:4321
```

Weitere Befehle: `npm run build`, `npm run preview`, `npm run check`.

## Veröffentlichung

Ein Push auf `main` löst den Workflow in `.github/workflows/deploy.yml` aus und
veröffentlicht die Seite automatisch. Der Kontaktformular-Endpunkt wird in
`src/components/ContactForm.astro` (`FORM_ENDPOINT`) gesetzt.

Die einmaligen Migrationsskripte unter `scripts/` (Weebly-Import, Redirects)
müssen im Normalbetrieb nicht ausgeführt werden.
