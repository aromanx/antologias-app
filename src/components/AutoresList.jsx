import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function AutoresList() {
  const [autores, setAutores] = useState([]);
  const [antologias, setAntologias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAntologia, setSelectedAntologia] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [autoresRes, antologiasRes] = await Promise.all([
          fetch("http://localhost:3000/autores"),
          fetch("http://localhost:3000/antologia")
        ]);

        if (!autoresRes.ok || !antologiasRes.ok) {
          throw new Error('Error al cargar los datos');
        }

        const autoresData = await autoresRes.json();
        const antologiasData = await antologiasRes.json();

        setAutores(autoresData);
        setAntologias(antologiasData);
        setError(null);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setError("Error al cargar los datos. Por favor, intente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Función para reproducir el audio
  const speak = (text) => {
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      utterance.voice = voices.find(
        (voice) => voice.name === "Microsoft Zira Desktop - Spanish (Spain)"
      );
      window.speechSynthesis.speak(utterance);
    }
  };

  // Manejar reproducción de audio
  const handlePlayPause = (antologia) => {
    if (selectedAntologia?.id === antologia.id) {
      if (isPlaying) {
        window.speechSynthesis.pause();
      } else {
        window.speechSynthesis.resume();
      }
    } else {
      window.speechSynthesis.cancel();
      setSelectedAntologia(antologia);
      speak(antologia.contenido);
    }
    setIsPlaying(!isPlaying);
  };

  // Detener el audio al cerrar el drawer
  const handleCloseDrawer = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSelectedAntologia(null);
  };

  const getAntologiasAutor = (idautor) => {
    return antologias.filter(antologia => antologia.idautor === idautor);
  };

  const handleSelectAntologia = async (antologia) => {
    try {
      const response = await fetch(`http://localhost:3000/antologia/${antologia.id}`);
      if (!response.ok) throw new Error('Error al cargar la antología');
      const antologiaCompleta = await response.json();
      setSelectedAntologia(antologiaCompleta);
    } catch (error) {
      console.error("Error al cargar la antología:", error);
    }
  };

  const generatePDF = (autor) => {
    const doc = new jsPDF();
    
    // Configurar fuente para soporte de caracteres especiales
    doc.setFont("helvetica");
    
    // Título
    doc.setFontSize(20);
    doc.text(autor.nombre, 20, 20);
    
    // Biografía
    doc.setFontSize(12);
    
    // Dividir el texto en líneas para que quepa en la página
    const splitBio = doc.splitTextToSize(autor.biografia, 170);
    doc.text(splitBio, 20, 40);
    
    // Guardar el PDF
    doc.save(`biografia_${autor.nombre.replace(/\s+/g, '_')}.pdf`);
  };

  const generateDOCX = async (autor) => {
    try {
      // Crear un nuevo documento
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: autor.nombre,
              heading: HeadingLevel.HEADING_1,
              spacing: {
                after: 200
              }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Biografía",
                  bold: true,
                  size: 28,
                })
              ],
              spacing: {
                before: 200,
                after: 200
              }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: autor.biografia,
                  size: 24,
                })
              ],
              spacing: {
                line: 360 // Espaciado entre líneas
              }
            })
          ]
        }]
      });

      // Generar el buffer del documento
      const buffer = await Packer.toBuffer(doc);
      
      // Crear el blob y descargar
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      saveAs(blob, `biografia_${autor.nombre.replace(/\s+/g, '_')}.docx`);
    } catch (error) {
      console.error("Error al generar el documento DOCX:", error);
      alert("Error al generar el documento. Por favor, intente de nuevo.");
    }
  };

  if (loading) {
    return <div className="text-center p-4">Cargando autores...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Nuestros Autores</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {autores.map((autor) => (
          <Card key={autor.idautor} className="hover:shadow-lg transition-shadow bg-white border border-gray-200">
            <CardHeader>
              <div className="aspect-square overflow-hidden rounded-lg mb-4">
                <img
                  src={autor.urlfoto}
                  alt={autor.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150';
                  }}
                />
              </div>
              <CardTitle className="text-xl text-center text-gray-900">{autor.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button 
                      variant="outline"
                      className="w-full text-center hover:bg-primary/10 bg-white text-gray-700 border border-gray-300"
                    >
                      Ver Biografía
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader className="bg-white border-b border-gray-200">
                      <DrawerTitle className="text-2xl font-bold text-gray-900">
                        {autor.nombre}
                      </DrawerTitle>
                      <DrawerDescription>
                        <div className="mt-4 flex justify-center">
                          <img
                            src={autor.urlfoto}
                            alt={autor.nombre}
                            className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                          />
                        </div>
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50">
                      <div className="prose max-w-none">
                        <p className="text-justify text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {autor.biografia}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-center space-x-4">
                        <Button
                          variant="outline"
                          onClick={() => generatePDF(autor)}
                          className="flex items-center space-x-2"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                          <span>Descargar PDF</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => generateDOCX(autor)}
                          className="flex items-center space-x-2"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                          <span>Descargar DOCX</span>
                        </Button>
                      </div>
                    </div>
                    <DrawerFooter className="bg-white border-t border-gray-200">
                      <DrawerClose asChild>
                        <Button 
                          variant="outline"
                          className="text-gray-700 hover:bg-gray-100"
                        >
                          Cerrar
                        </Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>

              <h3 className="font-semibold mb-2 text-gray-800">Antologías publicadas:</h3>
              <div className="space-y-2">
                {getAntologiasAutor(autor.idautor).map((antologia) => (
                  <Drawer key={antologia.id}>
                    <DrawerTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full text-left justify-start hover:bg-primary/10 bg-white text-gray-700 border border-gray-300"
                      >
                        <span className="truncate">{antologia.titulo}</span>
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader className="bg-white border-b border-gray-200">
                        <DrawerTitle className="text-2xl font-bold text-gray-900">{antologia.titulo}</DrawerTitle>
                        <DrawerDescription>
                          <div className="flex flex-col space-y-2 text-gray-700">
                            <span className="font-medium">Obra: {antologia.tituloObra}</span>
                            <span className="font-medium">Autor: {antologia.autorObra}</span>
                            <Button
                              onClick={() => handlePlayPause(antologia)}
                              className="mt-2 bg-primary hover:bg-primary/90 text-white"
                            >
                              {isPlaying && selectedAntologia?.id === antologia.id
                                ? "Pausar"
                                : "Reproducir"}
                            </Button>
                          </div>
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50">
                        <div className="prose max-w-none">
                          <pre className="whitespace-pre-wrap text-justify text-gray-900 bg-white p-6 rounded-lg shadow-inner border border-gray-200 leading-relaxed">
                            {antologia.contenido}
                          </pre>
                        </div>
                      </div>
                      <DrawerFooter className="bg-white border-t border-gray-200">
                        <DrawerClose asChild>
                          <Button 
                            variant="outline"
                            onClick={handleCloseDrawer}
                            className="text-gray-700 hover:bg-gray-100"
                          >
                            Cerrar
                          </Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                ))}
                {getAntologiasAutor(autor.idautor).length === 0 && (
                  <p className="text-gray-500 text-center italic">
                    No hay antologías publicadas
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-700 line-clamp-2 text-justify">
                {autor.biografia}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 