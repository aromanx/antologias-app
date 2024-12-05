import React, { Suspense, useState, useEffect } from 'react';
import LoadingSpinner from "@/components/LoadingSpinner";
import { Book } from "@/components/Book";
import { ENDPOINTS } from '@/config/config';
import { useAuth0 } from "@auth0/auth0-react";
import { Input } from "@/components/ui/input";
import { Search, Volume2, VolumeX, Heart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AutoresPanel } from '@/components/AutoresPanel';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from 'react-markdown';
import { VerseGame } from "@/components/VerseGame";

// Importación diferida del panel de administración
const AdminPanel = React.lazy(() => import('@/components/AdminPanel'));

// Agregar la constante con los correos permitidos al inicio del archivo, después de los imports
const ADMIN_EMAILS = ['aroman@ucol.mx', 'sanchezp@ucol.mx'];

function App() {
  // Estados
  const [antologias, setAntologias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedPromptType, setSelectedPromptType] = useState("analisis");
  const [selectedAntologia, setSelectedAntologia] = useState(null);
  const [likedAntologias, setLikedAntologias] = useState(new Set());
  const [selectedAutor, setSelectedAutor] = useState(null);

  // Auth0
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  // Inicializar Google Gemini con la API key
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

  // Cargar antologías al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${ENDPOINTS.antologias}`);
      if (!response.ok) {
        throw new Error('Error al cargar las antologías');
      }
      const data = await response.json();
      console.log("Antologías cargadas:", data);
      setAntologias(data);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar antologías según término de búsqueda
  const filteredAntologias = antologias.filter((antologia) =>
    antologia.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    antologia.autorObra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    antologia.contenido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    antologia.Autor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlayAudio = (text) => {
    window.speechSynthesis.cancel();

    if (isPlaying) {
      setIsPlaying(false);
      setCurrentAudio(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
      console.error('Error en la reproducción de audio');
    };

    setCurrentAudio(utterance);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const predefinedPrompts = {
    analisis: (antologia) => `
      Realiza un análisis literario profundo del siguiente poema:

      Título: ${antologia.titulo}
      Obra: ${antologia.tituloObra}
      Autor: ${antologia.autorObra}
      Contenido:
      ${antologia.contenido}

      Por favor, proporciona un análisis detallado que incluya:
      1. Análisis formal:
         - Estructura métrica y rítmica
         - Tipo de estrofa y rima
         - Recursos fónicos y sonoros
      2. Análisis retórico:
         - Figuras literarias principales
         - Recursos estilísticos destacados
         - Campos semánticos predominantes
      3. Análisis temático:
         - Tema central y subtemas
         - Motivos literarios recurrentes
         - Simbología específica
      4. Análisis contextual:
         - Relación con el movimiento literario
         - Influencias literarias detectables
         - Contexto histórico-cultural
      5. Interpretación crítica:
         - Significado profundo de la obra
         - Relevancia literaria y cultural
         - Aportaciones innovadoras
    `,
    metrica: (antologia) => `
      Realiza un análisis métrico detallado del siguiente poema:

      ${antologia.contenido}

      Por favor, analiza:
      1. Estructura métrica:
         - Tipo de verso y medida
         - Esquema de rima
         - Estrofas y su clasificación
      2. Ritmo y musicalidad:
         - Acentos rítmicos
         - Pausas y encabalgamientos
         - Efectos sonoros
      3. Recursos fónicos:
         - Aliteraciones
         - Paronomasias
         - Otros recursos sonoros
    `,
    retorica: (antologia) => `
      Analiza los recursos retóricos y figuras literarias en:

      ${antologia.contenido}

      Detalla:
      1. Figuras de pensamiento:
         - Metáforas y sus interpretaciones
         - Símiles y comparaciones
         - Alegorías y símbolos
      2. Figuras de dicción:
         - Paralelismos
         - Repeticiones
         - Estructuras sintácticas
      3. Tropos:
         - Metonimias
         - Sinécdoques
         - Hipérboles
    `,
    intertextualidad: (antologia) => `
      Realiza un análisis intertextual de la obra:

      Título: ${antologia.titulo}
      Autor: ${antologia.autorObra}
      Contenido: ${antologia.contenido}

      Analiza:
      1. Referencias literarias:
         - Alusiones a otras obras
         - Influencias detectables
         - Diálogo con la tradición
      2. Contexto literario:
         - Relación con otros autores
         - Movimiento literario
         - Innovaciones aportadas
      3. Conexiones culturales:
         - Referencias históricas
         - Elementos culturales
         - Significado social
    `,
    contexto: (antologia) => `
      Proporciona el contexto histórico y cultural de la siguiente obra:

      Título: ${antologia.titulo}
      Obra: ${antologia.tituloObra}
      Autor: ${antologia.autorObra}

      Incluye:
      1. Época y contexto histórico
      2. Movimiento literario
      3. Influencias culturales
      4. Impacto en la literatura de Colima
      5. Relevancia actual
    `,
    autor: (antologia) => `
      Analiza la figura del autor y su obra:

      Autor: ${antologia.autorObra}
      Obra: ${antologia.tituloObra}

      Proporciona:
      1. Biografía relevante
      2. Estilo literario característico
      3. Principales influencias
      4. Aportaciones a la literatura
      5. Legado cultural
    `,
    comparativo: (antologia) => `
      Realiza un análisis comparativo:

      Obra actual:
      Título: ${antologia.titulo}
      Autor: ${antologia.autorObra}
      Contenido:
      ${antologia.contenido}

      Compara con:
      1. Obras similares de la poca
      2. Otros autores de Colima
      3. Tendencias literarias contemporáneas
      4. Influencias y diferencias
      5. Aportaciones únicas
    `,
    simbolismo: (antologia) => `
      Analiza el simbolismo y las metáforas:

      Poema:
      ${antologia.contenido}

      Detalla:
      1. Símbolos principales
      2. Metáforas y su significado
      3. Imágenes poéticas
      4. Referencias culturales
      5. Interpretación simbólica general
    `,
    sentimientos: (antologia) => `
      Realiza un análisis de sentimientos sobre el siguiente poema:

      Título: ${antologia.titulo}
      Obra: ${antologia.tituloObra}
      Autor: ${antologia.autorObra}
      Contenido:
      ${antologia.contenido}

      Proporciona:
      1. Sentimientos predominantes
      2. Emociones evocadas
      3. Impacto emocional en el lector
      4. Comparación con otros poemas
    `,
    hermeneutica: (antologia) => `
      Realiza una interpretación hermenéutica del poema:

      ${antologia.contenido}

      Considera:
      1. Niveles de significación:
         - Sentido literal
         - Sentido alegórico
         - Sentido simbólico
      2. Horizontes interpretativos:
         - Contexto de producción
         - Contexto de recepción
         - Actualización del significado
      3. Dimensiones de análisis:
         - Histórica
         - Cultural
         - Filosófica
    `
  };

  const handleAIInteraction = async (antologia, promptType = "custom") => {
    setIsAiLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Crear un prompt enriquecido con toda la información disponible
      const enrichedPrompt = `
        Analiza la siguiente obra y su autor, considerando toda la información disponible:

        INFORMACIÓN DE LA ANTOLOGÍA:
        Título: ${antologia.titulo}
        Obra: ${antologia.tituloObra}
        Autor de la obra: ${antologia.autorObra}
        Contenido:
        ${antologia.contenido}

        INFORMACIÓN DEL AUTOR QUE REGISTRÓ:
        Nombre: ${antologia.Autor?.nombre}
        Biografía: ${antologia.Autor?.biografia}
        
        ${promptType === "custom" 
          ? customPrompt 
          : predefinedPrompts[promptType](antologia)
        }

        Por favor, complementa este análisis con tu conocimiento sobre:
        1. Contexto histórico y cultural del autor y la obra
        2. Otras obras relevantes del autor
        3. Influencias literarias y conexiones con otros autores
        4. Impacto en la literatura de Colima y México
        5. Relevancia contemporánea de la obra

        Organiza la respuesta en secciones claras y proporciona ejemplos específicos cuando sea posible.
      `;

      const result = await model.generateContent(enrichedPrompt);
      const response = await result.response;
      const text = response.text();
      setAiResponse({
        antologiaId: antologia.id,
        analysis: text
      });
    } catch (error) {
      console.error("Error al interactuar con la IA:", error);
      setAiResponse({
        antologiaId: antologia.id,
        error: "No se pudo generar el análisis. Por favor, intente más tarde."
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Limpiar el audio cuando el componente se desmonta
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentAudio(null);
    };
  }, []);

  // Función para generar un ID de usuario consistente
  const generateUserId = () => {
    return 1; // ID fijo para pruebas
  };

  const handleLikeClick = async (antologia, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert("Necesitas iniciar sesión para dar like a las antologías");
      return;
    }

    try {
      // Validar que tengamos un ID de antología válido
      if (!antologia?.id) {
        console.error('Error: ID de antología no válido', antologia);
        throw new Error('ID de antología no válido');
      }

      const idusuario = generateUserId();
      if (!idusuario) {
        throw new Error('No se pudo generar el ID de usuario');
      }

      console.log('Enviando petición de like:', { 
        url: `${ENDPOINTS.likes}/${antologia.id}`,
        body: { idusuario },
        antologia: {
          id: antologia.id,
          titulo: antologia.titulo
        }
      });

      const response = await fetch(`${ENDPOINTS.likes}/${antologia.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idusuario }),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      if (!response.ok) {
        // Manejar caso específico de like duplicado
        if (response.status === 400 && data.error === 'Ya has dado like a esta antología') {
          console.log('Like duplicado detectado');
          setLikedAntologias(prev => {
            const newSet = new Set(prev);
            newSet.add(antologia.id);
            return newSet;
          });
          throw new Error(data.error);
        }
        throw new Error(data.error || 'Error al procesar el like');
      }

      // Actualizar estados solo si la operación fue exitosa
      if (data.success) {
        console.log('Like registrado exitosamente:', data);
        
        // Actualizar el set de likes
        setLikedAntologias(prev => {
          const newSet = new Set(prev);
          newSet.add(antologia.id);
          return newSet;
        });

        // Actualizar el contador en la antología
        setAntologias(prev => prev.map(ant => {
          if (ant.id === antologia.id) {
            const newLikes = (ant.likes || 0) + 1;
            console.log('Actualizando contador de likes:', {
              antologiaId: ant.id,
              likesAnteriores: ant.likes,
              nuevosLikes: newLikes
            });
            return {
              ...ant,
              likes: newLikes
            };
          }
          return ant;
        }));
      }
    } catch (error) {
      console.error("Error al procesar like:", error);
      alert(error.message || "No se pudo registrar el like. Por favor, intenta de nuevo.");
    }
  };

  // Función para cargar los likes del usuario
  const fetchUserLikes = async () => {
    if (!isAuthenticated) return;

    try {
      const userId = generateUserId();
      console.log('Obteniendo likes para usuario:', userId);

      const response = await fetch(`${ENDPOINTS.likes}/user/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener likes');
      }

      console.log('Likes del usuario cargados:', data);
      
      if (Array.isArray(data)) {
        const likedIds = data.map(like => like.idantologia);
        console.log('IDs de antologías con like:', likedIds);
        setLikedAntologias(new Set(likedIds));
      } else {
        console.error('Respuesta inesperada al obtener likes:', data);
        setLikedAntologias(new Set());
      }
    } catch (error) {
      console.error("Error al obtener likes:", error);
      setLikedAntologias(new Set());
    }
  };

  // Efecto para cargar los likes cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserLikes();
    } else {
      setLikedAntologias(new Set()); // Limpiar likes si el usuario no está autenticado
    }
  }, [isAuthenticated, user]);

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">COLIMA EN SU POESÍA</h1>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm">Bienvenido, {user.name}</span>
                {ADMIN_EMAILS.includes(user.email) && (
                  <Button
                    variant="secondary"
                    onClick={() => setShowAdmin(!showAdmin)}
                  >
                    {showAdmin ? 'Ver Contenido' : 'Administración'}
                  </Button>
                )}
                <button
                  onClick={() => logout({ returnTo: window.location.origin })}
                  className="bg-white text-primary px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="bg-white text-primary px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 py-8">
        {showAdmin && isAuthenticated && ADMIN_EMAILS.includes(user.email) ? (
          <Suspense fallback={<LoadingSpinner />}>
            <AdminPanel onAntologiaChange={fetchData} />
          </Suspense>
        ) : (
          <Tabs defaultValue="antologias" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="antologias">Antologías</TabsTrigger>
              <TabsTrigger value="autores">Autores</TabsTrigger>
            </TabsList>

            <TabsContent value="antologias">
              {/* Buscador */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por título, autor o contenido..."
                    className="pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Lista de Antologías */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAntologias.length > 0 ? (
                  filteredAntologias.map((antologia) => (
                    <div key={antologia.id || antologia.idautor} 
                      className="bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="relative">
                        <Book antologia={antologia} />
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayAudio(antologia.contenido);
                            }}
                            className={`rounded-full ${isPlaying ? "bg-primary text-white" : ""}`}
                            title={isPlaying ? "Detener lectura" : "Reproducir texto"}
                          >
                            {isPlaying ? (
                              <VolumeX className="h-5 w-5" />
                            ) : (
                              <Volume2 className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 border-t">
                        <div className="flex gap-2">
                          <Button
                            variant={likedAntologias.has(antologia.id) ? "secondary" : "ghost"}
                            size="sm"
                            onClick={(e) => handleLikeClick(antologia, e)}
                            className={`
                              ${likedAntologias.has(antologia.id) ? "text-red-500 hover:text-red-600" : "hover:text-red-500"} 
                              flex-shrink-0 transition-colors duration-200
                              ${!isAuthenticated ? "cursor-pointer" : ""}
                            `}
                            title={
                              !isAuthenticated 
                                ? "Inicia sesión para dar like" 
                                : likedAntologias.has(antologia.id)
                                  ? "Ya has dado like a esta antología"
                                  : "Me gusta"
                            }
                            disabled={likedAntologias.has(antologia.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Heart 
                                className={`h-4 w-4 transition-all duration-200 ${
                                  likedAntologias.has(antologia.id) 
                                    ? "fill-current scale-110" 
                                    : "scale-100 hover:scale-110"
                                }`}
                              />
                              <span className="text-sm font-medium">
                                {antologia.likes || 0}
                              </span>
                            </div>
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                className="w-full"
                              >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Analizar con IA
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Análisis de "{antologia.titulo}"</DialogTitle>
                                <DialogDescription>
                                  Por {antologia.autorObra}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    variant={selectedPromptType === "analisis" ? "default" : "outline"}
                                    onClick={() => {
                                      setSelectedPromptType("analisis");
                                      handleAIInteraction(antologia, "analisis");
                                    }}
                                  >
                                    Análisis Literario
                                  </Button>
                                  <Button
                                    variant={selectedPromptType === "metrica" ? "default" : "outline"}
                                    onClick={() => {
                                      setSelectedPromptType("metrica");
                                      handleAIInteraction(antologia, "metrica");
                                    }}
                                  >
                                    Análisis Métrico
                                  </Button>
                                  <Button
                                    variant={selectedPromptType === "retorica" ? "default" : "outline"}
                                    onClick={() => {
                                      setSelectedPromptType("retorica");
                                      handleAIInteraction(antologia, "retorica");
                                    }}
                                  >
                                    Recursos Retóricos
                                  </Button>
                                  <Button
                                    variant={selectedPromptType === "intertextualidad" ? "default" : "outline"}
                                    onClick={() => {
                                      setSelectedPromptType("intertextualidad");
                                      handleAIInteraction(antologia, "intertextualidad");
                                    }}
                                  >
                                    Intertextualidad
                                  </Button>
                                  <Button
                                    variant={selectedPromptType === "contexto" ? "default" : "outline"}
                                    onClick={() => {
                                      setSelectedPromptType("contexto");
                                      handleAIInteraction(antologia, "contexto");
                                    }}
                                  >
                                    Contexto Histórico
                                  </Button>
                                  <Button
                                    variant={selectedPromptType === "autor" ? "default" : "outline"}
                                    onClick={() => {
                                      setSelectedPromptType("autor");
                                      handleAIInteraction(antologia, "autor");
                                    }}
                                  >
                                    Análisis del Autor
                                  </Button>
                                  <Button
                                    variant={selectedPromptType === "comparativo" ? "default" : "outline"}
                                    onClick={() => {
                                      setSelectedPromptType("comparativo");
                                      handleAIInteraction(antologia, "comparativo");
                                    }}
                                  >
                                    Análisis Comparativo
                                  </Button>
                                  <Button
                                    variant={selectedPromptType === "simbolismo" ? "default" : "outline"}
                                    onClick={() => {
                                      setSelectedPromptType("simbolismo");
                                      handleAIInteraction(antologia, "simbolismo");
                                    }}
                                  >
                                    Simbolismo y Metáforas
                                  </Button>
                                  <Button
                                    variant={selectedPromptType === "sentimientos" ? "default" : "outline"}
                                    onClick={() => {
                                      setSelectedPromptType("sentimientos");
                                      handleAIInteraction(antologia, "sentimientos");
                                    }}
                                  >
                                    Análisis de Sentimientos
                                  </Button>
                                  <Button
                                    variant={selectedPromptType === "hermeneutica" ? "default" : "outline"}
                                    onClick={() => {
                                      setSelectedPromptType("hermeneutica");
                                      handleAIInteraction(antologia, "hermeneutica");
                                    }}
                                  >
                                    Análisis Hermenéutico
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    O escribe tu propia pregunta:
                                  </label>
                                  <Textarea
                                    placeholder="Escribe tu pregunta sobre la obra o el autor..."
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    className="min-h-[100px]"
                                  />
                                  <Button
                                    className="w-full"
                                    disabled={!customPrompt.trim()}
                                    onClick={() => {
                                      setSelectedPromptType("custom");
                                      handleAIInteraction(antologia, "custom");
                                    }}
                                  >
                                    Enviar Pregunta
                                  </Button>
                                </div>

                                <div className="mt-6">
                                  {isAiLoading ? (
                                    <div className="flex items-center justify-center p-8">
                                      <LoadingSpinner />
                                    </div>
                                  ) : aiResponse?.antologiaId === antologia.id ? (
                                    aiResponse.error ? (
                                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                        <div className="flex items-center">
                                          <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                          </div>
                                          <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">
                                              Error en el análisis
                                            </h3>
                                            <div className="mt-2 text-sm text-red-700">
                                              {aiResponse.error}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <ReactMarkdown
                                          components={{
                                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-3" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-lg font-bold my-2" {...props} />,
                                            p: ({ node, ...props }) => <p className="my-2 text-gray-800 dark:text-gray-200" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-2" {...props} />,
                                            li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                                            blockquote: ({ node, ...props }) => (
                                              <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic" {...props} />
                                            ),
                                            code: ({ node, inline, ...props }) => (
                                              inline ? (
                                                <code className="bg-gray-100 dark:bg-gray-800 rounded px-1" {...props} />
                                              ) : (
                                                <pre className="bg-gray-100 dark:bg-gray-800 rounded p-4 overflow-x-auto">
                                                  <code {...props} />
                                                </pre>
                                              )
                                            ),
                                          }}
                                        >
                                          {aiResponse.analysis.replace(/\n/g, '\n\n')}
                                        </ReactMarkdown>
                                      </div>
                                    )
                                  ) : (
                                    <div className="text-center text-muted-foreground p-4">
                                      Selecciona un tipo de análisis o escribe tu pregunta.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Agregar el nuevo botón para el juego de versos */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="flex items-center"
                                title="Jugar con versos"
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  className="h-4 w-4 mr-2"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                  />
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Jugar con Versos
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh]">
                              <DialogHeader>
                                <DialogTitle>Juego de Versos - {antologia.titulo}</DialogTitle>
                                <DialogDescription>
                                  Pon a prueba tu conocimiento de esta obra de {antologia.autorObra}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 overflow-y-auto">
                                <VerseGame 
                                  content={antologia.contenido}
                                  title={antologia.titulo}
                                  author={antologia.autorObra}
                                  onClose={() => {
                                    const dialog = document.querySelector('[role="dialog"]');
                                    if (dialog) {
                                      dialog.close();
                                    }
                                  }}
                                />
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Nuevo botón para biografía del autor */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                className="flex-shrink-0"
                                title="Ver biografía del autor"
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-4 w-4" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                                  />
                                </svg>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh]">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-4">
                                  <div className="w-full text-center mb-4">
                                    <div className="relative w-48 h-48 mx-auto mb-4">
                                      <img
                                        src={antologia.Autor.urlfoto}
                                        alt={antologia.Autor.nombre}
                                        className="w-full h-full object-cover rounded-lg shadow-lg"
                                        onError={(e) => {
                                          e.target.src = 'https://via.placeholder.com/150';
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg"></div>
                                    </div>
                                    <h2 className="text-2xl font-bold">{antologia.Autor.nombre}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {antologia.Antologias?.length || 0} antologías publicadas
                                    </p>
                                  </div>
                                </DialogTitle>
                              </DialogHeader>
                              <div className="mt-6 overflow-y-auto max-h-[60vh] pr-2">
                                <div className="prose prose-sm max-w-none">
                                  <div className="bg-muted/50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4">Biografía</h3>
                                    <ReactMarkdown>
                                      {antologia.Autor.biografia}
                                    </ReactMarkdown>
                                  </div>
                                  <div className="mt-4">
                                    <h3 className="text-lg font-semibold mb-4">Obras Publicadas</h3>
                                    <div className="bg-muted/50 p-6 rounded-lg">
                                      {antologia.Antologias?.map((obra, index) => (
                                        <div key={index} className="mb-4 last:mb-0">
                                          <h4 className="font-medium text-primary">{obra.titulo}</h4>
                                          <p className="text-sm text-muted-foreground mt-1">{obra.tituloObra}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No se encontraron antologías que coincidan con tu búsqueda.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="autores">
              <div className="max-w-7xl mx-auto">
                <AutoresPanel 
                  readOnly={true} 
                  onAntologiaSelect={(antologia) => {
                    setSelectedAntologia(antologia);
                  }}
                  onPlayAudio={(text) => {
                    handlePlayAudio(text);
                  }}
                  isPlaying={isPlaying}
                  userId={null}
                  renderAutorActions={(autor) => (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="ml-2"
                          title="Ver biografía"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-4">
                            <div className="w-full text-center mb-4">
                              <div className="relative w-48 h-48 mx-auto mb-4">
                                <img
                                  src={autor.urlfoto}
                                  alt={autor.nombre}
                                  className="w-full h-full object-cover rounded-lg shadow-lg"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/150';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg"></div>
                              </div>
                              <h2 className="text-2xl font-bold">{autor.nombre}</h2>
                            </div>
                          </DialogTitle>
                        </DialogHeader>
                        <div className="mt-6 overflow-y-auto max-h-[60vh] pr-2">
                          <div className="prose prose-sm max-w-none">
                            <div className="bg-muted/50 p-6 rounded-lg">
                              <h3 className="text-lg font-semibold mb-4">Biografía</h3>
                              <ReactMarkdown>
                                {autor.biografia || "No hay biografía disponible"}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-semibold mb-2">UCOL-CA-49</h3>
              <p className="text-sm text-muted-foreground">
                Rescate del patrimonio cultural y literario
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">UCOL-CA-55</h3>
              <p className="text-sm text-muted-foreground">
                Ingeniería de Software y Tecnologías de Información
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">UCOL-CA-91</h3>
              <p className="text-sm text-muted-foreground">
                Automatización y sistemas embebidos
              </p>
            </div>
          </div>
          <div className="text-center mt-6 text-sm text-muted-foreground">
            <p>Universidad de Colima</p>
            <p>© {new Date().getFullYear()} Todos los derechos reservados</p>
          </div>
        </div>
      </footer>

      {/* Agregar el diálogo para mostrar la antología seleccionada */}
      <Dialog open={!!selectedAntologia} onOpenChange={() => setSelectedAntologia(null)}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedAntologia?.titulo}</DialogTitle>
            <DialogDescription>
              {selectedAntologia?.tituloObra} - {selectedAntologia?.autorObra}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto mt-4">
            {selectedAntologia && <Book antologia={selectedAntologia} />}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedAntologia(null)}
            >
              Cerrar
            </Button>
            <Button
              variant="secondary"
              onClick={() => handlePlayAudio(selectedAntologia?.contenido)}
            >
              {isPlaying ? (
                <>
                  <VolumeX className="h-4 w-4 mr-2" />
                  Detener lectura
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Reproducir
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
