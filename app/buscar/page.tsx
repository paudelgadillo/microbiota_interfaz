'use client';
import { useState } from 'react';
import { buscarPorId, obtenerResultados, ResultadoPaciente } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

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

const inputClass = "bg-[#fcfbf9] border border-[#e8e4db] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#4a8e8b]/20 focus:border-[#4a8e8b] transition-all";

const PERFIL_MAP: Record<string, string> = {
  'Saludable': 'Saludable',
  'Promedio' : 'Promedio',
  'Riesgo'   : 'Riesgo / Disbiosis',
};

const DATOS_CURIOSOS = [
  {
    titulo   : '¿Sabías que...?',
    texto    : 'Existen bacterias buenas en tu intestino, como las Bifidobacterias y las bacterias del ácido láctico, que se dan un banquete cuando comes chocolate oscuro. Ellas fermentan los compuestos del cacao y los transforman en compuestos antiinflamatorios que son excelentes para el corazón y la salud en general.',
    imagen   : '/microbiota_idea.png',
    bg       : 'bg-[#f7edf1]',
    border   : 'border-[#d4a8ba]/40',
    color    : 'text-[#8c3a5d]',
    textColor: 'text-[#5a253c]',
  },
  {
    titulo   : 'Control Mental',
    texto    : 'Si de repente tienes un antojo incontrolable de azúcar o comida rápida, podría no ser tu cerebro el que manda, sino tus bacterias. Las diferentes especies de bacterias prefieren diferentes alimentos; algunas aman el azúcar y otras la fibra. Se cree que pueden enviar señales químicas a través del nervio vago hacia tu cerebro para obligarte a comer lo que ellas necesitan para sobrevivir.',
    imagen   : '/microbiota_curiosa.png',
    bg       : 'bg-[#e4f2f0]',
    border   : 'border-[#a1d6cf]/40',
    color    : 'text-[#4a8e8b]',
    textColor: 'text-[#1e3a3a]',
  },
  {
    titulo   : 'Tu segundo genoma',
    texto    : 'Tu microbiota contiene aproximadamente 3.3 millones de genes únicos, mientras que el genoma humano solo tiene unos 23,000. En cierto sentido, llevas contigo más información genética bacteriana que humana. Esta diversidad genética es lo que permite a tu microbiota realizar funciones que tú solo no podrías.',
    imagen   : '/microbiota_detective.png',
    bg       : 'bg-[#fdf8ed]',
    border   : 'border-[#e8d59b]/40',
    color    : 'text-[#d4af37]',
    textColor: 'text-[#7a591e]',
  },
];

export default function BuscarPage() {
  const [id, setId]                     = useState('');
  const [perfilFiltro, setPerfilFiltro] = useState('Todos los estados');
  const [scoreMin, setScoreMin]         = useState('');
  const [scoreMax, setScoreMax]         = useState('');
  const [resultados, setResultados]     = useState<ResultadoPaciente[]>([]);
  const [error, setError]               = useState('');
  const [cargando, setCargando]         = useState(false);
  const [buscado, setBuscado]           = useState(false);

  const aplicarFiltros = async () => {
    setCargando(true);
    setError('');
    setResultados([]);
    setBuscado(true);

    try {
      if (id.trim()) {
        const data = await buscarPorId(id.trim());
        setResultados([data]);
        setCargando(false);
        return;
      }

      const todos = await obtenerResultados();
      let filtrados = todos;

      if (perfilFiltro !== 'Todos los estados') {
        const perfilReal = PERFIL_MAP[perfilFiltro] ?? perfilFiltro;
        filtrados = filtrados.filter(r => r.perfil === perfilReal);
      }

      const min = parseFloat(scoreMin);
      if (!isNaN(min)) filtrados = filtrados.filter(r => r.microbiota_score >= min);

      const max = parseFloat(scoreMax);
      if (!isNaN(max)) filtrados = filtrados.filter(r => r.microbiota_score <= max);

      if (filtrados.length === 0) {
        setError('No se encontraron registros con los filtros seleccionados.');
      } else {
        setResultados(filtrados);
      }
    } catch {
      setError('No se encontró ningún paciente con ese ID en la base de datos.');
    } finally {
      setCargando(false);
    }
  };

  const limpiarFiltros = () => {
    setId('');
    setPerfilFiltro('Todos los estados');
    setScoreMin('');
    setScoreMax('');
    setResultados([]);
    setError('');
    setBuscado(false);
  };

  const tituloTabla = () => {
    if (!buscado) return 'Usa los filtros para buscar registros';
    if (resultados.length === 1) return '1 resultado encontrado';
    if (resultados.length > 1) return `${resultados.length} resultados encontrados`;
    return 'Sin resultados';
  };

  return (
    <div className="flex flex-col flex-1 pb-20">

      {/* Header */}
      <header className="px-10 py-8">
        <div className="flex items-center gap-2 text-xs font-bold text-[#8c3a5d] uppercase tracking-widest mb-2">
          <i className="ti ti-archive"></i> Repositorio Clínico
        </div>
        <h1 className="text-3xl font-bold text-[#2d2828]">Gestión de Registros</h1>
        <p className="text-gray-500 text-sm mt-2">
          Consulta y filtra el historial de análisis de microbiota de la plataforma.
        </p>
      </header>

      {/* Barra de Filtros */}
      <div className="px-10 mb-8">
        <div className="bg-white p-6 rounded-[2rem] border border-[#e8e4db] shadow-sm flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[250px]">
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">Buscar por ID</label>
            <div className="relative">
              <i className="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={id}
                onChange={e => setId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && aplicarFiltros()}
                placeholder="ej. 112"
                className={`${inputClass} w-full pl-11`}
              />
            </div>
          </div>

          <div className="w-52">
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">Estado del Perfil</label>
            <select
              className={`${inputClass} w-full`}
              value={perfilFiltro}
              onChange={e => setPerfilFiltro(e.target.value)}
            >
              <option>Todos los estados</option>
              <option>Saludable</option>
              <option>Promedio</option>
              <option>Riesgo</option>
            </select>
          </div>

          <div className="w-44">
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">Rango de Score</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={scoreMin}
                onChange={e => setScoreMin(e.target.value)}
                className={`${inputClass} w-full px-2 text-center`}
              />
              <span className="text-gray-300">-</span>
              <input
                type="number"
                placeholder="Max"
                value={scoreMax}
                onChange={e => setScoreMax(e.target.value)}
                className={`${inputClass} w-full px-2 text-center`}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={aplicarFiltros}
              disabled={cargando}
              className="bg-[#4a8e8b] hover:bg-[#3d7572] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#4a8e8b]/20 transition-all disabled:opacity-50"
            >
              {cargando ? 'Buscando...' : 'Aplicar Filtros'}
            </button>
            {buscado && (
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2.5 rounded-xl text-sm font-bold border border-[#e8e4db] text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all"
                title="Limpiar filtros"
              >
                <i className="ti ti-x"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="px-10 flex flex-col gap-8">

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium">
            <i className="ti ti-alert-circle mr-2"></i> {error}
          </div>
        )}

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-[2rem] border border-[#e8e4db] shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-[#e8e4db] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-[#2d2828]">{tituloTabla()}</h3>
              {buscado && perfilFiltro !== 'Todos los estados' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ebf5f4] text-[#4a8e8b] border border-[#b4d6d4]">
                  {perfilFiltro}
                </span>
              )}
              {buscado && (scoreMin || scoreMax) && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fdf8ed] text-[#d4af37] border border-[#e8d59b]">
                  Score {scoreMin || '0'} – {scoreMax || '100'}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-[#fcfbf9] border border-[#e8e4db] text-gray-400">
                <i className="ti ti-layout-grid"></i>
              </button>
              <button className="p-2 rounded-lg bg-[#ebf5f4] border border-[#4a8e8b]/30 text-[#4a8e8b]">
                <i className="ti ti-list"></i>
              </button>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fcfbf9] text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-8 py-4">Fecha Análisis</th>
                <th className="px-8 py-4">ID Paciente</th>
                <th className="px-8 py-4">Microbiota Score</th>
                <th className="px-8 py-4">Estado Perfil</th>
                <th className="px-8 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e4db]">
              {resultados.length > 0 ? (
                resultados.map((r, i) => (
                  <tr
                    key={r.id_paciente}
                    className="hover:bg-[#fdfbf7] transition-colors"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-8 py-5 text-sm text-gray-500">
                      {r.fecha ? new Date(r.fecha).toLocaleDateString() : 'Reciente'}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-[#4a8e8b]">{r.id_paciente}</span>
                      {r.es_anomalia && (
                        <span className="ml-2 text-[10px] bg-fuchsia-100 text-fuchsia-700 px-1.5 py-0.5 rounded font-bold uppercase">
                          Atípico
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-bold ${r.microbiota_score >= 60 ? 'text-[#2a9d8f]' : 'text-[#8c3a5d]'}`}>
                          {r.microbiota_score.toFixed(1)}
                        </span>
                        <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${r.microbiota_score >= 60 ? 'bg-[#2a9d8f]' : 'bg-[#8c3a5d]'}`}
                            style={{ width: `${r.microbiota_score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <BadgeStatus status={r.perfil} />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link
                        href={`/buscar/${r.id_paciente}`}
                        className="text-[#4a8e8b] font-bold text-sm hover:underline inline-flex items-center gap-1"
                      >
                        Ver detalles <i className="ti ti-chevron-right"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-[#fcfbf9] flex items-center justify-center text-gray-300">
                        <i className="ti ti-search text-3xl"></i>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {buscado
                          ? 'No hay registros que coincidan con los filtros aplicados'
                          : 'Usa el buscador o los filtros para localizar registros'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Datos curiosos — solo visibles después de buscar */}
        {buscado && (
          <div className="flex flex-col gap-4">

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[#e8e4db]"></div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <i className="ti ti-bulb"></i>
                Datos Curiosos
              </div>
              <div className="flex-1 h-px bg-[#e8e4db]"></div>
            </div>

            <div className="flex flex-col gap-4">
              {DATOS_CURIOSOS.map((d, i) => (
                <div
                  key={i}
                  className={`${d.bg} ${d.border} border rounded-[2rem] p-6 flex items-center gap-6`}
                >
                  {/* Imagen de mascota */}
                  <div className="w-32 h-32 flex-shrink-0 relative">
                    <Image
                      src={d.imagen}
                      alt={d.titulo}
                      fill
                      className="object-contain drop-shadow-md"
                    />
                  </div>

                  {/* Texto */}
                  <div className="flex-1">
                    <h4 className={`${d.color} font-bold text-base mb-2`}>{d.titulo}</h4>
                    <p className={`${d.textColor} text-sm leading-relaxed opacity-90`}>{d.texto}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}