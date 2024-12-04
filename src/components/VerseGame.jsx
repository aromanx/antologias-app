import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { jsPDF } from "jspdf";
import { AlertCircle } from "lucide-react";

export function VerseGame({ contenido }) {
  const [versosOriginales, setVersosOriginales] = useState([]);
  const [versosNuevos, setVersosNuevos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (!contenido) {
        throw new Error("No hay contenido para mostrar");
      }
      // Dividir el contenido en versos individuales
      const versos = contenido
        .split("\n")
        .filter(verso => verso.trim() !== "")
        .map((verso, index) => ({
          id: index,
          texto: verso.trim(),
          seleccionado: false
        }));
      
      if (versos.length === 0) {
        throw new Error("No se encontraron versos en el contenido");
      }

      setVersosOriginales(versos);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error al procesar los versos:", err);
    }
  }, [contenido]);

  const handleVersoClick = (verso, esOriginal) => {
    try {
      if (esOriginal) {
        // Mover verso del panel original al nuevo
        setVersosOriginales(prev => prev.filter(v => v.id !== verso.id));
        setVersosNuevos(prev => [...prev, verso]);
      } else {
        // Mover verso del panel nuevo al original
        setVersosNuevos(prev => prev.filter(v => v.id !== verso.id));
        setVersosOriginales(prev => [...prev, verso]);
      }
    } catch (err) {
      setError("Error al mover el verso");
      console.error("Error al manejar el clic:", err);
    }
  };

  const handleDescargarPDF = () => {
    try {
      const doc = new jsPDF();
      const poema = versosNuevos.map(v => v.texto).join("\n");
      
      // Configurar fuente para soporte de caracteres especiales
      doc.setFont("helvetica");
      doc.setFontSize(12);

      // Título
      doc.setFontSize(16);
      doc.text("Mi Poema Creado", 20, 20);
      
      // Contenido del poema
      doc.setFontSize(12);
      const lineas = doc.splitTextToSize(poema, 170);
      doc.text(lineas, 20, 40);

      // Fecha de creación
      const fecha = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Creado el: ${fecha}`, 20, doc.internal.pageSize.height - 20);

      doc.save("mi_poema.pdf");
    } catch (err) {
      setError("Error al generar el PDF");
      console.error("Error al descargar PDF:", err);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {/* Panel de versos originales */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">
          Versos Originales ({versosOriginales.length})
        </h3>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {versosOriginales.map((verso) => (
              <div
                key={verso.id}
                onClick={() => handleVersoClick(verso, true)}
                className="p-2 bg-muted hover:bg-accent/50 rounded cursor-pointer transition-colors"
              >
                {verso.texto}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Panel de nuevo poema */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">
          Mi Nuevo Poema ({versosNuevos.length})
        </h3>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {versosNuevos.map((verso) => (
              <div
                key={verso.id}
                onClick={() => handleVersoClick(verso, false)}
                className="p-2 bg-primary/10 hover:bg-accent/50 rounded cursor-pointer transition-colors"
              >
                {verso.texto}
              </div>
            ))}
          </div>
        </ScrollArea>
        {versosOriginales.length === 0 && versosNuevos.length > 0 && (
          <div className="mt-4">
            <Button 
              onClick={handleDescargarPDF}
              className="w-full"
            >
              Descargar PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

VerseGame.propTypes = {
  contenido: PropTypes.string.isRequired
};

export default VerseGame; 