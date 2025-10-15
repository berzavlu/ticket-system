'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, ZoomIn, ZoomOut, Maximize2, Minimize2, Home, Expand, Shrink } from 'lucide-react';

// Importar bpmn-js dinámicamente para evitar problemas con SSR
let NavigatedViewer: any = null;

export default function FlujoBpmnPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBpmn = async () => {
      try {
        console.log('🔵 Iniciando carga de BPMN...');
        
        // Esperar un momento para que React renderice el contenedor primero
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Importar NavigatedViewer (incluye pan y zoom, NO requiere Modeler)
        const BpmnJS = await import('bpmn-js/lib/NavigatedViewer');
        NavigatedViewer = BpmnJS.default;
        console.log('✅ NavigatedViewer importado');

        if (!containerRef.current) {
          console.error('❌ Container ref no existe');
          return;
        }
        
        // Verificar dimensiones del contenedor
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        
        console.log('📏 Dimensiones del contenedor:', { width, height });
        
        if (width === 0 || height === 0) {
          throw new Error(`Contenedor sin dimensiones válidas: ${width}x${height}`);
        }

        // Crear instancia del NavigatedViewer (incluye zoomScroll y moveCanvas)
        const viewer = new NavigatedViewer({
          container: containerRef.current
        });

        viewerRef.current = viewer;
        console.log('✅ NavigatedViewer creado');
        
        // Verificar módulos de interacción disponibles
        try {
          const zoomScroll = viewer.get('zoomScroll');
          const moveCanvas = viewer.get('moveCanvas');
          console.log('✅ Módulos de interacción disponibles:', {
            zoomScroll: !!zoomScroll,
            moveCanvas: !!moveCanvas
          });
        } catch (e) {
          console.warn('⚠️ Error al verificar módulos:', e);
        }

        // Cargar el archivo BPMN
        console.log('🔵 Cargando archivo BPMN...');
        const response = await fetch('/ticket-process.bpmn');
        
        if (!response.ok) {
          throw new Error(`Error al cargar BPMN: ${response.status}`);
        }
        
        const bpmnXML = await response.text();
        console.log('✅ Archivo BPMN cargado, tamaño:', bpmnXML.length, 'caracteres');

        // Importar el diagrama
        console.log('🔵 Importando XML...');
        await viewer.importXML(bpmnXML);
        console.log('✅ XML importado exitosamente');

        // Configurar canvas
        const canvas = viewer.get('canvas');
        const eventBus = viewer.get('eventBus');
        console.log('✅ Canvas y EventBus obtenidos');
        
        // Listener para actualizar zoom usando eventBus
        eventBus.on('canvas.viewbox.changed', () => {
          const newZoom = canvas.zoom();
          if (typeof newZoom === 'number' && !isNaN(newZoom) && newZoom > 0) {
            setZoom(newZoom);
          }
        });

        console.log('🎉 BPMN cargado exitosamente');
        
        // Verificar viewbox ANTES de marcar como loaded
        const viewbox = canvas.viewbox();
        console.log('📐 Viewbox después de importar:', viewbox);
        
        if (!viewbox || !viewbox.outer || viewbox.outer.width === 0 || viewbox.outer.height === 0) {
          console.error('❌ Viewbox no válido después de importar XML');
          throw new Error('El diagrama BPMN no tiene dimensiones válidas');
        }
        
        // Ajustar zoom inicial - usar 70% para mejor visualización
        canvas.zoom('fit-viewport');
        let initialZoom = canvas.zoom();
        
        // Aplicar zoom del 70% para dar más espacio visual
        const spaciousZoom = initialZoom * 0.7;
        canvas.zoom(spaciousZoom);
        
        console.log('✅ Zoom inicial ajustado:', spaciousZoom);
        
        if (typeof spaciousZoom === 'number' && !isNaN(spaciousZoom) && spaciousZoom > 0) {
          setZoom(spaciousZoom);
        } else {
          setZoom(0.5);
        }
        
        // Ahora sí, marcar como cargado
        setLoading(false);
        console.log('🎉 Diagrama completamente listo para interactuar');
      } catch (err: any) {
        console.error('❌ Error loading BPMN:', err);
        setError(err.message || 'Error al cargar el diagrama BPMN');
        setLoading(false);
      }
    };

    loadBpmn();

    // Cleanup
    return () => {
      if (viewerRef.current) {
        console.log('🧹 Limpiando viewer...');
        try {
          viewerRef.current.destroy();
        } catch (e) {
          console.warn('⚠️ Error al destruir viewer:', e);
        }
      }
    };
  }, []);

  const handleZoomIn = () => {
    if (viewerRef.current) {
      const canvas = viewerRef.current.get('canvas');
      const currentZoom = canvas.zoom();
      canvas.zoom(currentZoom + 0.2);
    }
  };

  const handleZoomOut = () => {
    if (viewerRef.current) {
      const canvas = viewerRef.current.get('canvas');
      const currentZoom = canvas.zoom();
      const newZoom = Math.max(0.2, currentZoom - 0.2); // No menor a 0.2
      canvas.zoom(newZoom);
    }
  };

  const handleZoomReset = () => {
    if (viewerRef.current) {
      const canvas = viewerRef.current.get('canvas');
      canvas.zoom(1.0);
    }
  };

  const handleZoomFit = () => {
    if (viewerRef.current) {
      const canvas = viewerRef.current.get('canvas');
      canvas.zoom('fit-viewport', 'auto');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      fullscreenContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listener para cambios de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleDownloadSVG = async () => {
    if (viewerRef.current) {
      try {
        const canvas = viewerRef.current.get('canvas');
        const { svg } = await viewerRef.current.saveSVG();
        
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ticket-process-fluyez.svg';
        link.click();
        
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Error downloading SVG:', err);
        alert('Error al descargar el diagrama');
      }
    }
  };

  const handleDownloadPNG = async () => {
    if (viewerRef.current) {
      try {
        const canvas = viewerRef.current.get('canvas');
        const { svg } = await viewerRef.current.saveSVG();
        
        // Convertir SVG a PNG usando canvas
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const img = new Image();
        img.onload = () => {
          const pngCanvas = document.createElement('canvas');
          pngCanvas.width = img.width;
          pngCanvas.height = img.height;
          
          const ctx = pngCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, pngCanvas.width, pngCanvas.height);
            ctx.drawImage(img, 0, 0);
            
            pngCanvas.toBlob((blob) => {
              if (blob) {
                const pngUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = pngUrl;
                link.download = 'ticket-process-fluyez.png';
                link.click();
                URL.revokeObjectURL(pngUrl);
              }
            });
          }
          
          URL.revokeObjectURL(url);
        };
        
        img.src = url;
      } catch (err) {
        console.error('Error downloading PNG:', err);
        alert('Error al descargar el diagrama');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flujo de Proceso BPMN</h1>
          <p className="text-gray-600 mt-1">
            Diagrama del proceso automatizado de gestión de tickets
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadSVG} variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Descargar SVG
          </Button>
          <Button onClick={handleDownloadPNG} variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Descargar PNG
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Proceso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Fases Principales</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Creación de ticket</li>
                <li>• Asignación (manual o auto)</li>
                <li>• Análisis y respuesta</li>
                <li>• Resolución</li>
                <li>• Cierre y estadísticas</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Actores</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <span className="font-medium">Cliente</span> - Crea tickets y responde</li>
                <li>• <span className="font-medium">Agente</span> - Analiza y resuelve</li>
                <li>• <span className="font-medium">Admin/Supervisor</span> - Asigna y supervisa</li>
                <li>• <span className="font-medium">Sistema</span> - Automatizaciones</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Automatizaciones</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Notificaciones por email</li>
                <li>• Cambios de estado automáticos</li>
                <li>• Generación de estadísticas</li>
                <li>• Auto-asignación de tickets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BPMN Viewer */}
      <div ref={fullscreenContainerRef} className={isFullscreen ? 'bg-white' : ''}>
        <Card className={isFullscreen ? 'h-screen m-0 rounded-none' : ''}>
          <CardHeader className={isFullscreen ? 'border-b' : ''}>
            <div className="flex items-center justify-between">
              <CardTitle>Diagrama BPMN 2.0</CardTitle>
              <div className="flex gap-2 items-center">
                <Button onClick={handleZoomOut} variant="ghost" size="sm" title="Alejar (Ctrl + -)">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button onClick={handleZoomReset} variant="ghost" size="sm" title="Zoom 100%">
                  <Home className="w-4 h-4" />
                </Button>
                <Button onClick={handleZoomIn} variant="ghost" size="sm" title="Acercar (Ctrl + +)">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button onClick={handleZoomFit} variant="ghost" size="sm" title="Ajustar a pantalla">
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <span className="text-sm text-gray-600 font-medium min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <Button 
                  onClick={toggleFullscreen} 
                  variant={isFullscreen ? "secondary" : "primary"} 
                  size="sm" 
                  className="gap-2"
                  title={isFullscreen ? "Salir de pantalla completa (Esc)" : "Abrir en pantalla completa (F11)"}
                >
                  {isFullscreen ? (
                    <>
                      <Shrink className="w-4 h-4" />
                      <span className="hidden sm:inline">Salir</span>
                    </>
                  ) : (
                    <>
                      <Expand className="w-4 h-4" />
                      <span className="hidden sm:inline">Pantalla completa</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={isFullscreen ? 'h-[calc(100vh-80px)] p-0' : ''}>
            {/* Contenedor siempre visible para que tenga dimensiones */}
            <div
              ref={containerRef}
              className={`${isFullscreen ? '' : 'border border-gray-200 rounded-lg'} bg-white relative overflow-hidden`}
              style={{ 
                height: isFullscreen ? '100%' : '500px',
                width: '100%',
                cursor: 'grab',
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              } as React.CSSProperties}
            >
              {/* Canvas de bpmn-js se renderizará aquí */}
              
              {/* Spinner de carga superpuesto */}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando diagrama BPMN...</p>
                  </div>
                </div>
              )}
              
              {/* Error superpuesto */}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">⚠️</span>
                    </div>
                    <p className="text-red-600 font-medium mb-2">Error al cargar el diagrama</p>
                    <p className="text-gray-600 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>
            
            {!loading && !error && !isFullscreen && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Consejos de navegación:</strong> Usa la rueda del mouse para hacer zoom, 
                  arrastra para mover el diagrama, o presiona F11 para pantalla completa.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Leyenda BPMN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-green-600 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-sm">Inicio</p>
                <p className="text-xs text-gray-500">Evento de inicio</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-blue-600 rounded flex items-center justify-center text-xs">
                Tarea
              </div>
              <div>
                <p className="font-medium text-sm">Tarea</p>
                <p className="text-xs text-gray-500">Actividad manual</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-purple-600 rounded flex items-center justify-center text-xs">
                Auto
              </div>
              <div>
                <p className="font-medium text-sm">Servicio</p>
                <p className="text-xs text-gray-500">Tarea automática</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-orange-600 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orange-600 rotate-45"></div>
              </div>
              <div>
                <p className="font-medium text-sm">Gateway</p>
                <p className="text-xs text-gray-500">Decisión o bifurcación</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-red-600 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-red-600 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-sm">Fin</p>
                <p className="text-xs text-gray-500">Evento de fin</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="w-0 h-0 border-l-8 border-l-gray-600 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
              <div>
                <p className="font-medium text-sm">Flujo</p>
                <p className="text-xs text-gray-500">Secuencia de actividades</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Descripción del Proceso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 mb-4">
              Este diagrama BPMN 2.0 representa el proceso completo de gestión de tickets en el sistema Fluyez,
              desde la creación inicial hasta el cierre y generación de estadísticas.
            </p>
            
            <h3 className="font-semibold text-gray-900 mt-4 mb-2">Flujo Principal:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li><strong>Creación:</strong> El cliente crea un ticket que se registra en la base de datos</li>
              <li><strong>Asignación:</strong> El ticket se asigna manualmente (Admin/Supervisor) o mediante auto-asignación (Agente)</li>
              <li><strong>Análisis:</strong> El agente analiza el ticket y determina si necesita más información</li>
              <li><strong>Respuesta:</strong> Se crean respuestas públicas (con notificación email) o notas internas</li>
              <li><strong>Resolución:</strong> Una vez resuelto, se marca como resuelto y se notifica al cliente</li>
              <li><strong>Cierre:</strong> El cliente confirma la resolución, se cierra el ticket y se generan estadísticas</li>
            </ol>
            
            <h3 className="font-semibold text-gray-900 mt-4 mb-2">Flujos Alternativos:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Si se requiere más información, el ticket pasa a estado PENDING hasta que el cliente responda</li>
              <li>Si el problema no está resuelto, se continúa trabajando en el ticket</li>
              <li>Si el cliente no confirma la resolución, el ticket se reabre y vuelve al análisis</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

