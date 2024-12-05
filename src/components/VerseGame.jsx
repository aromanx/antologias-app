import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { jsPDF } from "jspdf";
import { AlertCircle } from "lucide-react";

export function VerseGame({ content, title, author, onClose }) {
  const [originalVerses, setOriginalVerses] = useState([]);
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Dividir el contenido en versos y filtrar líneas vacías
    const verses = content
      .split('\n')
      .map(verse => verse.trim())
      .filter(verse => verse.length > 0);
    setOriginalVerses(verses);
  }, [content]);

  const handleVerseClick = (verse, index, fromSelected = false) => {
    if (fromSelected) {
      // Devolver verso a la columna original
      setSelectedVerses(prev => prev.filter((_, i) => i !== index));
      setOriginalVerses(prev => [...prev, verse]);
    } else {
      // Mover verso a la columna seleccionada
      setOriginalVerses(prev => prev.filter((_, i) => i !== index));
      setSelectedVerses(prev => [...prev, verse]);
    }
  };

  useEffect(() => {
    // Verificar si todos los versos han sido seleccionados
    setIsComplete(originalVerses.length === 0);
  }, [originalVerses]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Configurar el documento
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(12);
    doc.text(`por ${author}`, 20, 30);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    // Agregar los versos
    let y = 40;
    selectedVerses.forEach((verse) => {
      // Dividir versos largos en múltiples líneas
      const lines = doc.splitTextToSize(verse, 170);
      lines.forEach(line => {
        if (y > 280) { // Si se acerca al final de la página
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 7;
      });
    });
    
    // Guardar el PDF
    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_reordenado.pdf`);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="grid grid-cols-2 gap-4 h-[60vh]">
        {/* Columna de versos originales */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Versos Disponibles</h3>
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {originalVerses.map((verse, index) => (
                <div
                  key={`original-${index}`}
                  onClick={() => handleVerseClick(verse, index)}
                  className="p-2 bg-muted hover:bg-accent hover:text-accent-foreground rounded cursor-pointer transition-colors"
                >
                  {verse}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Columna de versos seleccionados */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Tu Poema</h3>
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {selectedVerses.map((verse, index) => (
                <div
                  key={`selected-${index}`}
                  onClick={() => handleVerseClick(verse, index, true)}
                  className="p-2 bg-primary/10 hover:bg-primary/20 rounded cursor-pointer transition-colors"
                >
                  {verse}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        {isComplete ? (
          <div className="flex items-center gap-2 text-green-600">
            <AlertCircle className="h-4 w-4" />
            <span>¡Has ordenado todos los versos!</span>
          </div>
        ) : (
          <div className="text-muted-foreground">
            {originalVerses.length} versos restantes
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>
          <Button
            onClick={downloadPDF}
            disabled={!isComplete}
          >
            Descargar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

VerseGame.propTypes = {
  content: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default VerseGame; 