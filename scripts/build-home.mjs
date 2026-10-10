// Genera la homepage: /index.html e /en/index.html, dalla stessa struttura.
// I testi sono in T.it / T.en qui sotto; i servizi arrivano da data/prodotti.mjs,
// il "punto di controllo umano" di ogni servizio da data/servizi.mjs (campo human).
// L'interattività (coda di approvazione, manifesto, simulatore) è in assets/ovia-home.js:
// i suoi contenuti arrivano dal JSON #hx-data generato qui, così il JS non ha testi.
// Modifica qui e rilancia `npm run sito`.
import { writeFileSync, mkdirSync } from 'node:fs';
import { SITE, prodottiIn } from '../data/prodotti.mjs';
import { SERVIZI } from '../data/servizi.mjs';
import { SERVIZI_EN } from '../data/en/servizi.mjs';
import { head, header, footer, esc, calBtn, urlIn } from './lib/layout.mjs';
import { UI, pathFor } from './lib/i18n.mjs';
import { bloccoHome } from './build-faq.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const ALT = { it: '/', en: '/en/' };
const MARKETING = ['siti-web-ai', 'lead-generation'];
const AUTOMAZIONE = ['second-brain', 'inbox', 'chiamate', 'documenti', 'crm'];
const LOGHI = [
  { src: '/loghi/eurofiltri-trim.png', alt: 'Eurofiltri Group', h: 26, mono: true },
  { src: '/loghi/rialziamoci.svg', alt: 'Rialziamoci Italia', h: 34 },
  { src: '/loghi/l3-innovation-trim.png', alt: 'L3 Innovation', h: 26 },
  { src: '/loghi/lucrezia-trabucco-trim.png', alt: 'Lucrezia Trabucco, biologa nutrizionista', h: 15, mono: true },
];

// Primo "human" trovato nei contenuti del servizio: dove interviene la persona.
const humanOf = (lang, id) => {
  const d = (lang === 'en' ? SERVIZI_EN : SERVIZI)[id];
  const m = d && JSON.stringify(d).match(/"human":"((?:[^"\\]|\\.)*)"/);
  return m ? JSON.parse(`"${m[1]}"`) : '';
};

const T = {
  it: {
    title: 'Ovia — Sistemi di marketing e automazione per le imprese',
    desc: 'Ovia progetta e gestisce sistemi di marketing e automazione per imprese e studi professionali: il sistema prepara il lavoro, una persona approva ogni passo che conta. Prenota il Process Check.',
    h1: 'Sistemi di marketing e automazione per le imprese.',
    lead: 'Portiamo nuovi clienti alla tua azienda e togliamo il lavoro ripetitivo a chi ci lavora. I nostri sistemi preparano tutto, poi si fermano e aspettano una persona.',
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
    // simulatore
    simH: 'Guarda un sistema Ovia al lavoro.',
    simP: 'Scegli cosa arriva. Ovia lo legge e prepara il lavoro, poi si ferma: la decisione è tua.',
    simNote: 'Esempio dimostrativo con nomi e dati inventati.',
    stages: ['Arriva', 'Ovia legge', 'Ovia prepara', 'Tu decidi', 'Fatto'],
    arrived: 'Cosa è arrivato', understood: 'Cosa ha capito', drafted: 'Cosa ha preparato', result: 'Risultato',
    approveBtn: 'Tieni premuto per approvare', edit: 'Modifica', editDone: 'Fine modifica', reject: 'Rifiuta',
    rejected: 'Fermato da te. Nessun messaggio è partito e il caso resta aperto in coda.',
    yourPart: 'Il tuo contributo: una decisione. Il resto l’ha fatto il sistema.',
    again: 'Prova un altro caso', restart: 'Ricomincia', discover: 'Scopri',
    scen: [
      { id: 'lead-generation', tab: 'Nuovo contatto', src: 'Modulo del sito · 21:47',
        input: 'Buonasera, ho un’azienda di impianti con 12 dipendenti. Vorrei capire se potete aiutarci a gestire meglio le richieste di preventivo. Grazie, Marco Serra',
        fields: [['Contatto', 'Marco Serra'], ['Azienda', 'Impianti, 12 dipendenti'], ['Richiesta', 'Gestione dei preventivi'], ['Priorità', 'Alta, in linea con il tuo cliente ideale']],
        draft: 'Buonasera Marco, grazie per averci scritto. Gestire bene i preventivi è proprio il tipo di lavoro che organizziamo per aziende come la sua. Le propongo trenta minuti di Process Check: qui sotto trova il link per scegliere l’orario che preferisce.',
        done: ['Risposta inviata alle 21:49', 'Contatto registrato nel CRM', 'Promemoria se non prenota entro 3 giorni'] },
      { id: 'inbox', tab: 'Email di un cliente', src: 'Email in arrivo · 08:12',
        input: 'Buongiorno, mi servirebbe sapere entro venerdì se avete ricevuto tutti i documenti per la dichiarazione. Cordiali saluti, Giulia Fadda',
        fields: [['Cliente', 'Giulia Fadda · dichiarazione 2026'], ['Argomento', 'Stato dei documenti'], ['Scadenza', 'Venerdì'], ['Assegnata a', 'Chi segue la pratica']],
        draft: 'Gentile Giulia, abbiamo ricevuto tutti i documenti tranne la certificazione degli interessi del mutuo. Appena ce la invia completiamo la dichiarazione, in tempo per venerdì.',
        done: ['Risposta inviata alle 08:14', 'Email archiviata nella scheda cliente', 'Documento mancante segnato in sospeso'] },
      { id: 'documenti', tab: 'Documento', src: 'Caricato dal cliente · 15:03',
        input: 'busta_paga_marzo.pdf · 2 pagine',
        fields: [['Tipo', 'Busta paga'], ['Intestatario', 'Andrea Spano, corrisponde alla pratica'], ['Periodo', 'Marzo 2026'], ['Manca ancora', 'Busta paga di febbraio']],
        draft: 'Gentile Andrea, abbiamo ricevuto la busta paga di marzo, grazie. Per completare la pratica ci manca solo quella di febbraio: può caricarla dallo stesso link.',
        done: ['Documento archiviato nella pratica 214', 'Richiesta inviata al cliente', 'Checklist aggiornata: 11 documenti su 12'] },
      { id: 'chiamate', tab: 'Chiamata', src: 'Chiamata registrata · 11 minuti',
        input: '«…quindi ci risentiamo dopo il 15 per la firma. La bozza del contratto me la manda lei entro giovedì?»',
        fields: [['Cliente', 'Fratelli Deiana Srl'], ['Impegno', 'Bozza del contratto, a nostro carico'], ['Scadenza', 'Giovedì'], ['Prossimo contatto', 'Dopo il 15, per la firma']],
        draft: 'Buongiorno, come concordato al telefono vi invieremo la bozza del contratto entro giovedì e ci risentiremo dopo il 15 per la firma. Restiamo a disposizione per qualsiasi dubbio.',
        done: ['Riepilogo inviato al cliente', 'Attività assegnata: bozza del contratto, giovedì', 'Promemoria in calendario dopo il 15'] },
    ],
    facts: [['15.000+', 'pratiche gestite con i software che abbiamo costruito'], ['30 minuti', 'per il Process Check, senza impegno'], ['Olbia', 'sede, braccio operativo di L3 Innovation Srl']],
    clients: 'Hanno scelto Ovia',
    sysH: 'Due sistemi che lavorano insieme.',
    sysP: 'Il marketing porta le richieste, l’automazione le gestisce senza perdite di tempo. In ogni servizio il pallino indica dove decide una persona.',
    mkH: 'Marketing', mkGoal: 'Portare nuovi clienti, in modo misurabile.',
    auH: 'Automazione', auGoal: 'Togliere il lavoro ripetitivo e riprendere il controllo.',
    landings: [['/siti-studi-professionali.html', 'Siti per studi professionali', 'Il sito che porta consulenze e prenota al posto tuo.'], ['/siti-attivita-locali.html', 'Siti per attività locali', 'Il sito che porta tavoli, clienti e prenotazioni.']],
    open: 'Scopri',
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
    title: 'Ovia — Marketing & automation systems for business',
    desc: 'Ovia designs and runs marketing and automation systems for businesses and professional firms: the system prepares the work, a person approves every step that matters. Book the Process Check.',
    h1: 'Marketing and automation systems for business.',
    lead: 'We bring new clients to your company and take repetitive work off your people. Our systems prepare everything, then stop and wait for a person.',
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
    simH: 'Watch an Ovia system at work.',
    simP: 'Choose what comes in. Ovia reads it and prepares the work, then stops: the decision is yours.',
    simNote: 'Demo example with made-up names and data.',
    stages: ['In', 'Ovia reads', 'Ovia drafts', 'You decide', 'Done'],
    arrived: 'What came in', understood: 'What it understood', drafted: 'What it prepared', result: 'Result',
    approveBtn: 'Press and hold to approve', edit: 'Edit', editDone: 'Done editing', reject: 'Reject',
    rejected: 'Stopped by you. Nothing was sent and the case stays open in the queue.',
    yourPart: 'Your part: one decision. The system did the rest.',
    again: 'Try another case', restart: 'Start again', discover: 'Explore',
    scen: [
      { id: 'lead-generation', tab: 'New enquiry', src: 'Website form · 9:47 pm',
        input: 'Good evening, I run a building services company with 12 employees. I’d like to know if you can help us handle quote requests better. Thanks, Marco Serra',
        fields: [['Contact', 'Marco Serra'], ['Company', 'Building services, 12 staff'], ['Request', 'Handling quote requests'], ['Priority', 'High, matches your ideal client']],
        draft: 'Good evening Marco, thank you for getting in touch. Handling quotes well is exactly the kind of work we organise for companies like yours. I suggest a thirty-minute Process Check: you’ll find the link below to pick a time that suits you.',
        done: ['Reply sent at 9:49 pm', 'Contact saved in the CRM', 'Reminder if no booking within 3 days'] },
      { id: 'inbox', tab: 'Client email', src: 'Incoming email · 8:12 am',
        input: 'Good morning, could you let me know by Friday whether you have received all the documents for my tax return? Kind regards, Giulia Fadda',
        fields: [['Client', 'Giulia Fadda · 2026 tax return'], ['Topic', 'Document status'], ['Deadline', 'Friday'], ['Assigned to', 'Whoever handles the case']],
        draft: 'Dear Giulia, we have received all the documents except the mortgage interest statement. As soon as you send it we will complete your return, in time for Friday.',
        done: ['Reply sent at 8:14 am', 'Email filed in the client record', 'Missing document flagged as pending'] },
      { id: 'documenti', tab: 'Document', src: 'Uploaded by the client · 3:03 pm',
        input: 'payslip_march.pdf · 2 pages',
        fields: [['Type', 'Payslip'], ['Holder', 'Andrea Spano, matches the case'], ['Period', 'March 2026'], ['Still missing', 'February payslip']],
        draft: 'Dear Andrea, we have received your March payslip, thank you. To complete the case we only need February’s: you can upload it from the same link.',
        done: ['Document filed in case 214', 'Request sent to the client', 'Checklist updated: 11 of 12 documents'] },
      { id: 'chiamate', tab: 'Phone call', src: 'Recorded call · 11 minutes',
        input: '“…so we’ll speak again after the 15th to sign. Will you send me the draft contract by Thursday?”',
        fields: [['Client', 'Deiana Brothers Ltd'], ['Commitment', 'Draft contract, on us'], ['Deadline', 'Thursday'], ['Next contact', 'After the 15th, to sign']],
        draft: 'Good morning, as agreed on the phone we will send you the draft contract by Thursday and speak again after the 15th to sign. Do get in touch with any questions.',
        done: ['Summary sent to the client', 'Task assigned: draft contract, Thursday', 'Calendar reminder after the 15th'] },
    ],
    facts: [['15,000+', 'cases handled with the software we built'], ['30 minutes', 'for the Process Check, no obligation'], ['Olbia, Italy', 'home base, operating arm of L3 Innovation Srl']],
    clients: 'They chose Ovia',
    sysH: 'Two systems working together.',
    sysP: 'Marketing brings the enquiries in, automation handles them without wasted time. In every service the dot marks where a person decides.',
    mkH: 'Marketing', mkGoal: 'Bring in new clients, measurably.',
    auH: 'Automation', auGoal: 'Remove repetitive work and take back control.',
    landings: [['/siti-studi-professionali.html', 'Websites for professional firms', 'The website that brings in consultations and books them for you.'], ['/siti-attivita-locali.html', 'Websites for local businesses', 'The website that brings in tables, clients and bookings.']],
    open: 'Explore',
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

// Manifesto: parola per parola (il JS le "accende" con lo scroll), {dot} = pallino del logo, _parola_ = in blu.
const manifesto = s => s.split(' ').map(w => w === '{dot}'
  ? '<span class="mf-dot" aria-hidden="true"></span>'
  : /^_.+_$/.test(w) ? `<span class="mf-w mf-em">${esc(w.slice(1, -1))}</span>`
  : `<span class="mf-w">${esc(w)}</span>`).join(' ');

function pagina(lang) {
  const t = T[lang], u = UI[lang], P = x => pathFor(lang, x);
  const prods = prodottiIn(lang), byId = Object.fromEntries(prods.map(p => [p.id, p]));
  const url = SITE.url + ALT[lang];

  const jsonld = [{ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', '@id': SITE.url + '/#website', url: SITE.url + '/', name: 'Ovia', inLanguage: lang === 'en' ? 'en' : 'it-IT', publisher: { '@id': SITE.url + '/#organization' } },
    { '@type': 'Organization', '@id': SITE.url + '/#organization', name: 'Ovia', url: SITE.url, email: SITE.email, logo: SITE.url + '/favicon.svg',
      slogan: 'Marketing & automation systems for business', legalName: 'L3 Innovation Srl', vatID: 'IT02882330901',
      parentOrganization: { '@type': 'Organization', name: 'L3 Innovation Srl' },
      address: { '@type': 'PostalAddress', addressLocality: 'Olbia', addressCountry: 'IT' },
      founder: { '@type': 'Person', '@id': SITE.url + '/chi-siamo.html#luca-lorenzo', name: 'Luca Lorenzo' },
      sameAs: ['https://www.linkedin.com/company/oviaitalia'] },
    { '@type': 'WebPage', '@id': url + '#webpage', url, name: t.title, description: t.desc, inLanguage: lang === 'en' ? 'en' : 'it-IT', isPartOf: { '@id': SITE.url + '/#website' }, about: { '@id': SITE.url + '/#organization' } },
  ] }];

  const check = id => { const h = humanOf(lang, id); return h ? `<small class="hx-check">${esc(h)}</small>` : ''; };
  const svc = ids => ids.map(id => byId[id]).map(p => `<li><a href="${urlIn(lang, p.id)}"><strong>${esc(p.name)}</strong><span>${esc(p.tagline)}</span>${check(p.id)}<em>${t.open}</em></a></li>`).join('');
  const land = t.landings.map(([path, n, d]) => `<li><a href="${P(path)}"><strong>${esc(n)}</strong><span>${esc(d)}</span><em>${t.open}</em></a></li>`).join('');

  // Dati per ovia-home.js (testi e scenari): nessun testo cablato nel JS.
  const data = {
    q: { by: t.qBy, pending: t.qPending, ok: t.qOk, sent: t.qSent, waiting: t.qWaiting, count1: t.count1, countN: t.countN, empty: t.empty, pool: t.pool },
    sim: { stages: t.stages, arrived: t.arrived, understood: t.understood, drafted: t.drafted, result: t.result,
      approve: t.approveBtn, edit: t.edit, editDone: t.editDone, reject: t.reject, rejected: t.rejected, yourPart: t.yourPart,
      again: t.again, restart: t.restart, discover: t.discover,
      scen: t.scen.map(s => ({ ...s, href: urlIn(lang, s.id), name: byId[s.id].name })) },
  };

  const card = ([k, title, m], i) => `<li class="hx-card${i === 0 ? ' is-top' : ''}" style="--i:${i}"${i ? ' aria-hidden="true"' : ''}><span class="k">${esc(t.qBy)} · ${esc(k)}</span><strong>${esc(title)}</strong><span class="m">${esc(m)}</span><em class="st">${esc(t.qPending)}</em></li>`;

  const extra = `<meta name="twitter:title" content="${esc(t.title)}">
<meta name="twitter:description" content="${esc(t.desc)}">`;

  return head({ title: t.title, description: t.desc, path: '/', lang, alt: ALT, jsonld, extra }) + header('home', lang, ALT) + `
<main class="hx-home">
  <section class="hx" aria-labelledby="hx-h1">
    <div class="ov-wrap hx-grid">
      <div class="hx-copy">
        <h1 id="hx-h1">${esc(t.h1)}</h1>
        <p class="ov-lead">${esc(t.lead)}</p>
        <div class="hm-ctas">${calBtn(u.cta)}<button type="button" class="ov-btn-ghost js-concierge">${esc(t.talk)}</button></div>
      </div>
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

  <section class="mf" data-mf aria-label="${lang === 'en' ? 'The meaning of the dot' : 'Il significato del pallino'}"><div class="ov-wrap">
    <p class="mf-text">${manifesto(t.manifesto)}</p>
    <p class="mf-sub">${esc(t.manifestoSub)}</p>
  </div></section>

  <section class="ov-section sx-sec" id="sistema"><div class="ov-wrap">
    <h2 class="ov-h2">${esc(t.simH)}</h2>
    <p class="ov-lead">${esc(t.simP)}</p>
    <div class="sx" data-sx>
      <div class="sx-tabs" role="tablist" aria-label="${esc(t.simH)}">${t.scen.map((s, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-sx-tab="${i}">${esc(s.tab)}</button>`).join('')}</div>
      <ol class="sx-track" data-sx-track>${t.stages.map((s, i) => `<li${i === 3 ? ' class="me"' : ''}><i></i><span>${esc(s)}</span></li>`).join('')}<li class="sx-fill" aria-hidden="true"></li></ol>
      <p class="ov-sr" aria-live="polite" data-sx-live></p>
      <div class="sx-panel" data-sx-panel>
        <div class="sx-in"><p class="sx-h">${esc(t.arrived)}</p><p class="sx-src">${esc(t.scen[0].src)}</p><p class="sx-msg">${esc(t.scen[0].input)}</p></div>
        <div class="sx-work"><p class="sx-h">${esc(t.drafted)}</p><p class="sx-draft">${esc(t.scen[0].draft)}</p></div>
      </div>
    </div>
    <p class="sx-note">${esc(t.simNote)}</p>
  </div></section>

  <section class="hm-clients" aria-label="${esc(t.clients)}"><div class="ov-wrap">
    <dl class="hm-facts">${t.facts.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>
    <div class="hm-cl"><p>${esc(t.clients)}</p>
    <ul class="hm-logos">${LOGHI.map(l => `<li><img src="${l.src}" alt="${esc(l.alt)}"${l.mono ? ' class="mono"' : ''} style="height:${l.h}px" loading="lazy" decoding="async"></li>`).join('')}</ul></div>
  </div></section>

  <section class="ov-section" id="soluzioni"><div class="ov-wrap">
    <h2 class="ov-h2">${esc(t.sysH)}</h2>
    <p class="ov-lead">${esc(t.sysP)}</p>
    <div class="hm-sys">
      <div id="siti-web"><h3>${esc(t.mkH)}</h3><p class="goal">${esc(t.mkGoal)}</p><ul class="hm-svc">${svc(MARKETING)}${land}</ul></div>
      <div><h3>${esc(t.auH)}</h3><p class="goal">${esc(t.auGoal)}</p><ul class="hm-svc">${svc(AUTOMAZIONE)}</ul></div>
    </div>
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
      <picture><source srcset="/assets/luca-lorenzo.webp" type="image/webp"><img src="/assets/luca-lorenzo.jpg" alt="${esc(t.founderAlt)}" width="120" height="150" loading="lazy" decoding="async"></picture>
      <div><strong>${esc(t.founder)}</strong><span>${esc(t.founderRole)}</span><a class="hm-link" href="${P('/chi-siamo.html')}">${esc(t.story)}</a></div>
    </div>
  </div></section>

  <section class="ov-section" id="sicurezza"><div class="ov-wrap">
    <h2 class="ov-h2">${esc(t.trustH)}</h2>
    <p class="ov-lead">${esc(t.trustP)}</p>
    <div class="hm-trust">${t.trust.map(([h, p]) => `<div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>
  </div></section>

  ${bloccoHome(lang)}

  <section class="ov-wrap" id="prossimo-passo"><div class="ov-cta-band hx-cta">
    <div class="hx-cta-side"><button type="button" class="hx-cta-dot" data-hx-cta aria-label="${esc(u.cta)}"></button><p>${esc(t.ctaHold)}</p></div>
    <div>
      <p class="hx-cta-tag">${esc(t.ctaTag)}</p>
      <h2>${esc(t.ctaH)}</h2>
      <p>${esc(t.ctaP)}</p>
      <div class="hm-ctas">${calBtn(u.cta)}<button type="button" class="ov-btn-ghost js-concierge">${esc(t.talk)}</button></div>
      <p class="small">${esc(t.ctaS)}</p>
    </div>
  </div></section>
</main>
<script type="application/json" id="hx-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script src="/assets/ovia-home.js" defer></script>` + footer(lang);
}

export function buildHome() {
  mkdirSync(ROOT + 'en', { recursive: true });
  writeFileSync(ROOT + 'index.html', pagina('it'));
  writeFileSync(ROOT + 'en/index.html', pagina('en'));
}
