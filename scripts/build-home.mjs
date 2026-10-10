// Genera la homepage: /index.html e /en/index.html, dalla stessa struttura.
// I testi sono in T.it / T.en qui sotto; i servizi arrivano da data/prodotti.mjs,
// il "punto di controllo umano" di ogni servizio da data/servizi.mjs (campo human).
// L'interattività (coda di approvazione, manifesto, simulatore) è in assets/ovia-home.js:
// i suoi contenuti arrivano dal JSON #hx-data generato qui, così il JS non ha testi.
// Modifica qui e rilancia `npm run sito`.
import { writeFileSync, mkdirSync } from 'node:fs';
import { SITE, prodottiIn } from '../data/prodotti.mjs';
import { head, header, footer, esc, calBtn, urlIn } from './lib/layout.mjs';
import { ctaBand, sistemi } from './lib/blocchi.mjs';
import { UI, pathFor } from './lib/i18n.mjs';
import { bloccoHome } from './build-faq.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const ALT = { it: '/', en: '/en/' };
// I cinque pezzi del sistema: studio, arriva, legge, prepara, decidi tu (il pallino).
const KIT_GLYPH = [
  '<path d="M3 19.5h16M5 19.5V9l6-4 6 4v10.5M9 19.5v-5h4v5"/>',
  '<path d="M4 9.5v3M7.5 7v8M11 4.5v13M14.5 7v8M18 9.5v3"/>',
  '<rect x="4" y="3.5" width="14" height="15" rx="1.6"/><path d="M7.5 8h7M7.5 11h7M7.5 14h4"/>',
  '<rect x="7" y="2.5" width="8" height="17" rx="4"/><circle cx="11" cy="6.6" r="1.3"/><circle cx="11" cy="11" r="1.3"/><circle cx="11" cy="15.4" r="1.3"/>',
  '<circle cx="11" cy="11" r="5" fill="currentColor" stroke="none"/>',
]
const LOGHI = [
  { src: '/loghi/eurofiltri-trim.png', alt: 'Eurofiltri Group', h: 26, w: 105, mono: true },
  { src: '/loghi/rialziamoci.svg', alt: 'Rialziamoci Italia', h: 34, w: 111 },
  { src: '/loghi/l3-innovation-trim.png', alt: 'L3 Innovation', h: 26, w: 103 },
  { src: '/loghi/lucrezia-trabucco-trim.png', alt: 'Lucrezia Trabucco, biologa nutrizionista', h: 15, w: 209, mono: true },
];

const T = {
  it: {
    title: 'Ovia — Sistemi di marketing e automazione per studi professionali',
    desc: 'Ovia progetta sistemi di marketing e automazione per studi professionali: commercialisti, avvocati e consulenti del lavoro. Il sistema prepara email, documenti e scadenze, una persona dello studio approva ogni passo che conta.',
    eyebrow: 'Per commercialisti, avvocati e consulenti del lavoro',
    h1: 'Sistemi di marketing e automazione per studi professionali.',
    lead: 'Nuovi clienti per lo studio, e meno ore perse tra email, documenti e scadenze. Ovia prepara il lavoro, poi si ferma: ogni passo che conta lo approvi tu.',
    talk: 'Parla con l’assistente',
    // coda di approvazione (hero)
    qTitle: 'Coda di approvazione', qWaiting: 'in attesa', qWaitingOne: 'in attesa',
    qBy: 'Preparato da Ovia', qPending: 'In attesa', qOk: 'Approvato', qSent: 'Fatto',
    hint: 'Tieni premuto il pallino per approvare',
    hintKey: 'oppure tieni premuto Invio',
    approveSr: 'Approva l’azione in attesa',
    count1: 'Hai approvato 1 azione. Il resto l’ha fatto il sistema.',
    countN: 'Hai approvato {n} azioni. Il resto l’ha fatto il sistema.',
    empty: 'Coda vuota. Arriva qualcosa di nuovo…',
    pool: [
      ['Analisi della chiamata', 'Dichiarazione 2026', 'Giulia Fadda · 1 dato da confermare'],
      ['Documenti pronti', 'Mandato e preventivo', 'Paolo Murgia · da firmare'],
      ['Dato discordante', 'Ore settimanali: 20 o 24?', 'Fratelli Deiana Srl'],
      ['Richiesta documento', 'Busta paga di febbraio', 'Pratica 214'],
      ['Possibile doppione', 'Marco Serra e Marco Sera', 'Stesso numero di telefono'],
      ['Nota vocale', 'Aggiornamento della pratica', 'Prossima azione: venerdì'],
      ['Promemoria al cliente', 'Rinnovo del contratto', 'Scade tra 30 giorni'],
    ],
    // manifesto
    manifesto: 'Il pallino {dot} del nostro logo significa _in_ _attesa._ Ogni sistema Ovia fa il lavoro ripetitivo, poi si ferma e aspetta una persona prima di ogni passo che conta.',
    manifestoSub: 'Così l’automazione lavora per te, e non al posto tuo.',
    tale: {
      title: 'La mattina di uno studio, in un minuto',
      steps: [
        ['08:30', 'Arriva tutto, insieme.', 'Email, PEC, documenti dei clienti, chiamate. Ogni canale chiede attenzione nello stesso momento.'],
        ['08:31', 'Ovia legge e collega.', 'Ogni chiamata, email e documento viene agganciato al cliente e alla pratica giusti, senza doppioni.'],
        ['08:33', 'Prepara il lavoro.', 'Schede aggiornate, documenti e risposte già pronti, nel tono dello studio. Nessuna cifra inventata.'],
        ['08:34', 'Poi si ferma. Aspetta te.', 'Il pallino blu segna ogni passo che richiede una persona. Niente parte da solo.'],
        ['08:40', 'Tu decidi. Il resto è fatto.', 'Approvi in pochi gesti, e la giornata riparte dal lavoro che conta davvero.'],
      ],
      legend: [['email', 'Email'], ['doc', 'Documenti'], ['call', 'Chiamate'], ['pec', 'PEC']],
      clients: ['Giulia Fadda', 'Fratelli Deiana Srl', 'Pratica 214', 'Nuovo contatto'],
      cards: ['Analisi della chiamata', 'Documenti da firmare', 'Sollecito busta paga', 'Risposta al preventivo'],
      wait: 'In attesa', ok: 'Approvato', count: '{n} di 4 approvate da te', next: 'Provalo qui sotto',
    },
    // Monta il tuo sistema: il flusso reale di Ovia (nato sulle pratiche di sovraindebitamento),
    // applicato al processo di uno studio. Un pezzo alla volta, guidato dal pallino.
    kit: {
      h: 'Monta il tuo sistema. Cinque pezzi, un minuto.',
      p: 'È il flusso che Ovia usa ogni giorno su pratiche reali, adattato al tuo studio. Dove vedi il pallino blu, tocca a te.',
      parts: ['Studio', 'Ascolta', 'Capisce', 'Valuta', 'Approvi tu'],
      label: 'Il tuo sistema', piece: 'Pezzo {n} di 5', doneTag: 'Sistema montato', restart: 'Ricomincia',
      note: 'Esempio dimostrativo con nomi e dati inventati.',
      s0: { h: 'Che studio hai?', p: 'Ovia si costruisce sul processo del tuo studio, non su un modello generico.' },
      s1: { h: 'Arriva una chiamata. Premi per ascoltarla.', p: 'Ovia la registra e la trascrive da sola. Tu resti concentrato sul cliente, non sugli appunti.', play: 'Ascolta la chiamata', live: 'In ascolto', you: 'Studio' },
      s2: { h: 'Ovia trasforma la chiamata in una scheda.', p: 'Cliente, pratica, impegni e documenti. Quello che il cliente non ha detto con certezza resta «non quantificato»: nessuna cifra inventata.',
        h2: 'Due chiamate dicono cose diverse. Decidi tu.', p2: 'Ovia non sceglie al posto tuo: ti mostra entrambi i valori, con la data di ogni chiamata.',
        head: 'Proposta di Ovia · non ancora nella scheda', nq: 'Non quantificato', diff: 'Dato diverso tra due chiamate', keep: 'Tieni', use: 'Usa' },
      s3: { h: 'Ovia valuta la pratica. Tocca il semaforo.', p: 'Ogni valutazione ha le sue ragioni, scritte. Niente punteggi misteriosi.', why: 'Perché?', next: 'Prossima azione', docs: 'Documenti pronti da generare' },
      s4: { h: 'Ora si ferma. Tieni premuto il pallino per firmare.', p: 'Finché non approvi, la scheda del cliente non cambia e nessun documento nasce.', pending: 'Analisi in attesa di approvazione', hold: 'Tieni premuto per approvare', approved: 'Approvata da te · la tua firma resta nel registro' },
      s5: { h: 'Il tuo sistema è montato.', p: 'È lo stesso flusso che Ovia usa ogni giorno su pratiche reali, costruito sul processo del tuo studio.', you: 'Il tuo contributo: un ascolto, una scelta, una firma. Il resto l’ha fatto il sistema, in {s} secondi.', again: 'Monta per un altro studio', discover: 'Scopri', calNote: 'Arrivo dal sito: ho montato il sistema per uno {studio}.' },
      studios: [
        { id: 'commercialista', name: 'Commercialista', sub: 'Dichiarazioni, contabilità, scadenze fiscali', kind: 'studio commercialista', svc: 'chiamate',
          call: { who: 'Giulia Fadda', ini: 'GF', meta: 'Cliente dal 2019 · 3 minuti', lines: [
            ['c', 'Buongiorno, volevo sapere se vi è arrivato tutto per la dichiarazione.'],
            ['s', 'Quasi: manca la certificazione degli interessi del mutuo.'],
            ['c', 'Ve la mando entro venerdì. Quest’anno ho anche un affitto, circa 600 euro al mese. E delle spese mediche, non so quanto.'] ] },
          fields: [['Cliente', 'Giulia Fadda'], ['Pratica', 'Dichiarazione 2026'], ['Manca', 'Certificazione interessi del mutuo'], ['Impegno', 'La invia entro venerdì']],
          nq: ['Spese mediche', '«non so quanto»'],
          conflict: { k: 'Affitto percepito', keep: ['650 € al mese', 'chiamata del 12 marzo'], use: ['600 € al mese', 'chiamata di oggi'] },
          eval: { level: 'mid', label: 'Da completare', why: ['Manca 1 documento su 12', 'Nuovo reddito da affitto, da inserire nel quadro', 'Spese mediche da quantificare con le ricevute'], next: 'Promemoria a Giulia mercoledì, se il documento non arriva',
            docs: [['Richiesta del documento mancante', 'PDF'], ['Elenco ricevute spese mediche', 'PDF'], ['Riepilogo per il fascicolo', 'Word']] },
          done: ['Scheda di Giulia Fadda aggiornata', 'Documenti salvati nella cartella del cliente', 'Promemoria in calendario per mercoledì'] },
        { id: 'avvocato', name: 'Avvocato', sub: 'Pratiche, termini, colloqui con i clienti', kind: 'studio legale', svc: 'chiamate',
          call: { who: 'Paolo Murgia', ini: 'PM', meta: 'Nuovo cliente · 4 minuti', lines: [
            ['c', 'Avvocato, mi è arrivato un decreto ingiuntivo dal mio fornitore. Notificato il 2 ottobre.'],
            ['s', 'Per quale importo?'],
            ['c', 'Dodicimila e qualcosa, non ricordo. Però una parte l’avevo già pagata, ho i bonifici.'] ] },
          fields: [['Cliente', 'Paolo Murgia, nuovo'], ['Pratica', 'Opposizione a decreto ingiuntivo'], ['Documenti', 'Atto notificato, bonifici di pagamento'], ['Fatto rilevante', 'Pagamento parziale già eseguito']],
          nq: ['Importo ingiunto', '«dodicimila e qualcosa»'],
          conflict: { k: 'Data di notifica', keep: ['29 settembre', 'modulo dal sito, 3 ottobre'], use: ['2 ottobre', 'chiamata di oggi'] },
          eval: { level: 'high', label: 'Urgente', why: ['Termine di 40 giorni dalla notifica', 'Data di notifica da verificare sull’atto', 'Pagamento parziale da documentare'], next: 'Appuntamento in studio entro venerdì, con l’atto e la busta',
            docs: [['Mandato e informativa privacy', 'Word'], ['Preventivo', 'PDF'], ['Richiesta documenti al cliente', 'PDF']] },
          done: ['Pratica aperta: decreto ingiuntivo, Paolo Murgia', 'Termine in calendario, da confermare sulla notifica', 'Documenti salvati nella cartella del cliente'] },
        { id: 'consulente', name: 'Consulente del lavoro', sub: 'Paghe, assunzioni, adempimenti', kind: 'studio di consulenza del lavoro', svc: 'documenti',
          call: { who: 'Fratelli Deiana Srl', ini: 'FD', meta: 'Cliente dal 2021 · 2 minuti', lines: [
            ['c', 'Da lunedì assumiamo Sara Pinna, impiegata part-time. Contratto del commercio.'],
            ['s', 'Quante ore a settimana?'],
            ['c', 'Venti, mi pare. La paga come gli altri, più o meno.'] ] },
          fields: [['Cliente', 'Fratelli Deiana Srl'], ['Pratica', 'Assunzione di Sara Pinna'], ['Inizio', 'Lunedì'], ['Contratto', 'CCNL Commercio, part-time']],
          nq: ['Retribuzione', '«come gli altri, più o meno»'],
          conflict: { k: 'Ore settimanali', keep: ['24 ore', 'email di ieri'], use: ['20 ore', 'chiamata di oggi'] },
          eval: { level: 'high', label: 'Scadenza vicina', why: ['Comunicazione obbligatoria prima di lunedì', 'Mancano i documenti della lavoratrice', 'Retribuzione da definire con l’azienda'], next: 'Richiesta documenti all’azienda oggi, comunicazione entro domenica',
            docs: [['Richiesta documenti all’azienda', 'PDF'], ['Lettera di assunzione', 'Word'], ['Checklist assunzione', 'PDF']] },
          done: ['Pratica aperta: assunzione di Sara Pinna', 'Comunicazione obbligatoria in calendario entro domenica', 'Documenti salvati nella cartella dell’azienda'] },
      ],
    },
    facts: [['15.000+', 'pratiche gestite con i software che abbiamo costruito'], ['30 minuti', 'per il Process Check, senza impegno'], ['Olbia', 'sede, braccio operativo di L3 Innovation Srl']],
    clients: 'Hanno scelto Ovia',
    sysH: 'Due sistemi che lavorano insieme.',
    sysP: 'Il marketing porta nuovi clienti allo studio, l’automazione toglie il lavoro ripetitivo a chi ci lavora. In ogni servizio il pallino indica dove decide una persona dello studio.',
    methodH: 'Un metodo, quattro passaggi.',
    methodP: 'Nessuna trasformazione improvvisa: partiamo dal problema che ti costa di più e lo risolviamo con un risultato che si può misurare.',
    steps: [
      ['Process Check', 'Trenta minuti sul tuo flusso di lavoro reale: dove si perde tempo, dove si perdono clienti.'],
      ['Progetto', 'Ti proponiamo cosa costruire per primo, con costi, tempi e risultato atteso nero su bianco.'],
      ['Costruzione', 'Costruiamo il sistema sugli strumenti che usi già. Il tuo team lo prova prima che diventi operativo.'],
      ['Misura e cura', 'Misuriamo ore recuperate e clienti acquisiti, e miglioriamo il sistema mese dopo mese.'],
    ],
    // Caso reale: dove nasce Ovia (pre-istruttoria del sovraindebitamento, Rialziamoci Italia).
    caseTag: 'Caso reale · Rialziamoci Italia',
    caseH: 'Ovia è nata dove un errore costa caro.',
    caseP: 'Il primo sistema Ovia gestisce la pre-istruttoria delle pratiche di sovraindebitamento di Rialziamoci Italia, dalla prima telefonata al numero verde fino ai documenti ufficiali. Il flusso che hai appena montato viene da lì.',
    caseSteps: [
      ['Numero verde', 'L’operatore risponde e registra. La pratica nasce da sola, senza doppioni.'],
      ['Fascicolo', 'Debito, patrimonio e reddito per fasce: semaforo e urgenza già alla prima chiamata.'],
      ['Colloquio', 'La seconda chiamata diventa una scheda completa: creditori, importi, criticità, documenti.'],
      ['Approvazione', 'L’analisi resta una proposta. Un operatore la controlla, la corregge e firma.'],
      ['Documenti', 'Cinque documenti ufficiali in PDF e Word, nella cartella del cliente.'],
      ['Decisione', 'Il titolare decide se partire. Poi la pratica passa a chi la gestisce.'],
    ],
    caseRulesH: 'Le regole che restano uguali in ogni studio',
    caseRules: [
      ['Nessuna cifra inventata', 'Quello che il cliente non ha detto con certezza resta «non quantificato».'],
      ['Più chiamate, una sola scheda', 'Le informazioni si sommano senza doppioni. Se due chiamate non coincidono, decide una persona.'],
      ['Niente entra senza firma', 'Finché nessuno approva, pratica, valutazioni e cruscotto non cambiano. Il nome di chi approva resta nel registro.'],
      ['Ogni passaggio tracciato', 'Modifiche, chiamate, approvazioni: chi ha fatto cosa e quando, sempre consultabile.'],
    ],
    caseBridge: 'Lo stesso metodo, costruito sul processo del tuo studio.',
    founder: 'Luca Lorenzo', founderRole: 'Fondatore e CEO', story: 'La nostra storia',
    founderAlt: 'Luca Lorenzo, fondatore e CEO di Ovia',
    trustH: 'La responsabilità resta alle persone.',
    trustP: 'Strategia e sicurezza fanno guadagnare. L’intelligenza artificiale è lo strumento.',
    trust: [
      ['Approvazione umana', 'Nessuna comunicazione sensibile parte senza il via libera di una persona del tuo team.'],
      ['Dati sotto controllo', 'Permessi per ruolo, registro di ogni modifica e, se serve, installazione sui tuoi server.'],
      ['Conformità', 'Sistemi progettati nel rispetto di GDPR, AI Act e Legge 132/2025 sull’intelligenza artificiale.'],
      ['Nessun addestramento', 'I dati dei tuoi clienti non vengono mai usati per addestrare modelli esterni.'],
    ],
    ctaTag: 'In attesa di te',
    ctaHold: 'Tieni premuto per prenotare',
    ctaH: 'Il prossimo passo lo decidi tu.',
    ctaP: 'Trenta minuti con noi: ti mostriamo dove va il tempo, cosa si può automatizzare in sicurezza e da dove conviene partire.',
    ctaS: 'Senza impegno. Lavoriamo con pochi clienti alla volta.',
  },
  en: {
    title: 'Ovia — Marketing & automation systems for professional firms',
    desc: 'Ovia designs marketing and automation systems for professional firms: accountants, lawyers and payroll consultants. The system prepares emails, documents and deadlines; a person at the firm approves every step that matters.',
    eyebrow: 'For accountants, lawyers and payroll consultants',
    h1: 'Marketing and automation systems for professional firms.',
    lead: 'New clients for the firm, and fewer hours lost to emails, documents and deadlines. Ovia prepares the work, then stops: every step that matters is yours to approve.',
    talk: 'Talk to the assistant',
    qTitle: 'Approval queue', qWaiting: 'waiting', qWaitingOne: 'waiting',
    qBy: 'Prepared by Ovia', qPending: 'Waiting', qOk: 'Approved', qSent: 'Done',
    hint: 'Press and hold the dot to approve',
    hintKey: 'or hold Enter',
    approveSr: 'Approve the waiting action',
    count1: 'You approved 1 action. The system did the rest.',
    countN: 'You approved {n} actions. The system did the rest.',
    empty: 'Queue empty. Something new is coming in…',
    pool: [
      ['Call analysis', '2026 tax return', 'Giulia Fadda · 1 value to confirm'],
      ['Documents ready', 'Engagement letter and quote', 'Paolo Murgia · to sign'],
      ['Conflicting value', 'Weekly hours: 20 or 24?', 'Deiana Brothers Ltd'],
      ['Document request', 'February payslip', 'Case 214'],
      ['Possible duplicate', 'Marco Serra and Marco Sera', 'Same phone number'],
      ['Voice note', 'Case update', 'Next action: Friday'],
      ['Client reminder', 'Contract renewal', 'Due in 30 days'],
    ],
    manifesto: 'The dot {dot} in our logo means _waiting._ Every Ovia system does the repetitive work, then stops and waits for a person before every step that matters.',
    manifestoSub: 'That is how automation works for you, not instead of you.',
    tale: {
      title: 'A firm’s morning, in one minute',
      steps: [
        ['8:30', 'Everything arrives at once.', 'Emails, certified mail, client documents, calls. Every channel wants attention at the same time.'],
        ['8:31', 'Ovia reads and connects.', 'Every call, email and document is linked to the right client and case, with no duplicates.'],
        ['8:33', 'It prepares the work.', 'Updated records, documents and replies are ready, in the firm’s tone. No invented figures.'],
        ['8:34', 'Then it stops. It waits for you.', 'The blue dot marks every step that needs a person. Nothing goes out on its own.'],
        ['8:40', 'You decide. The rest is done.', 'You approve in a few gestures, and the day restarts from the work that really matters.'],
      ],
      legend: [['email', 'Emails'], ['doc', 'Documents'], ['call', 'Calls'], ['pec', 'Certified mail']],
      clients: ['Giulia Fadda', 'Deiana Brothers Ltd', 'Case 214', 'New enquiry'],
      cards: ['Call analysis', 'Documents to sign', 'Payslip reminder', 'Reply to the quote request'],
      wait: 'Waiting', ok: 'Approved', count: '{n} of 4 approved by you', next: 'Try it below',
    },
    kit: {
      h: 'Build your system. Five pieces, one minute.',
      p: 'It’s the flow Ovia runs every day on real cases, adapted to your firm. Wherever you see the blue dot, it’s your turn.',
      parts: ['Firm', 'Listens', 'Understands', 'Assesses', 'You approve'],
      label: 'Your system', piece: 'Piece {n} of 5', doneTag: 'System built', restart: 'Start again',
      note: 'Demo example with made-up names and data.',
      s0: { h: 'What kind of firm are you?', p: 'Ovia is built on your firm’s own process, not on a generic template.' },
      s1: { h: 'A call comes in. Press to listen.', p: 'Ovia records and transcribes it on its own. You stay focused on the client, not on your notes.', play: 'Listen to the call', live: 'Listening', you: 'Firm' },
      s2: { h: 'Ovia turns the call into a record.', p: 'Client, case, commitments and documents. Anything the client didn’t state for certain stays “not quantified”: no invented figures.',
        h2: 'Two calls say different things. You decide.', p2: 'Ovia doesn’t choose for you: it shows both values, with the date of each call.',
        head: 'Ovia’s proposal · not yet in the record', nq: 'Not quantified', diff: 'Value differs between two calls', keep: 'Keep', use: 'Use' },
      s3: { h: 'Ovia assesses the case. Tap the light.', p: 'Every assessment comes with its reasons, in writing. No mystery scores.', why: 'Why?', next: 'Next action', docs: 'Documents ready to generate' },
      s4: { h: 'Now it stops. Press and hold the dot to sign.', p: 'Until you approve, the client record doesn’t change and no document is created.', pending: 'Analysis waiting for approval', hold: 'Press and hold to approve', approved: 'Approved by you · your signature stays in the log' },
      s5: { h: 'Your system is built.', p: 'It’s the same flow Ovia runs every day on real cases, built on your firm’s process.', you: 'Your part: one listen, one choice, one signature. The system did the rest, in {s} seconds.', again: 'Build it for another firm', discover: 'Explore', calNote: 'Coming from the website: I built the system for a {studio}.' },
      studios: [
        { id: 'commercialista', name: 'Accountant', sub: 'Tax returns, bookkeeping, tax deadlines', kind: 'accounting firm', svc: 'chiamate',
          call: { who: 'Giulia Fadda', ini: 'GF', meta: 'Client since 2019 · 3 minutes', lines: [
            ['c', 'Good morning, I wanted to check you have everything for my tax return.'],
            ['s', 'Almost: the mortgage interest statement is still missing.'],
            ['c', 'I’ll send it by Friday. This year I also rent out a flat, about 600 euros a month. And some medical expenses, not sure how much.'] ] },
          fields: [['Client', 'Giulia Fadda'], ['Case', '2026 tax return'], ['Missing', 'Mortgage interest statement'], ['Commitment', 'Sends it by Friday']],
          nq: ['Medical expenses', '“not sure how much”'],
          conflict: { k: 'Rental income', keep: ['€650 a month', 'call of 12 March'], use: ['€600 a month', 'today’s call'] },
          eval: { level: 'mid', label: 'To complete', why: ['1 of 12 documents missing', 'New rental income to add to the return', 'Medical expenses to quantify from receipts'], next: 'Reminder to Giulia on Wednesday, if the document hasn’t arrived',
            docs: [['Request for the missing document', 'PDF'], ['Medical receipts checklist', 'PDF'], ['Summary for the file', 'Word']] },
          done: ['Giulia Fadda’s record updated', 'Documents saved in the client’s folder', 'Reminder in the calendar for Wednesday'] },
        { id: 'avvocato', name: 'Lawyer', sub: 'Cases, time limits, client meetings', kind: 'law firm', svc: 'chiamate',
          call: { who: 'Paolo Murgia', ini: 'PM', meta: 'New client · 4 minutes', lines: [
            ['c', 'I’ve received a payment order from my supplier. It was served on 2 October.'],
            ['s', 'For what amount?'],
            ['c', 'Twelve thousand and something, I don’t remember. But I had already paid part of it, I have the transfers.'] ] },
          fields: [['Client', 'Paolo Murgia, new'], ['Case', 'Challenge to a payment order'], ['Documents', 'Served order, payment transfers'], ['Key fact', 'Partial payment already made']],
          nq: ['Amount claimed', '“twelve thousand and something”'],
          conflict: { k: 'Date of service', keep: ['29 September', 'website form, 3 October'], use: ['2 October', 'today’s call'] },
          eval: { level: 'high', label: 'Urgent', why: ['40-day time limit from service', 'Date of service to check on the order', 'Partial payment to document'], next: 'Meeting at the office by Friday, with the order and envelope',
            docs: [['Engagement letter and privacy notice', 'Word'], ['Fee quote', 'PDF'], ['Document request to the client', 'PDF']] },
          done: ['Case opened: payment order, Paolo Murgia', 'Time limit in the calendar, to confirm on service date', 'Documents saved in the client’s folder'] },
        { id: 'consulente', name: 'Payroll consultant', sub: 'Payroll, hiring, compliance', kind: 'payroll consultancy', svc: 'documenti',
          call: { who: 'Deiana Brothers Ltd', ini: 'DB', meta: 'Client since 2021 · 2 minutes', lines: [
            ['c', 'From Monday we’re hiring Sara Pinna, part-time clerk. Retail contract.'],
            ['s', 'How many hours a week?'],
            ['c', 'Twenty, I think. Pay like the others, more or less.'] ] },
          fields: [['Client', 'Deiana Brothers Ltd'], ['Case', 'Hiring Sara Pinna'], ['Start', 'Monday'], ['Contract', 'Retail agreement, part-time']],
          nq: ['Salary', '“like the others, more or less”'],
          conflict: { k: 'Weekly hours', keep: ['24 hours', 'yesterday’s email'], use: ['20 hours', 'today’s call'] },
          eval: { level: 'high', label: 'Deadline close', why: ['Mandatory notice before Monday', 'Employee documents still missing', 'Salary to agree with the company'], next: 'Request documents from the company today, notice by Sunday',
            docs: [['Document request to the company', 'PDF'], ['Employment letter', 'Word'], ['Hiring checklist', 'PDF']] },
          done: ['Case opened: hiring Sara Pinna', 'Mandatory notice in the calendar by Sunday', 'Documents saved in the company’s folder'] },
      ],
    },
    facts: [['15,000+', 'cases handled with the software we built'], ['30 minutes', 'for the Process Check, no obligation'], ['Olbia, Italy', 'home base, operating arm of L3 Innovation Srl']],
    clients: 'They chose Ovia',
    sysH: 'Two systems working together.',
    sysP: 'Marketing brings new clients to the firm, automation takes repetitive work off your people. In every service the dot marks where someone at the firm decides.',
    methodH: 'One method, four steps.',
    methodP: 'No sudden transformation: we start from the problem that costs you most and solve it with a result you can measure.',
    steps: [
      ['Process Check', 'Thirty minutes on your real workflow: where time is lost, where clients are lost.'],
      ['Plan', 'We propose what to build first, with costs, timing and the expected result in writing.'],
      ['Build', 'We build the system on the tools you already use. Your team tests it before it goes live.'],
      ['Measure and improve', 'We measure hours saved and clients won, and improve the system month after month.'],
    ],
    caseTag: 'Real case · Rialziamoci Italia',
    caseH: 'Ovia was born where a mistake costs the most.',
    caseP: 'The first Ovia system runs the pre-assessment of debt-relief cases for Rialziamoci Italia, from the first call to the freephone number to the official documents. The flow you just built comes from there.',
    caseSteps: [
      ['Freephone', 'The operator answers and records. The case is created on its own, with no duplicates.'],
      ['File', 'Debt, assets and income in bands: traffic light and urgency from the very first call.'],
      ['Interview', 'The second call becomes a full record: creditors, amounts, issues, documents.'],
      ['Approval', 'The analysis stays a proposal. An operator checks it, corrects it and signs.'],
      ['Documents', 'Five official documents in PDF and Word, in the client’s folder.'],
      ['Decision', 'The owner decides whether to proceed. Then the case moves to whoever handles it.'],
    ],
    caseRulesH: 'The rules that stay the same in every firm',
    caseRules: [
      ['No invented figures', 'Anything the client didn’t state for certain stays “not quantified”.'],
      ['Many calls, one record', 'Information adds up with no duplicates. If two calls disagree, a person decides.'],
      ['Nothing goes in without a signature', 'Until someone approves, the case, the assessments and the dashboard don’t change. The approver’s name stays in the log.'],
      ['Every step logged', 'Edits, calls, approvals: who did what and when, always available.'],
    ],
    caseBridge: 'The same method, built on your firm’s own process.',
    founder: 'Luca Lorenzo', founderRole: 'Founder and CEO', story: 'Our story',
    founderAlt: 'Luca Lorenzo, founder and CEO of Ovia',
    trustH: 'Responsibility stays with people.',
    trustP: 'Strategy and security make the money. Artificial intelligence is the tool.',
    trust: [
      ['Human approval', 'No sensitive message goes out without the go-ahead of someone on your team.'],
      ['Data under control', 'Role-based permissions, a log of every change and, if needed, installation on your own servers.'],
      ['Compliance', 'Systems designed in line with the GDPR, the EU AI Act and Italian Law 132/2025 on artificial intelligence.'],
      ['No training on your data', 'Your clients’ data is never used to train external models.'],
    ],
    ctaTag: 'Waiting for you',
    ctaHold: 'Press and hold to book',
    ctaH: 'The next step is your call.',
    ctaP: 'Thirty minutes with us: we show you where the time goes, what can be safely automated and where it makes sense to begin.',
    ctaS: 'No obligation. We work with a few clients at a time.',
  },
};

function pagina(lang) {
  const t = T[lang], u = UI[lang], P = x => pathFor(lang, x);
  const prods = prodottiIn(lang), byId = Object.fromEntries(prods.map(p => [p.id, p]));
  const url = SITE.url + ALT[lang];

  const jsonld = [{ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', '@id': SITE.url + '/#website', url: SITE.url + '/', name: 'Ovia', inLanguage: lang === 'en' ? 'en' : 'it-IT', publisher: { '@id': SITE.url + '/#organization' } },
    { '@type': 'Organization', '@id': SITE.url + '/#organization', name: 'Ovia', url: SITE.url, email: SITE.email, logo: SITE.url + '/assets/brand/ovia-logo.png',
      slogan: 'Marketing & automation systems for business', legalName: 'L3 Innovation Srl', vatID: 'IT02882330901',
      parentOrganization: { '@type': 'Organization', name: 'L3 Innovation Srl' },
      address: { '@type': 'PostalAddress', addressLocality: 'Olbia', addressCountry: 'IT' },
      founder: { '@type': 'Person', '@id': SITE.url + '/chi-siamo.html#luca-lorenzo', name: 'Luca Lorenzo' },
      sameAs: ['https://www.linkedin.com/company/oviaitalia'] },
    { '@type': 'WebPage', '@id': url + '#webpage', url, name: t.title, description: t.desc, inLanguage: lang === 'en' ? 'en' : 'it-IT', isPartOf: { '@id': SITE.url + '/#website' }, about: { '@id': SITE.url + '/#organization' } },
  ] }];

  // Dati per ovia-home.js (testi e scenari): nessun testo cablato nel JS.
  const data = {
    q: { by: t.qBy, pending: t.qPending, ok: t.qOk, sent: t.qSent, waiting: t.qWaiting, count1: t.count1, countN: t.countN, empty: t.empty, pool: t.pool },
    story: t.tale,
    kit: { ...t.kit, cal: calBtn(u.cta), studios: t.kit.studios.map(st => ({ ...st, svcHref: urlIn(lang, st.svc), svcName: byId[st.svc].name })) },
  };

  const card = ([k, title, m], i) => `<li class="hx-card${i === 0 ? ' is-top' : ''}" style="--i:${i}"${i ? ' aria-hidden="true"' : ''}><span class="k">${esc(t.qBy)} · ${esc(k)}</span><strong>${esc(title)}</strong><span class="m">${esc(m)}</span><em class="st">${esc(t.qPending)}</em></li>`;

  const extra = `<meta name="twitter:title" content="${esc(t.title)}">
<meta name="twitter:description" content="${esc(t.desc)}">`;

  return head({ title: t.title, description: t.desc, path: '/', lang, alt: ALT, jsonld, extra }) + header('home', lang, ALT) + `
<main class="hx-home">
  <section class="hx" aria-labelledby="hx-h1">
    <canvas class="hx-field" aria-hidden="true"></canvas>
    <div class="ov-wrap hx-grid">
      <div class="hx-copy">
        <p class="hx-eyebrow">${esc(t.eyebrow)}</p>
        <h1 id="hx-h1">${esc(t.h1)}</h1>
        <p class="ov-lead">${esc(t.lead)}</p>
      </div>
      <div class="hm-ctas hx-ctas">${calBtn(u.cta)}<button type="button" class="ov-btn-ghost js-concierge">${esc(t.talk)}</button>${lang === 'it' ? `<button type="button" class="hx-film" data-film aria-haspopup="dialog"><span class="hx-film-i" aria-hidden="true"></span>Guarda come funziona <span class="hx-film-t">42 s</span></button>` : ''}</div>
      <div class="hx-stage" data-hx-stage>
        <div class="hx-bar"><span>${esc(t.qTitle)}</span><span class="hx-n"><b data-hx-n>3</b> ${esc(t.qWaiting)}</span></div>
        <ol class="hx-queue" data-hx-queue>${t.pool.slice(0, 3).map(card).join('')}</ol>
        <div class="hx-press">
          <button type="button" class="hx-dot" data-hx-dot aria-describedby="hx-hint">
            <svg class="hx-ring" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="57"/></svg>
            <span class="ov-sr">${esc(t.approveSr)}</span>
          </button>
        </div>
        <p class="hx-hint" id="hx-hint">${esc(t.hint)}<span> · ${esc(t.hintKey)}</span></p>
        <p class="hx-count" data-hx-count aria-live="polite"></p>
      </div>
    </div>
  </section>

  <section class="st-sec" data-story aria-labelledby="st-h">
    <div class="st-pin">
      <canvas class="st-cv" aria-hidden="true"></canvas>
      <div class="ov-wrap st-grid">
        <div class="st-copy">
          <p class="st-eyebrow" id="st-h">${esc(t.tale.title)}</p>
          <ol class="st-steps">${t.tale.steps.map(([k, h, p], i) => `<li${i === 0 ? ' class="is-on"' : ''}><p class="st-k">${esc(k)}</p><h2>${esc(h)}</h2><p class="st-p">${esc(p)}</p>${i === 4 ? `<a class="hm-link" href="#sistema">${esc(t.tale.next)}</a>` : ''}</li>`).join('')}</ol>
          <div class="st-bar" aria-hidden="true">${t.tale.steps.map(() => '<i></i>').join('')}</div>
          <ul class="st-legend">${t.tale.legend.map(([k, l]) => `<li class="lg-${k}">${esc(l)}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
  </section>

  <section class="ov-section kit-sec" id="sistema"><div class="ov-wrap">
    <h2 class="ov-h2">${esc(t.kit.h)}</h2>
    <p class="ov-lead">${esc(t.kit.p)}</p>
    <div class="kit" data-kit>
      <ol class="kit-parts" aria-label="${esc(t.kit.label)}">${t.kit.parts.map((n, i) => `<li${i === 4 ? ' class="me"' : ''}><span class="kit-slot"><svg viewBox="0 0 22 22" aria-hidden="true">${KIT_GLYPH[i]}</svg></span><span class="kit-lab">${esc(n)}</span></li>`).join('')}<li class="kit-line" aria-hidden="true"></li></ol>
      <div class="kit-body">
        <div class="kit-guide">
          <p class="kit-n" data-kit-n>${esc(t.kit.piece.replace('{n}', 1))}</p>
          <h3 class="kit-h" data-kit-h aria-live="polite">${esc(t.kit.s0.h)}</h3>
          <p class="kit-p" data-kit-p>${esc(t.kit.s0.p)}</p>
          <button type="button" class="kit-reset" data-kit-reset hidden>${esc(t.kit.restart)}</button>
        </div>
        <div class="kit-bench" data-kit-bench><div class="kit-stage"><div class="kit-choices">${t.kit.studios.map(st => `<button type="button" class="kit-choice"><strong>${esc(st.name)}</strong><span>${esc(st.sub)}</span></button>`).join('')}</div></div></div>
      </div>
    </div>
    <p class="sx-note">${esc(t.kit.note)}</p>
  </div></section>

  <section class="ov-section hm-case" id="caso" aria-labelledby="caso-h"><div class="ov-wrap">
    <p class="case-tag"><img src="/loghi/rialziamoci.svg" alt="" width="111" height="34" loading="lazy" decoding="async">${esc(t.caseTag)}</p>
    <h2 class="ov-h2" id="caso-h">${esc(t.caseH)}</h2>
    <p class="ov-lead">${esc(t.caseP)}</p>
    <ol class="case-flow">${t.caseSteps.map(([h, p], i) => `<li${i === 3 ? ' class="me"' : ''}><span class="case-n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
    <h3 class="case-rules-h">${esc(t.caseRulesH)}</h3>
    <div class="hm-trust case-rules">${t.caseRules.map(([h, p]) => `<div><h4>${esc(h)}</h4><p>${esc(p)}</p></div>`).join('')}</div>
    <div class="case-foot">
      <p class="case-bridge">${esc(t.caseBridge)}</p>
      <div class="hm-founder">
        <picture><source srcset="/assets/luca-lorenzo-viso-240.webp 240w, /assets/luca-lorenzo-viso-480.webp 480w" sizes="120px" type="image/webp"><img src="/assets/luca-lorenzo.jpg" alt="${esc(t.founderAlt)}" width="120" height="150" loading="lazy" decoding="async"></picture>
        <div><strong>${esc(t.founder)}</strong><span>${esc(t.founderRole)}</span><a class="hm-link" href="${P('/chi-siamo.html')}">${esc(t.story)}</a></div>
      </div>
    </div>
  </div></section>

  <section class="hm-clients" aria-label="${esc(t.clients)}"><div class="ov-wrap">
    <dl class="hm-facts">${t.facts.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>
    <div class="hm-cl"><p>${esc(t.clients)}</p>
    <ul class="hm-logos">${LOGHI.map(l => `<li><img src="${l.src}" alt="${esc(l.alt)}"${l.mono ? ' class="mono"' : ''} width="${l.w}" height="${l.h}" style="height:${l.h}px" loading="lazy" decoding="async"></li>`).join('')}</ul></div>
  </div></section>

  <section class="ov-section" id="soluzioni"><div class="ov-wrap">
    <h2 class="ov-h2">${esc(t.sysH)}</h2>
    <p class="ov-lead">${esc(t.sysP)}</p>
    ${sistemi(lang)}
  </div></section>

  <section class="ov-section" id="metodo" style="padding-top:0"><div class="ov-wrap">
    <h2 class="ov-h2">${esc(t.methodH)}</h2>
    <p class="ov-lead">${esc(t.methodP)}</p>
    <ol class="hm-steps">${t.steps.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
  </div></section>

  <section class="ov-section" id="sicurezza"><div class="ov-wrap">
    <h2 class="ov-h2">${esc(t.trustH)}</h2>
    <p class="ov-lead">${esc(t.trustP)}</p>
    <div class="hm-trust">${t.trust.map(([h, p]) => `<div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>
  </div></section>

  ${bloccoHome(lang)}

  <section class="ov-wrap" id="prossimo-passo">${ctaBand(lang, { h: esc(t.ctaH), p: esc(t.ctaP), small: esc(t.ctaS), tag: t.ctaTag })}</section>
${lang === 'it' ? `<dialog class="ov-film" id="ov-film" aria-label="Video: come funziona il sito Ovia">
  <button type="button" class="ov-film-x" data-film-close aria-label="Chiudi il video">Chiudi</button>
  <video preload="none" poster="/assets/video/ovia-sito-poster.webp?v=5" controls playsinline muted width="1440" height="810">
    <source src="/assets/video/ovia-sito.mp4?v=5" type="video/mp4">
    <source src="/assets/video/ovia-sito.webm?v=5" type="video/webm">
  </video>
</dialog>` : ''}
</main>
<script type="application/json" id="hx-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script src="/assets/ovia-home.js" defer></script>
<script src="/assets/ovia-marquee.js" defer></script>` + footer(lang);
}

export function buildHome() {
  mkdirSync(ROOT + 'en', { recursive: true });
  writeFileSync(ROOT + 'index.html', pagina('it'));
  writeFileSync(ROOT + 'en/index.html', pagina('en'));
}
