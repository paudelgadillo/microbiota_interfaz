import { ResultadoPaciente } from '@/lib/api';

const colorPerfil: Record<string, string> = {
  'Saludable'        : 'bg-emerald-100 text-emerald-800',
  'Promedio'         : 'bg-yellow-100  text-yellow-800',
  'Riesgo / Disbiosis': 'bg-red-100    text-red-800',
};

const colorScore = (score: number) => {
  if (score >= 65) return 'text-emerald-600';
  if (score >= 40) return 'text-yellow-500';
  return 'text-red-500';
};

export default function ResultadoCard({ r }: { r: ResultadoPaciente }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-mono text-gray-400">{r.id_paciente}</span>
        {r.es_anomalia && (
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
            Atípico
          </span>
        )}
      </div>

      <div className="flex items-end gap-2">
        <span className={`text-4xl font-bold ${colorScore(r.microbiota_score)}`}>
          {r.microbiota_score}
        </span>
        <span className="text-gray-400 text-sm mb-1">/ 100</span>
      </div>

      <span className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${colorPerfil[r.perfil] || 'bg-gray-100 text-gray-700'}`}>
        {r.perfil}
      </span>

      <div className="grid grid-cols-2 gap-2 mt-1">
        {[
          { label: 'IMC',              value: r.imc              },
          { label: 'Diet Score',       value: r.diet_score       },
          { label: 'Lifestyle',        value: r.lifestyle_score  },
          { label: 'Stress',           value: r.microbiota_stress},
          { label: 'Riesgo Met.',      value: r.metabolic_risk_score },
        ].map(item => (
          <div key={item.label} className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="text-sm font-semibold text-gray-700">{item.value}</p>
          </div>
        ))}
      </div>

      {r.fecha && (
        <p className="text-xs text-gray-300 mt-1">
          {new Date(r.fecha).toLocaleDateString('es-MX', {
            day: '2-digit', month: 'short', year: 'numeric'
          })}
        </p>
      )}
    </div>
  );
}