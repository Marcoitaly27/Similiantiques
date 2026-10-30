const messages = {
  it: {
    skip: 'Vai al contenuto', headerNote: 'OGGETTI, ATTRAVERSO IL TEMPO',
    eyebrow: 'UN NUOVO SGUARDO SUL PASSATO', headline: 'Ogni oggetto ha\nuna somiglianza.',
    lead: 'Una forma, un dettaglio, un’eco lontana. Scopri le connessioni visive tra i tuoi oggetti e la collezione del Met.',
    privacy: 'La tua foto resta nel browser. Sempre.', illustration: 'Illustrazione, non un’opera del museo',
    start: 'Parti da un oggetto', formats: 'JPG, PNG, WEBP, AVIF · MAX 40 MB',
    drop: 'Trascina qui una foto', uploadHint: 'Un oggetto trovato. Un ricordo. Qualcosa che ti incuriosisce.',
    choose: 'Scegli una foto →', camera: 'Scatta una foto', details: 'IL DETTAGLIO FA LA DIFFERENZA',
    description: 'Aggiungi qualche parola (facoltativo)', descriptionPlaceholder: 'Es. gold, baroque, floral patterns',
    weight: 'Quanto conta il testo?', textHint: 'La foto guida la ricerca. Le parole aiutano a precisarla; CLIP comprende meglio l’inglese.',
    search: 'Trova somiglianze →', download: 'Preparazione del modello · il primo download può richiedere alcuni minuti',
    cache: 'Modello salvato nella cache del browser, se disponibile. Occorrono circa 600 MB e memoria sufficiente; su alcuni telefoni può non funzionare.',
    examples: 'Oppure, segui una curiosità', exampleNote: '6 FOTO DI ESEMPIO · IN ARRIVO',
    connections: 'Connessioni nella collezione', department: 'Dipartimento', period: 'Periodo', culture: 'Cultura', all: 'Tutti',
    scoreHint: 'La percentuale esprime la somiglianza CLIP, non una probabilità o una conferma di identità. Il confronto è esclusivamente visivo.',
    empty: 'Le connessioni iniziano con una foto. Scegli un oggetto e lasciati sorprendere.',
    honesty: 'Somiglianze, non certezze. Simili è uno strumento di ricerca visiva: non è una perizia, non verifica l’autenticità e non attribuisce alcun valore monetario.',
    attribution: 'Dati e immagini: The Metropolitan Museum of Art.',
    independent: 'Progetto indipendente, non affiliato a The Met. Le immagini del museo vengono caricate dai suoi server.',
    compareTitle: 'Uno sguardo, fianco a fianco', close: 'Chiudi', yourPhoto: 'La tua foto',
    compareHint: 'Confronta forma, colore e composizione. Questo modello non fornisce spiegazioni causali o prove di autenticità.',
    why: 'Mostrami perché →', museum: 'Vedi su The Met →', similarity: 'somiglianza visiva', untitled: 'Senza titolo',
    noImage: 'Immagine non disponibile', noMatches: 'Nessun risultato per questi filtri. Prova ad ampliarli.',
    selected: 'Foto pronta. Avvia la ricerca per trovare somiglianze.', working: 'Analisi locale della foto…',
    loadingData: 'Caricamento del catalogo…', results: 'risultati', cached: 'Download completato. Calcolo locale in corso…',
    offline: 'Sei offline. Il modello e il catalogo devono essere già in cache per funzionare senza internet.',
    modelError: 'Impossibile caricare o eseguire il modello. Controlla la connessione e la memoria disponibile, poi riprova. Alcuni browser mobili non hanno memoria sufficiente.',
    dataError: 'Catalogo non disponibile o non valido. Aggiungi public/data/objects.json ed embeddings.bin secondo il README. Nessun risultato simulato viene mostrato.',
    sizeError: 'Scegli una foto non vuota fino a 40 MB.', pixelsError: 'La foto supera 60 megapixel. Esporta una copia più piccola.',
    heicError: 'Foto HEIC/HEIF: esportala come JPEG o scegli “Più compatibile” nelle impostazioni della fotocamera iPhone. La conversione non viene inviata a servizi esterni.',
    formatError: 'Formato non supportato. Usa JPEG, PNG, WebP o AVIF.', decodeError: 'Impossibile aprire questa foto. Esporta una copia JPEG e riprova.',
    sampleError: 'La foto di esempio non è disponibile.', samplePlaceholder: 'Segnaposto',
    vessel: 'Una forma antica', ornament: 'Un piccolo ornamento', sculpture: 'Un volto nel tempo',
    textile: 'Trame e motivi', tableware: 'Oggetti quotidiani', detail: 'Un dettaglio prezioso',
  },
  en: {
    skip: 'Skip to content', headerNote: 'OBJECTS, ACROSS TIME', eyebrow: 'A FRESH LOOK AT THE PAST',
    headline: 'Every object has\na resemblance.', lead: 'A shape, a detail, a distant echo. Discover visual connections between your objects and The Met collection.',
    privacy: 'Your photo stays in your browser. Always.', illustration: 'Illustration, not a museum artwork',
    start: 'Start with an object', formats: 'JPG, PNG, WEBP, AVIF · MAX 40 MB', drop: 'Drop a photo here',
    uploadHint: 'A found object. A memory. Something that makes you curious.', choose: 'Choose a photo →', camera: 'Take a photo',
    details: 'IT’S ALL IN THE DETAILS', description: 'Add a few words (optional)', descriptionPlaceholder: 'E.g. gold, baroque, floral patterns',
    weight: 'How much should the text count?', textHint: 'The photo guides the search. Words help refine it; CLIP works best with English.',
    search: 'Find resemblances →', download: 'Preparing the model · the first download may take a few minutes',
    cache: 'The model is cached in your browser when available. About 600 MB and sufficient memory are needed; some phones may not support it.',
    examples: 'Or, follow your curiosity', exampleNote: '6 EXAMPLE PHOTOS · COMING SOON',
    connections: 'Connections in the collection', department: 'Department', period: 'Period', culture: 'Culture', all: 'All',
    scoreHint: 'The percentage is CLIP similarity, not a probability or identity confirmation. The comparison is purely visual.',
    empty: 'Connections begin with a photo. Choose an object and see what you discover.',
    honesty: 'Resemblances, not certainties. Simili is a visual-similarity search tool: it is not an appraisal or an authenticity check, and provides no monetary value.',
    attribution: 'Data and images: The Metropolitan Museum of Art.',
    independent: 'Independent project, not affiliated with The Met. Museum images load from its servers.',
    compareTitle: 'A closer look, side by side', close: 'Close', yourPhoto: 'Your photo',
    compareHint: 'Compare shape, color and composition. This model does not provide causal explanations or proof of authenticity.',
    why: 'Show me why →', museum: 'View on The Met →', similarity: 'visual similarity', untitled: 'Untitled',
    noImage: 'Image unavailable', noMatches: 'No matches for these filters. Try widening your selection.',
    selected: 'Photo ready. Start the search to find resemblances.', working: 'Analyzing your photo locally…',
    loadingData: 'Loading the collection…', results: 'results', cached: 'Download complete. Computing locally…',
    offline: 'You are offline. The model and collection must already be cached to work without internet.',
    modelError: 'Could not load or run the model. Check your connection and available memory, then retry. Some mobile browsers do not have enough memory.',
    dataError: 'Collection unavailable or invalid. Add public/data/objects.json and embeddings.bin following the README. No simulated results are shown.',
    sizeError: 'Choose a nonempty photo up to 40 MB.', pixelsError: 'This photo exceeds 60 megapixels. Export a smaller copy.',
    heicError: 'HEIC/HEIF photo: export as JPEG or choose “Most Compatible” in your iPhone camera settings. No external conversion service is used.',
    formatError: 'Unsupported format. Use JPEG, PNG, WebP or AVIF.', decodeError: 'Could not open this photo. Export a JPEG copy and retry.',
    sampleError: 'This example photo is unavailable.', samplePlaceholder: 'Placeholder',
    vessel: 'An ancient form', ornament: 'A small ornament', sculpture: 'A face through time',
    textile: 'Patterns and threads', tableware: 'Everyday objects', detail: 'A precious detail',
  },
};
let language;
try { language = localStorage.getItem('simili-language'); } catch { /* Storage can be blocked. */ }
if (!messages[language]) language = 'it';
export const t = key => messages[language][key] || key;
export const getLanguage = () => language;
export function applyLanguage() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-placeholder]').forEach(node => { node.placeholder = t(node.dataset.placeholder); });
  const toggle = document.querySelector('#language');
  toggle.textContent = language === 'it' ? 'EN →' : 'IT →';
  toggle.setAttribute('aria-label', language === 'it' ? 'Switch to English' : 'Passa all’italiano');
  document.querySelector('#file').setAttribute('aria-label', t('choose'));
  document.querySelector('#camera-file').setAttribute('aria-label', t('camera'));
}
export function toggleLanguage() {
  language = language === 'it' ? 'en' : 'it';
  try { localStorage.setItem('simili-language', language); } catch { /* Optional preference. */ }
  applyLanguage();
}
