/**
 * Plantilla invisible renderizada fuera de pantalla para html2canvas → PDF.
 * Formato de empadronado JPL de la I. Municipalidad de El Quisco.
 */

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function InfractionPDFTemplate({ citationRef, infraction }) {
  const { vehicle = {}, propietario = {}, location = {}, citacion = {}, tipoInfraccion = {} } = infraction;

  const infDate     = infraction.fecha ? new Date(infraction.fecha) : new Date();
  const formattedDay  = infDate.toLocaleDateString('es-CL');
  const formattedTime = infDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  const citDate     = citacion?.fechaCitacion ? new Date(citacion.fechaCitacion) : null;
  const formattedCitDay = citDate ? citDate.toLocaleDateString('es-CL') : '_________________';
  const formattedCitTime = citDate ? citDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '09:00';

  const docDate = new Date();

  return (
    <div className="fixed left-[-9999px] top-[-9999px]">
      <div
        ref={citationRef}
        className="w-[800px] bg-white text-black p-12 pr-16 font-serif text-lg leading-relaxed"
        style={{ minHeight: '1100px' }}
      >
        {/* Encabezado */}
        <div className="mb-10 font-bold text-lg">
          <p>INFRACCIÓN ID: {infraction.id}</p>
          <p className="mt-4 font-black text-xl tracking-wider">EMPADRONADO</p>
          <br /><br />
          <p className="text-right">
            El Quisco, {docDate.getDate()} de {MONTH_NAMES[docDate.getMonth()]} de {docDate.getFullYear()}
          </p>
        </div>

        <h2 className="font-bold underline mb-8">SEÑOR JUEZ DE POLICIA LOCAL:</h2>

        <div className="space-y-8 text-justify">
          <p>
            <span className="font-bold underline">Datos de la Infracción:</span><br />
            Doy cuenta que el día {formattedDay}, a las {formattedTime}, en calle {location.address || '____________________'}, se sorprendió la siguiente infracción: {tipoInfraccion.nombre || '____________________'}.
            {infraction.observaciones && <span> Observaciones: {infraction.observaciones}</span>}
          </p>

          <p>
            <span className="font-bold underline">Datos del Vehículo:</span><br />
            El vehículo patente N° <span className="font-bold uppercase tracking-widest">{vehicle.plate}</span>, tipo {vehicle.type || '________'}.
          </p>

          <p>
            <span className="font-bold underline">Datos del Infractor (Propietario):</span><br />
            Infractor {propietario.nombreCompleto || '____________________'}, Cédula de Identidad {propietario.rut || '___________'}, profesión {propietario.profesion || '___________'}, estado civil {propietario.estadoCivil || '___________'}, Edad {propietario.edad || '___'}.<br />
            Domicilio: Ciudad de {propietario.comuna || '________'}, Calle {propietario.direccion || '____________________'}.
          </p>

          <p className="font-bold uppercase tracking-wide mt-6">
            EL INFRACTOR QUEDÓ CITADO PARA LA AUDIENCIA DEL DÍA:<br />
            {formattedCitDay}, a las {formattedCitTime} hrs.
          </p>

          <p>
            Disposición infringida: {tipoInfraccion.disposicionInfringida || '__________________________'}.<br />
            Testigo inspector municipal: {infraction.idFiscalizador || '________________'}.
          </p>
        </div>

        {/* Firma */}
        <div className="mt-32 w-full flex flex-col items-center">
          <div className="w-64 border-b border-black mb-2" />
          <p className="font-bold uppercase">Inspector ID: {infraction.idFiscalizador || '________'}</p>
          <p className="uppercase text-sm">Inspector Municipal / Seguridad Pública</p>
        </div>
      </div>
    </div>
  );
}
