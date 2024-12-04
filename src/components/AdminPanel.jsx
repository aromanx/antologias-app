import React, { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ENDPOINTS } from '@/config/config';
import { AutoresPanel } from './AutoresPanel';
import { Book } from './Book';

const AdminPanel = memo(({ onAntologiaChange }) => {
  const [antologias, setAntologias] = useState([]);
  const [autores, setAutores] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentAntologia, setCurrentAntologia] = useState(null);
  const [currentAutor, setCurrentAutor] = useState(null);
  const [editModeAutor, setEditModeAutor] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAntologia, setSelectedAntologia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        await fetchAutores();
        await fetchAntologias();
      } catch (error) {
        console.error('Error al inicializar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const fetchAntologias = async () => {
    try {
      const response = await fetch(ENDPOINTS.antologias);
      if (!response.ok) {
        throw new Error('Error al obtener antologías');
      }
      const data = await response.json();
      setAntologias(data);
    } catch (error) {
      console.error("Error al obtener las antologías:", error);
    }
  };

  const fetchAutores = async () => {
    try {
      console.log('Obteniendo autores...');
      const response = await fetch(ENDPOINTS.autores);
      if (!response.ok) {
        throw new Error('Error al obtener autores');
      }
      const data = await response.json();
      console.log('Autores obtenidos:', data);
      if (data && data.autores && Array.isArray(data.autores)) {
        setAutores(data.autores);
      } else {
        console.error('Formato de datos de autores inválido:', data);
        setAutores([]);
      }
    } catch (error) {
      console.error("Error al obtener los autores:", error);
      setAutores([]);
    }
  };

  const handleDeleteAntologia = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta antología?")) {
      return;
    }

    try {
      const response = await fetch(`${ENDPOINTS.antologias}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la antología');
      }

      const data = await response.json();
      
      if (data.success) {
        // Actualizar la lista de antologías
        await fetchAntologias();
        
        // Notificar al componente padre
        if (onAntologiaChange) {
          onAntologiaChange();
        }
      } else {
        throw new Error(data.error || 'Error al eliminar la antología');
      }
    } catch (error) {
      console.error("Error al eliminar la antología:", error);
      alert(error.message || "Error al eliminar la antología. Por favor, intente de nuevo.");
    }
  };

  const handleDeleteAutor = async (idautor) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este autor?")) {
      try {
        await fetch(`${ENDPOINTS.autores}/${idautor}`, {
          method: "DELETE",
        });
        fetchAutores();
      } catch (error) {
        console.error("Error al eliminar el autor:", error);
      }
    }
  };

  const handleSubmitAntologia = async (e) => {
    e.preventDefault();
    console.log('Iniciando envío del formulario de antología');
    
    try {
      // Validar campos requeridos
      if (!currentAntologia?.titulo?.trim()) {
        alert("El título de la antología es requerido");
        return;
      }
      if (!currentAntologia?.contenido?.trim()) {
        alert("El contenido de la antología es requerido");
        return;
      }
      if (!currentAntologia?.idautor) {
        alert("Debe seleccionar un autor");
        return;
      }
      if (!currentAntologia?.tituloObra?.trim()) {
        alert("El título de la obra es requerido");
        return;
      }
      if (!currentAntologia?.autorObra?.trim()) {
        alert("El autor de la obra es requerido");
        return;
      }

      const method = currentAntologia?.id ? "PUT" : "POST";
      const url = currentAntologia?.id 
        ? `${ENDPOINTS.antologias}/${currentAntologia.id}`
        : ENDPOINTS.antologias;

      console.log('Preparando datos para enviar:', {
        method,
        url,
        data: currentAntologia
      });

      const antologiaData = {
        ...currentAntologia,
        idautor: parseInt(currentAntologia.idautor)
      };

      console.log('Datos formateados:', antologiaData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(antologiaData),
      });

      console.log('Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta:', errorData);
        throw new Error(errorData.error || 'Error al guardar la antología');
      }

      const data = await response.json();
      console.log('Datos de respuesta:', data);

      alert(currentAntologia?.id ? "Antología actualizada con éxito" : "Antología creada con éxito");
      setEditMode(false);
      setCurrentAntologia(null);
      await fetchAntologias();
    } catch (error) {
      console.error("Error detallado al guardar la antología:", error);
      alert(error.message || "Error al guardar la antología. Por favor, intente de nuevo.");
    }
  };

  const handleSubmitAutor = async (e) => {
    e.preventDefault();
    try {
      const method = currentAutor?.idautor ? "PUT" : "POST";
      const url = currentAutor?.idautor 
        ? `${ENDPOINTS.autores}/${currentAutor.idautor}`
        : ENDPOINTS.autores;

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentAutor),
      });

      setEditModeAutor(false);
      setCurrentAutor(null);
      fetchAutores();
    } catch (error) {
      console.error("Error al guardar el autor:", error);
    }
  };

  const filteredAntologias = antologias.filter((antologia) =>
    antologia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    antologia.autorObra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    antologia.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    antologia.Autor?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="antologias" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="antologias">Antologías</TabsTrigger>
          <TabsTrigger value="autores">Autores</TabsTrigger>
        </TabsList>

        <TabsContent value="antologias">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Gestión de Antologías</h1>
              <Button
                onClick={async () => {
                  console.log('Iniciando creación de nueva antología');
                  if (!autores || autores.length === 0) {
                    console.log('Recargando lista de autores...');
                    await fetchAutores();
                  }
                  setEditMode(true);
                  setCurrentAntologia({
                    titulo: "",
                    contenido: "",
                    referencia: "",
                    tituloObra: "",
                    autorObra: "",
                    idautor: "",
                    likes: 0
                  });
                  console.log('Estado inicial de nueva antología establecido');
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Nueva Antología
              </Button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, autor, contenido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
            </div>

            {!editMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAntologias.map((antologia) => (
                  <Card 
                    key={antologia.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={async () => {
                      console.log('Antología seleccionada:', antologia);
                      try {
                        // Obtener la antología completa con los datos del autor
                        const response = await fetch(`${ENDPOINTS.antologias}/${antologia.id}`);
                        if (!response.ok) {
                          throw new Error('Error al cargar la antología');
                        }
                        const antologiaCompleta = await response.json();
                        console.log('Antología completa:', antologiaCompleta);
                        setSelectedAntologia(antologiaCompleta);
                      } catch (error) {
                        console.error('Error al cargar la antología:', error);
                        alert('Error al cargar la antología. Por favor, intente de nuevo.');
                      }
                    }}
                  >
                    <CardHeader className="cursor-pointer">
                      <CardTitle>{antologia.titulo}</CardTitle>
                      <CardDescription>
                        <div className="flex flex-col space-y-1">
                          <span>Autor de la obra: {antologia.autorObra}</span>
                          <span className="text-sm text-primary">
                            Registrado por: {antologia.Autor?.nombre}
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="cursor-pointer">
                      <p className="truncate">{antologia.contenido}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditMode(true);
                          setCurrentAntologia(antologia);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAntologia(antologia.id);
                        }}
                      >
                        Eliminar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <form 
                onSubmit={handleSubmitAntologia} 
                className="space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">
                      {currentAntologia?.id ? 'Editar' : 'Nueva'} Antología
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2">
                          Título de la Antología <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                          value={currentAntologia?.titulo || ""}
                          onChange={(e) => {
                            console.log('Actualizando título:', e.target.value);
                            setCurrentAntologia({
                              ...currentAntologia,
                              titulo: e.target.value,
                            });
                          }}
                          required
                          placeholder="Ingrese el título de la antología"
                        />
                      </div>
                      <div>
                        <label className="block mb-2">
                          Título de la Obra <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                          value={currentAntologia?.tituloObra || ""}
                          onChange={(e) => {
                            console.log('Actualizando título de obra:', e.target.value);
                            setCurrentAntologia({
                              ...currentAntologia,
                              tituloObra: e.target.value,
                            });
                          }}
                          required
                          placeholder="Ingrese el título de la obra"
                        />
                      </div>
                      <div>
                        <label className="block mb-2">
                          Autor de la Obra <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                          value={currentAntologia?.autorObra || ""}
                          onChange={(e) => {
                            console.log('Actualizando autor de obra:', e.target.value);
                            setCurrentAntologia({
                              ...currentAntologia,
                              autorObra: e.target.value,
                            });
                          }}
                          required
                          placeholder="Ingrese el autor de la obra"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-medium">
                          Seleccionar Autor <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-primary"
                            value={currentAntologia?.idautor || ""}
                            onChange={(e) => {
                              console.log('Actualizando autor:', e.target.value);
                              setCurrentAntologia({
                                ...currentAntologia,
                                idautor: e.target.value,
                              });
                            }}
                            required
                          >
                            <option value="">Seleccione un autor...</option>
                            {Array.isArray(autores) && autores.length > 0 ? (
                              autores.map((autor) => (
                                <option 
                                  key={autor.idautor} 
                                  value={autor.idautor}
                                >
                                  {autor.nombre}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>No hay autores disponibles</option>
                            )}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block mb-2">
                          Contenido <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                          rows="10"
                          value={currentAntologia?.contenido || ""}
                          onChange={(e) => {
                            console.log('Actualizando contenido');
                            setCurrentAntologia({
                              ...currentAntologia,
                              contenido: e.target.value,
                            });
                          }}
                          required
                          placeholder="Ingrese el contenido de la antología"
                        />
                      </div>
                      <div>
                        <label className="block mb-2">
                          Referencia
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                          value={currentAntologia?.referencia || ""}
                          onChange={(e) => {
                            console.log('Actualizando referencia:', e.target.value);
                            setCurrentAntologia({
                              ...currentAntologia,
                              referencia: e.target.value,
                            });
                          }}
                          placeholder="Ingrese la referencia (opcional)"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button 
                          type="submit" 
                          className="bg-primary text-white"
                          onClick={(e) => {
                            console.log('Botón submit clickeado');
                            e.stopPropagation();
                          }}
                        >
                          {currentAntologia?.id ? 'Actualizar' : 'Crear'} Antología
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Cancelando edición');
                            setEditMode(false);
                            setCurrentAntologia(null);
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </TabsContent>

        <TabsContent value="autores">
          <AutoresPanel />
        </TabsContent>
      </Tabs>

      {/* Diálogo para mostrar la antología */}
      <Dialog 
        open={!!selectedAntologia} 
        onOpenChange={(open) => {
          console.log('Dialog onOpenChange:', { open, selectedAntologia });
          if (!open) {
            setSelectedAntologia(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAntologia?.titulo}</DialogTitle>
            <DialogDescription>
              {selectedAntologia?.tituloObra} - {selectedAntologia?.autorObra}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedAntologia && (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Registrado por: {selectedAntologia.Autor?.nombre}
                  </p>
                </div>
                <Book antologia={selectedAntologia} />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

AdminPanel.displayName = 'AdminPanel';

export default AdminPanel; 