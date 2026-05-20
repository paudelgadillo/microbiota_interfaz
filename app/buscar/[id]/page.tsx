import { buscarPorId, obtenerResultados, obtenerDatosGraficas } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  GraficaClusters,
  GraficaDistribucion,
  GraficaAnomalias,
} from '@/components/Graficas';

// ── Helpers basados en PERFIL ─────────────────────────────────────────────────

const colorTextoPorPerfil = (perfil: string) => {
  if (perfil === 'Saludable') return 'text-[#2a9d8f]';
  if (perfil === 'Promedio')  return 'text-[#d4af37]';
  return 'text-[#8c3a5d]';
};

const colorBgPorPerfil = (perfil: string) => {
  if (perfil === 'Saludable') return 'bg-[#2a9d8f]';
  if (perfil === 'Promedio')  return 'bg-[#d4af37]';
  return 'bg-[#8c3a5d]';
};

const colorStrokePorPerfil = (perfil: string) => {
  if (perfil === 'Saludable') return '#2a9d8f';
  if (perfil === 'Promedio')  return '#d4af37';
  return '#8c3a5d';
};

const interpretacionPorPerfil = (perfil: string) => {
  if (perfil === 'Saludable')
    return 'La microbiota de este paciente presenta características asociadas a buena diversidad bacteriana y hábitos saludables.';
  if (perfil === 'Promedio')
    return 'El perfil muestra indicadores mixtos. Se recomienda revisar hábitos alimenticios y nivel de estrés.';
  return 'Se detectaron múltiples factores de riesgo. Se recomienda una evaluación clínica más detallada.';
};

// Mascotas de recomendaciones — siempre en este orden para los 4 items
const MASCOTAS_RECOMENDACIONES = [
  'microbiota_heroe.png',
  'microbiota_cientifica.png',
  'microbiota_pintora.png',
  'microbiota_maga.png',
];

const recomendacionesPorPerfil = (perfil: string) => {
  if (perfil === 'Saludable') {
    return {
      titulo: 'Mantén tu estado de salud intestinal',
      descripcion: 'Tu microbiota presenta un perfil óptimo. Estas son las claves para mantenerlo:',
      items: [
        {
          color: 'text-[#2a9d8f]',
          bg: 'bg-[#e4f2f0]',
          titulo: 'Continúa con tu dieta rica en fibra',
          texto: 'El consumo diario de frutas, verduras y legumbres alimenta directamente tus bacterias benéficas. No lo abandones.',
        },
        {
          color: 'text-[#2a9d8f]',
          bg: 'bg-[#e4f2f0]',
          titulo: 'Mantén la actividad física regular',
          texto: 'El ejercicio moderado sostenido favorece la diversidad bacteriana intestinal. 30 minutos diarios es suficiente.',
        },
        {
          color: 'text-[#2a9d8f]',
          bg: 'bg-[#e4f2f0]',
          titulo: 'Protege tu sueño',
          texto: 'El intestino tiene su propio ritmo circadiano. Dormir entre 7 y 8 horas mantiene estables tus poblaciones bacterianas.',
        },
        {
          color: 'text-[#2a9d8f]',
          bg: 'bg-[#e4f2f0]',
          titulo: 'Evaluación de seguimiento recomendada',
          texto: 'Aunque tu perfil es saludable, se recomienda repetir el análisis en 6 meses para monitorear cambios estacionales.',
        },
      ],
      alerta: null,
    };
  }

  if (perfil === 'Promedio') {
    return {
      titulo: 'Tu microbiota tiene margen de mejora',
      descripcion: 'Tu perfil es estable pero presenta indicadores que pueden optimizarse con cambios moderados en tus hábitos:',
      items: [
        {
          color: 'text-[#d4af37]',
          bg: 'bg-[#fdf8ed]',
          titulo: 'Incrementa el consumo de prebióticos',
          texto: 'Ajo, cebolla, plátano y avena son alimentos prebióticos que alimentan tus bacterias benéficas. Inclúyelos diariamente.',
        },
        {
          color: 'text-[#d4af37]',
          bg: 'bg-[#fdf8ed]',
          titulo: 'Incorpora alimentos fermentados',
          texto: 'Yogur natural, kéfir o kombucha aportan probióticos que pueden diversificar positivamente tu microbiota en semanas.',
        },
        {
          color: 'text-[#d4af37]',
          bg: 'bg-[#fdf8ed]',
          titulo: 'Gestiona el estrés activamente',
          texto: 'El eje intestino-cerebro es bidireccional. Técnicas de respiración, meditación o caminatas reducen el impacto del estrés en tu microbiota.',
        },
        {
          color: 'text-[#d4af37]',
          bg: 'bg-[#fdf8ed]',
          titulo: 'Reduce ultraprocesados y edulcorantes',
          texto: 'Estos productos alteran el equilibrio bacteriano incluso en pequeñas cantidades. Revisarlos puede marcar una diferencia notable en tu score.',
        },
      ],
      alerta: {
        tipo: 'advertencia',
        texto: 'Con cambios sostenidos durante 8 a 12 semanas, perfiles como el tuyo logran mejorar significativamente su clasificación.',
      },
    };
  }

  return {
    titulo: 'Tu microbiota requiere atención prioritaria',
    descripcion: 'Se detectaron múltiples factores de riesgo. Es importante actuar con los siguientes pasos:',
    items: [
      {
        color: 'text-[#8c3a5d]',
        bg: 'bg-[#f7edf1]',
        titulo: 'Consulta con un profesional de salud',
        texto: 'Los resultados de este análisis sugieren la necesidad de una evaluación clínica más detallada. No postergues una consulta médica o con un nutriólogo especializado.',
      },
      {
        color: 'text-[#8c3a5d]',
        bg: 'bg-[#f7edf1]',
        titulo: 'Evita el uso de antibióticos sin prescripción',
        texto: 'Los antibióticos de amplio espectro pueden devastar la diversidad bacteriana. Solo úsalos cuando un médico los indique explícitamente.',
      },
      {
        color: 'text-[#8c3a5d]',
        bg: 'bg-[#f7edf1]',
        titulo: 'Prioriza una dieta antiinflamatoria',
        texto: 'Elimina temporalmente ultraprocesados, azúcares refinados y alcohol. Aumenta vegetales de hoja verde, omega-3 y fibra soluble.',
      },
      {
        color: 'text-[#8c3a5d]',
        bg: 'bg-[#f7edf1]',
        titulo: 'Monitorea tus síntomas digestivos',
        texto: 'Registra frecuencia de evacuación, consistencia de heces y síntomas como inflamación o acidez. Esta información es valiosa para tu médico.',
      },
    ],
    alerta: {
      tipo: 'critico',
      texto: 'Este perfil está asociado a disbiosis intestinal. La intervención temprana mejora significativamente el pronóstico a mediano plazo.',
    },
  };
};

// ── Componentes ───────────────────────────────────────────────────────────────

const BadgeStatus = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'Saludable'         : 'bg-[#e4f2f0] text-[#2a9d8f] border-[#a1d6cf]',
    'Promedio'          : 'bg-[#fdf8ed] text-[#d4af37] border-[#e8d59b]',
    'Riesgo / Disbiosis': 'bg-[#f7edf1] text-[#8c3a5d] border-[#d4a8ba]',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${colors[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
};

const MetricCard = ({
  label,
  value,
  mascot,
  suffix = '',
  color = 'text-[#2d2828]',
}: {
  label: string;
  value: number | string;
  mascot: string;
  suffix?: string;
  color?: string;
}) => (
  <div className="bg-white rounded-2xl border border-[#e8e4db] p-5 flex flex-col gap-2 shadow-sm overflow-hidden relative">
    <div className="flex items-start justify-between">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pt-1 z-10">{label}</p>
      <div className="w-16 h-16 -mt-2 -mr-2 flex-shrink-0 z-10">
        <img src={`/${mascot}`} alt={label} className="w-full h-full object-contain drop-shadow-md" />
      </div>
    </div>
    <p className={`text-2xl font-bold ${color} z-10`}>
      {value}{suffix && <span className="text-sm font-normal text-gray-400 ml-1">{suffix}</span>}
    </p>
  </div>
);

// ── Página ────────────────────────────────────────────────────────────────────

export default async function DetallePacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let resultado;
  let datosGraficas: Awaited<ReturnType<typeof obtenerDatosGraficas>> = [];
  let resultados:    Awaited<ReturnType<typeof obtenerResultados>>    = [];

  try {
    [resultado, datosGraficas, resultados] = await Promise.all([
      buscarPorId(id),
      obtenerDatosGraficas(),
      obtenerResultados(),
    ]);
  } catch {
    notFound();
  }

  const score  = resultado.microbiota_score;
  const perfil = resultado.perfil;

  const fecha = resultado.fecha
    ? new Date(resultado.fecha).toLocaleDateString('es-MX', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : 'Sin fecha';

  const colorTexto      = colorTextoPorPerfil(perfil);
  const colorBg         = colorBgPorPerfil(perfil);
  const colorStroke     = colorStrokePorPerfil(perfil);
  const interpretacion  = interpretacionPorPerfil(perfil);
  const recomendaciones = recomendacionesPorPerfil(perfil);

  return (
    <div className="flex flex-col flex-1 pb-20">

      {/* Header */}
      <header className="px-10 py-8">
        <Link
          href="/buscar"
          className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#4a8e8b] transition-colors mb-4 w-fit"
        >
          <i className="ti ti-arrow-left" aria-hidden /> Volver a búsqueda
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8c3a5d] uppercase tracking-widest mb-2">
              <i className="ti ti-file-analytics" aria-hidden /> Expediente Clínico
            </div>
            <h1 className="text-3xl font-bold text-[#2d2828]">
              Paciente {resultado.id_paciente}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{fecha}</p>
          </div>
          <div className="flex items-center gap-3">
            {resultado.es_anomalia && (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200">
                <i className="ti ti-alert-triangle mr-1" aria-hidden /> Caso Atípico
              </span>
            )}
            <BadgeStatus status={perfil} />
          </div>
        </div>
      </header>

      <div className="px-10 flex flex-col gap-6">

        {/* Score principal */}
        <div className="bg-white rounded-[2rem] border border-[#e8e4db] shadow-sm p-8 flex items-center gap-10">
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke={colorStroke}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 314} 314`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${colorTexto}`}>
                  {score.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">/ 100</span>
              </div>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Microbiota Score</p>
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#2d2828] mb-2">Interpretación del resultado</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">{interpretacion}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${colorBg}`} style={{ width: `${score}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-8">{score.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Métricas clínicas con mascotas */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
            Métricas clínicas
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              label="IMC"
              value={resultado.imc.toFixed(1)}
              mascot="microbiota_saludando.png"
              color={resultado.imc >= 18.5 && resultado.imc <= 24.9 ? 'text-[#2a9d8f]' : 'text-[#8c3a5d]'}
            />
            <MetricCard
              label="Diet Score"
              value={resultado.diet_score}
              mascot="microbiota_collardefrutas.png"
              color={resultado.diet_score >= 10 ? 'text-[#2a9d8f]' : 'text-[#8c3a5d]'}
            />
            <MetricCard
              label="Lifestyle Score"
              value={resultado.lifestyle_score}
              mascot="microbiota_corriendo.png"
              color={resultado.lifestyle_score >= 0 ? 'text-[#2a9d8f]' : 'text-[#8c3a5d]'}
            />
            <MetricCard
              label="Microbiota Stress"
              value={resultado.microbiota_stress}
              mascot="microbiota_yoga.png"
              color={resultado.microbiota_stress <= 10 ? 'text-[#2a9d8f]' : 'text-[#8c3a5d]'}
            />
          </div>
        </div>

        {/* Riesgo metabólico + anomalía */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white rounded-2xl border border-[#e8e4db] shadow-sm p-6">
            <h3 className="text-sm font-bold text-[#2d2828] mb-4 flex items-center gap-2">
              <i className="ti ti-activity-heartbeat text-[#8c3a5d]" aria-hidden /> Riesgo Metabólico
            </h3>
            <div className="flex items-end gap-4">
              <span className={`text-4xl font-bold ${resultado.metabolic_risk_score <= 8 ? 'text-[#2a9d8f]' : 'text-[#8c3a5d]'}`}>
                {resultado.metabolic_risk_score.toFixed(1)}
              </span>
              <div className="flex-1 pb-1">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Bajo</span><span>Moderado</span><span>Alto</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${resultado.metabolic_risk_score <= 8 ? 'bg-[#2a9d8f]' : 'bg-[#8c3a5d]'}`}
                    style={{ width: `${Math.min((resultado.metabolic_risk_score / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {resultado.metabolic_risk_score <= 8
                ? 'El riesgo metabólico se encuentra dentro del rango esperado para la población de referencia.'
                : 'Se detectaron indicadores de riesgo metabólico elevado. Se sugiere seguimiento clínico.'}
            </p>
          </div>

          <div className={`rounded-2xl border shadow-sm p-6 flex flex-col justify-between ${
            resultado.es_anomalia ? 'bg-fuchsia-50 border-fuchsia-200' : 'bg-[#e4f2f0] border-[#a1d6cf]/30'
          }`}>
            <div>
              <h3 className={`text-sm font-bold mb-2 flex items-center gap-2 ${resultado.es_anomalia ? 'text-fuchsia-700' : 'text-[#2a9d8f]'}`}>
                <i className={`ti ${resultado.es_anomalia ? 'ti-radar' : 'ti-circle-check'}`} aria-hidden />
                Detección de anomalías
              </h3>
              <p className={`text-xs leading-relaxed ${resultado.es_anomalia ? 'text-fuchsia-600' : 'text-[#1e3a3a] opacity-80'}`}>
                {resultado.es_anomalia
                  ? 'Este perfil presenta combinaciones de datos estadísticamente atípicas respecto a la población estudiada.'
                  : 'El perfil se encuentra dentro de la distribución esperada para la población de referencia.'}
              </p>
            </div>
            <span className={`mt-4 text-lg font-bold ${resultado.es_anomalia ? 'text-fuchsia-700' : 'text-[#2a9d8f]'}`}>
              {resultado.es_anomalia ? 'Requiere validación' : 'Distribución normal'}
            </span>
          </div>
        </div>

        {/* Recomendaciones clínicas */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-[#e8e4db]"></div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <i className="ti ti-clipboard-list" aria-hidden />
              Recomendaciones clínicas
            </div>
            <div className="flex-1 h-px bg-[#e8e4db]"></div>
          </div>

          {recomendaciones.alerta && (
            <div className={`flex items-start gap-3 rounded-2xl px-6 py-4 border ${
              recomendaciones.alerta.tipo === 'critico'
                ? 'bg-[#f7edf1] border-[#d4a8ba]/40'
                : 'bg-[#fdf8ed] border-[#e8d59b]/40'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                recomendaciones.alerta.tipo === 'critico' ? 'bg-[#8c3a5d]' : 'bg-[#d4af37]'
              }`}>
                <i className={`ti ${recomendaciones.alerta.tipo === 'critico' ? 'ti-alert-triangle' : 'ti-info-circle'} text-white text-sm`} aria-hidden />
              </div>
              <p className={`text-sm leading-relaxed ${
                recomendaciones.alerta.tipo === 'critico' ? 'text-[#8c3a5d]' : 'text-[#a07d10]'
              }`}>
                {recomendaciones.alerta.texto}
              </p>
            </div>
          )}

          <div className="bg-white rounded-[2rem] border border-[#e8e4db] shadow-sm p-8">
            <h3 className={`text-lg font-bold mb-1 ${colorTexto}`}>
              {recomendaciones.titulo}
            </h3>
            <p className="text-sm text-gray-400 mb-6">{recomendaciones.descripcion}</p>

            <div className="grid grid-cols-2 gap-4">
              {recomendaciones.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 p-4 rounded-2xl border border-[#e8e4db] ${item.bg} overflow-hidden relative`}
                >
                  {/* ✅ Mascota grande flotando a la derecha, recortada por overflow-hidden */}
                  <div className="absolute right-0 bottom-0 w-24 h-24 flex-shrink-0 pointer-events-none">
                    <img
                      src={`/${MASCOTAS_RECOMENDACIONES[idx]}`}
                      alt=""
                      aria-hidden
                      className="w-full h-full object-contain object-bottom drop-shadow-md"
                    />
                  </div>
                  {/* Texto — z-10 para que quede sobre la mascota */}
                  <div className="flex flex-col gap-1 z-10 pr-20">
                    <p className={`text-sm font-bold ${item.color}`}>{item.titulo}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Posición en gráficas poblacionales */}
        {datosGraficas.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-[#e8e4db]"></div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <i className="ti ti-chart-dots" aria-hidden />
                Posición poblacional
              </div>
              <div className="flex-1 h-px bg-[#e8e4db]"></div>
            </div>

            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                <i className="ti ti-map-pin text-white text-sm" aria-hidden></i>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">
                  Así se ubica el paciente {resultado.id_paciente} dentro de la población estudiada
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  El punto <span className="font-bold">amarillo</span> marca su posición exacta. El resto de puntos se atenúa para facilitar la comparación.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-[#e8e4db] shadow-sm p-8">
              <GraficaClusters datos={datosGraficas} compact={true} pacienteResaltado={resultado.id_paciente} />
            </div>

            <div className="bg-white rounded-[2rem] border border-[#e8e4db] shadow-sm p-8">
              <GraficaDistribucion datos={resultados} compact={true} pacienteResaltado={resultado.id_paciente} />
            </div>

            <div className="bg-white rounded-[2rem] border border-[#e8e4db] shadow-sm p-8">
              <GraficaAnomalias datos={datosGraficas} pacienteResaltado={resultado.id_paciente} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}