// =====================================================================
// OVIA — Domande frequenti (pagina /faq.html + blocco in homepage).
// "home: true" = compare anche nella selezione della homepage.
// Testo semplice; **grassetto** e [link](/percorso) sono ammessi.
// =====================================================================

export const FAQ_CATEGORIE = [
  { id: 'ovia', label: 'Ovia e il metodo' },
  { id: 'process-check', label: 'Process Check' },
  { id: 'sicurezza', label: 'Sicurezza e privacy' },
  { id: 'normativa', label: 'AI e normativa' },
  { id: 'servizi', label: 'Servizi' },
  { id: 'tecnologia', label: 'Strumenti e integrazioni' },
  { id: 'costi', label: 'Costi e contratto' },
  { id: 'tempi', label: 'Tempi e supporto' },
  { id: 'siti', label: 'Siti web per le AI' },
];

export const FAQ = [
  // ---------------- Ovia e il metodo ----------------
  { c: 'ovia', home: true, q: 'Cos’è Ovia, in parole semplici?',
    a: 'Ovia costruisce sistemi di intelligenza artificiale su misura per studi professionali e PMI italiane. Gestiscono il lavoro ripetitivo, come email, documenti, chiamate, scadenze e nuovi contatti, mentre tu e il tuo team vi occupate dei clienti. Non vendiamo un software da installare: prima osserviamo come lavori, poi costruiamo il sistema intorno a te.' },
  { c: 'ovia', home: true, q: 'In cosa siete diversi da chi vende un software o un chatbot?',
    a: 'Nel punto di partenza. Chiunque oggi può comprare un abbonamento a uno strumento AI. Il valore sta nel decidere **cosa** automatizzare, **come** proteggere i dati dei tuoi clienti e **come** misurare il risultato. Per noi strategia e sicurezza fanno guadagnare, l’AI è lo strumento. Per questo ogni progetto parte da un’analisi del tuo flusso di lavoro, non da una demo di prodotto.' },
  { c: 'ovia', q: 'Per chi è pensato Ovia?',
    a: 'Soprattutto per commercialisti, avvocati, consulenti del lavoro e altri studi professionali, e per le PMI che gestiscono molti clienti, pratiche o richieste. Il profilo tipico è uno studio che perde ore ogni settimana a smistare email, rincorrere documenti o ricostruire cosa si è detto al telefono.' },
  { c: 'ovia', q: 'Devo cambiare il modo in cui lavoro o i programmi che uso?',
    a: 'No. Il principio del metodo Ovia è l’opposto: colleghiamo gli strumenti che usi già (posta, PEC, telefono, cartelle, gestionale) e costruiamo il sistema intorno alle tue persone. Cambia il lavoro ripetitivo, non le tue abitudini professionali.' },
  { c: 'ovia', q: 'L’intelligenza artificiale sostituirà i miei collaboratori?',
    a: 'Non è l’obiettivo, e non è come progettiamo i sistemi. L’AI prende il lavoro ripetitivo, come smistare, trascrivere, sollecitare e compilare, così le persone del tuo studio si occupano di ciò che richiede competenza e rapporto con il cliente. Chi oggi fa il lavoro a mano di solito diventa chi controlla il sistema.' },
  { c: 'ovia', q: 'Chi c’è dietro Ovia?',
    a: 'Ovia è un progetto di L3 Innovation Srl (P.IVA 02882330901). Lavoriamo con pochi clienti alla volta, perché ogni sistema è costruito e seguito su misura.' },

  // ---------------- Process Check ----------------
  { c: 'process-check', home: true, q: 'Cos’è il Process Check?',
    a: 'È il primo passo: trenta minuti in videochiamata sul tuo flusso di lavoro reale. Guardiamo dove va il tempo, cosa si ripete e dove si perdono informazioni. Alla fine sai quali attività si possono automatizzare in sicurezza, quanto tempo si può recuperare e da dove conviene partire. Nessun gergo tecnico.' },
  { c: 'process-check', q: 'Il Process Check mi impegna a qualcosa?',
    a: 'No. È un’analisi senza impegno. Se vediamo che possiamo darti un risultato misurabile, ti proponiamo da dove partire. Se non è così, te lo diciamo con franchezza.' },
  { c: 'process-check', q: 'Cosa devo preparare prima della chiamata?',
    a: 'Niente di tecnico. Aiuta avere in mente le due o tre attività che ti fanno perdere più tempo (per esempio la posta, i solleciti di documenti, le telefonate) e un’idea di quante persone ci lavorano. Il resto lo ricostruiamo insieme.' },
  { c: 'process-check', q: 'Cosa ricevo dopo il Process Check?',
    a: 'La fotografia del tuo studio: le attività automatizzabili, una stima del tempo recuperabile e il punto migliore da cui partire. Se decidi di procedere, su quella base prepariamo una proposta con obiettivi misurabili.' },

  // ---------------- Sicurezza e privacy ----------------
  { c: 'sicurezza', home: true, q: 'I dati dei miei clienti vengono usati per addestrare ChatGPT o altri modelli?',
    a: 'No. Usiamo fornitori e configurazioni che escludono l’uso dei dati per l’addestramento dei modelli, e lo mettiamo per iscritto. Le informazioni dei tuoi clienti restano nel tuo sistema e non vengono lette da chi non fa parte del tuo studio.' },
  { c: 'sicurezza', q: 'Dove sono conservati i dati?',
    a: 'Lo decidiamo insieme nel progetto, in base alla riservatezza dei dati che tratti. Si va dal cloud con fornitori selezionati all’installazione dedicata (on-premise) per gli studi che vogliono i dati su infrastruttura propria.' },
  { c: 'sicurezza', q: 'Chi nello studio può vedere cosa?',
    a: 'I permessi si configurano persona per persona: solo chi segue un cliente o una pratica la vede. Vale anche per gli assistenti AI: il sistema risponde solo con le informazioni che chi chiede è autorizzato a vedere. Ogni accesso resta tracciato.' },
  { c: 'sicurezza', q: 'Il sistema può inviare email o messaggi ai clienti da solo?',
    a: 'Per impostazione no. Il sistema prepara, tu approvi: nessuna comunicazione sensibile parte senza il tuo sì. Puoi decidere di automatizzare solo i messaggi a basso rischio, come le conferme di ricezione.' },
  { c: 'sicurezza', q: 'Il mio team oggi usa ChatGPT “di nascosto”. È un problema?',
    a: 'Sì, ed è il rischio più diffuso. Quando un collaboratore incolla l’email o il bilancio di un cliente in un chatbot pubblico, lo studio perde il controllo su dove finiscono quei dati. Vietare tutto raramente funziona. La soluzione è dare al team strumenti autorizzati, comodi quanto quelli gratuiti, dentro un perimetro sicuro.' },
  { c: 'sicurezza', q: 'Come gestite GDPR e segreto professionale?',
    a: 'Fin dall’inizio del progetto, non alla fine: informative, basi giuridiche, tempi di conservazione, accessi e ruoli nel trattamento dei dati vengono definiti prima di attivare qualsiasi automazione. Per le attività delicate, come la registrazione delle chiamate, impostiamo informativa e procedure prima di partire.' },

  // ---------------- AI e normativa ----------------
  { c: 'normativa', home: true, q: 'Posso usare l’AI nel mio studio? Cosa dice la Legge 132/2025?',
    a: 'Sì. L’art. 13 della Legge 132/2025, in vigore dal 10 ottobre 2025, consente ai professionisti di usare l’AI per attività strumentali e di supporto, a condizione che il lavoro intellettuale resti prevalente e che il cliente venga informato con un linguaggio chiaro. I sistemi Ovia sono progettati proprio così: il sistema propone, il professionista decide. Ne parliamo nel dettaglio [in questo articolo](/blog/legge-132-2025-ai-professionisti-informativa-clienti.html).' },
  { c: 'normativa', q: 'Devo informare i miei clienti che uso sistemi di intelligenza artificiale?',
    a: 'Per le professioni intellettuali sì, secondo l’art. 13 della Legge 132/2025. Di solito basta una clausola chiara nella lettera d’incarico, con un richiamo nell’informativa privacy. Ti aiutiamo a impostarla in modo coerente con i sistemi che usi davvero.' },
  { c: 'normativa', q: 'E l’AI Act europeo?',
    a: 'Per la maggior parte degli usi di uno studio professionale non impone obblighi pesanti, ma chiede trasparenza: per esempio, chi parla con un assistente virtuale deve sapere che è un sistema AI. Nei nostri progetti gli assistenti si presentano sempre come tali.' },
  { c: 'normativa', q: 'Se l’AI sbaglia, chi ne risponde?',
    a: 'La responsabilità professionale resta del professionista, ed è per questo che i sistemi Ovia non decidono al posto tuo. Ogni output passa da una revisione umana e, dove possibile, cita la fonte da cui arriva, così la verifica è rapida e documentabile.' },

  // ---------------- Servizi ----------------
  { c: 'servizi', home: true, q: 'Quali servizi offrite?',
    a: 'Sette sistemi, combinabili tra loro: [Ovia Second Brain](/servizi/second-brain.html) (la memoria dello studio), [Ovia Inbox](/servizi/inbox.html) (email), [Ovia Lead Generation](/servizi/lead-generation.html) (nuovi clienti), [Ovia Chiamate](/servizi/chiamate.html) (dalla telefonata all’azione), [Ovia Documenti](/servizi/documenti.html) (raccolta e solleciti), [Ovia Siti Web per le AI](/servizi/siti-web-ai.html) e [Ovia CRM](/servizi/crm.html).' },
  { c: 'servizi', q: 'Da quale servizio conviene partire?',
    a: 'Da quello che risolve il problema che ti costa di più. Spesso è la posta, la raccolta dei documenti o il lavoro dopo le telefonate. Il Process Check serve proprio a capirlo: partiamo da un’area, la misuriamo, e solo se funziona il sistema cresce.' },
  { c: 'servizi', q: 'Posso prendere un solo servizio?',
    a: 'Sì. Ogni sistema funziona da solo. Sono però progettati per alimentarsi a vicenda: le chiamate e le email aggiornano il CRM, e il Second Brain rende tutto interrogabile. Molti clienti partono con uno e aggiungono gli altri nel tempo.' },
  { c: 'servizi', q: 'Fate anche soluzioni fuori da questi sette servizi?',
    a: 'Sì. Se nel Process Check emerge un’esigenza specifica, per esempio un flusso particolare del tuo settore, valutiamo con franchezza se possiamo costruire qualcosa su misura con un risultato misurabile.' },

  // ---------------- Strumenti e integrazioni ----------------
  { c: 'tecnologia', q: 'Funziona con Gmail, Outlook, PEC e WhatsApp?',
    a: 'Sì. Ci colleghiamo alle caselle e ai canali che usi già, PEC comprese, senza chiederti di migrare.' },
  { c: 'tecnologia', q: 'Si integra con il gestionale del mio studio?',
    a: 'Dove il gestionale lo permette, sì. Quando non è possibile collegarlo direttamente, Ovia CRM fa da cruscotto accanto al gestionale, senza sostituirlo.' },
  { c: 'tecnologia', q: 'Serve comprare hardware o dispositivi particolari?',
    a: 'Di norma no. Per le chiamate in presenza a volte suggeriamo un registratore dedicato, ma scegliamo sempre la soluzione più semplice per il tuo modo di lavorare.' },
  { c: 'tecnologia', q: 'Quale intelligenza artificiale usate?',
    a: 'Scegliamo i modelli più adatti e affidabili per ogni compito, con configurazioni che escludono l’addestramento sui tuoi dati. L’AI è il motore, non il progetto: quando esce un modello migliore possiamo cambiarlo senza toccare il tuo metodo di lavoro.' },
  { c: 'tecnologia', q: 'Se un giorno smetto, cosa succede ai miei dati?',
    a: 'I dati sono tuoi. Alla chiusura del rapporto ti restituiamo le informazioni in formati standard e riutilizzabili, secondo quanto previsto nel contratto.' },

  // ---------------- Costi e contratto ----------------
  { c: 'costi', home: true, q: 'Quanto costa?',
    a: 'Dipende da cosa costruiamo, perché ogni sistema è su misura. In generale c’è un costo di attivazione e un canone mensile che include manutenzione, aggiornamenti e supporto umano. Ti diamo numeri precisi solo dopo il Process Check, quando sappiamo cosa serve davvero e quanto tempo ti fa recuperare.' },
  { c: 'costi', q: 'Perché c’è un canone mensile?',
    a: 'Perché un sistema AI non è un file che si consegna e si dimentica: va mantenuto, aggiornato quando cambiano strumenti e modelli, e migliorato sulla base di come lo usa il tuo team. Il canone copre questo lavoro e il supporto di una persona reale.' },
  { c: 'costi', q: 'Come faccio a sapere se l’investimento conviene?',
    a: 'Lo misuriamo. Ogni progetto parte da una promessa misurabile, come ore recuperate, tempi di risposta o solleciti eliminati, e la verifichiamo insieme dopo le prime settimane. Nelle pagine servizio trovi un calcolatore per una prima stima in euro.' },

  // ---------------- Tempi e supporto ----------------
  { c: 'tempi', home: true, q: 'Quanto tempo serve per vedere i primi risultati?',
    a: 'Di solito il primo nucleo funzionante arriva in 3–4 settimane dal Process Check, su un’area e un gruppo ristretto di clienti. Partiamo piccoli di proposito: prima misuriamo, poi estendiamo.' },
  { c: 'tempi', q: 'Il mio team dovrà fare formazione?',
    a: 'Poca, perché il sistema ricalca il vostro modo di lavorare. Facciamo comunque sessioni di avvio con le persone che lo useranno e, nelle prime settimane, monitoriamo insieme il funzionamento.' },
  { c: 'tempi', q: 'Se qualcosa non funziona, a chi mi rivolgo?',
    a: 'A noi, a una persona reale, non a un call center. Il supporto umano è parte del servizio e i tempi di risposta sono definiti nel contratto.' },
  { c: 'tempi', q: 'Lavorate solo in una zona d’Italia?',
    a: 'No. Lavoriamo con studi e aziende in tutta Italia. Process Check, progettazione e supporto si fanno a distanza senza difficoltà.' },

  // ---------------- Siti web per le AI ----------------
  { c: 'siti', q: 'Cosa significa “sito web per le AI”?',
    a: 'È un sito progettato per essere trovato e citato non solo da Google, ma anche dagli assistenti come ChatGPT, Gemini, Perplexity e dalle risposte AI di Google. Contenuti chiari, dati strutturati e risposte dirette alle domande reali dei tuoi clienti, con un assistente che risponde e prenota al posto tuo.' },
  { c: 'siti', q: 'Potete garantirmi di comparire su ChatGPT o primo su Google?',
    a: 'No, e diffida di chi lo garantisce: nessuno controlla i motori di ricerca o le AI. Possiamo aumentare in modo misurabile la probabilità di essere trovato e citato, con metodi documentati, e mostrarti i risultati mese per mese.' },
  { c: 'siti', q: 'Posso vedere il sito prima di decidere?',
    a: 'Sì. Per i siti partiamo da una demo gratuita con i tuoi contenuti, pronta in circa 48 ore: la guardi con calma e decidi solo dopo. Trovi i dettagli per [studi professionali](/siti-studi-professionali.html) e [attività locali](/siti-attivita-locali.html).' },
  { c: 'siti', q: 'Ho già un sito. Devo rifarlo da zero?',
    a: 'Non sempre. Dopo un’analisi ti diciamo con franchezza se conviene migliorare quello esistente o rifarlo. Spesso aggiungere pagine servizio, FAQ e dati strutturati a un sito tecnicamente sano basta.' },
];
