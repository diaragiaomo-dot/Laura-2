/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent, useRef } from 'react';
import {
  Heart,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Music,
  BookOpen,
  Award,
  Mail,
  ArrowUp,
  CheckCircle,
  Check,
  ExternalLink,
  Lock,
  Star,
  Ticket,
  Gift,
  User,
  Info,
  Compass,
  HelpCircle
} from 'lucide-react';
import {
  newsData,
  albumsData,
  tourDatesData,
  galleryData,
  quizQuestions,
  NewsItem,
  AlbumItem,
  TourDate,
  GalleryItem
} from './data';

function getProxiedImageUrl(url: string | undefined): string {
  if (!url) return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
  
  const cleanUrl = url.trim();
  
  if (cleanUrl.startsWith('http')) {
    // Route through our custom server-side image proxy to completely avoid client-side 403 Forbidden hotlink blocks
    return `/api/proxy-image?url=${encodeURIComponent(cleanUrl)}`;
  }
  
  return cleanUrl;
}

function isNonItalianTrack(trackName: string | undefined, collectionName: string | undefined): boolean {
  if (!trackName) return true;
  const nameLower = trackName.toLowerCase().trim();
  const collLower = (collectionName || '').toLowerCase().trim();

  // Non-Italian indicators
  const forbiddenKeywords = [
    'spanish', 'español', 'espanol', 'versión', 'castellano', 
    'latino', 'mexico', 'spagnolo', 'spagnola', 'traducido',
    'portugues', 'português', 'portuguese', 'english version',
    'spanglish', 'french version'
  ];

  if (forbiddenKeywords.some(keyword => nameLower.includes(keyword) || collLower.includes(keyword))) {
    return true;
  }

  // Common Spanish titles of Laura Pausini's songs
  const spanishTitles = [
    'la soledad', 'se fue', 'amores extraños', 'las cosas que vives', 
    'emergencia de amor', 'en ausencia de ti', 'un error de los grandes', 
    'fíate de mí', 'volveré junto a ti', 'dos historias iguales', 
    'víveme', 'viveme', 'como si no nos hubiéramos amado', 'dispárame dispara', 
    'disparame dispara', 'en cambio no', 'primavera anticipada', 
    'con la música en la radio', 'bienvenido', 'limpio', 'sino a ti', 
    'lado derecho del corazón', 'nadie ha dicho', 'está allá', 
    'verdades a medias', 'caja', 'durar', 'frente a nosotros', 
    'almas paralelas', 'un buen inizio', 'en el primer mirar', 
    'el primer paso en la luna', 'nuestro amor de cada día', 
    'más allá de la superficie', 'hogar natural', 'la solución', 
    'nuevo', 'conversación con dios', 'he preguntado por ti', 
    'si no me quieres hoy', 'todas las vezes', 'todas las veces', 
    'dos pasos detrás de mí', 'un día sin ti', 'escucha a tu coração', 
    'escucha a tu corazon', 'surrender', 'disparame', 'gente (spanish',
    'genta (spanish', 'emergenza de amor', 'un amigo es asi', 'un amigo es así',
    'las cosas que vives', 'quiero decirte que te amo', 'escucha atento'
  ];

  if (spanishTitles.some(title => nameLower === title || nameLower.startsWith(title + ' ') || nameLower.includes('(' + title) || nameLower.includes('[' + title))) {
    return true;
  }

  // Detect Spanish-only prepositions / words
  if (nameLower.includes(' en ') && !nameLower.includes(' in ')) {
    return true;
  }
  
  if (nameLower.includes(' los ') || nameLower.includes(' las ') || nameLower.includes(' el ') && !nameLower.includes(' il ')) {
    const words = nameLower.split(/\s+/);
    if (words.includes('los') || words.includes('las') || (words.includes('el') && !words.includes('il') && !words.includes('del'))) {
      return true;
    }
  }

  return false;
}

export default function App() {
  // Navigation & Scroll states
  const [activeTab, setActiveTab] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Gallery & Lightbox states
  const [galleryFilter, setGalleryFilter] = useState<string>('Tutte');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAllGallery, setShowAllGallery] = useState<boolean>(false);

  // Modal details states
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumItem | null>(null);
  const [selectedTourDate, setSelectedTourDate] = useState<TourDate | null>(null);
  const [showAllAlbumsModal, setShowAllAlbumsModal] = useState<boolean>(false);
  const [showAllNewsModal, setShowAllNewsModal] = useState<boolean>(false);
  const [showBioModal, setShowBioModal] = useState<boolean>(false);
  const [showPolicyModal, setShowPolicyModal] = useState<string | null>(null); // 'privacy' | 'cookie' | null

  // Fan Club Interaction states
  const [newsletterForm, setNewsletterForm] = useState({
    name: '',
    email: '',
    privacy: false
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    privacy: false
  });
  const [newsletterSubmitted, setNewsletterSubmitted] = useState<boolean>(false);

  // Quiz Interaction states
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizRevealed, setQuizRevealed] = useState<Record<number, boolean>>({});
  const [quizScore, setQuizScore] = useState<number>(0);

  // Favorite Songs & Albums accumulator (Heart Count)
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const favoriteCount = Object.keys(favorites).filter(key => favorites[key]).length;

  // Local fallback tracks for Laura Pausini (10 hits with high quality iTunes previews and weserv proxied artwork)
  const LOCAL_FALLBACK_TRACKS = [
    {
      trackName: "La Solitudine",
      collectionName: "Laura Pausini",
      previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/0d/17/8d/0d178d46-4e5b-b9bc-ee33-e67c8708c903/m4a.aac.p.m4a",
      artworkUrl100: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Laura_Pausini_2009.04.30_019.jpg",
      year: "1993"
    },
    {
      trackName: "Strani Amori",
      collectionName: "Laura",
      previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/bf/25/7f/bf257f92-5ebf-8182-36c5-23cbb14798e1/m4a.aac.p.m4a",
      artworkUrl100: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Laura_Pausini_2009.04.30_021.jpg",
      year: "1994"
    },
    {
      trackName: "Invece No",
      collectionName: "Primavera in Anticipo",
      previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/ef/0f/f2/ef0ff269-e74c-47bc-fa66-7df09ff8b46e/m4a.aac.p.m4a",
      artworkUrl100: "https://upload.wikimedia.org/wikipedia/commons/4/49/Laura_Pausini_2009.04.30_008.jpg",
      year: "2008"
    },
    {
      trackName: "Vivimi",
      collectionName: "Resta in Ascolto",
      previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/ec/3b/b7/ec3bb7a0-0d04-4363-2287-21a4f009df9e/m4a.aac.p.m4a",
      artworkUrl100: "https://upload.wikimedia.org/wikipedia/commons/1/17/Laura_Pausini_2009.04.30_061.jpg",
      year: "2004"
    },
    {
      trackName: "Resta in Ascolto",
      collectionName: "Resta in Ascolto",
      previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/65/59/cc/6559ccb7-08b5-cd10-eb55-276063bb9ea6/m4a.aac.p.m4a",
      artworkUrl100: "https://upload.wikimedia.org/wikipedia/commons/1/17/Laura_Pausini_2009.04.30_061.jpg",
      year: "2004"
    },
    {
      trackName: "Tra Te e il Mare",
      collectionName: "Tra Te e il Mare",
      previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/ee/12/f2/ee12f277-2e11-e6fb-bc5e-8566a014a42b/m4a.aac.p.m4a",
      artworkUrl100: "https://upload.wikimedia.org/wikipedia/commons/4/42/Laura_Pausini_2009.04.30_056.jpg",
      year: "2000"
    },
    {
      trackName: "E Ritorno da Te",
      collectionName: "The Best of Laura Pausini",
      previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/fe/b4/0f/feb40f4e-2895-3ca3-e18e-4a640ee307d7/m4a.aac.p.m4a",
      artworkUrl100: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Laura_Pausini_2009.04.30_012.jpg",
      year: "2001"
    },
    {
      trackName: "Non C'è",
      collectionName: "Laura Pausini",
      previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/37/d1/8b/37d18bc3-3b10-09a8-e99d-16a8fa0034a7/m4a.aac.p.m4a",
      artworkUrl100: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Laura_Pausini_2009.04.30_019.jpg",
      year: "1993"
    },
    {
      trackName: "Primavera in Anticipo",
      collectionName: "Primavera in Anticipo",
      previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/0f/59/3a/0f593ad7-827d-94cb-5b07-6f8df73a901f/m4a.aac.p.m4a",
      artworkUrl100: "https://upload.wikimedia.org/wikipedia/commons/4/49/Laura_Pausini_2009.04.30_008.jpg",
      year: "2008"
    },
    {
      trackName: "Durare",
      collectionName: "Anime Parallele",
      previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/34/00/69/3400693a-3f41-f09b-6b83-e17f9b00b1cb/m4a.aac.p.m4a",
      artworkUrl100: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Laura_Pausini_2009.04.30_016.jpg",
      year: "2023"
    }
  ];

  // Audio Player states
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [loadingAudio, setLoadingAudio] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load and fetch live tracks from iTunes or load fallbacks
  useEffect(() => {
    setLoadingAudio(true);
    fetch('https://itunes.apple.com/search?term=laura+pausini&limit=80&media=music&entity=musicTrack&country=it')
      .then(res => res.json())
      .then(data => {
        if (data && data.results && data.results.length >= 5) {
          const uniqueTracks: any[] = [];
          const trackNames = new Set();
          
          data.results.forEach((item: any) => {
            const normalized = item.trackName.toLowerCase().trim();
            // Filter out Spanish versions/translations to keep songs purely in Italian
            if (isNonItalianTrack(item.trackName, item.collectionName)) {
              return;
            }
            if (!trackNames.has(normalized) && uniqueTracks.length < 10 && item.previewUrl) {
              trackNames.add(normalized);
              uniqueTracks.push({
                trackName: item.trackName,
                collectionName: item.collectionName || 'Album',
                previewUrl: item.previewUrl,
                artworkUrl100: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '400x400bb') : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500',
                year: item.releaseDate ? new Date(item.releaseDate).getFullYear().toString() : 'N/D'
              });
            }
          });
          
          if (uniqueTracks.length >= 10) {
            setAudioTracks(uniqueTracks);
          } else {
            const merged = [...uniqueTracks];
            LOCAL_FALLBACK_TRACKS.forEach(fb => {
              if (merged.length < 10 && !merged.some(m => m.trackName.toLowerCase().trim() === fb.trackName.toLowerCase().trim())) {
                merged.push(fb);
              }
            });
            setAudioTracks(merged.slice(0, 10));
          }
        } else {
          setAudioTracks(LOCAL_FALLBACK_TRACKS);
        }
        setLoadingAudio(false);
      })
      .catch(err => {
        console.error('iTunes API search failed, using high-quality local fallbacks:', err);
        setAudioTracks(LOCAL_FALLBACK_TRACKS);
        setLoadingAudio(false);
      });
  }, []);

  // Handle Play / Pause / Selection
  const handlePlayTrack = (index: number) => {
    if (audioRef.current) {
      if (currentTrackIndex === index) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(err => console.log('Audio playback failed:', err));
        }
      } else {
        audioRef.current.pause();
        setCurrentTrackIndex(index);
        setPlaybackTime(0);
        setIsPlaying(false);
        
        setTimeout(() => {
          if (audioRef.current && audioTracks[index]) {
            audioRef.current.src = audioTracks[index].previewUrl;
            audioRef.current.load();
            audioRef.current.play()
              .then(() => setIsPlaying(true))
              .catch(err => console.log('Playback error:', err));
          }
        }, 50);
      }
    }
  };

  // Sync state with HTML5 audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setPlaybackTime(audio.currentTime);
      
      // Limit to 20 seconds as requested! "da 20 secondi l'una"
      if (audio.currentTime >= 20) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setPlaybackTime(0);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setPlaybackTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioTracks, currentTrackIndex]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Track scroll position to update header and active sections
  useEffect(() => {
    const handleScroll = () => {
      // Is scrolled
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Show back-to-top
      if (window.scrollY > 500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      // Update active tab based on scroll position
      const sections = ['home', 'biografia', 'discografia', 'tour', 'gallery', 'news', 'fanclub'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveTab(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') handleNextLightbox();
      if (e.key === 'ArrowLeft') handlePrevLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of fixed header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveTab(id);
    }
  };

  // Lightbox handlers
  const filteredGallery = galleryFilter === 'Tutte'
    ? galleryData
    : galleryData.filter(item => item.category === galleryFilter);

  const displayedGallery = showAllGallery ? filteredGallery : filteredGallery.slice(0, 8);

  const handlePrevLightbox = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : filteredGallery.length - 1));
  };

  const handleNextLightbox = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => (prev !== null && prev < filteredGallery.length - 1 ? prev + 1 : 0));
  };

  // Toggle Favorite
  const toggleFavorite = (id: string) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Newsletter Validation
  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errors = {
      name: newsletterForm.name.trim() === '',
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterForm.email),
      privacy: !newsletterForm.privacy
    };

    setFormErrors(errors);

    if (!errors.name && !errors.email && !errors.privacy) {
      setNewsletterSubmitted(true);
    }
  };

  // Quiz Answer selection
  const handleQuizAnswer = (questionId: number, optionIdx: number, correctIdx: number) => {
    if (quizRevealed[questionId]) return; // already answered

    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
    setQuizRevealed(prev => ({ ...prev, [questionId]: true }));

    if (optionIdx === correctIdx) {
      setQuizScore(prev => prev + 1);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizRevealed({});
    setQuizScore(0);
  };

  return (
    <div className="min-h-screen bg-cream selection:bg-rose-antico selection:text-white">
      {/* HEADER NAVBAR */}
      <header
        id="navbar"
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md py-3 shadow-md border-b border-cipria'
            : 'bg-white py-4 border-b border-cipria/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          {/* Logo Brand */}
          <div
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="font-cursive text-rose-antico text-4xl font-semibold select-none transform transition-transform group-hover:scale-105 duration-300">
              lp
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-wider text-nero select-none">
                LAURA PAUSINI
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold select-none font-medium">
                Fan Club Non Ufficiale
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {['home', 'biografia', 'discografia', 'tour', 'gallery', 'news', 'fanclub'].map(
              item => (
                <button
                  key={item}
                  id={`nav-link-${item}`}
                  onClick={() => scrollToSection(item)}
                  className={`relative font-medium text-sm capitalize py-1 transition-all duration-300 hover:text-rose-antico ${
                    activeTab === item ? 'text-rose-antico font-semibold' : 'text-gray-600'
                  }`}
                >
                  {item === 'fanclub' ? 'Fan Club' : item}
                  {activeTab === item && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-rose-antico rounded-full transform scale-x-100 transition-transform duration-300" />
                  )}
                </button>
              )
            )}
          </nav>

          {/* Header Action Heart & Mobile Burger */}
          <div className="flex items-center gap-4">
            {/* Heart Counter */}
            <div
              id="favorite-badge-btn"
              className="relative p-2 rounded-full text-rose-antico hover:bg-cipria transition-all duration-300 flex items-center gap-1 group cursor-pointer"
              title="I tuoi preferiti nel Fan Club"
              onClick={() => {
                if (favoriteCount > 0) {
                  scrollToSection('discografia');
                }
              }}
            >
              <Heart
                className={`w-5 h-5 transition-transform duration-300 ${
                  favoriteCount > 0 ? 'fill-rose-antico scale-110' : 'group-hover:scale-110'
                }`}
              />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {favoriteCount}
                </span>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-rose-antico focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div
          id="mobile-nav-drawer"
          className={`lg:hidden fixed inset-x-0 top-[73px] bg-white border-b border-cipria shadow-xl transition-all duration-300 ease-in-out z-30 ${
            mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="px-6 py-6 flex flex-col gap-4">
            {['home', 'biografia', 'discografia', 'tour', 'gallery', 'news', 'fanclub'].map(
              item => (
                <button
                  key={item}
                  id={`mobile-nav-link-${item}`}
                  onClick={() => scrollToSection(item)}
                  className={`text-left py-2 border-b border-cipria/30 capitalize font-medium transition-all ${
                    activeTab === item ? 'text-rose-antico pl-2 font-bold' : 'text-gray-600'
                  }`}
                >
                  {item === 'fanclub' ? 'Fan Club' : item}
                </button>
              )
            )}
            <div className="text-center pt-2 text-xs text-gray-400 italic">
              Sito non ufficiale • Creato con amore dai Fan
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        id="home"
        className="relative pt-24 md:pt-28 pb-16 lg:pb-24 bg-nero overflow-hidden"
      >
        {/* Full-bleed background photo of Laura Pausini singing */}
        <div className="absolute inset-0 z-0">
          <img
            src={getProxiedImageUrl("https://upload.wikimedia.org/wikipedia/commons/2/23/Laura_Pausini_live_2018.jpg")}
            alt="Laura Pausini live background"
            className="w-full h-full object-cover object-[center_35%] md:object-[right_35%] opacity-40 md:opacity-50"
            referrerPolicy="no-referrer"
          />
          {/* Gradients to fade out the photo into Nero on the left for text legibility, and fade at top/bottom */}
          <div className="absolute inset-0 bg-gradient-to-r from-nero via-nero/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-nero via-transparent to-nero/40" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(197,139,131,0.12),transparent_60%)] pointer-events-none z-0" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 text-white z-10 flex flex-col justify-center">
            <span className="text-gold uppercase tracking-[0.3em] font-semibold text-xs md:text-sm mb-3 animate-fade-in block">
              Sito non ufficiale • Unofficial Fan Club
            </span>
            <h1 className="font-serif text-5xl md:text-6xl xl:text-7xl font-bold leading-none tracking-tight mb-2">
              Laura Pausini
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="font-cursive text-rose-antico text-4xl md:text-5xl font-medium rotate-[-4deg]">
                Fan Club
              </span>
              <div className="w-16 h-[1px] bg-rose-antico/50" />
              <Heart className="w-6 h-6 text-rose-antico fill-rose-antico/20 animate-pulse" />
            </div>
            <p className="text-gray-300 text-lg md:text-xl font-light mb-8 max-w-xl leading-relaxed">
              La voce italiana che emoziona il mondo. Da Solarolo alle vette del pop mondiale, 30 anni di musica e unione straordinaria con i fan.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                id="hero-cta-discover"
                onClick={() => scrollToSection('biografia')}
                className="bg-rose-antico hover:bg-rose-antico-dark text-white font-medium px-8 py-3.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-rose-antico/20 hover:-translate-y-0.5 flex items-center gap-2 group cursor-pointer"
              >
                Scopri di più
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                id="hero-cta-join"
                onClick={() => scrollToSection('fanclub')}
                className="bg-transparent border border-white/30 hover:border-white hover:bg-white/5 text-white font-medium px-8 py-3.5 rounded-lg transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                Iscriviti al Club
              </button>
            </div>
          </div>

          {/* Right Image Column */}
          <div className="lg:col-span-6 relative flex justify-center z-10 animate-fade-in">
            <div className="relative w-full max-w-lg aspect-[4/3] sm:aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
              <img
                src={getProxiedImageUrl("https://upload.wikimedia.org/wikipedia/commons/e/e6/Laura_Pausini_Sanremo_2022.jpg")}
                alt="Laura Pausini esibizione live a Sanremo"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="bg-rose-antico/90 text-white text-[10px] tracking-wider uppercase font-semibold px-2 py-1 rounded mb-2 inline-block">
                  FESTIVAL DI SANREMO
                </span>
                <p className="font-serif text-lg font-medium italic">
                  &ldquo;La musica ci rende simili, le canzoni ci uniscono nel vento.&rdquo;
                </p>
              </div>
            </div>
            
            {/* Background floating gold design card decoration */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 border-b-2 border-l-2 border-gold/30 rounded-bl-3xl -z-10 pointer-events-none" />
            <div className="absolute -top-6 -right-6 w-32 h-32 border-t-2 border-r-2 border-gold/30 rounded-tr-3xl -z-10 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* BENTO SHOWCASE (Exactly matching the requested screenshot visual layout!) */}
      <section className="bg-cream border-y border-cipria">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          
          {/* Main 4-Column Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            
            {/* COLUMN 1: ULTIME NEWS */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-cipria/60 flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-cipria/30 pb-3">
                  <span className="w-1.5 h-6 bg-rose-antico rounded-full" />
                  <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-rose-antico">
                    Ultime News
                  </h3>
                </div>
                
                {/* News list - top 3 items */}
                <div className="space-y-5">
                  {newsData.slice(0, 3).map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedNews(item)}
                      className="flex gap-3 group cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-cipria">
                        <img
                          src={getProxiedImageUrl(item.imageUrl)}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="font-sans text-[13px] font-semibold text-nero line-clamp-2 leading-tight group-hover:text-rose-antico transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-rose-antico font-medium mt-1">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  id="bento-btn-all-news"
                  onClick={() => setShowAllNewsModal(true)}
                  className="w-full border border-rose-antico/40 hover:border-rose-antico hover:bg-cipria text-rose-antico font-medium py-2 px-4 rounded-lg text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Tutte le news
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* COLUMN 2: DISCOGRAFIA */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-cipria/60 flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-cipria/30 pb-3">
                  <span className="w-1.5 h-6 bg-rose-antico rounded-full" />
                  <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-rose-antico">
                    Discografia
                  </h3>
                </div>
                
                {/* Featured Album block */}
                <div className="text-center group">
                  <div className="w-full max-w-[200px] mx-auto aspect-square rounded-xl overflow-hidden shadow-md border border-cipria transform transition-transform duration-500 group-hover:scale-103 relative">
                    <img
                      src={getProxiedImageUrl(albumsData[0].coverUrl)}
                      alt={albumsData[0].title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Music className="w-8 h-8 text-white animate-bounce" />
                    </div>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-nero mt-4 mb-0.5">
                    {albumsData[0].title}
                  </h4>
                  <span className="text-xs text-gold font-medium tracking-wider uppercase">
                    {albumsData[0].year}
                  </span>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed px-2">
                    Il nuovo album di inediti che racconta emozioni, vita e nuove prospettive.
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  id="bento-btn-all-albums"
                  onClick={() => setShowAllAlbumsModal(true)}
                  className="w-full border border-rose-antico/40 hover:border-rose-antico hover:bg-cipria text-rose-antico font-medium py-2 px-4 rounded-lg text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Scopri tutta la discografia
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* COLUMN 3: PROSSIME DATE */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-cipria/60 flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-cipria/30 pb-3">
                  <span className="w-1.5 h-6 bg-rose-antico rounded-full" />
                  <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-rose-antico">
                    Prossime Date
                  </h3>
                </div>
                
                {/* List of 4 events */}
                <div className="space-y-3.5">
                  {tourDatesData.slice(0, 4).map(date => (
                    <div
                      key={date.id}
                      onClick={() => setSelectedTourDate(date)}
                      className="flex items-center justify-between border-b border-cipria/20 pb-3 last:border-none last:pb-0 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {/* Date badge */}
                        <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-cipria-dark/50 border border-cipria-dark group-hover:bg-rose-antico transition-colors duration-300">
                          <span className="text-[14px] font-bold text-nero group-hover:text-white leading-none">
                            {date.day}
                          </span>
                          <span className="text-[9px] uppercase font-bold text-rose-antico group-hover:text-cipria leading-none mt-0.5">
                            {date.month}
                          </span>
                        </div>
                        {/* Venue details */}
                        <div className="min-w-0">
                          <h4 className="font-sans text-[13px] font-bold text-nero group-hover:text-rose-antico transition-colors truncate">
                            {date.city}
                          </h4>
                          <p className="text-[10px] text-gray-500 truncate max-w-[110px]">
                            {date.venue}
                          </p>
                        </div>
                      </div>
                      
                      {/* Interactive Button */}
                      <span className="border border-rose-antico/30 group-hover:border-rose-antico group-hover:bg-rose-antico group-hover:text-white text-rose-antico text-[10px] font-bold px-3 py-1 rounded transition-all shrink-0">
                        Biglietti
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  id="bento-btn-all-dates"
                  onClick={() => scrollToSection('tour')}
                  className="w-full bg-rose-antico hover:bg-rose-antico-dark text-white font-semibold py-2 px-4 rounded-lg text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-sm"
                >
                  Vedi tutte le date
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* COLUMN 4: GALLERY */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-cipria/60 flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-cipria/30 pb-3">
                  <span className="w-1.5 h-6 bg-rose-antico rounded-full" />
                  <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-rose-antico">
                    Gallery
                  </h3>
                </div>
                
                {/* 2x3 Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {galleryData.slice(0, 6).map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setLightboxIndex(idx)}
                      className="aspect-video sm:aspect-square md:aspect-video xl:aspect-[4/3] rounded-lg overflow-hidden border border-cipria bg-gray-100 cursor-pointer relative group"
                    >
                      <img
                        src={getProxiedImageUrl(item.url)}
                        alt={item.caption}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Compass className="w-4 h-4 text-white transform scale-75 group-hover:scale-100 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  id="bento-btn-all-gallery"
                  onClick={() => scrollToSection('gallery')}
                  className="w-full border border-rose-antico/40 hover:border-rose-antico hover:bg-cipria text-rose-antico font-medium py-2 px-4 rounded-lg text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Vai alla gallery
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* LOWER BANNER CTA (Exactly matching the footer/banner area of the screenshot layout!) */}
          <div className="mt-12 bg-cipria-dark/50 rounded-2xl border border-cipria p-6 md:p-8 flex flex-col xl:flex-row justify-between items-center gap-6 shadow-sm">
            {/* Left: Branding */}
            <div className="flex items-center gap-4 text-center xl:text-left">
              <div className="p-3 bg-white rounded-full text-rose-antico shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold tracking-tight text-nero">
                  ENTRA A FAR PARTE DEL FAN CLUB
                </h4>
                <p className="text-xs text-gray-500">
                  Contenuti esclusivi, anteprime, eventi e molto altro! Unisciti a noi gratuitamente.
                </p>
              </div>
            </div>

            {/* Middle: Perks list */}
            <div className="hidden md:flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-gold fill-gold/20" />
                <span>Contenuti esclusivi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-gold fill-gold/20" />
                <span>Pre-sale biglietti</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-gold fill-gold/20" />
                <span>Sorprese e vantaggi</span>
              </div>
            </div>

            {/* Right: CTA button */}
            <div>
              <button
                id="cta-join-now-bottom"
                onClick={() => scrollToSection('fanclub')}
                className="bg-gold hover:bg-gold-dark text-white font-semibold py-3 px-6 rounded-xl tracking-wider text-xs uppercase shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                Iscriviti ora
                <Heart className="w-4 h-4 fill-white" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SEZIONE ANTEPRIME MUSICALI */}
      <section id="anteprime" className="py-16 bg-nero text-white scroll-mt-20 relative overflow-hidden">
        {/* HTML5 Audio Element */}
        <audio ref={audioRef} src={audioTracks[currentTrackIndex]?.previewUrl} preload="auto" />

        {/* Ambient gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(197,139,131,0.08),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-gold uppercase tracking-[0.2em] text-xs font-semibold block mb-2">
              Ascolta le sue hit
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Anteprime Musicali (20s)
            </h2>
            <div className="w-16 h-[3px] bg-rose-antico mx-auto mb-4" />
            <p className="text-xs md:text-sm text-gray-400">
              Ascolta 10 delle canzoni più famose di Laura Pausini in anteprime promozionali da 20 secondi ciascuna.
            </p>
          </div>

          {loadingAudio ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-10 h-10 border-4 border-rose-antico border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Caricamento delle anteprime musicali...</p>
            </div>
          ) : (
            /* Main Audio Player Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md">
              
              {/* Left column: Currently selected track visual card & player controls (Lg: col-span-5) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-6 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8">
                <div className="text-center sm:text-left flex flex-col sm:flex-row lg:flex-col items-center gap-6">
                  
                  {/* Spinning Vinyl Record Artwork */}
                  <div className="relative w-40 h-40 md:w-48 md:h-48 shrink-0 select-none">
                    <div className={`absolute inset-0 rounded-full bg-black border-4 border-white/10 shadow-2xl transition-transform duration-1000 overflow-hidden ${isPlaying ? 'animate-spin [animation-duration:8s]' : ''}`}>
                      <img
                        src={getProxiedImageUrl(audioTracks[currentTrackIndex]?.artworkUrl100)}
                        alt={audioTracks[currentTrackIndex]?.trackName}
                        className="w-full h-full object-cover opacity-85"
                        referrerPolicy="no-referrer"
                      />
                      {/* Vinyl inner circle */}
                      <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-nero border-4 border-white/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white/40" />
                      </div>
                    </div>
                    
                    {/* Music badge */}
                    <div className="absolute -bottom-2 -right-2 p-2.5 bg-rose-antico rounded-full shadow-lg border border-white/15">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Title, Album & Controls */}
                  <div className="flex-1 text-center sm:text-left lg:text-center w-full space-y-3">
                    <div>
                      <h4 className="font-serif text-xl md:text-2xl font-bold text-white tracking-wide truncate">
                        {audioTracks[currentTrackIndex]?.trackName}
                      </h4>
                      <p className="text-xs text-gold font-medium uppercase tracking-wider mt-1 truncate">
                        {audioTracks[currentTrackIndex]?.collectionName} ({audioTracks[currentTrackIndex]?.year})
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Artista: Laura Pausini</p>
                    </div>

                    {/* Animated Audio Visualizer Bars */}
                    <div className="flex items-center justify-center gap-1 h-10 py-2">
                      {[0.6, 0.3, 0.8, 0.5, 0.9, 0.4, 0.7, 0.5, 0.8, 0.6, 0.4].map((heightVal, vIdx) => (
                        <span
                          key={vIdx}
                          className="w-1 bg-rose-antico rounded-full transition-all duration-300"
                          style={{
                            height: isPlaying ? `${Math.floor(heightVal * 100)}%` : '15%',
                            animation: isPlaying ? `bounceVisualizer 1.2s ease-in-out infinite alternate` : 'none',
                            animationDelay: `${vIdx * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Player controls */}
                <div className="space-y-4">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-antico to-gold rounded-full"
                        style={{ width: `${(playbackTime / 20) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>0:{Math.floor(playbackTime).toString().padStart(2, '0')}</span>
                      <span>Limite: 0:20</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => handlePlayTrack((currentTrackIndex - 1 + audioTracks.length) % audioTracks.length)}
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
                      title="Canzone Precedente"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handlePlayTrack(currentTrackIndex)}
                      className="p-4 rounded-full bg-rose-antico hover:bg-rose-antico-dark text-white transition-all transform hover:scale-105 shadow-md shadow-rose-antico/20 cursor-pointer flex items-center justify-center w-14 h-14"
                      title={isPlaying ? 'Pausa' : 'Riproduci'}
                    >
                      {isPlaying ? (
                        <span className="flex gap-1.5 items-center justify-center">
                          <span className="w-1.5 h-4 bg-white rounded-full" />
                          <span className="w-1.5 h-4 bg-white rounded-full" />
                        </span>
                      ) : (
                        <svg className="w-6 h-6 fill-white ml-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={() => handlePlayTrack((currentTrackIndex + 1) % audioTracks.length)}
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
                      title="Canzone Successiva"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Demo indicator */}
                  <p className="text-[9px] text-gray-400 text-center italic">
                    * Spegnimento automatico conforme di 20 secondi.
                  </p>
                </div>
              </div>

              {/* Right column: Tracklist (Lg: col-span-7) */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <h5 className="font-serif text-sm font-bold text-gray-300 uppercase tracking-wider">
                      Elenco Tracce (10 Canzoni)
                    </h5>
                    <span className="text-[10px] text-gold font-medium uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      Laura Previews
                    </span>
                  </div>
                  
                  {/* Scrollable grid track selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {audioTracks.map((track, idx) => {
                      const isSelected = idx === currentTrackIndex;
                      const favId = `track-preview-${idx}`;
                      return (
                        <div
                          key={idx}
                          onClick={() => handlePlayTrack(idx)}
                          className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer group ${
                            isSelected
                              ? 'bg-rose-antico/15 border-rose-antico text-white shadow-sm shadow-rose-antico/10'
                              : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Cover thumb */}
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 relative">
                              <img
                                src={getProxiedImageUrl(track.artworkUrl100)}
                                alt={track.trackName}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              {isSelected && isPlaying && (
                                <div className="absolute inset-0 bg-rose-antico/60 flex items-center justify-center">
                                  <Music className="w-4 h-4 text-white animate-bounce" />
                                </div>
                              )}
                            </div>
                            
                            <div className="min-w-0">
                              <h6 className="text-xs font-bold truncate">
                                {track.trackName}
                              </h6>
                              <p className="text-[10px] text-gray-400 truncate">
                                {track.collectionName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(favId);
                              }}
                              className="p-1.5 rounded-full hover:bg-white/10 text-rose-antico transition-transform duration-300 active:scale-95"
                              title={favorites[favId] ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                            >
                              <Heart className={`w-3.5 h-3.5 ${favorites[favId] ? 'fill-rose-antico text-rose-antico' : 'text-gray-500'}`} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-3">
                  <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <p className="text-[10px] text-gray-400 leading-normal">
                    <strong>Note informative:</strong> Le tracce audio sono caricate dinamicamente in tempo reale dall&apos;iTunes API o fornite tramite canali ufficiali a solo scopo promozionale demo. Tutte le canzoni appartengono interamente all&apos;artista e ai legittimi proprietari dei diritti.
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
        
        {/* Custom CSS Animation in style tag */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes bounceVisualizer {
            0% { transform: scaleY(1); }
            100% { transform: scaleY(2.2); }
          }
        `}} />
      </section>

      {/* SEZIONE BIOGRAFIA */}
      <section id="biografia" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Image Column */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative max-w-sm w-full rounded-2xl overflow-hidden border-4 border-cipria shadow-xl group">
                <img
                  src={getProxiedImageUrl("https://upload.wikimedia.org/wikipedia/commons/1/15/Laura_Pausini_2018.jpg")}
                  alt="Laura Pausini ritratto biografia"
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-103"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              {/* Background luxury elements */}
              <div className="absolute -bottom-4 -right-4 w-3/4 h-3/4 bg-cipria-dark/40 rounded-2xl -z-10 pointer-events-none" />
              <div className="absolute top-10 left-10 w-12 h-12 border-t-2 border-l-2 border-gold/50 pointer-events-none" />
            </div>

            {/* Right Content Column */}
            <div className="lg:col-span-7">
              <span className="text-gold uppercase tracking-[0.2em] text-xs font-semibold block mb-2">
                La sua storia
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-nero mb-6">
                Una voce italiana nel cuore del mondo
              </h2>
              <div className="w-20 h-[3px] bg-rose-antico mb-6" />
              
              <div className="text-gray-600 space-y-4 text-sm md:text-base leading-relaxed mb-8">
                <p>
                  Nata a Faenza e cresciuta a <strong>Solarolo</strong>, in provincia di Ravenna, Laura Pausini comincia a farsi conoscere a livello nazionale nel 1993, quando vince la sezione Novità del <strong>Festival di Sanremo</strong> con il leggendario brano <em>La solitudine</em>.
                </p>
                <p>
                  Da quel momento, la sua voce limpida e potente travalica i confini italiani, conquistando l&apos;Europa, l&apos;America Latina e gli Stati Uniti. Diventa l&apos;artista italiana più venduta a livello globale, incidendo brani sia in italiano che in spagnolo, portoghese, inglese e francese.
                </p>
                <p>
                  Nel corso della sua eccezionale carriera, Laura ha collezionato prestigiosi riconoscimenti unici nella storia: un <strong>Grammy Award</strong>, ben quattro <strong>Latin Grammy</strong>, un <strong>Golden Globe</strong> e una straordinaria nomination al <strong>Premio Oscar</strong> nel 2021.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8 text-center border-y border-cipria py-6 bg-cream/30 rounded-xl">
                <div>
                  <span className="block font-serif text-2xl md:text-3xl font-bold text-rose-antico">
                    75M+
                  </span>
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Dischi Venduti
                  </span>
                </div>
                <div className="border-x border-cipria">
                  <span className="block font-serif text-2xl md:text-3xl font-bold text-rose-antico">
                    14
                  </span>
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Album in Studio
                  </span>
                </div>
                <div>
                  <span className="block font-serif text-2xl md:text-3xl font-bold text-rose-antico">
                    1
                  </span>
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Grammy Award
                  </span>
                </div>
              </div>

              <button
                id="bio-read-more-btn"
                onClick={() => setShowBioModal(true)}
                className="bg-transparent border-2 border-rose-antico text-rose-antico hover:bg-rose-antico hover:text-white font-bold px-6 py-3 rounded-lg text-sm tracking-wider uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                Leggi la biografia completa
                <BookOpen className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* SEZIONE DISCOGRAFIA */}
      <section id="discografia" className="py-20 bg-cream/40 border-t border-b border-cipria/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Header section */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-gold uppercase tracking-[0.2em] text-xs font-semibold block mb-2">
              Album Capolavori
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-nero mb-4">
              La Discografia di Laura
            </h2>
            <div className="w-16 h-[3px] bg-rose-antico mx-auto mb-4" />
            <p className="text-xs md:text-sm text-gray-500 italic">
              Esplora i dischi che hanno segnato la storia del pop italiano nel mondo. Cuorici i tuoi preferiti per tenerne traccia!
            </p>
          </div>

          {/* Griglia Responsive - 6 Albums */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {albumsData.slice(0, 6).map(album => (
              <div
                key={album.id}
                className="bg-white rounded-2xl overflow-hidden border border-cipria shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="relative aspect-video sm:aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={getProxiedImageUrl(album.coverUrl)}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(album.id);
                      }}
                      className="p-2.5 rounded-full bg-white/90 hover:bg-white text-rose-antico shadow-md backdrop-blur-sm transition-all scale-95 hover:scale-105 cursor-pointer"
                      title={favorites[album.id] ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform duration-300 ${
                          favorites[album.id] ? 'fill-rose-antico scale-110' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-gold text-[10px] uppercase font-bold tracking-widest bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                      Anno {album.year}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-nero group-hover:text-rose-antico transition-colors mb-2">
                      {album.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
                      {album.description}
                    </p>
                  </div>

                  <button
                    id={`album-discover-btn-${album.id}`}
                    onClick={() => setSelectedAlbum(album)}
                    className="w-full text-center bg-cipria text-rose-antico hover:bg-rose-antico hover:text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Scopri l&apos;album
                    <Music className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA Discografia */}
          <div className="text-center mt-12">
            <button
              id="discography-view-all-btn"
              onClick={() => setShowAllAlbumsModal(true)}
              className="bg-rose-antico hover:bg-rose-antico-dark text-white font-bold px-8 py-3.5 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 hover:shadow-lg inline-flex items-center gap-2 cursor-pointer"
            >
              Scopri tutta la discografia
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* SEZIONE TOUR */}
      <section id="tour" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Header section */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-gold uppercase tracking-[0.2em] text-xs font-semibold block mb-2">
              Concerti &amp; Live
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-nero mb-4">
              Tour Date (Demo)
            </h2>
            <div className="w-16 h-[3px] bg-rose-antico mx-auto mb-4" />
            <p className="text-xs md:text-sm text-gray-500">
              Vivi l&apos;emozione straordinaria del concerto dal vivo. Di seguito alcune tappe indicative del World Tour.
            </p>
            
            {/* Disclaimer in evidenza */}
            <div className="mt-4 bg-cipria border border-rose-antico/20 rounded-xl p-3 text-[11px] text-gray-500 leading-relaxed max-w-xl mx-auto flex items-start gap-2 text-left">
              <Info className="w-5 h-5 text-rose-antico shrink-0 mt-0.5" />
              <span>
                <strong>Importante:</strong> Questo è un fan site non ufficiale. Non vendiamo biglietti veri e non inventiamo date spacciandole per ufficiali. Le date mostrate sono puramente esemplificative; ti invitiamo a verificarle e prenotarle esclusivamente attraverso i canali ufficiali e autorizzati dell&apos;artista.
              </span>
            </div>
          </div>

          {/* Table list of dates */}
          <div className="max-w-4xl mx-auto space-y-4">
            {tourDatesData.map(date => (
              <div
                key={date.id}
                onClick={() => setSelectedTourDate(date)}
                className="bg-cream/40 hover:bg-cipria/30 border border-cipria rounded-2xl p-4 md:p-6 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group hover:shadow-md"
              >
                {/* Date and Place */}
                <div className="flex items-center gap-4">
                  {/* Big Date Badge */}
                  <div className="flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white border border-cipria shadow-sm shrink-0 group-hover:bg-rose-antico group-hover:border-rose-antico transition-all duration-300">
                    <span className="text-xl md:text-2xl font-bold text-nero group-hover:text-white leading-none">
                      {date.day}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-rose-antico group-hover:text-cipria uppercase tracking-wider mt-1 leading-none">
                      {date.month}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-lg md:text-xl font-bold text-nero group-hover:text-rose-antico transition-colors">
                        {date.city}
                      </span>
                      <span className={`text-[9px] uppercase px-2 py-0.5 font-bold rounded-full ${
                        date.status === 'Sold Out'
                          ? 'bg-gray-200 text-gray-600'
                          : date.status === 'Ultimi Biglietti'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {date.status}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-antico shrink-0" />
                      {date.venue}
                    </p>
                  </div>
                </div>

                {/* Info action button */}
                <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-none pt-3 md:pt-0">
                  <span className="text-[11px] text-gray-400 italic md:hidden">
                    Clicca per dettagli
                  </span>
                  <button
                    id={`tour-info-btn-${date.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTourDate(date);
                    }}
                    className="bg-white hover:bg-rose-antico border border-rose-antico text-rose-antico hover:text-white font-bold py-2 px-5 rounded-lg text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    Informazioni
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SEZIONE GALLERY */}
      <section id="gallery" className="py-20 bg-cream/40 border-t border-b border-cipria/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Header section */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-gold uppercase tracking-[0.2em] text-xs font-semibold block mb-2">
              Emozioni Fotografiche
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-nero mb-4">
              La Galleria Fotografica
            </h2>
            <div className="w-16 h-[3px] bg-rose-antico mx-auto mb-4" />
            <p className="text-xs md:text-sm text-gray-500">
              Scorri i momenti più belli catturati sul palco e in studio. Clicca su ciascun riquadro per ingrandire.
            </p>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {['Tutte', 'Live', 'Studio', 'Ritratti', 'Premi'].map(filter => (
              <button
                key={filter}
                id={`gallery-filter-${filter}`}
                onClick={() => {
                  setGalleryFilter(filter);
                  setShowAllGallery(false);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                  galleryFilter === filter
                    ? 'bg-rose-antico text-white shadow-sm'
                    : 'bg-white border border-cipria text-gray-600 hover:border-rose-antico hover:text-rose-antico'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedGallery.map((item, index) => (
              <div
                key={item.id}
                onClick={() => {
                  // Find index in filtered list to maintain lightbox prev/next order
                  const idxInFiltered = filteredGallery.findIndex(g => g.id === item.id);
                  setLightboxIndex(idxInFiltered !== -1 ? idxInFiltered : index);
                }}
                className="aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden border border-cipria bg-white shadow-sm cursor-pointer relative group"
              >
                <img
                  src={getProxiedImageUrl(item.url)}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                  <span className="text-[10px] text-gold uppercase font-bold tracking-widest mb-1">
                    {item.category}
                  </span>
                  <p className="text-white text-xs font-medium line-clamp-2 leading-tight">
                    {item.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Toggle show all in category button */}
          {filteredGallery.length > 8 && (
            <div className="text-center mt-12">
              <button
                id="gallery-toggle-more-btn"
                onClick={() => setShowAllGallery(!showAllGallery)}
                className="bg-transparent border-2 border-rose-antico text-rose-antico hover:bg-rose-antico hover:text-white font-bold px-8 py-3 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-2 mx-auto cursor-pointer"
              >
                {showAllGallery ? 'Mostra Meno Foto' : 'Mostra Altre Foto'}
                <ChevronRight className={`w-4 h-4 transform transition-transform duration-300 ${showAllGallery ? 'rotate-90' : ''}`} />
              </button>
            </div>
          )}

        </div>
      </section>

      {/* SEZIONE FAN CLUB & NEWSLETTER (Highlighted design area!) */}
      <section id="fanclub" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-b from-cipria to-cipria-dark/50 border border-cipria rounded-3xl p-8 md:p-12 shadow-md">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column: Benefits & Info */}
              <div className="lg:col-span-6">
                <span className="text-gold uppercase tracking-[0.25em] text-xs font-bold block mb-2">
                  Unisciti alla nostra community
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-nero mb-6">
                  Entra a far parte del Fan Club
                </h2>
                <div className="w-16 h-[3px] bg-rose-antico mb-6" />
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8">
                  Iscriviti gratuitamente per rimanere in contatto con migliaia di fan in tutta Italia e nel mondo. Diventando un membro del nostro fan club non ufficiale, avrai accesso immediato a questi fantastici vantaggi gratuiti:
                </p>

                {/* Advantages list with icons */}
                <div className="space-y-4">
                  {[
                    { title: 'Contenuti dedicati', desc: 'Sfondi gratuiti, canzoni in acustico e curiosità storiche sulla discografia.' },
                    { title: 'Quiz e curiosità', desc: 'Mettiti alla prova con la nostra trivia interattiva e impara fatti unici sull\'artista.' },
                    { title: 'Aggiornamenti musicali', desc: 'Ricevi tempestivamente le notifiche su eventuali indiscrezioni di nuovi singoli o album.' },
                    { title: 'Spazio per i fan', desc: 'Accedi al forum di coordinamento per partecipare ad acclamazioni e coreografie nei concerti.' },
                    { title: 'Newsletter periodica', desc: 'Niente spam, solo riassunti mensili di notizie curate direttamente dai fan per i fan.' }
                  ].map((adv, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="p-2 bg-white rounded-xl border border-cipria text-rose-antico shadow-xs shrink-0">
                        <Check className="w-4 h-4 stroke-[3px]" />
                      </div>
                      <div>
                        <h4 className="font-sans text-[14px] font-bold text-nero">
                          {adv.title}
                        </h4>
                        <p className="text-xs text-gray-500 leading-tight mt-0.5">
                          {adv.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Interaction Hub (Form & Quiz!) */}
              <div className="lg:col-span-6 space-y-8">
                
                {/* 1. Newsletter Form Container */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-cipria">
                  <h3 className="font-serif text-xl font-bold text-nero mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-rose-antico" />
                    Modulo di Iscrizione Gratuito
                  </h3>
                  
                  {newsletterSubmitted ? (
                    <div className="text-center py-8 px-4 flex flex-col items-center justify-center animate-fade-in">
                      <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                        <CheckCircle className="w-12 h-12" />
                      </div>
                      <h4 className="font-serif text-2xl font-bold text-nero mb-2">
                        Benvenuto a Bordo!
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-sm mb-6">
                        Grazie per esserti unito al Laura Pausini Unofficial Fan Club. Abbiamo inviato un messaggio di conferma simulato all&apos;indirizzo: <strong className="text-nero">{newsletterForm.email}</strong>.
                      </p>
                      <button
                        onClick={() => {
                          setNewsletterSubmitted(false);
                          setNewsletterForm({ name: '', email: '', privacy: false });
                        }}
                        className="bg-cipria hover:bg-rose-antico text-rose-antico hover:text-white font-bold py-2 px-6 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Iscrivi un altro utente
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                      {/* Name Field */}
                      <div>
                        <label htmlFor="form-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Nome Completo *
                        </label>
                        <input
                          id="form-name"
                          type="text"
                          placeholder="Inserisci il tuo nome"
                          value={newsletterForm.name}
                          onChange={(e) => setNewsletterForm({ ...newsletterForm, name: e.target.value })}
                          className={`w-full bg-cream border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                            formErrors.name
                              ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                              : 'border-cipria focus:ring-rose-antico/20 focus:border-rose-antico'
                          }`}
                        />
                        {formErrors.name && (
                          <span className="text-[11px] text-red-500 block mt-1">
                            Questo campo è obbligatorio.
                          </span>
                        )}
                      </div>

                      {/* Email Field */}
                      <div>
                        <label htmlFor="form-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Indirizzo Email *
                        </label>
                        <input
                          id="form-email"
                          type="email"
                          placeholder="latuamail@esempio.com"
                          value={newsletterForm.email}
                          onChange={(e) => setNewsletterForm({ ...newsletterForm, email: e.target.value })}
                          className={`w-full bg-cream border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                            formErrors.email
                              ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                              : 'border-cipria focus:ring-rose-antico/20 focus:border-rose-antico'
                          }`}
                        />
                        {formErrors.email && (
                          <span className="text-[11px] text-red-500 block mt-1">
                            Inserisci un indirizzo email valido.
                          </span>
                        )}
                      </div>

                      {/* Privacy Checkbox */}
                      <div className="flex items-start gap-2.5 pt-1">
                        <input
                          id="form-privacy"
                          type="checkbox"
                          checked={newsletterForm.privacy}
                          onChange={(e) => setNewsletterForm({ ...newsletterForm, privacy: e.target.checked })}
                          className="mt-0.5 rounded border-cipria focus:ring-rose-antico text-rose-antico accent-rose-antico cursor-pointer"
                        />
                        <label htmlFor="form-privacy" className="text-xs text-gray-500 leading-tight select-none cursor-pointer">
                          Accetto l&apos;informativa sulla privacy e dichiaro di essere a conoscenza che questo è un sito non ufficiale gestito da ammiratori. *
                        </label>
                      </div>
                      {formErrors.privacy && (
                        <span className="text-[11px] text-red-500 block mt-0.5">
                          È necessario accettare l&apos;informativa per continuare.
                        </span>
                      )}

                      <button
                        id="newsletter-submit-btn"
                        type="submit"
                        className="w-full bg-rose-antico hover:bg-rose-antico-dark text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
                      >
                        Iscriviti al Fan Club
                        <Check className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>

                {/* 2. Interactive Fan Quiz Trivia Game */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-cipria">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-cipria/30">
                    <h3 className="font-serif text-lg font-bold text-nero flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-gold" />
                      Quanto conosci Laura?
                    </h3>
                    {Object.keys(quizRevealed).length > 0 && (
                      <button
                        onClick={resetQuiz}
                        className="text-[10px] uppercase font-bold text-rose-antico hover:underline cursor-pointer"
                      >
                        Azzera Quiz
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {quizQuestions.map(q => {
                      const isAnswered = quizRevealed[q.id];
                      const selectedIdx = quizAnswers[q.id];
                      return (
                        <div key={q.id} className="text-left border-b border-cipria/10 pb-4 last:border-none last:pb-0">
                          <p className="text-xs font-bold text-nero mb-2 flex gap-1.5 items-start">
                            <span className="bg-cipria-dark/50 text-rose-antico px-1.5 py-0.5 rounded text-[10px] font-bold">
                              Q{q.id}
                            </span>
                            {q.question}
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, oIdx) => {
                              const isCorrect = oIdx === q.answerIndex;
                              const isSelected = oIdx === selectedIdx;
                              let btnClass = 'bg-cream/40 border-cipria text-gray-700 hover:border-gold hover:bg-cipria';

                              if (isAnswered) {
                                if (isCorrect) {
                                  btnClass = 'bg-emerald-100 border-emerald-400 text-emerald-800 font-semibold';
                                } else if (isSelected) {
                                  btnClass = 'bg-red-100 border-red-400 text-red-800';
                                } else {
                                  btnClass = 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed';
                                }
                              }

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleQuizAnswer(q.id, oIdx, q.answerIndex)}
                                  disabled={isAnswered}
                                  className={`border text-xs px-3 py-2 rounded-lg text-left transition-all duration-300 cursor-pointer ${btnClass}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {/* Show trivia description if answered */}
                          {isAnswered && (
                            <div className="mt-2 bg-gold/5 border border-gold/10 p-2.5 rounded-lg text-[10px] leading-relaxed text-gold-dark flex items-start gap-1.5 animate-fade-in">
                              <Star className="w-3.5 h-3.5 shrink-0 mt-0.5 fill-gold/10" />
                              <span>
                                {q.trivia}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Quiz score summary */}
                    {Object.keys(quizRevealed).length === quizQuestions.length && (
                      <div className="mt-4 bg-cipria border border-rose-antico/20 p-4 rounded-xl text-center animate-fade-in">
                        <p className="text-xs font-bold text-nero uppercase tracking-wider mb-1">
                          Il tuo punteggio finale:
                        </p>
                        <span className="block font-serif text-3xl font-extrabold text-rose-antico">
                          {quizScore} / {quizQuestions.length}
                        </span>
                        <p className="text-xs text-gray-500 italic mt-1">
                          {quizScore === 3
                            ? '👑 Sei un Fan Leggendario di Laura!'
                            : quizScore === 2
                              ? '⭐ Bravissimo! Conosci molto bene Laura.'
                              : '🎵 Continua ad ascoltarla per imparare tutto su di lei!'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-nero text-white pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
            
            {/* Col 1: Brand & Desc */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <span className="font-cursive text-rose-antico text-4xl font-semibold">lp</span>
                <div className="flex flex-col">
                  <span className="font-serif text-lg font-bold tracking-wider">LAURA PAUSINI</span>
                  <span className="text-[9px] uppercase tracking-widest text-gold font-medium">Fan Club Non Ufficiale</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                Dal 1993, la voce di Laura Pausini unisce cuori in ogni parte del pianeta. Questo spazio è gestito con amore e passione da ammiratori indipendenti per condividere notizie, concerti e dischi.
              </p>
              
              {/* Unofficial Disclaimer mandated */}
              <div className="text-[10px] text-gray-500 leading-relaxed border-l-2 border-rose-antico/50 pl-3 pt-0.5">
                Fan site non ufficiale dedicato a Laura Pausini. Questo sito non è affiliato, gestito o approvato dall’artista o dal suo staff.
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-gold">
                Sezioni del Sito
              </h4>
              <ul className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                {['home', 'biografia', 'discografia', 'tour', 'gallery', 'news', 'fanclub'].map(
                  item => (
                    <li key={item}>
                      <button
                        onClick={() => scrollToSection(item)}
                        className="hover:text-rose-antico hover:underline transition-all capitalize cursor-pointer text-left"
                      >
                        {item === 'fanclub' ? 'Fan Club' : item}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Col 3: Contacts & Legal */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-gold">
                Contatti &amp; Privacy
              </h4>
              <p className="text-xs text-gray-400">
                Vuoi scriverci un suggerimento, collaborare o inviarci delle foto da inserire in gallery?
              </p>
              <div className="flex items-center gap-2 text-xs text-rose-antico">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@laurapausinifanclub.demo" className="hover:underline">
                  info@laurapausini-fanclub.com
                </a>
              </div>
              
              {/* Policies toggles */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 pt-2">
                <button
                  onClick={() => setShowPolicyModal('privacy')}
                  className="hover:text-rose-antico hover:underline cursor-pointer"
                >
                  Informativa Privacy
                </button>
                <span>•</span>
                <button
                  onClick={() => setShowPolicyModal('cookie')}
                  className="hover:text-rose-antico hover:underline cursor-pointer"
                >
                  Cookie Policy
                </button>
              </div>
            </div>

          </div>

          {/* Social Icons & Bottom copyright bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div>
              &copy; {new Date().getFullYear()} Laura Pausini Fan Club Non Ufficiale. Tutti i diritti riservati.
            </div>
            
            {/* Aesthetic representation of music socials */}
            <div className="flex items-center gap-3">
              {['Facebook', 'Instagram', 'YouTube', 'Spotify', 'TikTok'].map(sc => (
                <a
                  key={sc}
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert(`Collegamento demo non ufficiale ai canali social di Laura Pausini (${sc})`); }}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-rose-antico hover:text-white flex items-center justify-center text-[10px] font-bold text-gray-400 transition-all duration-300"
                  title={`Visita Laura Pausini su ${sc}`}
                >
                  {sc[0]}
                </a>
              ))}
            </div>
          </div>

        </div>
      </footer>

      {/* FLOAT BACK TO TOP BUTTON */}
      <button
        id="scroll-to-top-btn"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-gold hover:bg-gold-dark text-white shadow-lg transition-all duration-300 z-35 cursor-pointer flex items-center justify-center hover:shadow-xl hover:-translate-y-1 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Torna in alto"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* MODAL 1: SINGLE NEWS DETAILS */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scale-up border border-cipria">
            {/* Modal Header Image */}
            <div className="relative aspect-video shrink-0 bg-gray-100">
              <img
                src={getProxiedImageUrl(selectedNews.imageUrl)}
                alt={selectedNews.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-gold text-xs font-bold uppercase tracking-wider">
                  {selectedNews.date}
                </span>
                <h3 className="font-serif text-xl md:text-2xl font-bold mt-1 leading-tight">
                  {selectedNews.title}
                </h3>
              </div>
            </div>

            {/* Modal Body Scroll */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-4">
              <p className="text-gray-700 text-sm md:text-base leading-relaxed font-medium border-l-4 border-rose-antico pl-3 italic">
                {selectedNews.excerpt}
              </p>
              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                {selectedNews.content.split('. ').map((sentence, sIdx) => {
                  if (sentence.trim() === '') return null;
                  return (
                    <p key={sIdx}>
                      {sentence.trim()}{sentence.endsWith('.') ? '' : '.'}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-cream border-t border-cipria flex items-center justify-between shrink-0">
              <span className="text-[10px] text-gray-400 italic">
                Fan site non ufficiale dedicato a Laura Pausini
              </span>
              <button
                onClick={() => setSelectedNews(null)}
                className="bg-rose-antico hover:bg-rose-antico-dark text-white font-bold py-1.5 px-5 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SINGLE ALBUM DETAILS & TRACKLIST PLAYER */}
      {selectedAlbum && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scale-up border border-cipria">
            {/* Modal Head */}
            <div className="p-4 md:p-6 bg-cream border-b border-cipria flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cipria text-rose-antico rounded-xl">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-nero">
                    Scheda Album • {selectedAlbum.title}
                  </h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                    Pubblicato nel {selectedAlbum.year}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="p-2 text-gray-400 hover:text-rose-antico transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6">
              
              {/* Cover and details Row */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-44 aspect-square rounded-xl overflow-hidden shadow-md border border-cipria shrink-0 bg-gray-100">
                  <img
                    src={getProxiedImageUrl(selectedAlbum.coverUrl)}
                    alt={selectedAlbum.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-3">
                  <h4 className="font-serif text-2xl font-bold text-rose-antico">
                    {selectedAlbum.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selectedAlbum.details}
                  </p>
                  
                  {/* Favorite indicator */}
                  <div className="pt-2">
                    <button
                      onClick={() => toggleFavorite(selectedAlbum.id)}
                      className="border border-rose-antico hover:bg-cipria text-rose-antico text-xs font-bold px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Heart className={`w-3.5 h-3.5 ${favorites[selectedAlbum.id] ? 'fill-rose-antico' : ''}`} />
                      {favorites[selectedAlbum.id] ? 'Album Cuoricato' : 'Cuorica l\'album'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tracklist Block */}
              <div>
                <h4 className="font-serif text-base font-bold text-nero mb-3 border-b border-cipria/30 pb-2 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-gold" />
                  Tracce Principali Demo (Senza testi completi)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedAlbum.tracks.map((track, tIdx) => {
                    const trackId = `${selectedAlbum.id}-tr-${tIdx}`;
                    return (
                      <div
                        key={tIdx}
                        onClick={() => toggleFavorite(trackId)}
                        className="p-2.5 rounded-xl border border-cipria bg-cream/20 hover:bg-cipria/35 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-bold text-gold shrink-0">
                            {String(tIdx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-xs font-medium text-nero group-hover:text-rose-antico transition-colors truncate">
                            {track}
                          </span>
                        </div>
                        <Heart
                          className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110 ${
                            favorites[trackId] ? 'fill-rose-antico text-rose-antico' : 'text-gray-300'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 mt-4 leading-normal">
                  * Nota: Per rispetto dei diritti d&apos;autore dell&apos;artista, questo fan club non include i testi completi delle canzoni o file audio piratati. Puoi ascoltare questi brani sui canali ufficiali (Spotify, Apple Music, YouTube).
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-cream border-t border-cipria flex items-center justify-between shrink-0">
              <span className="text-[10px] text-gray-400 italic">
                Supporta Laura acquistando la sua musica ufficiale.
              </span>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="bg-rose-antico hover:bg-rose-antico-dark text-white font-bold py-1.5 px-5 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TOUR TICKET / INFO POPUP */}
      {selectedTourDate && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl animate-scale-up border border-cipria">
            {/* Modal Header */}
            <div className="p-6 bg-cream border-b border-cipria text-center relative">
              <button
                onClick={() => setSelectedTourDate(null)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-rose-antico transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 rounded-full bg-white border border-cipria flex flex-col items-center justify-center mx-auto mb-3 shadow-sm">
                <span className="text-xl font-bold text-nero leading-none">
                  {selectedTourDate.day}
                </span>
                <span className="text-[11px] font-bold text-rose-antico uppercase tracking-wider mt-0.5 leading-none">
                  {selectedTourDate.month}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-nero">
                Concerto di {selectedTourDate.city}
              </h3>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-antico" />
                {selectedTourDate.venue}
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-cipria/60 rounded-xl p-4 border border-cipria text-xs text-gray-600 leading-relaxed space-y-2">
                <p className="font-bold text-nero flex items-center gap-1.5 text-[13px] text-rose-antico">
                  <Info className="w-4 h-4 shrink-0" />
                  AVVISO AI FAN
                </p>
                <p>
                  Stai visualizzando le informazioni demo per il concerto di <strong>{selectedTourDate.city}</strong> previsto presso il <strong>{selectedTourDate.venue}</strong>.
                </p>
                <p>
                  Lo stato attuale delle vendite stimato per questo evento è: <strong className="text-nero uppercase tracking-wide text-[10px] bg-white px-2 py-0.5 rounded border border-cipria inline-block">{selectedTourDate.status}</strong>.
                </p>
                <p>
                  Ti ricordiamo espressamente che <strong>questo sito non vende biglietti</strong> e non effettua prenotazioni reali. Trattandosi di un fan club indipendente e amatoriale, per acquistare i biglietti ufficiali dei concerti o verificare che la data non abbia subìto variazioni, rinvii o cancellazioni, devi sempre fare riferimento a:
                </p>
                <ul className="list-disc pl-4 space-y-1 mt-1 text-nero font-semibold">
                  <li>Sito ufficiale: laurapausini.com</li>
                  <li>Rivenditori autorizzati (TicketOne, ecc.)</li>
                  <li>Canali social ufficiali dell&apos;artista</li>
                </ul>
              </div>

              {/* Heart booking indicator */}
              <button
                onClick={() => toggleFavorite(`tour-event-${selectedTourDate.id}`)}
                className="w-full border border-rose-antico hover:bg-cipria text-rose-antico text-xs font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${favorites[`tour-event-${selectedTourDate.id}`] ? 'fill-rose-antico' : ''}`} />
                {favorites[`tour-event-${selectedTourDate.id}`] ? 'Rimuovi dai miei eventi pianificati' : 'Salva nei miei eventi pianificati'}
              </button>
            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-cream border-t border-cipria flex gap-3">
              <button
                onClick={() => {
                  setSelectedTourDate(null);
                  alert('Questo pulsante reindirizzerebbe l\'utente alle prevendite ufficiali su TicketOne per l\'acquisto reale.');
                }}
                className="flex-1 bg-gold hover:bg-gold-dark text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md"
              >
                Prevendite Ufficiali
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedTourDate(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FULL DISCOGRAFIA (ALL 8 ALBUMS GRID) */}
      {showAllAlbumsModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-scale-up border border-cipria">
            {/* Header */}
            <div className="p-6 bg-cream border-b border-cipria flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-serif text-2xl font-bold text-nero flex items-center gap-2">
                  <Music className="w-6 h-6 text-rose-antico animate-pulse" />
                  Discografia Completa
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Sezione non ufficiale con tutti gli album in studio di maggior successo (8 capolavori selezionati).
                </p>
              </div>
              <button
                onClick={() => setShowAllAlbumsModal(false)}
                className="p-2.5 text-gray-400 hover:text-rose-antico transition-all cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable grid */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 bg-cream/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {albumsData.map(album => (
                  <div
                    key={album.id}
                    onClick={() => {
                      setSelectedAlbum(album);
                      setShowAllAlbumsModal(false);
                    }}
                    className="bg-white rounded-xl overflow-hidden border border-cipria shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-4 flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative mb-3 border border-cipria">
                      <img
                        src={getProxiedImageUrl(album.coverUrl)}
                        alt={album.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-white bg-black/50 px-1.5 py-0.5 rounded">
                          {album.year}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-nero truncate group-hover:text-rose-antico transition-colors">
                        {album.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 line-clamp-2 mt-1">
                        {album.description}
                      </p>
                    </div>
                    <span className="text-[10px] text-rose-antico font-bold tracking-widest uppercase mt-3 block text-right group-hover:underline">
                      Esplora Tracce &gt;
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-cream border-t border-cipria flex justify-between items-center shrink-0">
              <span className="text-[10px] text-gray-400">
                Visualizzato in modalità provvisoria • Tutte le canzoni appartengono ai rispettivi proprietari.
              </span>
              <button
                onClick={() => setShowAllAlbumsModal(false)}
                className="bg-rose-antico hover:bg-rose-antico-dark text-white font-bold py-1.5 px-6 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ALL NEWS LIST (EXTENDED) */}
      {showAllNewsModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-scale-up border border-cipria">
            {/* Header */}
            <div className="p-6 bg-cream border-b border-cipria flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-serif text-2xl font-bold text-nero flex items-center gap-2">
                  <Award className="w-6 h-6 text-rose-antico" />
                  Tutte le Notizie del Fan Club
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Archivio delle news e curiosità sul cammino musicale e incontri di Laura Pausini.
                </p>
              </div>
              <button
                onClick={() => setShowAllNewsModal(false)}
                className="p-2.5 text-gray-400 hover:text-rose-antico transition-all cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable list of news */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 bg-cream/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsData.map(news => (
                  <div
                    key={news.id}
                    onClick={() => {
                      setSelectedNews(news);
                      setShowAllNewsModal(false);
                    }}
                    className="bg-white rounded-2xl overflow-hidden border border-cipria shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="aspect-video bg-gray-100 overflow-hidden relative">
                      <img
                        src={getProxiedImageUrl(news.imageUrl)}
                        alt={news.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 bg-rose-antico/90 text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded">
                        {news.date}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-base font-bold text-nero mb-2 group-hover:text-rose-antico transition-colors line-clamp-1">
                          {news.title}
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
                          {news.excerpt}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-rose-antico group-hover:underline flex items-center gap-1">
                        Leggi la notizia completa
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-cream border-t border-cipria flex justify-between items-center shrink-0">
              <span className="text-[10px] text-gray-400">
                Aggiornato costantemente dai fan.
              </span>
              <button
                onClick={() => setShowAllNewsModal(false)}
                className="bg-rose-antico hover:bg-rose-antico-dark text-white font-bold py-1.5 px-6 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: BIOGRAFIA DETTAGLIATA (TIMELINE / BIO EXTENDED) */}
      {showBioModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scale-up border border-cipria">
            {/* Head */}
            <div className="p-5 bg-cream border-b border-cipria flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-rose-antico" />
                <h3 className="font-serif text-lg font-bold text-nero">
                  Biografia Estesa di Laura Pausini
                </h3>
              </div>
              <button
                onClick={() => setShowBioModal(false)}
                className="p-2 text-gray-400 hover:text-rose-antico transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6">
              
              {/* Timeline intro */}
              <div className="text-center pb-4 border-b border-cipria/30">
                <h4 className="font-serif text-xl font-bold text-rose-antico italic">
                  &ldquo;La solitudine non è una fine, è stato il mio inizio&rdquo;
                </h4>
                <p className="text-xs text-gray-400 mt-2">
                  Un riassunto cronologico del cammino straordinario di Laura.
                </p>
              </div>

              {/* Timeline steps */}
              <div className="space-y-6 relative border-l-2 border-cipria-dark pl-6 ml-3">
                {[
                  {
                    year: '1974',
                    title: 'La Nascita',
                    desc: 'Nasce a Faenza il 16 maggio. Cresce nella vicina Solarolo, manifestando sin da piccolissima una spiccata passione per il canto guidata dal padre Fabrizio.'
                  },
                  {
                    year: '1993',
                    title: 'La Rivelazione a Sanremo',
                    desc: 'Interpreta "La solitudine" sul palco del Festival di Sanremo vincendo la categoria Novità. Il brano ottiene un clamoroso successo immediato in tutta Europa.'
                  },
                  {
                    year: '1994 - 1996',
                    title: 'Il Mercato Spagnolo',
                    desc: 'Incisione del primo omonimo album in spagnolo. Vende un milione di copie solo in Spagna e conquista le hit parade di tutta l\'America Latina, diventando un idolo assoluto di lingua ispanica.'
                  },
                  {
                    year: '2004 - 2006',
                    title: 'Il Trionfo ai Grammy Awards',
                    desc: 'Pubblica "Resta in ascolto" (Escucha). Nel 2006 riceve il prestigioso Grammy Award a Los Angeles per il Miglior Album Pop Latino, consacrandola formalmente a livello planetario.'
                  },
                  {
                    year: '2021',
                    title: 'Golden Globe & Nomination Oscar',
                    desc: 'Vince il Golden Globe con il brano "Io sì (Seen)" composto con Diane Warren per la colonna sonora del film "La vita davanti a sé" con Sophia Loren, ottenendo una storica nomination all\'Oscar.'
                  },
                  {
                    year: '2023 - Oggi',
                    title: '30 Anni di Successi & Anime Parallele',
                    desc: 'Festeggia 30 anni di straordinaria carriera con una maratona di tre concerti gratuiti a New York, Madrid e Milano in 24 ore. Lancia il fortunatissimo album "Anime Parallele" e dà il via a un trionfale tour mondiale.'
                  }
                ].map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle bullet */}
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-rose-antico border-2 border-white shadow-sm flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    
                    <span className="text-xs font-bold text-gold bg-cipria-dark/50 px-2 py-0.5 rounded">
                      {step.year}
                    </span>
                    <h5 className="font-serif text-sm font-bold text-nero mt-1">
                      {step.title}
                    </h5>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-cream border-t border-cipria flex justify-end shrink-0">
              <button
                onClick={() => setShowBioModal(false)}
                className="bg-rose-antico hover:bg-rose-antico-dark text-white font-bold py-1.5 px-6 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Chiudi Biografia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: PRIVACY & COOKIE POLICY DISCLOSURES */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl animate-scale-up border border-cipria">
            <div className="p-6 bg-cream border-b border-cipria flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold text-nero capitalize">
                {showPolicyModal === 'privacy' ? 'Informativa sulla Privacy' : 'Cookie Policy Informativa'}
              </h3>
              <button
                onClick={() => setShowPolicyModal(null)}
                className="text-gray-400 hover:text-rose-antico transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-xs text-gray-600 leading-relaxed space-y-3 max-h-[60vh] overflow-y-auto">
              {showPolicyModal === 'privacy' ? (
                <>
                  <p className="font-bold text-nero">
                    Informativa ai sensi della normativa vigente sul trattamento dei dati personali (Demo).
                  </p>
                  <p>
                    I dati personali forniti volontariamente tramite il modulo d&apos;iscrizione alla nostra newsletter non ufficiale (nome ed indirizzo email) vengono memorizzati esclusivamente in locale, all&apos;interno del browser dell&apos;utente, al solo scopo dimostrativo di simulare il funzionamento della piattaforma del fan club.
                  </p>
                  <p>
                    Non raccogliamo, non inviamo ad alcun server remoto, non vendiamo e non diffondiamo alcuna informazione a terze parti.
                  </p>
                  <p>
                    Trattandosi di un sito amatoriale sviluppato a scopi di prototipazione, l&apos;iscrizione non comporta l&apos;inserimento in liste reali o l&apos;invio di comunicazioni promozionali effettive.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-nero">
                    Uso dei Cookie e memorie locali (Demo).
                  </p>
                  <p>
                    Questo sito non utilizza cookie di profilazione o tracciamento commerciale di terze parti.
                  </p>
                  <p>
                    Potrebbe utilizzare tecnologie di archiviazione locale (LocalStorage) del browser per salvare in modo persistente le canzoni e gli album preferiti contrassegnati con l&apos;icona a cuore, così come lo stato delle risposte fornite all&apos;interno del gioco quiz. Questa memorizzazione avviene esclusivamente sul dispositivo dell&apos;utente e può essere azzerata in qualsiasi momento svuotando la cache del browser.
                  </p>
                </>
              )}
            </div>

            <div className="p-4 bg-cream border-t border-cipria text-right">
              <button
                onClick={() => setShowPolicyModal(null)}
                className="bg-rose-antico hover:bg-rose-antico-dark text-white font-bold py-1.5 px-5 rounded-lg text-xs uppercase cursor-pointer"
              >
                Ho Capito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN LIGHTBOX GALLERY FOR PORTRAITS */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between p-4 backdrop-blur-sm animate-fade-in select-none">
          {/* Top Bar controls */}
          <div className="flex justify-between items-center text-white py-2 px-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-gold uppercase tracking-widest font-bold">
                {filteredGallery[lightboxIndex].category}
              </span>
              <span className="text-xs text-gray-400">
                Immagine {lightboxIndex + 1} di {filteredGallery.length}
              </span>
            </div>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 bg-white/10 hover:bg-rose-antico text-white rounded-full transition-all cursor-pointer shadow-md"
              title="Chiudi galleria (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Central main photo view */}
          <div className="flex-1 flex items-center justify-between gap-4 max-w-6xl mx-auto w-full relative">
            
            {/* Prev button */}
            <button
              onClick={handlePrevLightbox}
              className="p-3 bg-white/10 hover:bg-rose-antico text-white rounded-full transition-all cursor-pointer shrink-0 z-10"
              title="Precedente (Freccia Sinistra)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Image display */}
            <div className="relative max-h-[75vh] max-w-[80vw] mx-auto flex flex-col items-center justify-center animate-scale-up">
              <img
                src={getProxiedImageUrl(filteredGallery[lightboxIndex].url)}
                alt={filteredGallery[lightboxIndex].caption}
                className="max-h-[70vh] max-w-full rounded-xl object-contain border border-white/10 shadow-2xl"
                referrerPolicy="no-referrer"
              />
              
              {/* Caption overlay */}
              <div className="mt-4 text-center max-w-lg bg-black/50 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <p className="text-white text-sm font-medium">
                  {filteredGallery[lightboxIndex].caption}
                </p>
              </div>
            </div>

            {/* Next button */}
            <button
              onClick={handleNextLightbox}
              className="p-3 bg-white/10 hover:bg-rose-antico text-white rounded-full transition-all cursor-pointer shrink-0 z-10"
              title="Successivo (Freccia Destra)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
          </div>

          {/* Bottom thumbnails scrollbar indicator */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-4 shrink-0">
            {filteredGallery.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(idx)}
                className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 cursor-pointer border transition-all ${
                  idx === lightboxIndex ? 'border-rose-antico scale-110 shadow-md shadow-rose-antico/45' : 'border-white/10 opacity-40 hover:opacity-80'
                }`}
              >
                <img
                  src={getProxiedImageUrl(item.url)}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
