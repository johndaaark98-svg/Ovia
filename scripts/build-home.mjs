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
  '<rect x="3" y="5.5" width="16" height="11.5" rx="1.6"/><path d="M3.6 6.6l7.4 5.4 7.4-5.4"/>',
  '<circle cx="9.8" cy="9.8" r="5.4"/><path d="M13.8 13.8l4.7 4.7"/>',
  '<path d="M4 6.5h14M4 11h14M4 15.5h8.5"/>',
  '<circle cx="11" cy="11" r="5" fill="currentColor" stroke="none"/>',
];
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
      ['Bozza di risposta', 'Richiesta di preventivo', 'Marco Serra · dal sito'],
      ['Riepilogo chiamata', 'Fratelli Deiana Srl', '3 impegni · 1 scadenza'],
      ['Richiesta documento', 'Busta paga di febbraio', 'Pratica 214'],
      ['Risposta email', 'Stato della dichiarazione', 'Giulia Fadda'],
      ['Articolo del blog', 'Pronto per la pubblicazione', 'Revisione finale'],
      ['Messaggio di ricontatto', '18 contatti inattivi', 'Campagna di ottobre'],
      ['Promemoria al cliente', 'Rinnovo del contratto', 'Scade tra 30 giorni'],
    ],
    // manifesto
    manifesto: 'Il pallino {dot} del nostro logo significa _in_ _attesa._ Ogni sistema Ovia fa il lavoro ripetitivo, poi si ferma e aspetta una persona prima di ogni passo che conta.',
    manifestoSub: 'Così l’automazione lavora per te, e non al posto tuo.',
    tale: {
      title: 'La mattina di uno studio, in un minuto',
      steps: [
        ['08:30', 'Arriva tutto, insieme.', 'Email, PEC, documenti dei clienti, chiamate. Ogni canale chiede attenzione nello stesso momento.'],
        ['08:31', 'Ovia legge e collega.', 'Ogni messaggio viene riconosciuto e agganciato al cliente e alla pratica giusti.'],
        ['08:33', 'Prepara il lavoro.', 'Risposte, solleciti e riepiloghi sono già scritti, nel tono dello studio.'],
        ['08:34', 'Poi si ferma. Aspetta te.', 'Il pallino blu segna ogni passo che richiede una persona. Niente parte da solo.'],
        ['08:40', 'Tu decidi. Il resto è fatto.', 'Approvi in pochi gesti, e la giornata riparte dal lavoro che conta davvero.'],
      ],
      legend: [['email', 'Email'], ['doc', 'Documenti'], ['call', 'Chiamate'], ['pec', 'PEC']],
      clients: ['Giulia Fadda', 'Fratelli Deiana Srl', 'Pratica 214', 'Nuovo contatto'],
      cards: ['Risposta sulla dichiarazione', 'Riepilogo della chiamata', 'Sollecito busta paga', 'Risposta al preventivo'],
      wait: 'In attesa', ok: 'Approvato', count: '{n} di 4 approvate da te', next: 'Provalo qui sotto',
    },
    // Monta il tuo sistema: percorso guidato, un pezzo alla volta.
    // Nei testi dei messaggi [[parola|n]] è la parola che Ovia riconosce e collega al campo n.
    kit: {
      h: 'Monta il tuo sistema. Cinque pezzi, un minuto.',
      p: 'Ti guidiamo noi, un gesto alla volta. Dove vedi il pallino blu, tocca a te.',
      parts: ['Studio', 'Arriva', 'Legge', 'Prepara', 'Decidi tu'],
      label: 'Il tuo sistema', piece: 'Pezzo {n} di 5', doneTag: 'Sistema montato', restart: 'Ricomincia',
      note: 'Esempio dimostrativo con nomi e dati inventati.',
      s0: { h: 'Che studio hai?', p: 'Il sistema si costruisce sul tuo lavoro, non su un modello generico.' },
      s1: { h: 'Arriva un’email. Trascinala dentro Ovia.', hTouch: 'Arriva un’email. Trascinala dentro Ovia, o toccala.', p: 'Email, PEC, documenti e chiamate entrano tutti da un solo punto.', drop: 'Trascina qui', got: 'Ricevuta', sr: 'Porta l’email dentro Ovia' },
      s2: { h: 'Passa sopra le parole sottolineate.', hTouch: 'Tocca le parole sottolineate.', p: 'Così vedi cosa capisce Ovia da sola: cliente, pratica, richiesta e scadenza.', linked: 'Collegata alla pratica giusta.' },
      s3: { h: 'Scegli il tono del tuo studio.', p: 'Ovia scrive la risposta con i dati della pratica. Non parti mai da un foglio bianco.', tones: ['Formale', 'Cordiale'], toneLabel: 'Tono della risposta', empty: 'La risposta comparirà qui.' },
      s4: { h: 'Ora si ferma. Tieni premuto il pallino.', p: 'Niente parte senza il tuo via libera. Se vuoi, prima modifica il testo.', hold: 'Tieni premuto per approvare', edit: 'Modifica', editDone: 'Fine modifica', approved: 'Approvata da te' },
      s5: { h: 'Il tuo sistema è montato.', p: 'È lo stesso che costruiamo per il tuo studio, sugli strumenti che usi già.', you: 'Il tuo contributo: una scelta, un tono, una decisione. Il resto l’ha fatto il sistema, in {s} secondi.', again: 'Monta per un altro studio', discover: 'Scopri', calNote: 'Arrivo dal sito: ho montato il sistema per uno {studio}.' },
      studios: [
        { id: 'commercialista', name: 'Commercialista', sub: 'Dichiarazioni, contabilità, scadenze fiscali', kind: 'studio commercialista', svc: 'inbox',
          mail: { ch: 'Email', time: '08:12', from: 'Giulia Fadda', text: 'Buongiorno, mi servirebbe sapere [[entro venerdì|3]] se avete [[ricevuto tutti i documenti|2]] per la [[dichiarazione|1]]. Grazie, [[Giulia Fadda|0]]' },
          fields: [['Cliente', 'Giulia Fadda, cliente dal 2019'], ['Pratica', 'Dichiarazione 2026'], ['Richiesta', 'Stato dei documenti'], ['Scadenza', 'Venerdì']],
          ctx: 'Dalla pratica: manca la certificazione degli interessi del mutuo.',
          drafts: ['Gentile signora Fadda, abbiamo ricevuto tutti i documenti per la dichiarazione, tranne la certificazione degli interessi del mutuo. Appena ce la invia completiamo la pratica, in tempo per venerdì. Cordiali saluti.',
            'Buongiorno Giulia, ci siamo quasi: abbiamo tutto tranne la certificazione degli interessi del mutuo. Appena ce la manda chiudiamo la dichiarazione entro venerdì. A presto!'],
          done: ['Risposta inviata alle 08:14', 'Email archiviata nella scheda di Giulia Fadda', 'Promemoria: certificazione del mutuo, mercoledì'] },
        { id: 'avvocato', name: 'Avvocato', sub: 'Pratiche, termini, appuntamenti con i clienti', kind: 'studio legale', svc: 'inbox',
          mail: { ch: 'Email', time: '09:05', from: 'Paolo Murgia', text: 'Buongiorno avvocato, ho ricevuto un [[decreto ingiuntivo|1]] dal mio fornitore. Ho letto che ci sono [[40 giorni|3]] per opporsi: [[possiamo vederci questa settimana?|2]] [[Paolo Murgia|0]]' },
          fields: [['Cliente', 'Paolo Murgia, nuovo cliente'], ['Pratica', 'Opposizione a decreto ingiuntivo'], ['Richiesta', 'Appuntamento in studio'], ['Termine', '40 giorni dalla notifica, da verificare']],
          ctx: 'Dall’agenda dello studio: libero giovedì alle 10 e venerdì alle 15.',
          drafts: ['Gentile signor Murgia, ho preso nota del decreto ingiuntivo. Per valutare l’opposizione nei termini le propongo un appuntamento in studio giovedì alle 10 o venerdì alle 15. Porti con sé l’atto e la busta con la data di notifica. Cordiali saluti.',
            'Buongiorno Paolo, ricevuto. Vediamoci in studio giovedì alle 10 o venerdì alle 15, così valutiamo subito l’opposizione. Porti l’atto e la busta con la data di notifica: il termine parte da lì.'],
          done: ['Risposta inviata alle 09:07', 'Pratica aperta: decreto ingiuntivo, Paolo Murgia', 'Termine in calendario, da confermare sulla notifica'] },
        { id: 'consulente', name: 'Consulente del lavoro', sub: 'Paghe, assunzioni, adempimenti', kind: 'studio di consulenza del lavoro', svc: 'documenti',
          mail: { ch: 'Email', time: '15:20', from: 'Fratelli Deiana Srl', text: 'Buongiorno, [[da lunedì|3]] assumiamo un’[[impiegata part-time|1]]. [[Cosa vi serve per l’assunzione?|2]] Ufficio amministrazione, [[Fratelli Deiana Srl|0]]' },
          fields: [['Cliente', 'Fratelli Deiana Srl, 12 dipendenti'], ['Pratica', 'Nuova assunzione, part-time'], ['Richiesta', 'Documenti necessari'], ['Scadenza', 'Comunicazione obbligatoria prima di lunedì']],
          ctx: 'Dalla checklist assunzioni dello studio: servono 4 documenti.',
          drafts: ['Buongiorno, per procedere con l’assunzione ci servono entro giovedì il documento d’identità e il codice fiscale della lavoratrice, l’IBAN, l’orario part-time concordato e la mansione. Alla comunicazione obbligatoria provvediamo noi prima di lunedì. Cordiali saluti.',
            'Buongiorno! Ci mandate entro giovedì documento e codice fiscale della nuova collega, IBAN, orario part-time e mansione? Al resto, comunicazione obbligatoria compresa, pensiamo noi prima di lunedì.'],
          done: ['Risposta inviata alle 15:22', 'Pratica aperta: assunzione, Fratelli Deiana Srl', 'Promemoria: comunicazione obbligatoria entro domenica'] },
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
    originH: 'Abbiamo imparato dove un errore costa caro.',
    originP: 'Ovia è il braccio operativo di L3 Innovation Srl, nata a Olbia. Prima di lavorare con imprese e studi abbiamo costruito il software che ha gestito oltre 15.000 pratiche di sovraindebitamento: documenti, scadenze e persone che aspettano una risposta. Da lì viene il nostro metodo.',
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
      ['Draft reply', 'Quote request', 'Marco Serra · from the website'],
      ['Call summary', 'Deiana Brothers Ltd', '3 commitments · 1 deadline'],
      ['Document request', 'February payslip', 'Case 214'],
      ['Email reply', 'Tax return status', 'Giulia Fadda'],
      ['Blog article', 'Ready to publish', 'Final review'],
      ['Follow-up message', '18 inactive contacts', 'October campaign'],
      ['Client reminder', 'Contract renewal', 'Due in 30 days'],
    ],
    manifesto: 'The dot {dot} in our logo means _waiting._ Every Ovia system does the repetitive work, then stops and waits for a person before every step that matters.',
    manifestoSub: 'That is how automation works for you, not instead of you.',
    tale: {
      title: 'A firm’s morning, in one minute',
      steps: [
        ['8:30', 'Everything arrives at once.', 'Emails, certified mail, client documents, calls. Every channel wants attention at the same time.'],
        ['8:31', 'Ovia reads and connects.', 'Every message is recognised and linked to the right client and case.'],
        ['8:33', 'It prepares the work.', 'Replies, reminders and summaries are already written, in the firm’s tone.'],
        ['8:34', 'Then it stops. It waits for you.', 'The blue dot marks every step that needs a person. Nothing goes out on its own.'],
        ['8:40', 'You decide. The rest is done.', 'You approve in a few gestures, and the day restarts from the work that really matters.'],
      ],
      legend: [['email', 'Emails'], ['doc', 'Documents'], ['call', 'Calls'], ['pec', 'Certified mail']],
      clients: ['Giulia Fadda', 'Deiana Brothers Ltd', 'Case 214', 'New enquiry'],
      cards: ['Reply on the tax return', 'Call summary', 'Payslip reminder', 'Reply to the quote request'],
      wait: 'Waiting', ok: 'Approved', count: '{n} of 4 approved by you', next: 'Try it below',
    },
    kit: {
      h: 'Build your system. Five pieces, one minute.',
      p: 'We guide you, one gesture at a time. Wherever you see the blue dot, it’s your turn.',
      parts: ['Firm', 'In', 'Reads', 'Drafts', 'You decide'],
      label: 'Your system', piece: 'Piece {n} of 5', doneTag: 'System built', restart: 'Start again',
      note: 'Demo example with made-up names and data.',
      s0: { h: 'What kind of firm are you?', p: 'The system is built on your work, not on a generic template.' },
      s1: { h: 'An email comes in. Drag it into Ovia.', hTouch: 'An email comes in. Drag it into Ovia, or tap it.', p: 'Emails, certified mail, documents and calls all come in through one place.', drop: 'Drop it here', got: 'Received', sr: 'Bring the email into Ovia' },
      s2: { h: 'Hover over the underlined words.', hTouch: 'Tap the underlined words.', p: 'See what Ovia understands on its own: client, case, request and deadline.', linked: 'Linked to the right case.' },
      s3: { h: 'Choose your firm’s tone.', p: 'Ovia writes the reply using the case data. You never start from a blank page.', tones: ['Formal', 'Friendly'], toneLabel: 'Tone of the reply', empty: 'The reply will appear here.' },
      s4: { h: 'Now it stops. Press and hold the dot.', p: 'Nothing goes out without your go-ahead. Edit the text first if you like.', hold: 'Press and hold to approve', edit: 'Edit', editDone: 'Done editing', approved: 'Approved by you' },
      s5: { h: 'Your system is built.', p: 'It’s the same one we build for your firm, on the tools you already use.', you: 'Your part: one choice, one tone, one decision. The system did the rest, in {s} seconds.', again: 'Build it for another firm', discover: 'Explore', calNote: 'Coming from the website: I built the system for a {studio}.' },
      studios: [
        { id: 'commercialista', name: 'Accountant', sub: 'Tax returns, bookkeeping, tax deadlines', kind: 'accounting firm', svc: 'inbox',
          mail: { ch: 'Email', time: '8:12 am', from: 'Giulia Fadda', text: 'Good morning, could you let me know [[by Friday|3]] whether you have [[received all the documents|2]] for my [[tax return|1]]? Thanks, [[Giulia Fadda|0]]' },
          fields: [['Client', 'Giulia Fadda, client since 2019'], ['Case', '2026 tax return'], ['Request', 'Document status'], ['Deadline', 'Friday']],
          ctx: 'From the case file: the mortgage interest statement is still missing.',
          drafts: ['Dear Ms Fadda, we have received all the documents for your tax return except the mortgage interest statement. As soon as you send it we will complete the return, in time for Friday. Kind regards.',
            'Hi Giulia, nearly there: we have everything except the mortgage interest statement. Send it over and we’ll wrap up your return by Friday. Speak soon!'],
          done: ['Reply sent at 8:14 am', 'Email filed in Giulia Fadda’s record', 'Reminder: mortgage statement, Wednesday'] },
        { id: 'avvocato', name: 'Lawyer', sub: 'Cases, time limits, client meetings', kind: 'law firm', svc: 'inbox',
          mail: { ch: 'Email', time: '9:05 am', from: 'Paolo Murgia', text: 'Good morning, I have received a [[payment order|1]] from my supplier. I read there are [[40 days|3]] to challenge it: [[could we meet this week?|2]] [[Paolo Murgia|0]]' },
          fields: [['Client', 'Paolo Murgia, new client'], ['Case', 'Challenge to a payment order'], ['Request', 'Meeting at the office'], ['Time limit', '40 days from service, to be checked']],
          ctx: 'From the firm’s calendar: free Thursday at 10 am and Friday at 3 pm.',
          drafts: ['Dear Mr Murgia, I have noted the payment order. To assess a challenge within the time limit, I suggest a meeting at the office on Thursday at 10 am or Friday at 3 pm. Please bring the order and the envelope showing the date of service. Kind regards.',
            'Hi Paolo, got it. Let’s meet at the office on Thursday at 10 or Friday at 3 so we can look at the challenge straight away. Bring the order and the envelope with the service date: the time limit runs from there.'],
          done: ['Reply sent at 9:07 am', 'Case opened: payment order, Paolo Murgia', 'Time limit in the calendar, to confirm on service date'] },
        { id: 'consulente', name: 'Payroll consultant', sub: 'Payroll, hiring, compliance', kind: 'payroll consultancy', svc: 'documenti',
          mail: { ch: 'Email', time: '3:20 pm', from: 'Deiana Brothers Ltd', text: 'Good afternoon, [[from Monday|3]] we are hiring a [[part-time clerk|1]]. [[What do you need for the hiring?|2]] Admin office, [[Deiana Brothers Ltd|0]]' },
          fields: [['Client', 'Deiana Brothers Ltd, 12 staff'], ['Case', 'New hire, part-time'], ['Request', 'Documents needed'], ['Deadline', 'Mandatory notice before Monday']],
          ctx: 'From the firm’s hiring checklist: 4 documents are needed.',
          drafts: ['Good afternoon, to proceed with the hiring we need by Thursday the employee’s ID and tax code, her IBAN, the agreed part-time hours and the job role. We will file the mandatory notice before Monday. Kind regards.',
            'Hi! Could you send us by Thursday the new colleague’s ID and tax code, IBAN, part-time hours and role? We’ll handle the rest, mandatory notice included, before Monday.'],
          done: ['Reply sent at 3:22 pm', 'Case opened: new hire, Deiana Brothers Ltd', 'Reminder: mandatory notice by Sunday'] },
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
    originH: 'We learned where a mistake costs the most.',
    originP: 'Ovia is the operating arm of L3 Innovation Srl, founded in Olbia, Italy. Before working with businesses and firms we built the software that has handled more than 15,000 debt-relief cases: documents, deadlines and people waiting for an answer. That is where our method comes from.',
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
    kit: { ...t.kit, cal: calBtn(u.cta),
      studios: t.kit.studios.map(st => ({ ...st, svcHref: urlIn(lang, st.svc), svcName: byId[st.svc].name,
        // "testo [[parola|n]] testo" → ['testo ', ['parola', n], ' testo']
        mail: { ...st.mail, text: st.mail.text.split(/(\[\[[^\]]+\]\])/).filter(Boolean).map(x => { const m = x.match(/^\[\[(.+)\|(\d)\]\]$/); return m ? [m[1], +m[2]] : x; }) } })) },
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
      <div class="hm-ctas hx-ctas">${calBtn(u.cta)}<button type="button" class="ov-btn-ghost js-concierge">${esc(t.talk)}</button>${lang === 'it' ? `<button type="button" class="hx-film" data-film aria-haspopup="dialog"><span class="hx-film-i" aria-hidden="true"></span>Guarda come funziona <span class="hx-film-t">39 s</span></button>` : ''}</div>
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

  <section class="ov-section hm-origin" id="chi-siamo"><div class="ov-wrap hm-origin-grid">
    <div>
      <h2 class="ov-h2">${esc(t.originH)}</h2>
      <p class="ov-lead">${esc(t.originP)}</p>
    </div>
    <div class="hm-founder">
      <picture><source srcset="/assets/luca-lorenzo-viso-240.webp 240w, /assets/luca-lorenzo-viso-480.webp 480w" sizes="120px" type="image/webp"><img src="/assets/luca-lorenzo.jpg" alt="${esc(t.founderAlt)}" width="120" height="150" loading="lazy" decoding="async"></picture>
      <div><strong>${esc(t.founder)}</strong><span>${esc(t.founderRole)}</span><a class="hm-link" href="${P('/chi-siamo.html')}">${esc(t.story)}</a></div>
    </div>
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
  <video preload="none" poster="/assets/video/ovia-sito-poster.webp?v=3" controls playsinline muted width="1440" height="810">
    <source src="/assets/video/ovia-sito.mp4?v=3" type="video/mp4">
    <source src="/assets/video/ovia-sito.webm?v=3" type="video/webm">
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
