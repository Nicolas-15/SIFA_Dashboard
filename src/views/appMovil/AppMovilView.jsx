import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Upload,
  Download,
  Smartphone,
  FileWarning,
  CheckSquare,
  Square,
  AlertTriangle,
  QrCode,
  Check,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { uploadApkWithProgress } from "@/services/apk.service";
import { SYSTEM_ROLES } from "@/constants/roles";

const APK_DOWNLOAD_URL =
  "http://sifa-core-images-quisco.s3.us-east-1.amazonaws.com/app/sifa_go.apk";

export function AppMovilView({ tab: controlledTab } = {}) {
  const { showToast, currentUser } = useOutletContext();
  const fileInputRef = useRef(null);

  const TABS = controlledTab
    ? []
    : [
        ...(currentUser?.role === SYSTEM_ROLES.ADMIN
          ? [{ value: "upload", label: "Subir APK", icon: Upload }]
          : []),
        { value: "download", label: "Descargar / QR", icon: QrCode },
      ];

  const [tab, setTab] = useState(controlledTab || TABS[0]?.value || "download");

  useEffect(() => {
    if (controlledTab) setTab(controlledTab);
  }, [controlledTab]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const uploadXhrRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!file.name.toLowerCase().endsWith(".apk")) {
      showToast("Solo se permiten archivos .apk", "error");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setSelectedFile(file);
    setAccepted(false);
  };

  const handleUpload = () => {
    if (!selectedFile || !accepted) return;

    setUploadProgress(0);

    const { xhr, promise } = uploadApkWithProgress(selectedFile, (pct) => {
      setUploadProgress(pct);
    });
    uploadXhrRef.current = xhr;
    promise
      .then(() => {
        showToast("APK subido exitosamente", "success");
        setSelectedFile(null);
        setAccepted(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          showToast(err.message, "error");
        }
      })
      .finally(() => {
        setUploadProgress(null);
        uploadXhrRef.current = null;
      });
  };

  const handleCancelUpload = () => {
    if (uploadXhrRef.current) {
      uploadXhrRef.current.abort();
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAccepted(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (uploadProgress === null) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [uploadProgress]);

  useEffect(() => {
    return () => {
      if (uploadXhrRef.current) {
        uploadXhrRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 my-0 pt-0">
          App Móvil SIFA GO
        </h2>
      </div>

      {TABS.length > 0 && (
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.value;
            const disabled = uploadProgress !== null;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => !disabled && setTab(t.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  active
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      {tab === "upload" ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
          <div className="lg:col-span-3 flex flex-col gap-3">
            <Card padding="lg" className="flex-1">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                    Archivo APK
                  </label>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                      selectedFile
                        ? "border-primary/30 bg-primary/[0.02] cursor-default"
                        : "border-slate-300 hover:border-primary cursor-pointer"
                    }`}
                    onClick={() => !selectedFile && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">
                      {selectedFile ? selectedFile.name : "Haz clic para seleccionar un archivo APK"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedFile
                        ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                        : "Solo archivos .apk — Máximo 50MB"}
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setAccepted(!accepted)}
                    disabled={!selectedFile}
                    className={`flex items-start gap-3 w-full p-4 rounded-xl border text-left transition-all ${
                      accepted
                        ? "border-primary bg-primary/5"
                        : "border-slate-300 bg-slate-50/50"
                    } ${!selectedFile ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-slate-400"}`}
                  >
                    {accepted ? (
                      <CheckSquare size={20} className="text-primary shrink-0 mt-0.5" />
                    ) : (
                      <Square size={20} className="text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Entiendo que se reemplazará la versión actual
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Si existe un APK desplegado, será sobrescrito por esta nueva versión.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleUpload}
                    disabled={!selectedFile || !accepted}
                    className="sm:flex-1"
                  >
                    <Upload size={18} />
                    <span>Subir APK</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleReset}
                    disabled={uploadProgress !== null}
                    className="sm:w-auto sm:px-6"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3">
            <Card padding="md">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                Información
              </h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <Smartphone size={18} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-700">App SIFA GO</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Aplicación móvil para fiscalizadores municipales.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                  <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-700">Precaución</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Al subir una nueva versión, todos los dispositivos con la versión anterior deberán actualizar.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <FileWarning size={18} className="text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-700">Validaciones</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      El sistema valida extensión, formato, tamaño y firma del archivo automáticamente.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="w-full flex-1">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
            <div className="md:col-span-3">
              <Card padding="lg" className="flex flex-col items-center justify-center">
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 self-start">
                  Descargar APK
                </h3>

                <div className="hidden md:flex flex-col items-center gap-4 mb-8">
                  <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200">
                    <QRCodeSVG value={APK_DOWNLOAD_URL} size={220} level="H" />
                  </div>
                  <p className="text-xs text-slate-500 text-center max-w-xs">
                    Escanea el código QR con tu dispositivo móvil para descargar la APK
                  </p>
                </div>

                <a
                  href={APK_DOWNLOAD_URL}
                  download="sifa_go.apk"
                  className="w-full lg:hidden"
                >
                  <Button variant="primary" size="lg" className="w-full">
                    <Download size={18} />
                      <span>Descargar</span>
                  </Button>
                </a>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card padding="md" className="h-full">
                <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                  Compatibilidad Android
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <Smartphone size={18} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Android 7.0+ (API 24)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Min SDK 24 — Target SDK 36</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-700">API 24 · N</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-700">API 25 · N 7.1</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-700">API 27 · Oreo</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-700">API 30 · R</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg col-span-2">
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-700">API 33 · T</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {uploadProgress !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-800">Subiendo APK</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedFile?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelUpload}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-red-600 transition-all hover:rotate-90 shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">
                  {uploadProgress < 100 ? "Subiendo..." : "Procesando..."}
                </span>
                <span className="font-bold text-slate-700">{uploadProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
