export interface NewsItem {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  imageUrl: string;
}

export interface AlbumItem {
  id: string;
  title: string;
  year: string;
  description: string;
  details: string;
  coverUrl: string;
  tracks: string[];
}

export interface TourDate {
  id: string;
  day: string;
  month: string;
  city: string;
  venue: string;
  status: 'Disponibile' | 'Sold Out' | 'Ultimi Biglietti';
  ticketUrl: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  category: 'Live' | 'Studio' | 'Ritratti' | 'Premi';
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answerIndex: number;
  trivia: string;
}

export const newsData: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Laura Pausini riceve il Global Icon Award 2024',
    date: '18 Maggio 2024',
    excerpt: 'Un prestigioso riconoscimento internazionale celebra i 30 anni di straordinaria carriera e impatto globale della cantante italiana.',
    content: 'Laura Pausini è stata insignita del prestigioso "Global Icon Award" durante l\'ultima cerimonia dei premi musicali internazionali a Miami. Il premio riconosce il suo straordinario contributo alla diffusione della musica pop in lingua italiana e spagnola nel mondo. Con oltre 75 milioni di copie vendute, un Grammy Award, quattro Latin Grammy e una nomination agli Oscar, Laura continua a essere la regina indiscussa della musica italiana nel panorama mondiale. Durante la premiazione ha ringraziato calorosamente i fan di tutto il mondo che la supportano fedelmente fin dagli esordi nel 1993.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Laura_Pausini_%40_Wind_Music_Awards_2016_04.jpg'
  },
  {
    id: 'news-2',
    title: 'Nuovo progetto in studio: la musica continua',
    date: '3 Maggio 2024',
    excerpt: 'Laura rivela di essere tornata in sala di registrazione con produttori di fama mondiale per registrare nuove canzoni.',
    content: 'Dopo il successo planetario dell\'album "Anime Parallele", Laura Pausini ha sorpreso i suoi fan pubblicando sui social una foto che la ritrae in studio a Milano, cuffie alle orecchie e microfono davanti. L\'artista ha rivelato di essere al lavoro su nuova musica: "Non riesco a stare ferma, le mie storie nascono così, cantando le vostre vite insieme alla mia. Ci sono nuove canzoni che scalpitano". Il progetto vedrà la collaborazione di noti parolieri italiani e produttori internazionali, promettendo un sound moderno ma fedele alla straordinaria potenza vocale che la caratterizza.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Laura_Pausini_2009.04.30_021.jpg'
  },
  {
    id: 'news-3',
    title: 'Laura Pausini torna live in Italia nel 2025',
    date: '20 Aprile 2024',
    excerpt: 'Annunciate le prime tappe del nuovo tour negli stadi e arene. Scopri i dettagli delle date e la prevendita per il fan club.',
    content: 'Il legame tra Laura Pausini e i suoi concerti live è indissolubile. A grande richiesta, lo staff ha annunciato il prolungamento del World Tour anche per l\'inizio del 2025 con tappe imperdibili nelle principali città italiane. Laura porterà sul palco una scenografia maestosa e una scaletta ricca dei suoi più grandi successi storici uniti ai brani del suo ultimo album. I membri del Fan Club avranno accesso a una prevendita esclusiva 24 ore prima dell\'apertura generale dei biglietti. Nota bene: Queste informazioni ed eventuali aggiornamenti devono essere sempre verificati sui canali ufficiali di biglietteria autorizzati.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Laura_Pausini_Inedito_World_Tour.jpg'
  },
  {
    id: 'news-4',
    title: 'Celebrazione dei 30 anni di "La Solitudine"',
    date: '10 Febbraio 2024',
    excerpt: 'La canzone che ha cambiato la vita di Laura e la storia della musica pop compie 30 anni. Una retrospettiva speciale.',
    content: 'Era il febbraio del 1993 quando una giovanissima Laura Pausini saliva sul palco di Sanremo Giovani interpretando "La Solitudine". Da quel momento nulla sarebbe stato più lo stesso. La canzone vinse la sezione novità e divenne istantaneamente un successo planetario in tutta Europa e in America Latina. Per celebrare questo anniversario memorabile, Laura ha condiviso con i fan riflessioni emozionanti e registrazioni storiche inedite, ricordando quel giorno magico in cui la sua voce ha iniziato a unire milioni di anime.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Laura_Pausini_viveme.jpg'
  },
  {
    id: 'news-5',
    title: 'Incontro speciale con i Fan a Solarolo',
    date: '15 Dicembre 2023',
    excerpt: 'Un raduno speciale carico di commozione e musica nella sua amata terra d\'origine in Emilia-Romagna.',
    content: 'Laura Pausini non dimentica mai le sue radici. Si è tenuto a Solarolo, il paese in cui è cresciuta, un esclusivo raduno non ufficiale dei fan per raccogliere fondi in favore delle comunità colpite dalle alluvioni. Laura ha cantato in acustico, parlato direttamente con i partecipanti, firmato autografi e condiviso ricordi d\'infanzia, dimostrando ancora una volta la sua umiltà e la generosità che la rendono così speciale agli occhi di tutti i suoi sostenitori.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Laura_Pausini_2009.04.30_034.jpg'
  }
];

export const albumsData: AlbumItem[] = [
  {
    id: 'album-1',
    title: 'Anime Parallele',
    year: '2023',
    description: 'Il nuovo album di inediti che racconta emozioni, vita e nuove prospettive di anime che corrono parallele.',
    details: 'Rilasciato nel mese di ottobre 2023, "Anime Parallele" (Almas Paralelas in spagnolo) è il quattordicesimo album in studio dell\'artista. Il concept celebra l\'individualità e la diversità delle persone, descritte como anime che camminano su binari paralleli ma condividono lo stesso cielo ed emozioni universali. Registrato in diversi studi internazionali, l\'album vanta sonorità pop d\'avanguardia con ballate potenti e pezzi ritmati moderni.',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Laura_Pausini_2009.04.30_016.jpg',
    tracks: ['Durare', 'Zero', 'Un buon inizio', 'Flashback', 'Dimora naturale', 'Più che un\'idea', 'Anime parallele', 'Cos\'è']
  },
  {
    id: 'album-2',
    title: 'Fatti sentire',
    year: '2018',
    description: 'Un disco energico incentrato sul coraggio di mostrarsi per ciò che si è e far sentire la propria voce.',
    details: '"Fatti sentire" (Hazte sentir) ha trionfato ai Latin Grammy Awards del 2018 come Miglior Album Pop Tradizionale, rendendo Laura la prima artista italiana a vincere quattro premi della prestigiosa Academy latina. L\'album esplora diversi stili musicali, tra cui pop classico, influenze reggaeton e arrangiamenti orchestrali intensi, guidati dal singolo di lancio "Non è detto".',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Laura_Pausini_2009.04.30_023.jpg',
    tracks: ['Non è detto', 'Nuevo', 'La soluzione', 'Le due finestre', 'Fatti sentire', 'Un progetto di vita in comune', 'Il coraggio di andare']
  },
  {
    id: 'album-3',
    title: 'Simili',
    year: '2015',
    description: 'Una splendida celebrazione delle somiglianze umane: siamo tutti diversi, eppure così incredibilmente simili.',
    details: '"Simili" è un album solare e ottimista. Contiene importanti collaborazioni d\'autore con artisti del calibro di Jovanotti, Giuliano Sangiorgi (Negramaro) e Biagio Antonacci. La title track "Simili" è diventata una vera e propria colonna sonora generazionale, accompagnata da video musicali iconici e da un trionfale tour negli stadi italiani.',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Laura_Pausini_2009.04.30_032.jpg',
    tracks: ['Lato destro del cuore', 'Simili', '200 note', 'Innamorata', 'Nella porta accanto', 'Chiedilo al cielo', 'Sono solo nuvole']
  },
  {
    id: 'album-4',
    title: 'Inedito',
    year: '2011',
    description: 'Nato dopo un periodo di pausa dalle scene, un album intimo e appassionato che riscopre il piacere di cantare.',
    details: '"Inedito" rappresenta il ritorno di Laura Pausini dopo due anni di voluto silenzio per dedicarsi alla famiglia e alla sua terra. Il disco si presenta estremamente curato, ricco di ballate struggenti e rock-pop grintoso, trainato dai singoli di grandissimo impatto radiofonico "Benvenuto" e "Bastava".',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Laura_Pausini_19_-_Bercy_-_Avril_2012_%286930185910%29.jpg',
    tracks: ['Benvenuto', 'Bastava', 'Inedito', 'Nel primo sguardo', 'Le cose che non mi aspetto', 'Mi tengo', 'Celeste']
  },
  {
    id: 'album-5',
    title: 'Primavera in anticipo',
    year: '2008',
    description: 'Un capolavoro pop-rock impreziosito dal celebre e famosissimo duetto internazionale con James Blunt.',
    details: 'Questo album ha debuttato direttamente alla posizione numero uno delle classifiche italiane, rimanendovi per nove settimane consecutive. Ha vinto il Latin Grammy come Miglior Album Pop Femminile nel 2009. La title track "Primavera in anticipo" cantata insieme al cantautore britannico James Blunt è stata una hit mondiale scalando le vette di tutte le radio europee.',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Laura_Pausini_2009.04.30_008.jpg',
    tracks: ['Invece no', 'Primavera in anticipo (duet with James Blunt)', 'Bellissimo così', 'Un fatto ovvio', 'Sorella terra', 'Mille braccia']
  },
  {
    id: 'album-6',
    title: 'Io canto',
    year: '2006',
    description: 'Un tributo d\'amore alla grande canzone d\'autore italiana con straordinarie reinterpretazioni dei classici.',
    details: '"Io canto" è composto interamente da cover di celebri brani che hanno formato Laura dal punto di vista artistico ed emozionale prima del successo. Include capolavori scritti da Riccardo Cocciante, Lucio Battisti, Zucchero, Vasco Rossi e molti altri, riarrangiati con il tocco inconfondibile di Laura Pausini e arricchiti da prestigiosi duetti con Tiziano Ferro, Juanes e Johnny Hallyday.',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Laura_Pausini_2009.04.30_036.jpg',
    tracks: ['Io canto', 'Due', 'Scrivimi', 'Il mio canto libero (feat. Juanes)', 'Spaccacuore', 'Non me lo so spiegare (feat. Tiziano Ferro)']
  },
  {
    id: 'album-7',
    title: 'Resta in ascolto',
    year: '2004',
    description: 'L\'album della consacrazione assoluta, vincitore del prestigioso Grammy Award nel 2006.',
    details: '"Resta in ascolto" (Escucha) ha segnato una svolta più rock e decisa nella discografia di Laura Pausini. Il disco affronta tematiche profonde, rabbia e speranza, scritte a seguito di una rottura personale. Grazie a questo straordinario capolavoro, Laura ha conquistato il Grammy Award a Los Angeles come Best Latin Pop Album, prima donna italiana nella storia a ricevere questo riconoscimento.',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Laura_Pausini_2009.04.30_061.jpg',
    tracks: ['Resta in ascolto', 'Vivimi', 'Come se non fosse stato mai amore', 'Benedetta passione', 'La prospettiva di me']
  },
  {
    id: 'album-8',
    title: 'Laura Pausini (Debutto)',
    year: '1993',
    description: 'L\'album d\'esordio omonimo che contiene la leggendaria hit "La solitudine".',
    details: 'Questo album ha segnato l\'inizio della leggenda. Contiene i primissimi successi scritti appositamente per lei e il brano vincitore di Sanremo, "La solitudine", che ha scalato le hit-parade di tutto il mondo. Un disco fresco, romantico e sincero che ha venduto milioni di copie, lanciando la giovanissima cantante romagnola nell\'olimpo della musica.',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Laura_Pausini_2009.04.30_019.jpg',
    tracks: ['La solitudine', 'Non c\'è', 'Mi rubi l\'anima (feat. Raf)', 'Perché non torna più', 'Gente', 'Tutt\'al più']
  }
];

export const tourDatesData: TourDate[] = [
  {
    id: 'tour-1',
    day: '20',
    month: 'DIC',
    city: 'Roma',
    venue: 'Palazzo dello Sport',
    status: 'Sold Out',
    ticketUrl: '#'
  },
  {
    id: 'tour-2',
    day: '22',
    month: 'DIC',
    city: 'Milano',
    venue: 'Unipol Forum',
    status: 'Ultimi Biglietti',
    ticketUrl: '#'
  },
  {
    id: 'tour-3',
    day: '28',
    month: 'DIC',
    city: 'Firenze',
    venue: 'Nelson Mandela Forum',
    status: 'Disponibile',
    ticketUrl: '#'
  },
  {
    id: 'tour-4',
    day: '30',
    month: 'DIC',
    city: 'Bologna',
    venue: 'Unipol Arena',
    status: 'Disponibile',
    ticketUrl: '#'
  },
  {
    id: 'tour-5',
    day: '15',
    month: 'GEN',
    city: 'Torino',
    venue: 'Inalpi Arena',
    status: 'Disponibile',
    ticketUrl: '#'
  },
  {
    id: 'tour-6',
    day: '18',
    month: 'GEN',
    city: 'Eboli',
    venue: 'PalaSele',
    status: 'Disponibile',
    ticketUrl: '#'
  }
];

export const galleryData: GalleryItem[] = [
  {
    id: 'gal-1',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Laura_Pausini_Inedito_World_Tour.jpg',
    caption: 'Laura si esibisce dal vivo durante una delle tappe del World Tour.',
    category: 'Live'
  },
  {
    id: 'gal-2',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Laura_Pausini_2009.04.30_056.jpg',
    caption: 'In studio di registrazione durante lo sviluppo di nuovi brani acustici.',
    category: 'Studio'
  },
  {
    id: 'gal-3',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Laura_Pausini_2009.04.30_001.jpg',
    caption: 'Un ritratto di Laura durante un incontro ravvicinato con i suoi fan.',
    category: 'Ritratti'
  },
  {
    id: 'gal-4',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Laura_Pausini_2009.04.30_026.jpg',
    caption: 'Laura in posa per la stampa internazionale al prestigioso Grammy Museum.',
    category: 'Premi'
  },
  {
    id: 'gal-5',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Laura_Pausini_2009.04.30_012.jpg',
    caption: 'Il calore del pubblico accoglie Laura durante il concerto di Siviglia, Spagna.',
    category: 'Live'
  },
  {
    id: 'gal-6',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Laura_Pausini_2009.04.30_039.jpg',
    caption: 'Un primo piano sul palco del Teatro Ariston, Festival di Sanremo.',
    category: 'Live'
  },
  {
    id: 'gal-7',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Laura_Pausini_03_-_Bercy_-_Avril_2012_%287076250493%29.jpg',
    caption: 'Spettacolare esibizione live di fronte a migliaia di spettatori a Milano.',
    category: 'Live'
  },
  {
    id: 'gal-8',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Laura_Pausini_2009.04.30_003.jpg',
    caption: 'Presentazione ufficiale del nuovo corso artistico e dell\'album Anime Parallele.',
    category: 'Ritratti'
  },
  {
    id: 'gal-9',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Laura_Pausini_Festival_de_Vi%C3%B1a_del_Mar_2014_01.jpg',
    caption: 'Esibizione trionfale di Laura al prestigioso Festival di Viña del Mar.',
    category: 'Live'
  },
  {
    id: 'gal-10',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Laura_Pausini_Festival_de_Vi%C3%B1a_del_Mar_2014_02.jpg',
    caption: 'Una splendida interpretazione dei suoi brani storici di fronte al grande pubblico cileno.',
    category: 'Live'
  },
  {
    id: 'gal-11',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Laura_Pausini_at_Radio_Italia_Live_2014_01.jpg',
    caption: 'Laura ringrazia calorosamente i fan radunati in Piazza del Duomo a Milano per il Radio Italia Live.',
    category: 'Live'
  },
  {
    id: 'gal-12',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Laura_Pausini_2009.04.30_025.jpg',
    caption: 'Ritratto ufficiale di Laura Pausini durante la promozione del tour europeo.',
    category: 'Ritratti'
  }
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'In quale anno Laura Pausini ha vinto il Festival di Sanremo nella sezione Novità?',
    options: ['1991', '1993', '1995', '1997'],
    answerIndex: 1,
    trivia: 'Laura ha vinto Sanremo Giovani nel 1993 cantando "La Solitudine" all\'età di soli 18 anni, dando il via a una folgorante carriera mondiale.'
  },
  {
    id: 2,
    question: 'Quale prestigioso premio cinematografico americano ha sfiorato nel 2021 ottenendo una nomination storica?',
    options: ['Golden Globe', 'Oscar', 'Grammy', 'Emmy'],
    answerIndex: 1,
    trivia: 'Ha ricevuto una storica nomination al Premio Oscar 2021 nella categoria "Miglior Canzone Originale" con "Io sì (Seen)", dopo aver già vinto il Golden Globe per lo stesso brano.'
  },
  {
    id: 3,
    question: 'Qual è stata la prima lingua straniera in cui Laura ha inciso un intero album di grandissimo successo?',
    options: ['Inglese', 'Spagnolo', 'Francese', 'Portoghese'],
    answerIndex: 1,
    trivia: 'Il suo primo album in lingua spagnola è uscito nel 1994 ed è diventato uno degli album stranieri più venduti nella storia della Spagna, rendendola un idolo assoluto in America Latina.'
  }
];
