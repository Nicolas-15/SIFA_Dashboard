import { Clock, MapPin, ChevronLeft, ChevronRight, X } from "lucide-react";
import { EditableField } from "./EditableField";
import { formatPlate } from "../utils/infractionFormatters";
import { useState, useEffect } from "react";

/**
 * Hook que carga múltiples imágenes autenticadas con JWT.
 * - URLs internas (/core/api/v1/uploads/...) se descargan con token
 * - URLs externas (https://s3...) se usan directo
 */
function useAuthImages(urls) {
  const [blobUrls, setBlobUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!urls || urls.length === 0) {
      setBlobUrls([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("token");
    let objectUrls = [];

    Promise.all(
      urls.map((url) => {
        if (!url) return Promise.resolve(null);
        if (url.startsWith("http")) return Promise.resolve(url);
        if (!token) return Promise.resolve(null);

        return fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.blob();
          })
          .then((blob) => {
            const objUrl = URL.createObjectURL(blob);
            objectUrls.push(objUrl);
            return objUrl;
          })
          .catch(() => null);
      }),
    ).then((results) => {
      setBlobUrls(results.filter(Boolean));
      setIsLoading(false);
    });

    return () => {
      objectUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [JSON.stringify(urls)]);

  return { blobUrls, isLoading };
}

/**
 * Foto(s) de la infracción con carrusel navegable y overlays.
 * Soporta múltiples evidencias fotográficas con flechas y dots.
 */
export function InfractionPhotoSection({
  editing,
  data,
  infraction,
  location,
  setNested,
}) {
  // Usar evidenceUrls (array) si existe, si no fallback a photoUrl
  const evidenceUrls = infraction.evidenceUrls || [];
  const allUrls =
    evidenceUrls.length > 0
      ? evidenceUrls
      : infraction.photoUrl
        ? [infraction.photoUrl]
        : [];

  const { blobUrls: images, isLoading } = useAuthImages(allUrls);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isChangingImage, setIsChangingImage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (images.length <= 1) return;
    const nextIdx = (currentIndex + 1) % images.length;
    const img = new Image();
    img.src = images[nextIdx];
  }, [images, currentIndex]);

  const goNext = (e) => {
    e.stopPropagation();
    setIsChangingImage(true);
    setCurrentIndex((i) => (i + 1) % images.length);
    setTimeout(() => setIsChangingImage(false), 300);
  };
  const goPrev = (e) => {
    e.stopPropagation();
    setIsChangingImage(true);
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    setTimeout(() => setIsChangingImage(false), 300);
  };

  return (
    <div
      className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative h-48 md:h-56"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(isLoading || isChangingImage) && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      {images.length > 0 ? (
        <>
          <img
            src={images[currentIndex]}
            className={`w-full h-full object-cover transition-opacity duration-200 cursor-pointer ${isChangingImage ? "opacity-50" : "opacity-100"}`}
            alt={`Evidencia ${currentIndex + 1} de ${images.length}`}
            onClick={() => setIsFullscreen(true)}
          />

          {/* Flechas de navegación */}
          {hasMultiple && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
              >
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "bg-white scale-125" : "bg-white/50"}`}
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
      <div
        className={`absolute top-2 left-2 right-12 bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded flex items-center justify-between text-xs font-bold text-slate-700 transition-opacity duration-200 ${isHovered ? "opacity-0" : "opacity-100"}`}
      >
        <span className="flex items-center gap-1">
          <Clock size={12} />{" "}
          {new Date(infraction.fecha).toLocaleString("es-CL")}
        </span>
        <span className="flex items-center gap-1 truncate max-w-[50%]">
          <MapPin size={12} /> {location.address}
        </span>
      </div>

      {/* Overlay inferior: patente editable */}
      <div
        className={`absolute bottom-3 right-3 bg-black/80 pl-3 pr-2 py-1 flex items-center rounded-lg shadow-xl backdrop-blur-md border border-white/20 transition-opacity duration-200 ${isHovered ? "opacity-0" : "opacity-100"}`}
      >
        <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest mr-2">
          Patente
        </span>
        <div className="w-[100px]">
          <EditableField
            editing={editing}
            value={data.vehicle?.plate}
            onChange={(v) => setNested("vehicle", "plate", formatPlate(v))}
            mono
            textColor="text-white"
            align="text-center"
          />
        </div>
      </div>

      {/* Modal pantalla completa */}
      {isFullscreen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Botón cerrar */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-50"
            onClick={() => setIsFullscreen(false)}
          >
            <X size={32} />
          </button>

          {/* Flecha izquierda */}
          {hasMultiple && (
            <button
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Imagen */}
          <img
            src={images[currentIndex]}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            alt={`Evidencia ${currentIndex + 1} de ${images.length}`}
          />

          {/* Flecha derecha */}
          {hasMultiple && (
            <button
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Contador */}
          {hasMultiple && (
            <div className="absolute top-4 left-4 bg-black/60 text-white text-sm font-bold px-3 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Dots indicadores */}
          {hasMultiple && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? "bg-white scale-125" : "bg-white/50"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Card con el código y descripción de la infracción cometida.
 */
export function InfractionDetailCard({ editing, data, setField }) {
  return (
    <div
      className={`rounded-xl border p-4 space-y-3 transition-colors ${editing ? "border-blue-200 bg-white shadow-sm ring-1 ring-blue-50" : "border-slate-200 bg-slate-50"}`}
    >
      <h4 className="text-[11px] font-bold uppercase text-slate-500">
        Motivo e Infracción Cometida
      </h4>

      <div className="flex gap-4 items-start">
        <div className="shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase">
            Código Infracción
          </p>
          <div className="w-24">
            <EditableField
              editing={editing}
              value={data.tipoInfraccion.id}
              onChange={(v) => setField("infractionCode", v)}
              mono
            />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">
            Tipo de Infracción
          </p>
          <EditableField
            editing={editing}
            type="textarea"
            value={data.tipoInfraccion.nombre}
            onChange={(v) => setField("disposicionInfringida", v)}
          />
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase">
          Observaciones
        </p>
        <EditableField
          editing={editing}
          type="textarea"
          value={data.observaciones}
          onChange={(v) => setField("observaciones", v)}
        />
      </div>
    </div>
  );
}
