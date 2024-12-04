import React, { useState, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Button } from "@/components/ui/button";
import {
  Download,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  Printer,
} from "lucide-react";

export function Book({ antologia }) {
  console.log('Book component recibió antología:', antologia);
  const bookRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scale, setScale] = useState(1);

  if (!antologia) {
    console.error('No se recibió una antología válida');
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        Error: No se pudo cargar la antología
      </div>
    );
  }

  if (!antologia.contenido) {
    console.error('La antología no tiene contenido');
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        Error: La antología no tiene contenido
      </div>
    );
  }

  const linesPerPage = 15;
  const content = antologia.contenido.split('\n');
  
  const handleDownloadPDF = () => {
    // Por ahora, solo descargamos el contenido como texto
    const element = document.createElement('a');
    const file = new Blob([antologia.contenido], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${antologia.titulo}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const pageClassName = `page ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`;

  return (
    <div className="flex flex-col items-center space-y-4" ref={bookRef}>
      {/* Barra de herramientas */}
      <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-100 rounded-lg">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDownloadPDF}
          title="Descargar"
        >
          <Download className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrint}
          title="Imprimir"
        >
          <Printer className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          title="Acercar"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          title="Alejar"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Modo claro" : "Modo oscuro"}
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Libro */}
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}>
        <HTMLFlipBook 
          width={400} 
          height={600}
          showCover={true}
          maxShadowOpacity={0.5}
          className="book-content"
        >
          {/* Portada */}
          <div className={pageClassName}>
            <div className="p-8 h-full flex flex-col justify-between">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold">{antologia.titulo}</h1>
                <h2 className="text-xl">{antologia.tituloObra}</h2>
                <p className="text-lg">{antologia.autorObra}</p>
              </div>
              {antologia.Autor?.urlfoto && (
                <div className="flex justify-center">
                  <img 
                    src={antologia.Autor.urlfoto}
                    alt={antologia.Autor.nombre || 'Autor'}
                    loading="lazy"
                    width="300"
                    height="400"
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Páginas de contenido */}
          {content.reduce((pages, _, index) => {
            if (index % linesPerPage === 0) {
              const pageContent = content.slice(index, index + linesPerPage).join('\n');
              pages.push(
                <div key={index} className={pageClassName}>
                  <div className="p-8">
                    <div className="text-sm mb-4 text-right">
                      Página {Math.floor(index / linesPerPage) + 1} de {Math.ceil(content.length / linesPerPage)}
                    </div>
                    <pre className={`whitespace-pre-wrap text-justify font-serif leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {pageContent}
                    </pre>
                  </div>
                </div>
              );
            }
            return pages;
          }, [])}
        </HTMLFlipBook>
      </div>

      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #book-content, #book-content * {
            visibility: visible;
          }
          #book-content {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
} 