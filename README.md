# Ovia — sito ufficiale (oviaitalia.it)

## Cosa c'è in questa cartella
- `index.html` — il sito, un solo file (HTML + CSS + JS)
- `ovia-hero.mp4` — il video delle sinapsi nell'hero
- `CNAME` — dice a GitHub Pages di rispondere su oviaitalia.it

Sono gli unici tre file da caricare. Non servono build, framework, node_modules.

## Prima di andare online: il maggiordomo AI

Il pulsante "maggiordomo" oggi prova a chiamare `api.anthropic.com` direttamente
dal browser. Su un sito statico questo NON funziona in modo sicuro: una chiave
API nel codice del sito sarebbe visibile a chiunque apra "Ispeziona elemento"
e te la userebbero a tue spese in un pomeriggio.

Quello che succede finché non risolvi questo punto: la chiamata fallisce,
e il maggiordomo passa automaticamente al motore a regole (fallbackReply
in index.html) — funziona comunque, riconosce le parole chiave e propone
i pacchetti giusti, semplicemente non è "intelligente" come Claude.

Per avere il maggiordomo vero servono ~20 righe di codice su un piccolo
backend (una Cloudflare Worker o una funzione su Vercel/Netlify, gratis
per questo traffico) che tiene la chiave al sicuro e il sito chiama quello
invece di Anthropic direttamente. Fammelo sapere quando vuoi farlo: è un
lavoro di 15 minuti, ma è un pezzo separato da "mettere online il sito".

## Il calendario di prenotazione

Le disponibilità mostrate sono simulate (funzione slotsFor in index.html).
La conferma mostra un messaggio di successo ma non invia nulla a nessuno.
Per renderlo vero: o colleghi Cal.com/Calendly al posto della card, o mi
chiedi di collegare un webhook che ti arriva su email/Zapier quando qualcuno
prenota.

## Deploy su GitHub Pages — passo per passo

1. Vai su github.com, crea un repository nuovo, pubblico, nome a scelta
   (es. "ovia-sito"). Non aggiungere README/licenza in fase di creazione.

2. Carica questi tre file nella root del repository:
   trascinali nella pagina del repo da browser (Add file → Upload files),
   oppure da terminale:
   ```
   git clone https://github.com/TUO-USERNAME/ovia-sito.git
   cd ovia-sito
   cp /percorso/index.html /percorso/ovia-hero.mp4 /percorso/CNAME .
   git add .
   git commit -m "Sito Ovia"
   git push
   ```

3. Nel repository: Settings → Pages.
   - Source: "Deploy from a branch"
   - Branch: main, cartella /root
   - Salva

4. Sempre in Settings → Pages, sezione "Custom domain": scrivi
   `oviaitalia.it` e salva (il file CNAME che hai già caricato fa la
   stessa cosa automaticamente, ma confermalo qui).

5. Vai dal tuo registrar (dove hai comprato oviaitalia.it) e imposta
   questi record DNS:

   Per il dominio nudo (oviaitalia.it), quattro record A che puntano
   ai server di GitHub:
   ```
   A    @    185.199.108.153
   A    @    185.199.109.153
   A    @    185.199.110.153
   A    @    185.199.111.153
   ```

   Per www.oviaitalia.it, un record CNAME:
   ```
   CNAME    www    TUO-USERNAME.github.io
   ```

   Se il tuo registrar supporta ALIAS/ANAME invece di record A multipli
   sulla root, puoi usare quello puntando a TUO-USERNAME.github.io — è
   equivalente e più pulito.

6. La propagazione DNS richiede da pochi minuti a 24-48 ore. Quando è
   pronta, torna su Settings → Pages: se vedi il segno di spunta verde
   su "DNS check successful", spunta anche "Enforce HTTPS" — GitHub
   genera il certificato SSL da solo, gratis, in automatico.

7. Fatto: oviaitalia.it è online.

## Aggiornamenti futuri

Ogni volta che vuoi cambiare qualcosa, basta modificare index.html e
rifare git add / commit / push: GitHub Pages ripubblica da solo in
circa un minuto.
