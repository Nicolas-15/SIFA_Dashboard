import { Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { EditableField } from './EditableField';
import { formatPlate } from '../utils/infractionFormatters';
import { useState, useEffect } from 'react';

/**
 * Hook que carga múltiples imágenes autenticadas con JWT.
 * - URLs internas (/core/api/v1/uploads/...) se descargan con token
 * - URLs externas (https://s3...) se usan directo
 */
function useAuthImages(urls) {
  const [blobUrls, setBlobUrls] = useState([]);

  useEffect(() => {
    if (!urls || urls.length === 0) { setBlobUrls([]); return; }

    const token = localStorage.getItem('token');
    let objectUrls = [];

    Promise.all(
      urls.map(url => {
        if (!url) return Promise.resolve(null);
        if (url.startsWith('http')) return Promise.resolve(url);
        if (!token) return Promise.resolve(null);

        return fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.blob();
          })
          .then(blob => {
            const objUrl = URL.createObjectURL(blob);
            objectUrls.push(objUrl);
            return objUrl;
          })
          .catch(() => null);
      })
    ).then(results => setBlobUrls(results.filter(Boolean)));

    return () => {
      objectUrls.forEach(u => URL.revokeObjectURL(u));
    };
  }, [JSON.stringify(urls)]);

  return blobUrls;
}

/**
 * Foto(s) de la infracción con carrusel navegable y overlays.
 * Soporta múltiples evidencias fotográficas con flechas y dots.
 */
export function InfractionPhotoSection({ editing, data, infraction, location, setNested }) {
  // Usar evidenceUrls (array) si existe, si no fallback a photoUrl
  const evidenceUrls = infraction.evidenceUrls || [];
  const allUrls = evidenceUrls.length > 0
    ? evidenceUrls
    : (infraction.photoUrl ? [infraction.photoUrl] : []);

  const images = useAuthImages(allUrls);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasMultiple = images.length > 1;

  const goNext = (e) => { e.stopPropagation(); setCurrentIndex(i => (i + 1) % images.length); };
  const goPrev = (e) => { e.stopPropagation(); setCurrentIndex(i => (i - 1 + images.length) % images.length); };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative h-48 md:h-56">
      {images.length > 0 ? (
        <>
          <img
            src={images[currentIndex]}
            className="w-full h-full object-cover transition-opacity duration-300"
            alt={`Evidencia ${currentIndex + 1} de ${images.length}`}
          />

          {/* Flechas de navegación */}
          {hasMultiple && (
            <>
              <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors">
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Contador */}
          {hasMultiple && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Dots indicadores */}
          {hasMultiple && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
          Sin evidencia fotográfica
        </div>
      )}

      {/* Overlay superior: timestamp + dirección */}
      <div className="absolute top-2 left-2 right-12 bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded flex items-center justify-between text-xs font-bold text-slate-700">
        <span className="flex items-center gap-1">
          <Clock size={12} /> {new Date(infraction.timestamp).toLocaleString('es-CL')}
        </span>
        <span className="flex items-center gap-1 truncate max-w-[50%]">
          <MapPin size={12} /> {location.address}
        </span>
      </div>

      {/* Overlay inferior: patente editable */}
      <div className="absolute bottom-3 right-3 bg-black/80 pl-3 pr-2 py-1 flex items-center rounded-lg shadow-xl backdrop-blur-md border border-white/20">
        <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest mr-2">Patente</span>
        <div className="w-[100px]">
          <EditableField
            editing={editing}
            value={data.vehicle?.plate}
            onChange={v => setNested('vehicle', 'plate', formatPlate(v))}
            mono
            textColor="text-white"
            align="text-center"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Card con el código y descripción de la infracción cometida.
 */
export function InfractionDetailCard({ editing, data, setField }) {
  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-colors ${editing ? 'border-blue-200 bg-white shadow-sm ring-1 ring-blue-50' : 'border-slate-200 bg-slate-50'}`}>
      <h4 className="text-[11px] font-bold uppercase text-slate-500">Motivo e Infracción Cometida</h4>
      
      <div className="flex gap-4 items-start">
        <div className="shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Cód. Infracción</p>
          <div className="w-24">
            <EditableField editing={editing} value={data.infractionCode} onChange={v => setField('infractionCode', v)} mono />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Disposición Infringida</p>
          <EditableField editing={editing} type="textarea" value={data.disposicionInfringida} onChange={v => setField('disposicionInfringida', v)} />
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase">Descripción formal del hecho</p>
        <EditableField editing={editing} type="textarea" value={data.observaciones} onChange={v => setField('observaciones', v)} />
      </div>
    </div>
  );
}
