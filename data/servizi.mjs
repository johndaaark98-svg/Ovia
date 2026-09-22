// =====================================================================
// OVIA — Contenuti delle pagine servizio.
// [[chiave]] nel testo = rimando numerato alla fonte in data/fonti.mjs
// **testo** = grassetto. Tutto il resto è testo semplice (viene escapato).
// =====================================================================

// Pilastro comune: il posizionamento Ovia. Il peso visivo racconta la gerarchia.
export const PILASTRI_BASE = { strategia: 100, sicurezza: 100, ai: 45 };

export const SERVIZI = {
  /* ------------------------------------------------------------------ */
  'second-brain': {
    metaTitle: 'Ovia Second Brain — la memoria operativa del tuo studio | Ovia',
    metaDesc: 'Chiamate, decisioni, note e impegni collegati al cliente giusto e ritrovati con una domanda. Progettato su strategia e sicurezza, non sull’ultimo tool AI.',
    claim: 'Tutto ciò che sai, hai detto e devi fare. In un unico posto, sotto il tuo controllo.',
    sub: 'Ovia Second Brain è la memoria del tuo studio: cattura ciò che succede ogni giorno, lo collega al cliente e alla pratica giusti, e te lo restituisce quando serve, con una domanda in italiano. Non decide al posto tuo: ti ricorda ciò che già sai.',
    stats: [
      { big: '~20%', desc: 'della settimana di un professionista se ne va a cercare informazioni interne o il collega che le ha', ref: 'mckinsey' },
      { big: '28%', desc: 'del tempo è assorbito dalla gestione delle email, dove finisce gran parte della memoria dello studio', ref: 'mckinsey' },
      { big: '70,8%', desc: 'delle imprese italiane che usano AI la usano proprio per estrarre e analizzare testi e documenti', ref: 'istat' },
    ],
    problem: {
      title: 'La conoscenza del tuo studio esiste. Il problema è che è sparsa.',
      paras: [
        'Una decisione presa al telefono, un impegno preso in riunione, un dettaglio del cliente scritto su un post-it, un’eccezione concordata via email due anni fa. Ogni giorno il tuo studio produce conoscenza preziosa, e ogni giorno una parte si perde: nella testa di chi l’ha vissuta, in caselle che nessun altro legge, in cartelle che nessuno apre.',
        'Il costo non si vede in bilancio, ma c’è: ore spese a ricostruire, domande che interrompono il titolare, errori evitabili, clienti che devono ripetere le stesse cose. Secondo McKinsey quasi un quinto della settimana lavorativa se ne va solo a cercare informazioni interne [[mckinsey]].',
        '**Il punto non è comprare l’ennesimo strumento AI.** È decidere cosa va ricordato, da chi può essere consultato e dove restano i dati. Prima la strategia e la sicurezza. Poi lo strumento.',
      ],
    },
    pillars: {
      strategia: 'Mappiamo quali informazioni valgono davvero (impegni, decisioni, eccezioni, preferenze del cliente), da dove arrivano e chi deve ritrovarle. Senza questa mappa un second brain diventa un archivio in più.',
      sicurezza: 'Permessi per persona e per cliente: chi non segue una pratica non la vede, nemmeno chiedendola all’assistente. Dati mai usati per addestrare modelli di terzi, accessi tracciati.',
      ai: 'L’AI legge, collega e risponde citando la fonte interna. È il motore, non il progetto: la cambiamo quando ne esce una migliore, senza toccare il tuo metodo.',
    },
    flow: [
      { t: 'Cattura', h: 'Tutto ciò che conta entra da solo', p: 'Chiamate registrate, email rilevanti, note vocali, verbali, documenti caricati: le fonti che usi già alimentano la memoria senza che nessuno debba “ricordarsi di salvare”.' },
      { t: 'Collega', h: 'Ogni informazione trova il suo cliente', p: 'Il sistema riconosce a quale cliente, pratica e persona si riferisce ogni contenuto e lo aggancia alla scheda giusta, con data e provenienza.' },
      { t: 'Estrae', h: 'Impegni e decisioni diventano visibili', p: '“Ti mando la bozza entro venerdì”, “procediamo con l’opzione B”: impegni, decisioni e scadenze vengono estratti e resi consultabili, non sepolti in un testo.' },
      { t: 'Risponde', h: 'Chiedi in italiano, ottieni la risposta con la fonte', p: '“Cosa abbiamo concordato con Rossi sul contratto d’affitto?” La risposta arriva con il rimando al documento o alla chiamata originale, così puoi verificare in un clic.', human: 'Ogni risposta cita la fonte: si verifica, non si crede' },
      { t: 'Ricorda', h: 'Ti avvisa prima che te ne dimentichi', p: 'Impegni in scadenza e promesse fatte ai clienti tornano da te al momento giusto. La memoria diventa proattiva, ma resta tua.' },
    ],
    calc: {
      title: 'Quanto costa oggi la memoria sparsa del tuo studio',
      intro: 'Sposta i cursori con i numeri reali del tuo studio. Il calcolo è volutamente prudente.',
      inputs: [
        { name: 'persone', label: 'Persone nello studio', min: 1, max: 40, step: 1, value: 6 },
        { name: 'minuti', label: 'Minuti al giorno a cercare o ricostruire informazioni (a persona)', min: 5, max: 120, step: 5, value: 35, suffix: ' min', hint: 'La media McKinsey equivale a ~90 minuti/giorno: qui partiamo molto più bassi.' },
        { name: 'costo', label: 'Costo orario medio di una risorsa', min: 15, max: 120, step: 1, value: 32, prefix: '€ ' },
      ],
    },
    before: ['Le informazioni stanno nella testa di chi ha fatto la chiamata', 'Per sapere cosa si è deciso bisogna chiedere al titolare', 'Un collaboratore che se ne va porta via mesi di contesto', 'Gli impegni presi a voce si ricordano, quando va bene', 'Il cliente deve ripetere le stesse cose a persone diverse', 'Nessuno sa con certezza chi ha accesso a cosa'],
    after: ['Ogni informazione è agganciata al cliente e alla pratica', 'Chiunque autorizzato trova la risposta con una domanda', 'Il contesto resta allo studio, non alla singola persona', 'Gli impegni tornano da te prima della scadenza', 'Chi risponde al cliente conosce già tutta la storia', 'Permessi per persona e accessi tracciati, sempre'],
    security: [
      { h: 'Permessi ereditati', p: 'L’assistente risponde solo con ciò che la persona che chiede è autorizzata a vedere. Nessuna scorciatoia via chat.' },
      { h: 'Nessun addestramento esterno', p: 'I contenuti dei tuoi clienti non vengono mai usati per addestrare modelli di terzi.' },
      { h: 'Risposte con fonte', p: 'Ogni risposta rimanda al documento o alla chiamata di origine: il pensiero critico resta umano, come chiede la Legge 132/2025 [[l132]].' },
      { h: 'Opzione on-premise', p: 'Per gli studi che lo richiedono, i dati possono restare su infrastruttura dedicata, sotto il tuo controllo.' },
    ],
    audiences: [
      { tab: 'Commercialisti', h: 'Centinaia di clienti, una sola memoria', p: 'Per chi segue molti clienti con storie fiscali diverse, il second brain evita di ricostruire ogni volta il contesto.', items: ['Storico di ogni accordo e eccezione per cliente', 'Risposte rapide ai collaboratori senza interrompere il titolare', 'Continuità quando cambia il referente interno'] },
      { tab: 'Avvocati', h: 'Il fascicolo vivo della pratica', p: 'Telefonate, strategie e istruzioni del cliente collegate al fascicolo, con permessi rigorosi per pratica.', items: ['Istruzioni del cliente sempre ritrovabili con data', 'Accesso limitato al team della singola pratica', 'Riepiloghi pronti prima di ogni udienza o incontro'] },
      { tab: 'Consulenti del lavoro', h: 'Ogni azienda cliente, ogni dipendente, ogni eccezione', p: 'Accordi particolari, richieste ricorrenti e comunicazioni con le aziende clienti in un’unica memoria consultabile.', items: ['Eccezioni contrattuali sempre visibili', 'Storico delle richieste per azienda', 'Onboarding veloce dei nuovi collaboratori'] },
      { tab: 'PMI e imprese', h: 'La memoria commerciale e operativa dell’azienda', p: 'Clienti, fornitori, decisioni interne: ciò che oggi vive nelle caselle personali diventa patrimonio aziendale.', items: ['Contesto cliente condiviso tra vendite e operations', 'Decisioni di riunione tracciate e assegnate', 'Meno dipendenza dalle singole persone'] },
    ],
    timeline: [
      { when: 'Settimana 1', h: 'Process Check', p: 'Osserviamo dove nascono e dove si perdono le informazioni nel tuo studio.' },
      { when: 'Settimana 2', h: 'Mappa e regole', p: 'Definiamo cosa ricordare, chi vede cosa e dove restano i dati.' },
      { when: 'Settimane 3–4', h: 'Primo nucleo', p: 'Colleghiamo le prime fonti (di solito chiamate ed email) su un gruppo di clienti reale.' },
      { when: 'Mese 2', h: 'Misura ed estendi', p: 'Misuriamo il tempo recuperato; solo se funziona, allarghiamo ad altre fonti.' },
    ],
    faq: [
      { q: 'In cosa è diverso da un archivio o da un gestionale documentale?', a: 'Un archivio conserva file; il second brain conserva significato. Collega informazioni di fonti diverse allo stesso cliente, estrae impegni e decisioni e risponde a domande in linguaggio naturale citando la fonte. Il gestionale che usi resta: il second brain gli lavora accanto.' },
      { q: 'L’AI può inventare risposte?', a: 'Il rischio esiste con qualunque modello, per questo il sistema risponde solo usando i contenuti del tuo studio e mostra sempre la fonte. Se l’informazione non c’è, lo dice. La verifica umana resta il passaggio finale.' },
      { q: 'I dati dei miei clienti finiscono per addestrare ChatGPT o simili?', a: 'No. Usiamo fornitori e configurazioni che escludono l’uso dei dati per l’addestramento, e dove serve proponiamo un’installazione dedicata. È la prima cosa che mettiamo per iscritto.' },
      { q: 'Devo informare i clienti che uso l’AI?', a: 'Per le professioni intellettuali, l’art. 13 della Legge 132/2025 chiede di informare il cliente sui sistemi di AI utilizzati, con linguaggio chiaro, e di mantenere prevalente il lavoro intellettuale umano. Ti aiutiamo a impostare l’informativa e i processi in modo coerente.' },
      { q: 'Quanto tempo serve per vedere un risultato?', a: 'Il primo nucleo funzionante arriva di solito in 3–4 settimane, su un gruppo ristretto di clienti. Partiamo piccoli di proposito: prima misuriamo, poi estendiamo.' },
      { q: 'Funziona con gli strumenti che uso già?', a: 'Sì, è il principio del metodo Ovia: colleghiamo posta, telefonia, cartelle e gestionale che già usi, invece di chiederti di cambiarli.' },
    ],
    sources: ['mckinsey', 'istat', 'l132'],
  },

  /* ------------------------------------------------------------------ */
  'inbox': {
    metaTitle: 'Ovia Inbox — email lette, smistate e con risposta pronta | Ovia',
    metaDesc: 'Ogni email riconosciuta per cliente, argomento e urgenza, assegnata alla persona giusta con bozza di risposta nel tono dello studio. Tu approvi, niente parte da solo.',
    claim: 'La tua casella, letta e capita. Tu approvi, il resto si organizza.',
    sub: 'Ovia Inbox legge ogni email in arrivo, capisce da quale cliente arriva, di cosa parla e quanto è urgente, la assegna alla persona giusta e prepara una bozza di risposta nel tono del tuo studio. Nessuna email importante sepolta, nessuna risposta inviata senza il tuo sì.',
    stats: [
      { big: '28%', desc: 'della settimana lavorativa viene speso a leggere e gestire email', ref: 'mckinsey' },
      { big: '17%', desc: 'delle violazioni di dati in Italia parte dal phishing, il vettore più frequente', ref: 'ibm' },
      { big: '31%', desc: 'delle organizzazioni italiane ha policy efficaci contro la “shadow AI”, gli strumenti AI usati senza controllo', ref: 'ibm' },
    ],
    problem: {
      title: 'La casella è diventata la tua scrivania. E nessuno la tiene in ordine.',
      paras: [
        'Richieste di clienti, comunicazioni degli enti, PEC, fornitori, newsletter, solleciti: arriva tutto nello stesso posto, alla stessa velocità, con la stessa priorità apparente. Il risultato è che chi apre la casella passa la mattina a smistare invece che a lavorare.',
        'La tentazione è incollare le email in un chatbot per farsi scrivere le risposte. È esattamente la “shadow AI” che, secondo IBM, fa lievitare il costo delle violazioni di dati: solo il 31% delle organizzazioni italiane ha regole efficaci per gestirla [[ibm]].',
        '**Ovia Inbox fa il contrario:** prima decidiamo regole, priorità, tono e permessi dello studio, poi mettiamo l’AI a lavorare dentro quel perimetro, con l’approvazione umana come ultimo passaggio obbligato.',
      ],
    },
    pillars: {
      strategia: 'Definiamo le categorie che contano per te, le regole di assegnazione, i tempi di risposta per tipo di cliente e il tono dello studio. L’automazione esegue una strategia, non la inventa.',
      sicurezza: 'Nessun copia-incolla in chatbot esterni. Credenziali gestite lato server, dati non usati per addestramento, segnalazione delle email sospette di phishing, log di ogni azione.',
      ai: 'L’AI classifica, riassume e scrive la bozza. Non invia nulla da sola: il sistema propone, tu decidi.',
    },
    flow: [
      { t: 'Arriva', h: 'L’email entra, il sistema la legge', p: 'Posta ordinaria e PEC vengono lette appena arrivano, allegati compresi.' },
      { t: 'Riconosce', h: 'Cliente, argomento, urgenza', p: 'Il mittente viene collegato alla scheda cliente; l’argomento classificato secondo le tue categorie; l’urgenza stimata con regole che decidi tu.' },
      { t: 'Assegna', h: 'Alla persona giusta, subito', p: 'Ogni email finisce a chi segue quel cliente o quella materia. Le urgenze ti raggiungono immediatamente, il resto aspetta il suo turno.' },
      { t: 'Prepara', h: 'Bozza di risposta nel tono dello studio', p: 'Per le richieste ricorrenti il sistema prepara una bozza completa, usando lo storico del cliente e i tuoi modelli approvati.' },
      { t: 'Approvi', h: 'Tu rileggi, correggi e invii', p: 'Nessuna risposta parte senza approvazione umana. Ogni invio resta tracciato nello storico del cliente.', human: 'Controllo umano al 100% sulle risposte' },
    ],
    calc: {
      title: 'Quanto ti costa ogni anno la tua casella di posta',
      intro: 'Inserisci i volumi reali. Consideriamo recuperabile solo una parte del tempo.',
      inputs: [
        { name: 'persone', label: 'Persone che gestiscono email', min: 1, max: 30, step: 1, value: 4 },
        { name: 'email', label: 'Email gestite al giorno (a persona)', min: 10, max: 200, step: 5, value: 50 },
        { name: 'minuti', label: 'Minuti medi per email (lettura, smistamento, risposta)', min: 1, max: 10, step: .5, value: 3, suffix: ' min' },
        { name: 'costo', label: 'Costo orario medio di una risorsa', min: 15, max: 120, step: 1, value: 30, prefix: '€ ' },
      ],
    },
    before: ['Tutte le email hanno la stessa priorità apparente', 'Le richieste urgenti si scoprono quando il cliente richiama', 'Ogni risposta ricorrente viene riscritta da zero', 'Chi è in ferie diventa un collo di bottiglia', 'Qualcuno incolla email dei clienti in chatbot pubblici', 'Nessuno sa quante richieste restano senza risposta'],
    after: ['Ogni email è classificata per cliente, argomento e urgenza', 'Le urgenze ti raggiungono appena arrivano', 'Le risposte ricorrenti sono già in bozza, da approvare', 'L’assegnazione segue le regole, non la memoria', 'L’AI lavora solo dentro il perimetro sicuro dello studio', 'Tempi di risposta misurati, cliente per cliente'],
    security: [
      { h: 'Approvazione obbligatoria', p: 'Il sistema scrive bozze, non invia. Le eccezioni automatiche (es. conferme di ricezione) si attivano solo se le decidi tu.' },
      { h: 'Anti-phishing', p: 'Mittenti anomali, link sospetti e richieste di pagamento insolite vengono segnalati prima che qualcuno clicchi.' },
      { h: 'Nessun dato nei chatbot pubblici', p: 'Eliminiamo la shadow AI dando al team uno strumento autorizzato e tracciato.' },
      { h: 'Storico completo', p: 'Ogni email, bozza e invio resta collegato alla scheda cliente: chi ha risposto, cosa e quando.' },
    ],
    audiences: [
      { tab: 'Commercialisti', h: 'Scadenze, richieste, comunicazioni degli enti', p: 'Picchi di posta nei periodi fiscali gestiti con priorità chiare.', items: ['PEC e comunicazioni degli enti riconosciute e smistate', 'Risposte standard su scadenze e documenti già in bozza', 'Urgenze fiscali in evidenza immediata'] },
      { tab: 'Avvocati', h: 'Termini e comunicazioni che non possono aspettare', p: 'Notifiche, richieste dei clienti e comunicazioni con i colleghi separate e prioritizzate.', items: ['Comunicazioni con termini evidenziate', 'Assegnazione per fascicolo e responsabile', 'Tono formale dello studio mantenuto nelle bozze'] },
      { tab: 'Segreterie e ordini', h: 'Centinaia di richieste simili, ogni giorno', p: 'Per chi gestisce segreterie condivise o enti, le richieste ricorrenti vengono smaltite in una frazione del tempo.', items: ['Classificazione per tipo di richiesta', 'Risposte da modelli approvati', 'Report dei volumi e dei tempi di risposta'] },
      { tab: 'PMI e imprese', h: 'Clienti, ordini, fornitori', p: 'Info@, ordini e assistenza gestiti con regole chiare invece che con la buona volontà.', items: ['Ordini e richieste commerciali instradati al reparto giusto', 'Bozze di risposta con dati dal gestionale', 'Nessuna richiesta commerciale lasciata a metà'] },
    ],
    timeline: [
      { when: 'Settimana 1', h: 'Process Check', p: 'Analizziamo volumi, categorie e tempi reali della tua posta.' },
      { when: 'Settimana 2', h: 'Regole e tono', p: 'Categorie, assegnazioni, priorità e modelli di risposta approvati da te.' },
      { when: 'Settimane 3–4', h: 'Attivazione controllata', p: 'Partiamo con una casella e la classificazione, poi le bozze.' },
      { when: 'Mese 2', h: 'Misura', p: 'Tempi di risposta e ore recuperate, nero su bianco.' },
    ],
    faq: [
      { q: 'Le email vengono inviate automaticamente?', a: 'No, per impostazione nulla parte senza approvazione. Puoi decidere tu di automatizzare solo messaggi a basso rischio, come le conferme di ricezione.' },
      { q: 'Funziona con PEC, Gmail e Outlook?', a: 'Sì. Ci colleghiamo alle caselle che usi già, incluse le PEC, senza chiederti di migrare.' },
      { q: 'Come fa a scrivere nel tono del mio studio?', a: 'Partiamo dalle tue risposte reali e da modelli che approvi. Il tono viene fissato come regola, e ogni bozza resta modificabile prima dell’invio.' },
      { q: 'Chi può leggere le email dei miei clienti?', a: 'Solo le persone del tuo studio autorizzate. Il sistema è configurato con permessi per persona e i dati non vengono usati per addestrare modelli esterni.' },
      { q: 'Cosa succede se l’AI classifica male un’email?', a: 'La correggi con un clic e la regola migliora. Nelle prime settimane monitoriamo insieme le classificazioni proprio per questo.' },
    ],
    sources: ['mckinsey', 'ibm'],
  },

  /* ------------------------------------------------------------------ */
  'lead-generation': {
    metaTitle: 'Ovia Lead Generation — risposta ai contatti in minuti, follow-up con metodo | Ovia',
    metaDesc: 'Risposta immediata ai nuovi contatti, qualifica, follow-up dei preventivi e riattivazione dei contatti freddi. Una strategia commerciale che lavora da sola, nel rispetto del GDPR.',
    claim: 'Ogni contatto riceve risposta in minuti. Ogni preventivo viene seguito fino a una decisione.',
    sub: 'Ovia Lead Generation mette al lavoro la tua strategia commerciale: risponde ai nuovi contatti in pochi minuti, li qualifica, segue i preventivi inviati con una sequenza precisa e riattiva i contatti che si sono fermati. Tu parli solo con chi è pronto.',
    stats: [
      { big: '7×', desc: 'più probabilità di qualificare un contatto se lo si ricontatta entro un’ora invece che dopo', ref: 'hbr' },
      { big: '42 h', desc: 'il tempo medio di risposta delle aziende a un contatto web; il 23% non risponde mai', ref: 'hbr' },
      { big: '21×', desc: 'la differenza nella qualifica tra rispondere in 5 minuti e rispondere in 30', ref: 'mit' },
    ],
    problem: {
      title: 'I clienti non li perdi perché costi troppo. Li perdi perché rispondi tardi.',
      paras: [
        'Un potenziale cliente compila il modulo, scrive su WhatsApp o chiama. In quel momento sta decidendo. Se la risposta arriva il giorno dopo, nel frattempo ha già scritto ad altri due studi. La ricerca di Harvard Business Review su oltre duemila aziende è brutale: tempo medio di risposta 42 ore, e quasi un’azienda su quattro non risponde affatto [[hbr]].',
        'Poi ci sono i preventivi inviati e mai seguiti, e i contatti che si sono “raffreddati”. Non sono persi: nessuno li ha ricontattati nel modo giusto.',
        '**La lead generation non è un software, è una strategia:** chi è il cliente ideale, cosa gli si risponde, quando si insiste e quando ci si ferma. Ovia la disegna con te, la mette per iscritto e poi la fa eseguire al sistema, ogni giorno, senza eccezioni.',
      ],
    },
    pillars: {
      strategia: 'Cliente ideale, criteri di qualifica, sequenze di follow-up, messaggi per ogni fase e regole di stop. Prima definiamo come vendi, poi lo automatizziamo.',
      sicurezza: 'Consensi e basi giuridiche GDPR rispettati, contatti che dicono “no” esclusi per sempre, nessuna lista comprata. Proteggere la reputazione dello studio vale più di un lead in più.',
      ai: 'L’AI risponde, qualifica e personalizza i messaggi dentro le tue regole. Le trattative vere restano tue.',
    },
    flow: [
      { t: 'Contatto', h: 'Arriva un nuovo contatto', p: 'Dal sito, dai social, da WhatsApp, da un modulo o da una chiamata persa: tutto confluisce in un unico punto.' },
      { t: 'Risposta', h: 'Risposta in minuti, anche la sera', p: 'Il contatto riceve subito una risposta personalizzata e pertinente alla sua richiesta, non un messaggio generico.' },
      { t: 'Qualifica', h: 'Capisce chi è pronto e chi no', p: 'Con poche domande mirate il sistema capisce esigenza, urgenza e compatibilità con i tuoi servizi. Chi è in target prenota direttamente una chiamata.' },
      { t: 'Follow-up', h: 'Ogni preventivo seguito fino a una decisione', p: 'I preventivi inviati vengono seguiti con una sequenza precisa: valore, aggiornamento, chiusura esplicita. Senza insistenza, senza dimenticanze.' },
      { t: 'Riattiva', h: 'Il database smette di dormire', p: 'I contatti freddi ricevono proposte mirate nel momento giusto. Chi ha detto no resta escluso.', human: 'Le trattative e le decisioni restano sempre a te' },
    ],
    calc: {
      title: 'Quanto fatturato ti costa rispondere tardi',
      intro: 'Stima volutamente prudente: consideriamo un miglioramento di conversione molto inferiore a quello misurato da HBR e MIT.',
      inputs: [
        { name: 'lead', label: 'Nuovi contatti al mese', min: 5, max: 300, step: 5, value: 30 },
        { name: 'conv', label: 'Quanti diventano clienti oggi', min: 1, max: 50, step: 1, value: 12, suffix: '%' },
        { name: 'ore', label: 'Tempo medio di prima risposta', min: .1, max: 48, step: .1, value: 6, suffix: ' ore' },
        { name: 'valore', label: 'Valore medio di un cliente nel primo anno', min: 200, max: 20000, step: 100, value: 2400, prefix: '€ ' },
      ],
    },
    before: ['I contatti ricevono risposta quando qualcuno ha tempo', 'Il modulo del sito finisce in una casella che nessuno guarda', 'I preventivi vengono inviati e poi dimenticati', 'Il follow-up dipende dalla memoria del singolo', 'Il database clienti è un cimitero di contatti', 'Non sai quanti contatti perdi, né perché'],
    after: ['Ogni contatto riceve risposta pertinente in pochi minuti', 'Tutti i canali confluiscono in un unico flusso', 'Ogni preventivo ha la sua sequenza fino a una decisione', 'Il follow-up segue regole scritte, non l’umore', 'I contatti freddi vengono riattivati con metodo', 'Tassi di risposta e conversione misurati ogni mese'],
    security: [
      { h: 'GDPR by design', p: 'Solo contatti con base giuridica valida, informative corrette, opt-out rispettati automaticamente.' },
      { h: 'Lista di esclusione permanente', p: 'Chi chiede di non essere ricontattato non rientra mai in una sequenza.' },
      { h: 'Trasparenza sull’AI', p: 'Quando risponde un assistente virtuale, il contatto lo sa: è corretto e dal 2 agosto 2026 l’AI Act lo richiede per chi interagisce con un sistema AI [[aiact]].' },
      { h: 'Reputazione protetta', p: 'Frequenze e toni limitati da regole: nessuna raffica di messaggi che brucia il nome dello studio.' },
    ],
    audiences: [
      { tab: 'Studi professionali', h: 'Nuovi clienti senza fare i commerciali', p: 'Per chi riceve richieste dal sito o dal passaparola ma non ha tempo di seguirle tutte.', items: ['Risposta immediata alle richieste di consulenza', 'Prenotazione diretta della prima call', 'Follow-up dei preventivi senza imbarazzo'] },
      { tab: 'Agenzie e consulenti', h: 'Pipeline sempre alimentata', p: 'Per chi vive di nuovi progetti e non può permettersi mesi vuoti.', items: ['Qualifica automatica dei contatti in entrata', 'Riattivazione di ex clienti e contatti freddi', 'Report mensile di conversione per canale'] },
      { tab: 'Attività locali', h: 'Richieste che diventano prenotazioni', p: 'Per chi riceve domande su WhatsApp e social a ogni ora.', items: ['Risposte immediate anche fuori orario', 'Prenotazione integrata', 'Richiamo dei clienti che non tornano da tempo'] },
      { tab: 'PMI B2B', h: 'Cicli di vendita lunghi, seguiti con metodo', p: 'Per chi ha trattative che durano mesi e passano da più persone.', items: ['Sequenze diverse per fase della trattativa', 'Contesto del cliente condiviso tra commerciali', 'Allerta sulle trattative ferme'] },
    ],
    timeline: [
      { when: 'Settimana 1', h: 'Process Check', p: 'Da dove arrivano i contatti, quanto aspettano, dove si fermano.' },
      { when: 'Settimana 2', h: 'Strategia scritta', p: 'Cliente ideale, qualifica, messaggi, sequenze e regole di stop.' },
      { when: 'Settimane 3–4', h: 'Risposta immediata', p: 'Attiviamo prima la risposta rapida sui canali principali.' },
      { when: 'Mese 2', h: 'Follow-up e riattivazione', p: 'Sequenze sui preventivi e sul database esistente, con misurazione.' },
    ],
    faq: [
      { q: 'È legale ricontattare contatti che non rispondono da mesi?', a: 'Dipende dalla base giuridica con cui hai raccolto il contatto e da cosa hai comunicato nell’informativa. Nel Process Check verifichiamo il database e riattiviamo solo i contatti per cui è corretto farlo. Chi ha negato il consenso resta escluso.' },
      { q: 'I miei potenziali clienti capiranno che risponde un’AI?', a: 'Sì, e deve essere così: la trasparenza è una regola Ovia e dal 2 agosto 2026 anche un obbligo dell’AI Act per chi interagisce con un sistema AI. L’obiettivo non è fingere di essere umani, ma rispondere subito e bene, poi passare a te.' },
      { q: 'Compri o generi liste di contatti?', a: 'No. Lavoriamo sui contatti che arrivano a te e sul database che hai già. Le liste comprate sono un rischio legale e reputazionale che non facciamo correre ai nostri clienti.' },
      { q: 'Quanto velocemente vedo risultati?', a: 'La risposta immediata produce effetti già nelle prime settimane, perché riduce i contatti persi. Follow-up e riattivazione richiedono un ciclo commerciale completo per essere misurati.' },
      { q: 'Si integra con il mio CRM?', a: 'Sì. Se usi già un CRM ci colleghiamo a quello; se non lo hai, Ovia CRM nasce proprio per lavorare insieme alla lead generation.' },
    ],
    sources: ['hbr', 'mit', 'aiact'],
  },

  /* ------------------------------------------------------------------ */
  'chiamate': {
    metaTitle: 'Ovia Chiamate — dalla telefonata all’azione, senza passaggi a mano | Ovia',
    metaDesc: 'Chiamate e riunioni trascritte, riassunte e trasformate in attività, scadenze e scheda cliente aggiornata. Con informativa, consenso e dati protetti.',
    claim: 'Registra la chiamata. Attività, scadenze e riepilogo si preparano da soli.',
    sub: 'Ovia Chiamate trasforma ciò che dici a voce in lavoro organizzato: ogni chiamata o riunione viene trascritta e riassunta, gli impegni diventano attività assegnate, le date diventano scadenze e il cliente riceve un riepilogo pronto per la tua approvazione.',
    stats: [
      { big: '41,3%', desc: 'delle imprese italiane che usano AI la usa già per il riconoscimento vocale', ref: 'istat' },
      { big: '43,2%', desc: 'delle imprese che rinunciano all’AI lo fa per timori su privacy e protezione dei dati', ref: 'istat' },
      { big: '0', desc: 'passaggi a mano tra la fine della telefonata e l’aggiornamento della scheda cliente' },
    ],
    problem: {
      title: 'Le decisioni più importanti si prendono al telefono. E lì restano.',
      paras: [
        'Una chiamata di venti minuti con un cliente genera spesso altri quindici minuti di lavoro: appunti da sistemare, attività da passare ai collaboratori, date da segnare, un’email di riepilogo da scrivere. Quando la giornata è piena, quel lavoro slitta, o non si fa. E ciò che è stato detto diventa “mi sembra che avessimo detto…”.',
        'Le tecnologie di trascrizione sono ormai mature e diffuse: in Italia il riconoscimento vocale è tra gli usi più comuni dell’AI nelle imprese [[istat]]. Ma registrare una chiamata con un cliente non è un gesto neutro: servono informativa, base giuridica, conservazione corretta. È il motivo per cui quasi metà delle imprese che rinunciano all’AI cita la privacy [[istat]].',
        '**Ovia parte da qui:** prima regole chiare su cosa si registra, come lo si comunica e dove restano i dati. Poi l’automazione che ti restituisce quei quindici minuti per ogni chiamata.',
      ],
    },
    pillars: {
      strategia: 'Quali chiamate registrare, cosa estrarre (impegni, date, importi, decisioni), chi riceve cosa e quando. Lo decidiamo sulla base del tuo flusso reale.',
      sicurezza: 'Informativa e consenso gestiti, registrazioni conservate per il tempo necessario, accesso limitato per cliente, dati mai usati per addestrare modelli esterni.',
      ai: 'L’AI trascrive, riassume ed estrae. Il riepilogo al cliente parte solo dopo la tua approvazione.',
    },
    flow: [
      { t: 'Registra', h: 'Chiamata o riunione, anche in presenza', p: 'Con il telefono, un registratore dedicato o la videochiamata: la registrazione parte con l’informativa corretta.' },
      { t: 'Trascrive', h: 'Trascrizione e sintesi in italiano', p: 'La conversazione diventa testo e poi sintesi strutturata: di cosa si è parlato, cosa si è deciso, cosa resta aperto.' },
      { t: 'Riconosce', h: 'Collega la chiamata al cliente giusto', p: 'Il sistema abbina la chiamata al cliente e alla pratica, così lo storico resta completo anche dopo mesi.' },
      { t: 'Organizza', h: 'Attività, scadenze e scheda aggiornata', p: '“Mi mandi il 730 entro il 15”: diventa un’attività assegnata con scadenza e un aggiornamento della scheda cliente.' },
      { t: 'Riepiloga', h: 'Email di riepilogo pronta da approvare', p: 'Il cliente riceve un riepilogo chiaro di quanto concordato. Tu lo rileggi e lo invii con un clic.', human: 'Nessun riepilogo parte senza il tuo ok' },
    ],
    calc: {
      title: 'Quanto vale il lavoro che fai dopo ogni chiamata',
      intro: 'Conta solo il lavoro post-chiamata: appunti, attività, date, email di riepilogo.',
      inputs: [
        { name: 'persone', label: 'Persone che fanno chiamate con clienti', min: 1, max: 30, step: 1, value: 3 },
        { name: 'chiamate', label: 'Chiamate o riunioni al giorno (a persona)', min: 1, max: 30, step: 1, value: 6 },
        { name: 'minuti', label: 'Minuti di lavoro dopo ogni chiamata', min: 2, max: 30, step: 1, value: 10, suffix: ' min' },
        { name: 'costo', label: 'Costo orario medio', min: 15, max: 150, step: 1, value: 40, prefix: '€ ' },
      ],
    },
    before: ['Gli appunti si prendono mentre si ascolta, male', 'Le attività vengono passate a voce ai collaboratori', 'Le date promesse finiscono su un foglio', 'L’email di riepilogo al cliente non la scrive nessuno', 'Dopo mesi nessuno ricorda cosa si era deciso', 'Registrazioni sparse su telefoni personali'],
    after: ['Sei concentrato sul cliente, non sugli appunti', 'Le attività arrivano già assegnate, con scadenza', 'Le date diventano scadenze nel calendario dello studio', 'Il riepilogo al cliente è pronto da approvare', 'Ogni decisione è ritrovabile con data e contesto', 'Registrazioni gestite, protette e conservate a norma'],
    security: [
      { h: 'Informativa e consenso', p: 'Impostiamo informative e modalità di avviso prima di registrare, come richiede la normativa privacy.' },
      { h: 'Conservazione limitata', p: 'Audio e trascrizioni conservati solo per il tempo necessario, con cancellazione programmata.' },
      { h: 'Nessun telefono personale', p: 'Le registrazioni non restano su dispositivi privati dei collaboratori, ma nel sistema dello studio.' },
      { h: 'Precedenti chiari', p: 'Il Garante si è già espresso sui sistemi di registrazione e trascrizione delle chiamate [[garante]]: progettiamo tenendone conto fin dall’inizio.' },
    ],
    audiences: [
      { tab: 'Commercialisti', h: 'Consulenze telefoniche che diventano pratiche', p: 'Ogni consulenza produce documenti da chiedere, scadenze e attività per i collaboratori.', items: ['Richieste documenti generate dalla chiamata', 'Scadenze fiscali promesse tracciate', 'Scheda cliente sempre aggiornata'] },
      { tab: 'Avvocati', h: 'Istruzioni del cliente, messe per iscritto', p: 'Per chi deve poter dimostrare cosa il cliente ha chiesto e quando.', items: ['Verbale sintetico di ogni colloquio', 'Riepilogo di conferma al cliente', 'Collegamento automatico al fascicolo'] },
      { tab: 'Consulenti', h: 'Riunioni che producono lavoro, non solo parole', p: 'Per chi passa la giornata in call con clienti e team.', items: ['Action item assegnati a fine call', 'Riepilogo pronto per il cliente', 'Storico delle decisioni per progetto'] },
      { tab: 'PMI e imprese', h: 'Commerciali e assistenza senza note perse', p: 'Per chi vende e assiste al telefono.', items: ['CRM aggiornato dopo ogni chiamata', 'Follow-up generati automaticamente', 'Qualità del servizio misurabile'] },
    ],
    timeline: [
      { when: 'Settimana 1', h: 'Process Check', p: 'Quante chiamate, di che tipo, cosa succede dopo.' },
      { when: 'Settimana 2', h: 'Regole privacy', p: 'Informativa, consenso, conservazione e accessi, messi per iscritto.' },
      { when: 'Settimane 3–4', h: 'Primo flusso', p: 'Trascrizione, sintesi e attività su un gruppo di utenti.' },
      { when: 'Mese 2', h: 'Estensione', p: 'Riepiloghi al cliente, scadenze e collegamento al CRM.' },
    ],
    faq: [
      { q: 'Posso registrare le chiamate con i clienti?', a: 'Sì, a condizioni precise: informare l’interlocutore, avere una finalità legittima, conservare i dati correttamente e limitare gli accessi. Nel progetto impostiamo informativa e procedure prima di attivare qualsiasi registrazione.' },
      { q: 'Serve un dispositivo particolare?', a: 'No. Funziona con telefonia, videochiamate e registratori dedicati (come Plaud) a seconda di come lavori. Scegliamo la soluzione più semplice per il tuo studio.' },
      { q: 'La trascrizione funziona bene in italiano, anche con termini tecnici?', a: 'Sì, i sistemi attuali gestiscono bene l’italiano; per terminologia specifica e nomi dei clienti aggiungiamo un vocabolario dedicato. La sintesi resta comunque sempre rileggibile e correggibile.' },
      { q: 'Dove finiscono le registrazioni?', a: 'Nel sistema dello studio, con accesso limitato per cliente, conservazione a scadenza e nessun uso per addestrare modelli esterni.' },
      { q: 'Il cliente riceve il riepilogo in automatico?', a: 'Solo dopo la tua approvazione. Il sistema lo prepara, tu decidi se e quando inviarlo.' },
    ],
    sources: ['istat', 'garante'],
  },

  /* ------------------------------------------------------------------ */
  'documenti': {
    metaTitle: 'Ovia Documenti — raccolta documenti e solleciti automatici per studi | Ovia',
    metaDesc: 'Il sistema sa quali documenti servono per ogni cliente e pratica: richiede, controlla, sollecita solo ciò che manca con storico tracciato. Il tuo staff smette di rincorrere i clienti.',
    claim: 'I documenti arrivano prima. Nessuno deve più rincorrere i clienti.',
    sub: 'Ovia Documenti conosce i documenti necessari per ogni cliente e ogni pratica. Invia le richieste, controlla cosa arriva, riconosce cosa manca e sollecita solo quello, con un tono che cresce gradualmente e lo storico di ogni invio. Genera anche i documenti ricorrenti a partire dai tuoi modelli.',
    stats: [
      { big: '70,8%', desc: 'delle imprese italiane che usano AI la usa per estrarre e analizzare testi e documenti: è l’uso più diffuso', ref: 'istat' },
      { big: '~20%', desc: 'della settimana lavorativa è speso a cercare informazioni e rincorrere chi le ha', ref: 'mckinsey' },
      { big: '100%', desc: 'dei solleciti tracciati: chi ha ricevuto cosa, quando, e cosa manca ancora' },
    ],
    problem: {
      title: 'Il lavoro dello studio si ferma su un documento che non arriva.',
      paras: [
        'La dichiarazione è pronta, manca solo una ricevuta. Il contratto è da registrare, manca il documento d’identità del secondo firmatario. Ogni pratica ferma genera telefonate, email, WhatsApp, promemoria su fogli di carta. Moltiplicato per centinaia di clienti, è un lavoro a tempo pieno che nessuno ha scelto di fare.',
        'E poi ci sono i documenti che si compilano sempre uguali: deleghe, contratti di locazione, lettere di incarico. Tempo qualificato speso a copiare dati da un file all’altro.',
        '**La soluzione non è “un’AI che legge i PDF”:** è una strategia documentale per tipo di pratica (cosa serve, entro quando, come si sollecita) messa in sicurezza e poi automatizzata. L’estrazione di testi e documenti è già l’uso più diffuso dell’AI nelle imprese italiane [[istat]]; la differenza la fa come la si governa.',
      ],
    },
    pillars: {
      strategia: 'Per ogni tipo di pratica definiamo checklist documentale, tempistiche, tono dei solleciti e soglie di escalation. È il cuore del valore: il resto esegue.',
      sicurezza: 'Documenti d’identità, redditi, dati sanitari: categorie delicate che trattiamo con canali di caricamento protetti, accessi per pratica e conservazione a norma.',
      ai: 'L’AI riconosce il documento arrivato, verifica che sia quello giusto e completo, estrae i dati e compila i modelli ricorrenti.',
    },
    flow: [
      { t: 'Checklist', h: 'Il sistema sa cosa serve', p: 'Per ogni cliente e pratica esiste la lista dei documenti necessari, con le scadenze. È la tua conoscenza, messa per iscritto una volta.' },
      { t: 'Richiesta', h: 'Parte la richiesta al cliente', p: 'Il cliente riceve una richiesta chiara, con l’elenco esatto e un canale sicuro per caricare i file.' },
      { t: 'Controllo', h: 'Riconosce cosa è arrivato', p: 'Ogni file ricevuto viene riconosciuto, verificato (è il documento giusto? è leggibile? è completo?) e spuntato dalla lista.' },
      { t: 'Sollecito', h: 'Sollecita solo ciò che manca', p: 'Il cliente riceve promemoria solo per i documenti mancanti, con un tono che cresce con il tempo. Nessuno sollecito inutile a chi ha già mandato tutto.' },
      { t: 'Genera', h: 'Compila i documenti ricorrenti', p: 'Deleghe, contratti, lettere: i dati estratti riempiono i tuoi modelli, pronti per la revisione.', human: 'Ogni documento generato passa dalla tua revisione' },
    ],
    calc: {
      title: 'Quanto costa rincorrere i documenti',
      intro: 'Conta solo il tempo di richieste, solleciti e controlli: non il lavoro professionale vero e proprio.',
      inputs: [
        { name: 'clienti', label: 'Clienti attivi', min: 20, max: 1500, step: 10, value: 250 },
        { name: 'solleciti', label: 'Richieste + solleciti per cliente all’anno', min: 1, max: 30, step: 1, value: 8 },
        { name: 'minuti', label: 'Minuti per ogni richiesta o sollecito (con controllo)', min: 2, max: 30, step: 1, value: 9, suffix: ' min' },
        { name: 'costo', label: 'Costo orario medio della segreteria', min: 12, max: 60, step: 1, value: 24, prefix: '€ ' },
      ],
    },
    before: ['I documenti mancanti si scoprono all’ultimo momento', 'I solleciti partono a mano, quando ci si ricorda', 'Il cliente riceve richieste confuse e ripetute', 'I file arrivano su WhatsApp, email e chiavette', 'I modelli ricorrenti si compilano copiando dati', 'Nessuno sa a che punto è ogni pratica'],
    after: ['Ogni pratica ha la sua checklist e le sue scadenze', 'I solleciti partono da soli, solo su ciò che manca', 'Il cliente riceve un elenco chiaro e un canale unico', 'I file arrivano in un canale sicuro e tracciato', 'I modelli si compilano con i dati estratti, da rivedere', 'Stato di ogni pratica visibile in tempo reale'],
    security: [
      { h: 'Canale di caricamento protetto', p: 'Basta documenti d’identità e redditi su WhatsApp: un canale dedicato, cifrato e tracciato.' },
      { h: 'Accessi per pratica', p: 'Ogni documento è visibile solo a chi lavora quella pratica.' },
      { h: 'Conservazione a norma', p: 'Tempi di conservazione e cancellazione definiti per tipo di documento.' },
      { h: 'Revisione umana', p: 'I documenti generati sono bozze da rivedere: la firma e la responsabilità restano del professionista, come vuole la Legge 132/2025 [[l132]].' },
    ],
    audiences: [
      { tab: 'Commercialisti', h: 'Dichiarazioni, bilanci, pratiche ricorrenti', p: 'Il caso d’uso più forte: centinaia di clienti, documenti ricorrenti, scadenze fisse.', items: ['Checklist per 730, Redditi, successioni, bilanci', 'Solleciti progressivi automatici', 'Deleghe e contratti compilati dai dati raccolti'] },
      { tab: 'Avvocati', h: 'Fascicoli completi prima dell’udienza', p: 'Documentazione del cliente raccolta e verificata con metodo.', items: ['Elenco documenti per tipo di causa', 'Verifica di completezza', 'Lettere di incarico da modello'] },
      { tab: 'Consulenti del lavoro', h: 'Documenti di aziende e dipendenti', p: 'Assunzioni, variazioni, cedolini: documenti che devono arrivare in tempo.', items: ['Raccolta documenti per nuove assunzioni', 'Promemoria periodici alle aziende clienti', 'Archivio ordinato per dipendente'] },
      { tab: 'Agenzie e immobiliari', h: 'Pratiche con molti firmatari', p: 'Compravendite e locazioni con documenti da più persone.', items: ['Checklist per ogni parte coinvolta', 'Contratti di locazione da modello', 'Stato pratica condiviso'] },
    ],
    timeline: [
      { when: 'Settimana 1', h: 'Process Check', p: 'Quali pratiche, quali documenti, dove si inceppa la raccolta.' },
      { when: 'Settimana 2', h: 'Checklist e toni', p: 'Checklist per tipo di pratica, tempi e testi dei solleciti.' },
      { when: 'Settimane 3–4', h: 'Primo ciclo', p: 'Una tipologia di pratica, clienti reali, solleciti automatici.' },
      { when: 'Mese 2', h: 'Modelli e estensione', p: 'Generazione documenti ricorrenti e altre tipologie di pratica.' },
    ],
    faq: [
      { q: 'I miei clienti non sono digitali. Funziona lo stesso?', a: 'Sì. Il cliente riceve un messaggio semplice con l’elenco dei documenti e un link per caricarli, anche da smartphone. Chi preferisce può continuare a portarli in studio: il sistema registra comunque cosa è arrivato.' },
      { q: 'Il sistema riconosce davvero se un documento è quello giusto?', a: 'Riconosce il tipo di documento e verifica elementi chiave (intestatario, periodo, leggibilità). I casi dubbi vengono segnalati a una persona invece di essere accettati in automatico.' },
      { q: 'Posso decidere io il tono dei solleciti?', a: 'Sì, è parte della strategia: definiamo insieme testi e progressione, dal promemoria cortese al sollecito formale.' },
      { q: 'Si integra con il mio gestionale?', a: 'Colleghiamo il gestionale che usi dove possibile; in alternativa Ovia Documenti lavora con Ovia CRM, che fa da cruscotto delle pratiche.' },
      { q: 'Posso generare i miei modelli di contratto?', a: 'Sì: partiamo dai tuoi modelli reali. Il sistema li compila con i dati raccolti e ti restituisce una bozza da rivedere e firmare.' },
    ],
    sources: ['istat', 'mckinsey', 'l132'],
  },

  /* ------------------------------------------------------------------ */
  'siti-web-ai': {
    metaTitle: 'Ovia Siti Web per le AI — farsi citare da ChatGPT, Gemini e Google AI | Ovia',
    metaDesc: 'Siti progettati per la ricerca AI (GEO): contenuti che ChatGPT, Gemini, Perplexity e le AI Overviews di Google possono capire e citare, SEO locale e assistente che prenota.',
    claim: 'I clienti non cercano più solo su Google. Chiedono all’AI. Il tuo sito deve essere la risposta.',
    sub: 'Ovia Siti Web per le AI progetta siti che i motori di ricerca generativi capiscono e citano: struttura, contenuti e dati pensati per ChatGPT, Gemini, Perplexity e le AI Overviews di Google, oltre che per la SEO classica. Con un assistente che risponde e prenota al posto tuo.',
    stats: [
      { big: '−58%', desc: 'di click sul primo risultato Google quando compare un riassunto AI (AI Overview)', ref: 'ahrefs' },
      { big: '+40%', desc: 'di visibilità nelle risposte dei motori AI ottenibile ottimizzando i contenuti (GEO)', ref: 'geo' },
      { big: '24/7', desc: 'un assistente sul sito che risponde, qualifica e prenota anche quando lo studio è chiuso' },
    ],
    problem: {
      title: 'Essere primi su Google non basta più. Bisogna essere citati.',
      paras: [
        'Quando su Google compare un riassunto generato dall’AI, il primo risultato perde in media il 58% dei click: lo ha misurato Ahrefs su 300.000 parole chiave [[ahrefs]]. Nel frattempo, sempre più persone chiedono direttamente a ChatGPT o Gemini “quale commercialista a Treviso segue le startup?”. L’AI dà una risposta, non dieci link.',
        'La ricerca accademica dice che questa visibilità si può conquistare: i contenuti ottimizzati per i motori generativi (GEO) arrivano fino al 40% di visibilità in più nelle risposte [[geo]]. Ma non con trucchi: con contenuti chiari, autorevoli, strutturati e verificabili.',
        '**Attenzione alla scorciatoia:** riempire il sito di pagine generate in serie con l’AI è esattamente ciò che Google classifica come “scaled content abuse” e penalizza [[gspam]]. Serve una strategia editoriale, non una fabbrica di testi. È quello che costruiamo.',
      ],
    },
    pillars: {
      strategia: 'Partiamo dalle domande reali che i tuoi clienti fanno a Google e all’AI, e costruiamo un contenuto chiaro per ciascuna, distribuito dove il cliente cerca. È il metodo Search Everywhere di Ovia.',
      sicurezza: 'Sito veloce e protetto, moduli conformi al GDPR, nessun dato dei visitatori venduto o condiviso, assistente AI trasparente e con chiavi custodite lato server.',
      ai: 'L’AI aiuta a produrre e mantenere contenuti e a rispondere ai visitatori. La struttura, le fonti e il posizionamento li decidiamo noi con te.',
    },
    flow: [
      { t: 'Domande', h: 'Quali domande fanno i tuoi clienti', p: 'Analizziamo cosa cercano davvero su Google e cosa chiedono agli assistenti AI nel tuo settore e nella tua zona.' },
      { t: 'Struttura', h: 'Un sito che le macchine capiscono', p: 'Architettura chiara, dati strutturati (schema.org), pagine servizio e FAQ che rispondono in modo diretto e citabile.' },
      { t: 'Contenuti', h: 'Risposte autorevoli e verificabili', p: 'Contenuti con dati, fonti e competenza reale: ciò che i motori generativi premiano quando scelgono chi citare.' },
      { t: 'Assistente', h: 'Chi arriva trova subito risposta', p: 'Un assistente sul sito risponde alle domande, qualifica il contatto e prenota la consulenza nel tuo calendario.' },
      { t: 'Misura', h: 'Presenza su Google e sulle AI, misurata', p: 'Monitoriamo posizionamento, citazioni nelle risposte AI e contatti generati, e miglioriamo dove rende di più.', human: 'Ogni contenuto è rivisto da una persona' },
    ],
    calc: {
      title: 'Quanti contatti rischi di perdere con la ricerca AI',
      intro: 'Stima basata sul −58% di click misurato da Ahrefs quando compare una risposta AI.',
      inputs: [
        { name: 'visite', label: 'Visite organiche al mese sul tuo sito', min: 100, max: 20000, step: 100, value: 1200 },
        { name: 'quota', label: 'Quota di ricerche dove compare una risposta AI', min: 5, max: 80, step: 5, value: 35, suffix: '%', hint: 'Varia molto per settore: le domande informative ne hanno di più.' },
        { name: 'conv', label: 'Visitatori che ti contattano', min: .5, max: 10, step: .5, value: 2, suffix: '%' },
        { name: 'chiusura', label: 'Contatti che diventano clienti', min: 5, max: 60, step: 5, value: 20, suffix: '%' },
        { name: 'valore', label: 'Valore medio di un cliente', min: 200, max: 20000, step: 100, value: 1800, prefix: '€ ' },
      ],
    },
    before: ['Il sito è una brochure che nessuno aggiorna', 'Esisti su Google ma non nelle risposte di ChatGPT', 'Le pagine parlano di te, non delle domande dei clienti', 'Nessun dato strutturato per i motori di ricerca', 'Chi visita il sito la sera non trova nessuno', 'Non sai da dove arrivano i contatti'],
    after: ['Il sito risponde alle domande reali dei clienti', 'Sei tra le fonti che l’AI cita nella tua nicchia', 'Ogni servizio ha la sua pagina chiara e citabile', 'Dati strutturati e FAQ leggibili dalle macchine', 'Un assistente risponde e prenota a ogni ora', 'Contatti e citazioni misurati ogni mese'],
    security: [
      { h: 'Chiavi AI mai nel browser', p: 'L’assistente del sito passa da un backend protetto: nessuna chiave esposta a chi ispeziona la pagina.' },
      { h: 'GDPR e cookie', p: 'Moduli con informativa, cookie tecnici di default, consenso gestito correttamente.' },
      { h: 'Trasparenza', p: 'L’assistente si presenta come AI: fiducia del visitatore e conformità all’AI Act [[aiact]].' },
      { h: 'Contenuti a norma Google', p: 'Niente pagine generate in serie: contenuti utili e rivisti, come chiedono le linee guida di Google sui contenuti AI [[gai]].' },
    ],
    audiences: [
      { tab: 'Studi professionali', h: 'Farsi scegliere prima della prima telefonata', p: 'Commercialisti, avvocati e consulenti che vogliono essere la risposta alle domande del loro territorio.', items: ['Pagine per ogni servizio e specializzazione', 'FAQ citabili dai motori AI', 'Prenotazione consulenze integrata'], link: { href: '/siti-studi-professionali.html', label: 'Vedi l’offerta per studi professionali →' } },
      { tab: 'Attività locali', h: 'Tavoli, appuntamenti e prenotazioni', p: 'Ristoranti, centri e negozi che vogliono comparire quando qualcuno chiede “dove…” all’AI.', items: ['SEO locale e scheda Google curata', 'Prenotazione in 30 secondi', 'Assistente che risponde su orari, menu e disponibilità'], link: { href: '/siti-attivita-locali.html', label: 'Vedi l’offerta per attività locali →' } },
      { tab: 'PMI e B2B', h: 'Diventare la fonte del proprio settore', p: 'Aziende che vendono competenza e devono essere trovate dai buyer che fanno ricerca con l’AI.', items: ['Contenuti tecnici autorevoli', 'Schede prodotto strutturate', 'Lead qualificati dall’assistente'] },
    ],
    timeline: [
      { when: 'Settimana 1', h: 'Process Check', p: 'Come ti trovano oggi (e come non ti trovano) su Google e sulle AI.' },
      { when: 'Settimana 2', h: 'Strategia contenuti', p: 'Domande prioritarie, architettura del sito, messaggi.' },
      { when: 'Settimane 3–4', h: 'Demo e sviluppo', p: 'Anteprima reale con i tuoi contenuti, poi messa online.' },
      { when: 'Ogni mese', h: 'Care e crescita', p: 'Nuovi contenuti, monitoraggio citazioni AI, ottimizzazione.' },
    ],
    faq: [
      { q: 'Cos’è la GEO e in cosa è diversa dalla SEO?', a: 'La SEO lavora per posizionarti tra i risultati di Google; la GEO (Generative Engine Optimization) lavora per farti scegliere e citare come fonte dalle risposte generate dall’AI. Le basi sono comuni (contenuti utili, sito tecnico solido), ma la GEO premia in particolare risposte chiare, dati, citazioni e struttura.' },
      { q: 'Potete garantire che ChatGPT mi citi?', a: 'No, e diffida di chi lo garantisce: nessuno controlla i motori AI. Possiamo aumentare in modo misurabile la probabilità di essere citato, con metodi documentati dalla ricerca, e misurare i risultati.' },
      { q: 'Scrivete i contenuti con l’AI?', a: 'L’AI aiuta nella produzione, ma ogni contenuto nasce da una strategia, contiene la tua competenza reale ed è rivisto da una persona. Pubblicare testi generati in serie senza valore è ciò che Google penalizza.' },
      { q: 'Ho già un sito. Devo rifarlo da zero?', a: 'Non sempre. Dopo il Process Check ti diciamo con franchezza se conviene intervenire sul sito esistente o rifarlo.' },
      { q: 'Quanto tempo serve per vedere risultati?', a: 'Il sito nuovo è online in poche settimane; posizionamento e citazioni crescono nei mesi, con contenuti costanti. Per questo lavoriamo con un canone mensile di cura e crescita.' },
    ],
    sources: ['ahrefs', 'geo', 'gspam', 'gai', 'aiact'],
  },

  /* ------------------------------------------------------------------ */
  'crm': {
    metaTitle: 'Ovia CRM — il CRM su misura che lavora da solo, per studi e PMI | Ovia',
    metaDesc: 'Dashboard operativa, scadenze ricorrenti, solleciti automatici, email categorizzate e documenti generati. Un CRM costruito sul tuo modo di lavorare, anche on-premise.',
    claim: 'Clienti, pratiche e scadenze in un’unica dashboard. Che si aggiorna da sola.',
    sub: 'Ovia CRM è il cruscotto operativo del tuo studio o della tua azienda, costruito sul tuo modo di lavorare: clienti, pratiche, scadenze ricorrenti, attività del team, solleciti e documenti. Si alimenta dalle email, dalle chiamate e dai documenti, così nessuno deve “aggiornare il CRM”.',
    stats: [
      { big: '28%', desc: 'del tempo di chi vende va davvero in vendita: il resto in gestione trattative e inserimento dati', ref: 'salesforce' },
      { big: '15,7%', desc: 'delle PMI italiane usa l’AI; il freno principale è la mancanza di competenze, per quasi il 60%', ref: 'istat' },
      { big: '1', desc: 'unica vista su clienti, pratiche, scadenze e carichi del team' },
    ],
    problem: {
      title: 'Il CRM che nessuno aggiorna è solo un altro foglio Excel.',
      paras: [
        'Quasi ogni azienda ha provato un CRM. Quasi sempre finisce allo stesso modo: i primi mesi tutti lo compilano, poi diventa un obbligo in più, poi torna il foglio Excel, il foglio di carta sulla scrivania, la memoria del titolare. Chi vende passa meno di un terzo del tempo a vendere e il resto tra gestione e inserimento dati [[salesforce]].',
        'Il problema non è il software: è che il CRM standard ti chiede di adattarti a lui, e di alimentarlo a mano.',
        '**Ovia CRM ribalta la logica:** prima disegniamo il tuo processo (clienti, pratiche, scadenze, ruoli), poi costruiamo il CRM su quello e lo colleghiamo a email, chiamate e documenti perché si aggiorni da solo. E i dati restano dove decidi tu, anche on-premise.',
      ],
    },
    pillars: {
      strategia: 'Processo, stati delle pratiche, scadenze ricorrenti, ruoli e indicatori: il CRM è la fotografia del modo in cui vuoi che lo studio lavori.',
      sicurezza: 'Permessi per ruolo e per cliente, log di ogni modifica, backup, opzione on-premise per chi non vuole i dati dei clienti su cloud condivisi.',
      ai: 'L’AI alimenta il CRM da email, chiamate e documenti e segnala ritardi e rischi. Il cruscotto resta semplice e tuo.',
    },
    flow: [
      { t: 'Processo', h: 'Il CRM nasce dal tuo modo di lavorare', p: 'Stati, campi e scadenze ricalcano il tuo flusso reale, non un modello americano da adattare.' },
      { t: 'Alimenta', h: 'Si aggiorna da solo', p: 'Email categorizzate, chiamate riassunte, documenti arrivati: tutto finisce nella scheda cliente senza inserimenti manuali.' },
      { t: 'Scadenze', h: 'Ricorrenze e solleciti automatici', p: 'Scadenze periodiche generate in automatico, solleciti via email o WhatsApp, promemoria al team.' },
      { t: 'Team', h: 'Carichi e ritardi visibili', p: 'Chi fa cosa, cosa è in ritardo, quali pratiche sono a rischio: lo vedi prima che diventi un problema.' },
      { t: 'Controllo', h: 'Decidi con i numeri', p: 'Indicatori semplici su clienti, pratiche e tempi: la dashboard che il titolare guarda davvero.', human: 'Le comunicazioni sensibili partono solo con approvazione' },
    ],
    calc: {
      title: 'Quanto ti costa non avere un CRM che lavora da solo',
      intro: 'Tempo di aggiornamento manuale più opportunità dimenticate: due costi che non compaiono in bilancio.',
      inputs: [
        { name: 'persone', label: 'Persone che gestiscono clienti o pratiche', min: 1, max: 40, step: 1, value: 5 },
        { name: 'ore', label: 'Ore a settimana su fogli, aggiornamenti e ricerche (a persona)', min: 1, max: 20, step: .5, value: 4, suffix: ' h' },
        { name: 'costo', label: 'Costo orario medio', min: 15, max: 120, step: 1, value: 30, prefix: '€ ' },
        { name: 'opp', label: 'Opportunità o rinnovi dimenticati al mese', min: 0, max: 30, step: 1, value: 2 },
        { name: 'valore', label: 'Valore medio di un’opportunità', min: 100, max: 20000, step: 100, value: 1500, prefix: '€ ' },
      ],
    },
    before: ['Clienti e scadenze sparsi tra Excel, carta e memoria', 'Il CRM esiste ma nessuno lo aggiorna', 'Le scadenze ricorrenti si ricreano a mano ogni anno', 'Il titolare non sa chi è in ritardo su cosa', 'I dati dei clienti su strumenti cloud non controllati', 'Ogni report richiede una giornata di lavoro'],
    after: ['Un’unica vista su clienti, pratiche e scadenze', 'Il CRM si aggiorna da email, chiamate e documenti', 'Le ricorrenze si generano da sole', 'Carichi e ritardi del team visibili in tempo reale', 'Dati dove decidi tu, anche on-premise', 'Indicatori pronti, sempre aggiornati'],
    security: [
      { h: 'Permessi granulari', p: 'Ogni persona vede solo i clienti e le pratiche di cui si occupa.' },
      { h: 'Registro delle modifiche', p: 'Ogni modifica è tracciata: chi, cosa, quando.' },
      { h: 'On-premise o cloud dedicato', p: 'Scegli dove risiedono i dati. Per gli studi più riservati, installazione dedicata.' },
      { h: 'Backup e continuità', p: 'Backup automatici e procedure di ripristino definite fin dall’inizio.' },
    ],
    audiences: [
      { tab: 'Commercialisti', h: 'Scadenzario e pratiche sotto controllo', p: 'Per chi gestisce centinaia di clienti con adempimenti ricorrenti.', items: ['Scadenze fiscali ricorrenti per cliente', 'Solleciti documenti integrati', 'Help center AI per il team'] },
      { tab: 'Avvocati', h: 'Fascicoli, termini e attività', p: 'Per chi deve sapere in ogni momento lo stato di ogni pratica.', items: ['Stato fascicolo e termini', 'Attività per responsabile', 'Storico comunicazioni con il cliente'] },
      { tab: 'Agenzie e consulenti', h: 'Clienti, progetti e rinnovi', p: 'Per chi vive di contratti ricorrenti e progetti paralleli.', items: ['Pipeline commerciale collegata alla lead generation', 'Rinnovi e scadenze contrattuali', 'Carichi di lavoro del team'] },
      { tab: 'PMI e imprese', h: 'Vendite e operations nello stesso posto', p: 'Per chi vuole smettere di rincorrere informazioni tra reparti.', items: ['Scheda cliente condivisa', 'Ordini, richieste e follow-up', 'Dashboard per la direzione'] },
    ],
    timeline: [
      { when: 'Settimana 1', h: 'Process Check', p: 'Il tuo processo reale, dalle richieste alle scadenze.' },
      { when: 'Settimane 2–3', h: 'Disegno e costruzione', p: 'Stati, campi, ruoli e ricorrenze costruiti sul tuo flusso.' },
      { when: 'Settimana 4', h: 'Migrazione e avvio', p: 'Importiamo i dati esistenti e formiamo il team.' },
      { when: 'Mese 2', h: 'Automazioni', p: 'Colleghiamo email, chiamate e documenti perché si aggiorni da solo.' },
    ],
    faq: [
      { q: 'Perché non usare un CRM già pronto?', a: 'Puoi, e per molti va benissimo. Ovia CRM ha senso quando il tuo processo è specifico (come quello di uno studio professionale), quando vuoi che si aggiorni da solo da email e chiamate, o quando vuoi i dati on-premise.' },
      { q: 'Posso importare i dati che ho già?', a: 'Sì: importiamo fogli Excel, esportazioni del gestionale e rubriche, e li normalizziamo prima dell’avvio.' },
      { q: 'Serve formazione?', a: 'Poca, perché il CRM ricalca il tuo modo di lavorare. Facciamo comunque sessioni di avvio con il team e il canone include ore di supporto umano ogni mese.' },
      { q: 'I dati dei clienti sono al sicuro?', a: 'Permessi per ruolo, registro delle modifiche, backup e possibilità di installazione on-premise. I dati non vengono mai usati per addestrare modelli esterni.' },
      { q: 'Si integra con gli altri servizi Ovia?', a: 'È pensato per questo: Inbox, Chiamate, Documenti e Lead Generation alimentano il CRM, e il Second Brain lo rende interrogabile.' },
    ],
    sources: ['salesforce', 'istat'],
  },
};
