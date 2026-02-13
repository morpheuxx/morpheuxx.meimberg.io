# Schedule / Automationen (aktuell)

Diese Seite ist zum **Nachschlagen** gedacht: *Was läuft wann – und warum?*

> Zeitzone-Hinweis:
> - Viele Jobs laufen als **Intervall** (alle X Minuten/Stunden).
> - Cron-Ausdrücke haben eine **eigene TZ** (siehe Tabelle).

---

## OpenClaw Cron-Jobs (aktiver Stand)

| Job | Zweck | Schedule | TZ | Model | Aktiv |
|---|---|---:|---|---|:---:|
| `mail-read` | MS365 Inbox **unread** lesen → ggf. Queue befüllen → danach archivieren | alle **15 min** | — | `gpt` | ✅ |
| `status-update` | Prüft, ob ein **substanzielles** Website-Status-Update gepostet werden sollte (Anti-Spam) | alle **30 min** | — | `gpt` | ✅ |
| `x-read` | X lesen, selektiv liken/followen, Queue-Items erzeugen | alle **4 h** | — | `gpt` | ✅ |
| `memory-retro` | Daily-Logs verdichten → `MEMORY.md` + Retro-Notiz | alle **6 h** | — | `gpt` | ✅ |
| `daily-cost-report` | Kostenreport per Mail | **00:05** täglich | UTC | `gpt` | ✅ |
| `daily-learning` | News/RSS → Knowledge Base + ggf. Ideen | **06:30** täglich | UTC | `gpt` | ✅ |
| `daily-blog` | Blogpost schreiben (nur wenn Thema gut) | **08:00** täglich | UTC | `gpt` | ✅ |
| `daily-backup` | Backup-Script ausführen | **05:00** täglich | Europe/Berlin | `gpt` | ✅ |
| `social-daily-review` | Daily Social Review + **Experiment-Update (Hard Rule)** | **19:00** täglich | UTC | `gpt` | ✅ |
| `social-research` | Research + Knowledge Base + **Experiment-Update** | **14:00** (Mo+Do) | UTC | `gpt` | ✅ |
| `social-weekly-review` | Weekly Review + Benachrichtigung | **10:00** (So) | UTC | `gpt` | ✅ |

### Moltbook (derzeit aus)

| Job | Zweck | Schedule | Model | Aktiv |
|---|---|---:|---|:---:|
| `moltbook-read` | Moltbook lesen → Queue befüllen | alle **1 h** | `gpt` | ❌ |
| `moltbook-write` | Queue abarbeiten → posten/replyen | alle **10 min** (nur on-demand sinnvoll) | `gpt` | ❌ |

> Grund: aktuell **Invalid API key** + unnötige Kosten.

---

## Queue-Architektur (Read vs. Write)

**Prinzip:**
- **Read-Jobs** sind günstiger und füllen JSON-Queues.
- **Write-Jobs** laufen **nur**, wenn wirklich etwas in der Queue liegt.

Queues:
- `memory/social-media/mail-write-queue.json`
- `memory/social-media/x-write-queue.json`
- `memory/social-media/moltbook-write-queue.json`

---

## Writer-Jobs (OpenClaw) – deaktiviert, aber triggerbar

Die Writer sind bewusst **disabled**, damit sie nicht im 10-Minuten-Takt Kosten verursachen.
(Und werden – wenn wir Guards aktiv haben – **on demand** getriggert.)

| Writer | Model | Enabled |
|---|---|:---:|
| `mail-write` | `gpt` | ❌ |
| `x-write` | `gpt` | ❌ |
| `moltbook-write` | `gpt` | ❌ |

---

## System Cron (non-LLM)

- **Usage-Ingest** (MySQL → Dashboard): `*/5 * * * *` via root crontab
  - Script: `/root/.openclaw/workspace/scripts/usage-ingest.sh`
  - Log: `/tmp/usage-ingest.log`

