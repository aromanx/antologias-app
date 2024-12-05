import { useState, useEffect } from 'react';
import { ENDPOINTS } from '@/config/config';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, PlusCircle, Edit, Trash2, Book, Info } from "lucide-react";
import LoadingSpinner from './LoadingSpinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import PropTypes from 'prop-types';
import { Book as BookComponent } from './Book';
import ReactMarkdown from 'react-markdown';

export function AutoresPanel({ readOnly = false, onAntologiaSelect, onPlayAudio, isPlaying, userId, renderAutorActions }) {
  const [autores, setAutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [currentAutor, setCurrentAutor] = useState(null);
  const [selectedAutorAntologias, setSelectedAutorAntologias] = useState(null);
  const [selectedAntologia, setSelectedAntologia] = useState(null);
  const [loadingAntologias, setLoadingAntologias] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [antologiaDialogOpen, setAntologiaDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAutores();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, searchTerm]);

  const fetchAutores = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${ENDPOINTS.autores}?page=${page}&limit=10&search=${searchTerm}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener autores');
      }

      const data = await response.json();
      setAutores(data.autores);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (error) {
      console.error("Error al obtener los autores:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAntologias = async (autor) => {
    try {
      setLoadingAntologias(true);
      setError(null);
      console.log('Obteniendo antologías para autor:', autor.idautor);
      
      const response = await fetch(`${ENDPOINTS.autores}/${autor.idautor}/antologias`);
      const data = await response.json();
      
      console.log('Respuesta del servidor:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener antologías');
      }

      if (!data.antologias) {
        throw new Error('No se recibieron antologías del servidor');
      }

      setSelectedAutorAntologias({
        autor: data.autor,
        antologias: data.antologias
      });
      
      setDialogOpen(true);
    } catch (error) {
      console.error("Error al obtener antologías:", error);
      setError(error.message);
    } finally {
      setLoadingAntologias(false);
    }
  };

  const handleSubmitAutor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = currentAutor?.idautor ? "PUT" : "POST";
      const url = currentAutor?.idautor 
        ? `${ENDPOINTS.autores}/${currentAutor.idautor}`
        : ENDPOINTS.autores;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: currentAutor.nombre,
          biografia: currentAutor.biografia,
          urlfoto: currentAutor.urlfoto
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar autor');
      }
      
      setEditMode(false);
      setCurrentAutor(null);
      await fetchAutores();
      setError(null);
    } catch (error) {
      console.error("Error al guardar autor:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAutor = async (idautor) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este autor?")) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${ENDPOINTS.autores}/${idautor}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar autor');
      }

      await fetchAutores();
      setError(null);
    } catch (error) {
      console.error("Error al eliminar autor:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !editMode) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4">
      {editMode ? (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            {currentAutor?.idautor ? "Editar Autor" : "Nuevo Autor"}
          </h2>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmitAutor} className="space-y-4">
            <div>
              <label className="block mb-2">Nombre</label>
              <Input
                type="text"
                value={currentAutor?.nombre || ""}
                onChange={(e) =>
                  setCurrentAutor({
                    ...currentAutor,
                    nombre: e.target.value,
                  })
                }
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block mb-2">Biografía</label>
              <textarea
                className="w-full p-2 border rounded-md"
                value={currentAutor?.biografia || ""}
                onChange={(e) =>
                  setCurrentAutor({
                    ...currentAutor,
                    biografia: e.target.value,
                  })
                }
                required
                disabled={loading}
                rows={4}
              />
            </div>
            <div>
              <label className="block mb-2">URL de la foto</label>
              <Input
                type="url"
                value={currentAutor?.urlfoto || ""}
                onChange={(e) =>
                  setCurrentAutor({
                    ...currentAutor,
                    urlfoto: e.target.value,
                  })
                }
                disabled={loading}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  setCurrentAutor(null);
                  setError(null);
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Autores</h2>
            {!readOnly && (
              <Button
                onClick={() => {
                  setEditMode(true);
                  setCurrentAutor({
                    nombre: "",
                    biografia: "",
                    urlfoto: "",
                  });
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Nuevo Autor
              </Button>
            )}
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar autores..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-8"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {autores.map((autor) => (
              <Card key={autor.idautor}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {autor.nombre}
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
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
                      {!readOnly && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditMode(true);
                              setCurrentAutor(autor);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAutor(autor.idautor)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <div className="relative h-48">
                  <img
                    src={autor.urlfoto}
                    alt={autor.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-lg font-semibold">{autor.nombre}</p>
                  </div>
                </div>

                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {autor.biografia}
                  </p>
                </CardContent>

                <CardFooter className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {!readOnly && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditMode(true);
                            setCurrentAutor(autor);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAutor(autor.idautor)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={() => handleViewAntologias(autor)}
                  >
                    <Book className="h-4 w-4 mr-2" />
                    Ver Antologías
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Diálogo de antologías */}
          <Dialog 
            open={dialogOpen} 
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setSelectedAutorAntologias(null);
                setError(null);
              }
            }}
          >
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  Antologías de {selectedAutorAntologias?.autor?.nombre}
                </DialogTitle>
                <DialogDescription>
                  Listado de obras publicadas
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[60vh]">
                {loadingAntologias ? (
                  <div className="flex justify-center items-center h-32">
                    <LoadingSpinner />
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 p-4">
                    {error}
                  </div>
                ) : selectedAutorAntologias?.antologias?.length > 0 ? (
                  <div className="grid gap-4 p-4">
                    {selectedAutorAntologias.antologias.map((antologia) => (
                      <Card 
                        key={antologia.id} 
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setSelectedAntologia(antologia);
                          setAntologiaDialogOpen(true);
                        }}
                      >
                        <CardContent className="p-4">
                          <h3 className="text-lg font-semibold mb-2">
                            {antologia.titulo}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {antologia.tituloObra}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2 italic">
                            {antologia.contenido}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 p-4">
                    No hay antologías disponibles para este autor
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Diálogo para mostrar la antología seleccionada */}
          <Dialog 
            open={antologiaDialogOpen} 
            onOpenChange={(open) => {
              setAntologiaDialogOpen(open);
              if (!open) {
                setSelectedAntologia(null);
              }
            }}
          >
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{selectedAntologia?.titulo}</DialogTitle>
                <DialogDescription>
                  {selectedAntologia?.tituloObra}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                {selectedAntologia && (
                  <BookComponent antologia={selectedAntologia} />
                )}
              </div>
            </DialogContent>
          </Dialog>

          {autores.length > 0 && (
            <div className="mt-6 flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Anterior
              </Button>
              <span className="py-2">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Siguiente
              </Button>
            </div>
          )}

          {autores.length === 0 && !loading && (
            <div className="text-center text-gray-500 mt-8">
              No se encontraron autores
            </div>
          )}
        </>
      )}
    </div>
  );
}

AutoresPanel.propTypes = {
  readOnly: PropTypes.bool,
  onAntologiaSelect: PropTypes.func,
  onPlayAudio: PropTypes.func,
  isPlaying: PropTypes.bool,
  userId: PropTypes.string,
  renderAutorActions: PropTypes.func
};

AutoresPanel.defaultProps = {
  readOnly: false,
  onAntologiaSelect: null,
  onPlayAudio: null,
  isPlaying: false,
  userId: null,
  renderAutorActions: null
}; 