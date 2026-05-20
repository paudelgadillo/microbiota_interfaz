import { obtenerResultados, obtenerDatosGraficas } from '@/lib/api';
import {
  GraficaClusters,
  GraficaDistribucion,
  GraficaAnomalias
} from '@/components/Graficas';
import LogoutButton from '@/components/LogoutButton';

export default async function Dashboard() {
  let resultados    : Awaited<ReturnType<typeof obtenerResultados>>    = [];
  let datosGraficas : Awaited<ReturnType<typeof obtenerDatosGraficas>> = [];
  let error = '';

  try {
    [resultados, datosGraficas] = await Promise.all([
      obtenerResultados(),
      obtenerDatosGraficas(),
    ]);
  } catch {
    error = 'No pude conectar con la API. Verifica que esté corriendo.';
  }

  const total      = resultados.length;
  const saludables = resultados.filter(r => r.perfil === 'Saludable').length;
  const promedio   = total > 0
    ? (resultados.reduce((a, b) => a + b.microbiota_score, 0) / total).toFixed(1)
    : '0';
  const atipicos   = resultados.filter(r => r.es_anomalia).length;
  const pctSaludable = total > 0 ? Math.round((saludables / total) * 100) : 0;

  return (
    <div className="flex flex-col flex-1 pb-10">
      
      {/* Topbar del Dashboard - Ajustado según tus indicaciones */}
      <header className="px-10 py-8">
        <h1 className="text-3xl font-bold text-[#2d2828]">
          Análisis poblacional de salud intestinal
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-4xl leading-relaxed">
          No buscamos una microbiota perfecta, sino cuantificar qué tan lejos o cerca se encuentra una persona de un estado intestinal óptimo.
        </p>
      <div className="flex items-center gap-4">
  <div className="flex items-center gap-2 text-xs text-gray-500">
    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
    {total} registros activos
  </div>
  <LogoutButton />
</div>

      </header>

      <div className="px-10 flex flex-col gap-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Métricas con personajes de Microbiota */}
        <div className="grid grid-cols-4 gap-5">
          {[
            {
              label : 'Total de registros',
              value : total,
              suffix: 'Registros Activos',
              color : 'text-[#4a8e8b]',
              border: 'border-[#b4d6d4]',
              image : 'microbiota_ingeniera.png' // Ingeniero/Constructor
            },
            {
              label : 'Perfiles saludables',
              value : `${pctSaludable}%`,
              suffix: `${saludables} participantes`,
              color : 'text-[#2a9d8f]',
              border: 'border-[#a1d6cf]',
              image : 'microbiota_inspector.png' // Héroe
            },
            {
              label : 'Score promedio',
              value : promedio,
              suffix: 'Sobre 100',
              color : 'text-[#8c3a5d]',
              border: 'border-[#d4a8ba]',
              image : 'microbiota_inteligente.png' // Estudioso/Inteligente
            },
            {
              label : 'Casos atípicos',
              value : atipicos,
              suffix: 'Requieren Revisión',
              color : 'text-[#d4af37]',
              border: 'border-[#e8d59b]',
              image : 'microbiota_enferma.png' // Científico observando anomalías
            },
          ].map(m => (
            <div
              key={m.label}
              className={`bg-white rounded-2xl border-l-4 ${m.border} border-t border-r border-b border-t-[#e8e4db] border-r-[#e8e4db] border-b-[#e8e4db] shadow-sm p-5 flex flex-col gap-1 relative overflow-hidden group`}
            >
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pt-2 z-10 relative">
                  {m.label}
                </p>
                {/* Contenedor de la imagen */}
                <div className="w-16 h-16 -mt-3 -mr-2 z-10 relative transition-transform duration-300 group-hover:scale-110">
                  {/* Asegúrate de que las imágenes estén en la carpeta /public */}
                  <img 
                    src={`/${m.image}`} 
                    alt={m.label} 
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
              </div>
              <p className={`text-3xl font-bold ${m.color} z-10 relative`}>{m.value}</p>
              {m.suffix && <p className="text-xs font-medium text-gray-400 z-10 relative">{m.suffix}</p>}
              
              {/* Fondo decorativo sutil detrás del personaje */}
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${m.color.replace('text', 'bg')}`}></div>
            </div>
          ))}
        </div>

        {/* Gráficas */}
        {datosGraficas.length > 0 && (
  <div className="flex flex-col gap-5">
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 p-6">
      <GraficaClusters datos={datosGraficas} />
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 p-6">
      <GraficaDistribucion datos={resultados} />
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 p-6">
      <GraficaAnomalias datos={datosGraficas} />
    </div>
  </div>
)}

      </div>
    </div>
  );
}