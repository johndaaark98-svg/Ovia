/* =====================================================================
   OVIA — Assistente virtuale del sito (ex "maggiordomo")
   Modulo autonomo: crea da solo pulsante e finestra, legge la lingua
   dalla pagina (<html lang>), parla con /api/maggiordomo e invia la
   richiesta al gestionale con /api/lead. Nessun markup richiesto.
   Primario: API Anthropic via Vercel. Ripiego: domande guidate a regole.
   ===================================================================== */
(function () {
  'use strict';
  if (window.OviaAgent) return;

  var EN = (document.documentElement.lang || 'it').slice(0, 2) === 'en';
  var BASE = EN ? '/en/services/' : '/servizi/';
  var AGENT_API_URL = 'https://ovia-ten.vercel.app/api/maggiordomo';
  var LEAD_API_URL = 'https://ovia-ten.vercel.app/api/lead';

  var T = EN ? {
    btn: 'Ovia assistant', btnAria: 'Open the Ovia assistant', dialog: 'Ovia assistant',
    role: 'AI virtual assistant · describe what you need, I’ll suggest the solution',
    close: 'Close', send: 'Send', placeholder: 'Describe what you need…',
    chips: ['Too many emails to handle', 'Clients don’t send their documents', 'Calls get lost', 'I have no overview of my team'],
    book: 'Book the Process Check',
    greeting: 'Hi! I’m Ovia’s virtual assistant, powered by artificial intelligence (AI). Tell me what you need — the problem that eats most of your time — and I’ll suggest the right solution for the way you work.',
    typing: 'Ovia is typing…',
    q1: 'Thanks for telling me. To suggest the best solution, what kind of business do you run — accountant, lawyer, consultant, another type of company?',
    q2: 'Great. And today, for this part of the work, which tools do you use — email, WhatsApp, practice software, Excel sheets, or something else?',
    q3: 'Got it. One last thing: how many times a week, or how many clients, does this involve? A rough estimate is fine.',
    done: 'Thanks, I now have a clear picture of what you need. You can send the analysis to our team with the form below: we’ll use it to prepare a tailor-made proposal for you.',
    custom: 'Needs a tailor-made solution, not one of the published services',
    ready: 'Request ready for analysis', first: 'First name', last: 'Last name', email: 'Work email',
    sendTeam: 'Send the analysis to the team', invalid: 'Please enter your first name, last name and a valid email to continue.',
    sending: 'Sending…', sent: 'Analysis sent',
    thanks: function (n) { return 'Thank you ' + n + ', we’ve received everything. The Ovia team will get back to you within 24 hours with a tailor-made proposal.'; },
    failed: 'Sending failed. Please try again, or email us at oviaitalia@gmail.com.',
    labels: [['Attività', 'Business'], ['Esigenza', 'Need'], ['Strumenti attuali', 'Current tools'], ['Volume/frequenza', 'Volume/frequency'], ['Pacchetto suggerito', 'Suggested package']],
    lang: 'Rispondi sempre in INGLESE (la persona visita la versione inglese del sito; le etichette del riepilogo tra [[SUMMARY]] e [[/SUMMARY]] restano però esattamente in italiano, i valori in inglese),'
  } : {
    btn: 'Assistente Ovia', btnAria: 'Apri l’assistente Ovia', dialog: 'Assistente Ovia',
    role: 'Assistente virtuale AI · descrivi la tua esigenza, ti propongo la soluzione',
    close: 'Chiudi', send: 'Invia', placeholder: 'Descrivi la tua esigenza…',
    chips: ['Troppe email da gestire', 'I clienti non mandano i documenti', 'Le chiamate si perdono', 'Non ho controllo sul team'],
    book: 'Prenota il Process Check',
    greeting: 'Ciao! Sono l’assistente virtuale di Ovia, basato su intelligenza artificiale (AI). Descrivimi la tua esigenza — il problema che ti ruba più tempo — e ti propongo la soluzione giusta per il tuo modo di lavorare.',
    typing: 'Ovia sta scrivendo…',
    q1: 'Grazie per avermelo raccontato. Per proporti la soluzione più adatta, mi dici che tipo di attività segui — commercialista, avvocato, consulente, un’altra impresa?',
    q2: 'Perfetto. E oggi, per questa parte del lavoro, con quali strumenti vi arrangiate — email, WhatsApp, un gestionale, fogli Excel, o altro?',
    q3: 'Capito. Un’ultima cosa: quante volte a settimana, o quanti clienti coinvolge, questa attività? Anche una stima va benissimo.',
    done: 'Grazie, ora ho un quadro chiaro della tua esigenza. Puoi inviare l’analisi al nostro team con il modulo qui sotto: la useremo per prepararti una proposta su misura.',
    custom: 'Richiede una soluzione su misura, non tra quelle pubblicate',
    ready: 'Richiesta pronta per l’analisi', first: 'Nome', last: 'Cognome', email: 'Email di lavoro',
    sendTeam: 'Invia l’analisi al team', invalid: 'Completa nome, cognome e una email valida per continuare.',
    sending: 'Invio in corso…', sent: 'Analisi inviata',
    thanks: function (n) { return 'Grazie ' + n + ', abbiamo ricevuto tutto. Il team Ovia ti ricontatta entro 24 ore con una proposta su misura.'; },
    failed: 'Invio non riuscito. Riprova, oppure scrivici a oviaitalia@gmail.com.',
    labels: null,
    lang: 'Rispondi sempre in italiano,'
  };

  var PACKAGES = [
    { name: 'Ovia Second Brain', id: 'second-brain', kw: ['memoria', 'ricord', 'dimentic', 'appunt', 'note', 'second brain', 'informazioni', 'perd', 'procedur', 'conoscenz', 'circolar', 'cercare', 'trovare', 'memory', 'remember', 'forget', 'notes', 'knowledge', 'search', 'find'], desc: 'chiamate, decisioni, note e impegni vengono catturati, collegati al cliente giusto e ritrovati con una semplice domanda. La tua memoria professionale, sempre interrogabile, con permessi per persona.' },
    { name: 'Ovia Inbox', id: 'inbox', kw: ['email', 'mail', 'posta', 'pec', 'casella', 'messaggi', 'inbox', 'messages'], desc: 'ogni email viene riconosciuta (cliente, argomento, urgenza), assegnata alla persona giusta e accompagnata da una bozza di risposta nel tono del tuo studio. Tu approvi e invii; le urgenze ti raggiungono subito.' },
    { name: 'Ovia Lead Generation', id: 'lead-generation', kw: ['lead', 'preventiv', 'vendite', 'crescita', 'follow', 'nuovi client', 'contatt', 'marketing', 'acquisi', 'riattiv', 'quote', 'sales', 'growth', 'new client'], desc: 'i nuovi contatti ricevono risposta in pochi minuti e vengono qualificati, i preventivi vengono seguiti con metodo fino a una decisione, i contatti freddi riattivati. Nel rispetto del GDPR.' },
    { name: 'Ovia Chiamate', id: 'chiamate', kw: ['chiamat', 'telefon', 'riunion', 'meeting', 'vocal', 'plaud', 'registr', 'call', 'phone', 'voice'], desc: 'ogni chiamata viene trascritta e riassunta, poi trasformata in attività assegnate, scadenze, scheda cliente aggiornata ed email di riepilogo pronta per la tua approvazione.' },
    { name: 'Ovia Documenti', id: 'documenti', kw: ['document', 'fattur', 'sollecit', 'rincor', 'mandano', 'allegat', 'raccolta', 'modelli', 'contratt', 'delegh', 'invoice', 'reminder', 'chase'], desc: 'il sistema sa quali documenti servono per ogni cliente e pratica: invia le richieste, controlla cosa arriva, sollecita solo ciò che manca con storico tracciato e compila i documenti ricorrenti.' },
    { name: 'Ovia Siti Web per le AI', id: 'siti-web-ai', kw: ['sito', 'web', 'seo', 'google', 'chatgpt', 'posizion', 'online', 'prenotazion', 'visibil', 'website', 'booking', 'visibility'], desc: 'siti progettati per essere trovati e citati da ChatGPT, Gemini e dalle risposte AI di Google, con un assistente che risponde e prenota al posto tuo.' },
    { name: 'Ovia CRM', id: 'crm', kw: ['crm', 'gestional', 'excel', 'scadenz', 'dashboard', 'team', 'dipendent', 'collaborator', 'attivit', 'task', 'controllo', 'assegn', 'client', 'promemoria', 'deadline', 'staff', 'employee'], desc: 'un CRM su misura con clienti, pratiche, scadenze ricorrenti, carichi del team e solleciti automatici, che si aggiorna da solo da email, chiamate e documenti. Anche on-premise.' }
  ];

  var SYSTEM_PROMPT = 'Sei Ovia, l’assistente virtuale del sito di Ovia (L3 Innovation Srl, Olbia): un consulente cortese, piacevole e chiaro che accompagna chi visita il sito verso la soluzione più adatta alla sua esigenza di marketing o di automazione. Non vendiamo software standard: osserviamo come lavora il cliente e costruiamo il sistema intorno a lui.\n\n' +
    'Il tuo compito non è vendere in fretta un pacchetto: è capire a fondo, con calore e curiosità genuina, cosa la persona vuole automatizzare o migliorare — anche quando ciò che descrive non sembra corrispondere a nessuno dei servizi pubblicati sul sito. Se l’esigenza non rientra tra quelli, non trattarla mai come un limite (non dire mai “non abbiamo questo”): trattala con lo stesso interesse, perché è probabilmente il tipo di caso per cui costruiamo qualcosa su misura. Continua a fare domande con la stessa cura.\n\n' +
    'Tono: cortese, piacevole, mai freddo — ma anche mai vago o generico. Ogni risposta deve dimostrare che hai ascoltato davvero ciò che la persona ha appena detto, riprendendo le sue parole; evita frasi jolly buone per chiunque.\n\n' +
    'Regola assoluta: non spiegare mai COME funziona tecnicamente un’automazione. Mai menzionare modelli, webhook, API, RAG, integrazioni o altri tecnicismi. Resta sempre sul risultato per la persona, mai sul meccanismo.\n\n' +
    'Metodo: fai UNA domanda alla volta, breve e mirata, per capire in profondità: che tipo di attività svolge, qual è il problema specifico (non generico: i dettagli concreti), quali strumenti usa oggi per quella attività, e con quale frequenza o volume si presenta. Non correre: vanno bene 3–4 scambi prima di avere un quadro chiaro. Se la persona è già stata specifica al primo messaggio, non ripetere domande a cui ha già risposto.\n\n' +
    'Quando hai raccolto un quadro sufficientemente chiaro (tipo di attività + esigenza specifica + strumenti attuali; nome ed email solo se emergono spontaneamente, senza insistere — li chiederà comunque il modulo finale), il tuo messaggio deve prima ringraziare la persona e dirle con parole tue, cortesi, che ora hai un quadro chiaro e che può inviare l’analisi al team con il pulsante che comparirà; poi, SOLO in fondo al messaggio, su righe separate e senza aggiungere altro testo dopo, scrivi esattamente:\n\n' +
    '[[SUMMARY]]\nAttività: ...\nEsigenza: ...\nStrumenti attuali: ...\nVolume/frequenza: ...\nPacchetto suggerito: ... (oppure "Richiede una soluzione su misura, non tra quelle pubblicate")\n[[/SUMMARY]]\n[[READY]]\n\n' +
    'Questi tag sono invisibili alla persona (il sito li rimuove prima di mostrarli): non nominarli mai nella conversazione, non spiegare che li stai per scrivere. Usali una sola volta, quando il quadro è davvero completo.\n\n' +
    'Non promettere mai guadagni garantiti né automazioni senza controllo umano: il sistema propone, il cliente decide. ' + T.lang + ' con messaggi brevi (max 80–90 parole, tranne quello finale col riepilogo che può essere leggermente più lungo). Servizi Ovia, da usare solo per riconoscere internamente quale si avvicina di più a quanto descritto — non elencarli in blocco alla persona: ' +
    PACKAGES.map(function (p) { return p.name + ' — ' + p.desc; }).join(' | ');

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---------- Markup ---------- */
  var root = document.createElement('div');
  root.className = 'oa';
  root.innerHTML =
    '<button type="button" class="oa-launch js-concierge" aria-label="' + esc(T.btnAria) + '"><span class="oa-dot" aria-hidden="true"></span><span>' + esc(T.btn) + '</span></button>' +
    '<div class="oa-overlay" role="dialog" aria-modal="true" aria-label="' + esc(T.dialog) + '" hidden>' +
      '<div class="oa-backdrop" data-oa-close></div>' +
      '<div class="oa-panel">' +
        '<div class="oa-head"><div><p class="oa-name">Ovia</p><p class="oa-role">' + esc(T.role) + '</p></div>' +
        '<button type="button" class="oa-close" data-oa-close aria-label="' + esc(T.close) + '"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" fill="none"/></svg></button></div>' +
        '<div class="oa-messages" aria-live="polite"></div>' +
        '<div class="oa-chips">' + T.chips.map(function (c) { return '<button type="button" class="oa-chip">' + esc(c) + '</button>'; }).join('') +
          '<button type="button" class="oa-chip oa-chip-book" data-book>' + esc(T.book) + '</button></div>' +
        '<form class="oa-input-row"><label class="oa-sr" for="oa-input">' + esc(T.placeholder) + '</label>' +
          '<input type="text" id="oa-input" class="oa-input" placeholder="' + esc(T.placeholder) + '" autocomplete="off">' +
          '<button type="submit" class="oa-send">' + esc(T.send) + '</button></form>' +
      '</div>' +
    '</div>';
  document.body.appendChild(root);

  var overlay = root.querySelector('.oa-overlay');
  var messagesEl = root.querySelector('.oa-messages');
  var input = root.querySelector('.oa-input');
  var form = root.querySelector('.oa-input-row');
  var sendBtn = root.querySelector('.oa-send');
  var chipsEl = root.querySelector('.oa-chips');
  var history = [];
  var busy = false;
  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.documentElement.classList.add('oa-open');
    if (!messagesEl.children.length) addMsg('bot', T.greeting);
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() {
    overlay.hidden = true;
    document.documentElement.classList.remove('oa-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  root.querySelectorAll('[data-oa-close]').forEach(function (b) { b.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !overlay.hidden) close(); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.js-concierge');
    if (t) { e.preventDefault(); open(); }
  });

  function addMsg(who, text) {
    var div = document.createElement('div');
    div.className = 'oa-msg ' + who;
    div.innerHTML = esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  /* ---------- Ripiego senza API: domande guidate ---------- */
  var fb = { step: 0, attivita: '', esigenza: '', strumenti: '', volume: '' };
  function fallbackReply(text) {
    var t = text.trim();
    if (fb.step === 0) { fb.esigenza = t; fb.step = 1; return T.q1; }
    if (fb.step === 1) { fb.attivita = t; fb.step = 2; return T.q2; }
    if (fb.step === 2) { fb.strumenti = t; fb.step = 3; return T.q3; }
    fb.volume = t; fb.step = 4;
    var all = (fb.esigenza + ' ' + fb.attivita + ' ' + fb.strumenti).toLowerCase();
    var scored = PACKAGES.map(function (p) { return { p: p, s: p.kw.reduce(function (a, k) { return a + (all.indexOf(k) > -1 ? 1 : 0); }, 0) }; })
      .filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 2);
    var pkg = scored.length ? scored.map(function (x) { return x.p.name; }).join(' + ') : T.custom;
    var summary = 'Attività: ' + fb.attivita + '\nEsigenza: ' + fb.esigenza + '\nStrumenti attuali: ' + fb.strumenti + '\nVolume/frequenza: ' + fb.volume + '\nPacchetto suggerito: ' + pkg;
    return T.done + '\n\n[[SUMMARY]]\n' + summary + '\n[[/SUMMARY]]\n[[READY]]';
  }

  function parseReady(raw) {
    var ready = raw.indexOf('[[READY]]') > -1;
    var clean = raw.replace('[[READY]]', '');
    var summary = null;
    var m = clean.match(/\[\[SUMMARY\]\]([\s\S]*?)\[\[\/SUMMARY\]\]/);
    if (m) { summary = m[1].trim(); clean = clean.replace(m[0], ''); }
    return { text: clean.trim(), ready: ready, summary: summary };
  }

  function summaryFields(summary) {
    var f = { attivita: '', esigenza: '', strumenti_attuali: '', volume_frequenza: '', pacchetto_suggerito: '' };
    if (!summary) return f;
    var map = { 'attività': 'attivita', 'esigenza': 'esigenza', 'strumenti attuali': 'strumenti_attuali', 'volume/frequenza': 'volume_frequenza', 'pacchetto suggerito': 'pacchetto_suggerito' };
    summary.split('\n').forEach(function (line) {
      var i = line.indexOf(':'); if (i === -1) return;
      var k = map[line.slice(0, i).trim().toLowerCase()];
      if (k) f[k] = line.slice(i + 1).trim();
    });
    return f;
  }

  function showSummary(summary) {
    var s = summary || '';
    if (T.labels) T.labels.forEach(function (l) { s = s.replace(new RegExp('^' + l[0].replace('/', '\\/') + ':', 'm'), l[1] + ':'); });
    return esc(s).replace(/\n/g, '<br>');
  }

  function sendLead(d) {
    var f = summaryFields(d.summary);
    var payload = {
      nome: d.nome, cognome: d.cognome, email: d.email,
      attivita: f.attivita, esigenza: f.esigenza, strumenti_attuali: f.strumenti_attuali,
      volume_frequenza: f.volume_frequenza, pacchetto_suggerito: f.pacchetto_suggerito,
      trascrizione_conversazione: d.transcript.map(function (m) { return (m.role === 'user' ? 'Cliente' : 'Ovia') + ': ' + m.content; }).join('\n'),
      fonte: 'Sito — Maggiordomo', stato: 'Nuovo', data_ricezione: new Date().toISOString()
    };
    if (EN) payload.note_interne = 'Lingua: inglese (sito /en/)';
    return fetch(LEAD_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { if (!r.ok) throw new Error('lead'); });
  }

  function showReadyCard(summary) {
    var card = document.createElement('div');
    card.className = 'oa-card';
    card.innerHTML =
      '<p class="oa-card-title">' + esc(T.ready) + '</p>' +
      (summary ? '<p class="oa-card-sum">' + showSummary(summary) + '</p>' : '') +
      '<div class="oa-card-form">' +
        '<input type="text" class="oa-field" data-k="nome" placeholder="' + esc(T.first) + '" aria-label="' + esc(T.first) + '" autocomplete="given-name">' +
        '<input type="text" class="oa-field" data-k="cognome" placeholder="' + esc(T.last) + '" aria-label="' + esc(T.last) + '" autocomplete="family-name">' +
        '<input type="email" class="oa-field oa-full" data-k="email" placeholder="' + esc(T.email) + '" aria-label="' + esc(T.email) + '" autocomplete="email">' +
      '</div>' +
      '<button type="button" class="oa-submit">' + esc(T.sendTeam) + '</button>' +
      '<p class="oa-note" aria-live="polite"></p>';
    messagesEl.appendChild(card);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    var btn = card.querySelector('.oa-submit'), note = card.querySelector('.oa-note');
    btn.addEventListener('click', function () {
      var v = function (k) { return card.querySelector('[data-k="' + k + '"]').value.trim(); };
      var nome = v('nome'), cognome = v('cognome'), email = v('email');
      if (!nome || !cognome || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { note.textContent = T.invalid; return; }
      btn.disabled = true; note.textContent = T.sending;
      sendLead({ nome: nome, cognome: cognome, email: email, summary: summary, transcript: history })
        .then(function () { card.innerHTML = '<p class="oa-card-title">' + esc(T.sent) + '</p><p class="oa-card-sum">' + esc(T.thanks(nome)) + '</p>'; })
        .catch(function () { note.textContent = T.failed; btn.disabled = false; });
    });
  }

  function askClaude(userText) {
    var msgs = history.concat([{ role: 'user', content: userText }]);
    return fetch(AGENT_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system: SYSTEM_PROMPT, messages: msgs }) })
      .then(function (r) { if (!r.ok) throw new Error('api'); return r.json(); })
      .then(function (data) {
        var text = (data.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('\n').trim();
        if (!text) throw new Error('empty');
        return text;
      });
  }

  function send(text) {
    text = (text || input.value).trim();
    if (!text || busy) return;
    busy = true; sendBtn.disabled = true; input.value = '';
    chipsEl.hidden = true;
    addMsg('user', text);
    var typing = addMsg('bot typing', T.typing);
    askClaude(text).catch(function () { return fallbackReply(text); }).then(function (raw) {
      var r = parseReady(raw);
      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: r.text });
      if (history.length > 12) history.splice(0, history.length - 12);
      typing.remove();
      addMsg('bot', r.text);
      if (r.ready) showReadyCard(r.summary);
      busy = false; sendBtn.disabled = false; input.focus();
    });
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); send(); });
  chipsEl.querySelectorAll('.oa-chip').forEach(function (chip) {
    if (chip.hasAttribute('data-book')) {
      chip.addEventListener('click', function () { close(); var b = document.querySelector('[data-cal-link]'); if (b) b.click(); });
    } else {
      chip.addEventListener('click', function () { send(chip.textContent); });
    }
  });

  /* Il pulsante dell'assistente si sposta quando sotto c'è un pallino da tenere premuto,
     così non copre mai un'approvazione (soprattutto sul telefono). */
  (function () {
    var launch = document.querySelector('.oa-launch');
    if (!launch) return;
    var SEL = '[data-hx-dot], [data-pipe-hold]:not([hidden]), .sx-hold, [data-hx-cta], .sx-btn2';
    var raf = 0, base = null;
    var check = function () {
      raf = 0;
      // posizione "di casa" del pulsante (quando è spostato il suo rettangolo non vale)
      if (!launch.classList.contains('oa-away') || !base) base = launch.getBoundingClientRect();
      var away = false, L = base;
      var pad = 14;
      document.querySelectorAll(SEL).forEach(function (el) {
        if (away) return;
        var r = el.getBoundingClientRect();
        if (!r.width) return;
        if (r.left < L.right + pad && r.right > L.left - pad && r.top < L.bottom + pad && r.bottom > L.top - pad) away = true;
      });
      launch.classList.toggle('oa-away', away);
      launch.tabIndex = away ? -1 : 0;
    };
    var later = function () { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener('scroll', later, { passive: true });
    window.addEventListener('resize', later);
    if ('MutationObserver' in window) new MutationObserver(later).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    later();
  })();

  window.OviaAgent = { open: open, close: close };
})();
