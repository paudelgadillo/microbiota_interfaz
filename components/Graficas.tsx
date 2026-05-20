'use client';
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ComposedChart, Bar,
  ReferenceLine, LabelList
} from 'recharts';
import { DatoGrafica, ResultadoPaciente } from '@/lib/api';

const COLORES_PERFIL: Record<string, string> = {
  'Saludable'         : '#129e53',
  'Promedio'          : '#fac400',
  'Riesgo / Disbiosis': '#ac0e28',
};

const COLORES_ANOMALIA_TEXTO: Record<string, string> = {
  'Común / Típico'               : '#383a3b',
  'Atípico (Súper-Sano)'         : '#27ae60',
  'Atípico (Disbiosis)'          : '#8e44ad',
  'Atípico (Perfil Incongruente)': '#e67e22',
};

const TooltipScatter = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs shadow-md">
        <p className="font-semibold text-gray-800">ID: {d.id_paciente}</p>
        <p className="text-gray-600">Score: {Number(d.microbiota_score).toFixed(1)}</p>
        {d.perfil         && <p className="text-gray-600">Perfil: {d.perfil}</p>}
        {d.anomalia_texto && <p className="text-gray-500">Anomalía: {d.anomalia_texto}</p>}
      </div>
    );
  }
  return null;
};

const DotX = (props: any) => {
  const { cx, cy, fill } = props;
  const size = 6;
  return (
    <g>
      <line x1={cx - size} y1={cy - size} x2={cx + size} y2={cy + size}
        stroke={fill} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx + size} y1={cy - size} x2={cx - size} y2={cy + size}
        stroke={fill} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
};

// Punto resaltado: círculo pulsante con anillo y etiqueta
const DotResaltado = (props: any) => {
  const { cx, cy } = props;
  if (!cx || !cy) return null;
  return (
    <g>
      {/* Anillo exterior pulsante (animación CSS) */}
      <circle cx={cx} cy={cy} r={18} fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.4}
        style={{ animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
      <circle cx={cx} cy={cy} r={12} fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.7} />
      {/* Punto central */}
      <circle cx={cx} cy={cy} r={6} fill="#f59e0b" stroke="white" strokeWidth={2} />
    </g>
  );
};

const LabelEjeY = ({ value, viewBox }: any) => {
  if (!viewBox) return null;
  const { x, y, height } = viewBox;
  const cx = x - 10;
  const cy = y + height / 2;
  return (
    <text
      x={cx} y={cy}
      transform={`rotate(-90, ${cx}, ${cy})`}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fill="#6b7280"
    >
      {value}
    </text>
  );
};

// ── Gráfica A: Mapa de Clusters ───────────────────────────────────────────────
export function GraficaClusters({
  datos,
  compact = false,
  pacienteResaltado,
}: {
  datos: DatoGrafica[];
  compact?: boolean;
  pacienteResaltado?: string;
}) {
  const grupos = Object.keys(COLORES_PERFIL).map(perfil => ({
    perfil,
    color: COLORES_PERFIL[perfil],
    // Excluir el paciente resaltado de los grupos normales
    data : datos.filter(d => d.perfil === perfil && d.id_paciente !== pacienteResaltado),
  }));

  // Dato aislado del paciente resaltado
  const datoPaciente = pacienteResaltado
    ? datos.filter(d => d.id_paciente === pacienteResaltado)
    : [];

  return (
    <div className="flex flex-col gap-1">
      {/* Animación ping via style tag inline */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>

      <h2 className="text-sm font-semibold text-gray-700">
        Similitud Clínica — Agrupación por Fenotipo
      </h2>
      <p className="text-xs text-gray-400 mb-3">
        Eje X: Riesgo Metabólico · Eje Y: Estilo de vida y dieta
      </p>
      <div className="flex gap-4 mb-2 flex-wrap">
        {grupos.map(g => (
          <div key={g.perfil} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
              style={{ backgroundColor: g.color }} />
            <span className="text-xs text-gray-500">{g.perfil}</span>
          </div>
        ))}
        {pacienteResaltado && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0 bg-amber-400 ring-2 ring-amber-300" />
            <span className="text-xs font-bold text-amber-600">Paciente {pacienteResaltado}</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={compact ? 280 : 500}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
          <XAxis dataKey="tsne_x" type="number" name="Riesgo Metabólico"
            tick={{ fontSize: 10 }}
            label={{ value: 'Asociado con Riesgo Metabólico', position: 'insideBottom', offset: -20, fontSize: 11, fill: '#6b7280' }}
          />
          <YAxis dataKey="tsne_y" type="number" name="Estilo de vida"
            tick={{ fontSize: 10 }} width={55}
            label={<LabelEjeY value="Estilo de vida y dieta" />}
          />
          <Tooltip content={<TooltipScatter />} />

          {/* Puntos normales */}
          {grupos.map(g => (
            <Scatter key={g.perfil} name={g.perfil} data={g.data} fill={g.color} fillOpacity={pacienteResaltado ? 0.35 : 0.75}>
              {!compact && (
                <LabelList dataKey="id_paciente" position="right"
                  style={{ fontSize: 7, fill: '#9ca3af' }} />
              )}
            </Scatter>
          ))}

          {/* Punto resaltado encima de todos */}
          {datoPaciente.length > 0 && (
            <Scatter
              name={`Paciente ${pacienteResaltado}`}
              data={datoPaciente}
              fill="#f59e0b"
              shape={<DotResaltado />}
            >
              <LabelList dataKey="id_paciente" position="right"
                style={{ fontSize: 11, fill: '#b45309', fontWeight: 700 }} />
            </Scatter>
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Gráfica B: Distribución del Score ────────────────────────────────────────
export function GraficaDistribucion({
  datos,
  compact = false,
  pacienteResaltado,
}: {
  datos: ResultadoPaciente[];
  compact?: boolean;
  pacienteResaltado?: string;
}) {
  if (!datos.length) return null;

  const scores   = datos.map(d => d.microbiota_score);
  const minScore = Math.floor(Math.min(...scores));
  const maxScore = Math.ceil(Math.max(...scores));
  const promedio = scores.reduce((a, b) => a + b, 0) / scores.length;

  const numBins  = 15;
  const binWidth = (maxScore - minScore) / numBins;

  const bins: {
    rango: number;
    label: string;
    Saludable: number;
    Promedio: number;
    'Riesgo / Disbiosis': number;
  }[] = [];

  for (let i = 0; i < numBins; i++) {
    const inicio = minScore + i * binWidth;
    bins.push({
      rango              : Math.round(inicio * 10) / 10,
      label              : `${Math.round(inicio)}`,
      Saludable          : 0,
      Promedio           : 0,
      'Riesgo / Disbiosis': 0,
    });
  }

  datos.forEach(d => {
    const idx = Math.min(
      Math.floor((d.microbiota_score - minScore) / binWidth),
      numBins - 1
    );
    if (bins[idx] && d.perfil in bins[idx]) {
      (bins[idx][d.perfil as keyof (typeof bins)[0]] as number)++;
    }
  });

  const binMasProximo = bins.reduce((closest, b) =>
    Math.abs(b.rango - promedio) < Math.abs(closest.rango - promedio) ? b : closest
  );
  const promedioLabel = binMasProximo.label;

  // Bin donde cae el paciente resaltado
  const paciente = pacienteResaltado
    ? datos.find(d => d.id_paciente === pacienteResaltado)
    : null;

  const binPaciente = paciente
    ? bins[Math.min(Math.floor((paciente.microbiota_score - minScore) / binWidth), numBins - 1)]
    : null;

  const legendItems = [
    { label: 'Riesgo / Disbiosis', color: '#ac0e28' },
    { label: 'Promedio',           color: '#fac400' },
    { label: 'Saludable',          color: '#129e53' },
  ];

  const CustomTick = ({ x, y, payload }: any) => (
    <text x={x} y={y + 10} textAnchor="middle" fontSize={10} fill="#6b7280">
      {payload.value}
    </text>
  );

  const CustomRefLabel = ({ viewBox }: any) => {
    if (!viewBox) return null;
    const { x, y } = viewBox;
    return (
      <g>
        <rect x={x - 28} y={y - 20} width={62} height={18} rx={3}
          fill="white" stroke="#d1d5db" strokeWidth={0.5} />
        <text x={x + 3} y={y - 8} textAnchor="middle" fontSize={10}
          fill="#111827" fontWeight={500}>
          Media: {promedio.toFixed(1)}
        </text>
      </g>
    );
  };

  // Label del bin del paciente resaltado
  const PacienteRefLabel = ({ viewBox }: any) => {
    if (!viewBox || !paciente) return null;
    const { x, y, height } = viewBox;
    return (
      <g>
        <rect x={x - 32} y={y + height - 36} width={70} height={18} rx={3}
          fill="#fef3c7" stroke="#f59e0b" strokeWidth={1} />
        <text x={x + 3} y={y + height - 23} textAnchor="middle" fontSize={10}
          fill="#b45309" fontWeight={700}>
          ID {paciente.id_paciente}: {paciente.microbiota_score.toFixed(1)}
        </text>
      </g>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-sm font-semibold text-gray-700">
        Distribución Poblacional del Score
      </h2>
      <p className="text-xs text-gray-400 mb-3">
        Media poblacional:{' '}
        <span className="font-medium text-gray-600">{promedio.toFixed(1)}</span>
        {paciente && (
          <span className="ml-3 font-bold text-amber-600">
            · Paciente {paciente.id_paciente}: {paciente.microbiota_score.toFixed(1)}
          </span>
        )}
      </p>
      <div className="flex gap-4 mb-2 flex-wrap">
        {legendItems.map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0"
              style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
        {paciente && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0 bg-amber-400" />
            <span className="text-xs font-bold text-amber-600">Paciente {paciente.id_paciente}</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={compact ? 280 : 500}>
        <ComposedChart data={bins} margin={{ top: 30, right: 20, bottom: 40, left: 20 }}>
          <XAxis dataKey="label" tick={<CustomTick />}
            label={{ value: 'MicrobiotaScore (0 a 100)', position: 'insideBottom', offset: -20, fontSize: 11, fill: '#6b7280' }}
          />
          <YAxis tick={{ fontSize: 10 }} width={55}
            label={<LabelEjeY value="Número de Participantes" />}
          />
          <Tooltip
            formatter={(val, name) => [val, name]}
            labelFormatter={label => `Score ~${label}`}
          />
          <ReferenceLine x={promedioLabel} stroke="#374151"
            strokeDasharray="6 4" strokeWidth={1.5}
            label={<CustomRefLabel />}
          />
          {/* Línea vertical resaltando el bin del paciente */}
          {binPaciente && (
            <ReferenceLine
              x={binPaciente.label}
              stroke="#f59e0b"
              strokeWidth={3}
              strokeDasharray="4 3"
              label={<PacienteRefLabel />}
            />
          )}
          <Bar dataKey="Riesgo / Disbiosis" stackId="a" fill="#ac0e28" />
          <Bar dataKey="Promedio"           stackId="a" fill="#fac400" />
          <Bar dataKey="Saludable"          stackId="a" fill="#129e53" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Gráfica C: Anomalías ──────────────────────────────────────────────────────
export function GraficaAnomalias({
  datos,
  pacienteResaltado,
}: {
  datos: DatoGrafica[];
  pacienteResaltado?: string;
}) {
  const grupos = Object.keys(COLORES_ANOMALIA_TEXTO).map(tipo => ({
    tipo,
    color: COLORES_ANOMALIA_TEXTO[tipo],
    data : datos.filter(d =>
      d.id_paciente !== pacienteResaltado &&
      (d.anomalia_texto ?? (d.es_anomalia ? 'Atípico (Súper-Sano)' : 'Común / Típico')) === tipo
    ),
  })).filter(g => g.data.length > 0);

  const datoPaciente = pacienteResaltado
    ? datos.filter(d => d.id_paciente === pacienteResaltado)
    : [];

  return (
    <div className="flex flex-col gap-1">
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>

      <h2 className="text-sm font-semibold text-gray-700">
        Detección Automática de Casos Clínicos Atípicos
      </h2>
      <p className="text-xs text-gray-400 mb-3">
        Eje X: Asociado con Riesgo Metabólico · Eje Y: Asociado a Estilo de vida y dieta
      </p>
      <div className="flex flex-wrap gap-4 mb-2">
        {grupos.map(g => (
          <div key={g.tipo} className="flex items-center gap-1.5">
            <span className="text-xs font-bold" style={{ color: g.color }}>✕</span>
            <span className="text-xs text-gray-500">{g.tipo}</span>
          </div>
        ))}
        {pacienteResaltado && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-500">◉</span>
            <span className="text-xs font-bold text-amber-600">Paciente {pacienteResaltado}</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 10, right: 30, bottom: 40, left: 20 }}>
          <XAxis dataKey="tsne_x" type="number" name="Riesgo Metabólico"
            tick={{ fontSize: 10 }}
            label={{ value: 'Asociado con Riesgo Metabólico', position: 'insideBottom', offset: -20, fontSize: 11, fill: '#6b7280' }}
          />
          <YAxis dataKey="tsne_y" type="number" name="Estilo de vida"
            tick={{ fontSize: 10 }} width={55}
            label={<LabelEjeY value="Asociado a Estilo de vida y dieta" />}
          />
          <Tooltip content={<TooltipScatter />} />

          {grupos.map(g => (
            <Scatter key={g.tipo} name={g.tipo} data={g.data} fill={g.color}
              fillOpacity={pacienteResaltado
                ? (g.tipo === 'Común / Típico' ? 0.2 : 0.4)
                : (g.tipo === 'Común / Típico' ? 0.65 : 1)
              }
              shape={<DotX />}
            >
              {g.tipo !== 'Común / Típico' && (
                <LabelList dataKey="id_paciente" position="right"
                  style={{ fontSize: 9, fill: '#111827', fontWeight: 600 }} />
              )}
            </Scatter>
          ))}

          {datoPaciente.length > 0 && (
            <Scatter
              name={`Paciente ${pacienteResaltado}`}
              data={datoPaciente}
              fill="#f59e0b"
              shape={<DotResaltado />}
            >
              <LabelList dataKey="id_paciente" position="right"
                style={{ fontSize: 11, fill: '#b45309', fontWeight: 700 }} />
            </Scatter>
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}