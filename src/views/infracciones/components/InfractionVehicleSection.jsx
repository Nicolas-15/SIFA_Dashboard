import { Car, MapPin, X, Maximize2 } from 'lucide-react';
import { EditableField } from './EditableField';
import { useState } from 'react';

const VEHICLE_TYPES = ['Automóvil', 'Camioneta', 'Furgón', 'Motocicleta', 'Camión', 'Bus'];
const VEHICLE_COLORS = ['Blanco', 'Negro', 'Gris', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Plateado', 'Café', 'Naranja'];

/**
 * Box de vehículo interviniente + coordenadas GPS + mini mapa OSM.
 */
export function InfractionVehicleSection({ editing, data, setNested }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lat = data.location?.lat || -33.393;
  const lng = data.location?.lng || -71.696;

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className={`rounded-xl border p-4 space-y-3 flex flex-col transition-colors ${editing ? 'border-blue-200 bg-white shadow-sm ring-1 ring-blue-50' : 'border-slate-200 bg-slate-50'}`}>
      <h4 className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
        <Car size={13} /> Vehículo Interviniente
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Marca</p>
          <EditableField editing={editing} value={data.vehicle?.brand} onChange={v => setNested('vehicle', 'brand', v)} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Modelo</p>
          <EditableField editing={editing} value={data.vehicle?.model} onChange={v => setNested('vehicle', 'model', v)} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Color</p>
          <EditableField editing={editing} value={data.vehicle?.color} onChange={v => setNested('vehicle', 'color', v)} options={VEHICLE_COLORS} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Tipo</p>
          <EditableField editing={editing} value={data.vehicle?.type} onChange={v => setNested('vehicle', 'type', v)} options={VEHICLE_TYPES} />
        </div>
      </div>

      {/* Coordenadas + mapa */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <h4 className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1 mb-2">
          <MapPin size={13} /> Origen / Coordenadas
        </h4>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Latitud</p>
            <EditableField editing={editing} value={data.location?.lat} onChange={v => setNested('location', 'lat', v)} mono />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Longitud</p>
            <EditableField editing={editing} value={data.location?.lng} onChange={v => setNested('location', 'lng', v)} mono />
          </div>
        </div>
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
          <iframe 
            width="100%" 
            height="100%" 
            src={mapSrc} 
            title="Mapa de ubicación" 
          />
          <button 
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-lg shadow-md border border-slate-200 transition-colors"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Modal pantalla completa del mapa */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-50"
            onClick={() => setIsFullscreen(false)}
          >
            <X size={32} />
          </button>
          
          <div 
            className="w-full h-full max-w-5xl max-h-[90vh] rounded-lg overflow-hidden border border-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe 
              width="100%" 
              height="100%" 
              src={mapSrc} 
              title="Mapa de ubicación"
            />
          </div>
        </div>
      )}
    </div>
  );
}
