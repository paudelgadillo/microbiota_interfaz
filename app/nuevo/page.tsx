'use client';
import { useState } from 'react';
import { predecir, DatosPaciente, ResultadoPaciente } from '@/lib/api';
import ResultadoCard from '@/components/ResultadoCard';

// ── Componentes Visuales del Formulario ────────────────────────────────────────

// AQUÍ ESTÁ EL CAMBIO: El componente ahora recibe imgSrc en lugar de icon
const SectionTitle = ({ imgSrc, title, subtitle }: { imgSrc: string, title: string, subtitle: string }) => (
  <div className="flex items-center gap-4 mb-6 border-b border-[#e8e4db] pb-4">
    <div className="w-16 h-16 shrink-0 relative transition-transform duration-300 hover:scale-105">
      <img src={imgSrc} alt={title} className="w-full h-full object-contain drop-shadow-sm" />
    </div>
    <div>
      <h3 className="text-sm font-bold text-[#2d2828] uppercase tracking-wider">{title}</h3>
      <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const Campo = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const TipClinico = ({ children }: { children: React.ReactNode }) => (
  <div className="col-span-1 lg:col-span-2 bg-[#fdfbf5] rounded-2xl border border-[#f0e6d3] p-4 flex gap-3 mt-2">
    <p className="text-sm text-[#8a6826] leading-relaxed">
      <strong className="font-bold text-[#7a591e]">Tip Clínico:</strong> {children}
    </p>
  </div>
);

const ToggleButtons = ({ opciones, valor, onChange }: { opciones: { l: string, v: number }[], valor: any, onChange: (v: number) => void }) => (
  <div className="flex gap-3 h-[42px]">
    {opciones.map(opt => (
      <button
        key={opt.l}
        type="button"
        onClick={() => onChange(opt.v)}
        className={`flex-1 rounded-xl border text-sm font-bold transition-all ${
          valor === opt.v
            ? 'bg-[#8c3a5d] border-[#8c3a5d] text-white shadow-md'
            : 'bg-white border-[#e8e4db] text-[#6b7280] hover:border-[#8c3a5d]/50 hover:text-[#8c3a5d]'
        }`}
      >
        {opt.l}
      </button>
    ))}
  </div>
);

const inputClass = "w-full bg-[#fcfbf9] border border-[#e8e4db] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4a8e8b]/20 focus:border-[#4a8e8b] transition-all h-[42px]";
const selectClass = `${inputClass} text-gray-600`;

// ── Pantalla de Carga con Video ───────────────────────────────────────────────

const PantallaCarga = () => (
  <div className="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in-95 duration-700">

    {/* Video */}
    {/* AQUÍ ESTÁ EL CAMBIO: Reemplazamos max-w-lg por max-w-xs */}
    <div className="w-full max-w-xs rounded-3xl overflow-hidden shadow-xl shadow-[#4a8e8b]/10 border border-[#e8e4db] mb-10">
      <video
        src="/video_microbiotasinfondo.webm"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto object-cover"
      />
    </div>

    <h2 className="text-2xl font-bold text-[#2d2828] mb-2">Procesando Datos de Microbiota...</h2>
    <p className="text-gray-500 text-sm mb-10">Análisis de secuenciación avanzada en curso</p>

    {/* Barra de progreso animada */}
    <div className="w-full max-w-md">
      <div className="w-full bg-[#f3f4f6] h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#4a8e8b] to-[#2a9d8f] rounded-full"
          style={{ animation: 'progress 4s ease-in-out forwards' }}
        />
      </div>
    </div>

    <style>{`
      @keyframes progress {
        0%   { width: 0%; }
        30%  { width: 40%; }
        60%  { width: 70%; }
        90%  { width: 90%; }
        100% { width: 98%; }
      }
    `}</style>

    <div className="mt-8 px-5 py-2.5 rounded-full bg-[#e4f2f0] text-[#2a9d8f] text-[11px] font-bold tracking-widest flex items-center gap-2 border border-[#a1d6cf]">
      <i className="ti ti-shield-check text-base"></i>
      ENTORNO DE PROCESAMIENTO SEGURO
    </div>
  </div>
);

// ── Página Principal ───────────────────────────────────────────────────────────

export default function NuevoPage() {
  const [resultado, setResultado] = useState<ResultadoPaciente | null>(null);
  const [error, setError]         = useState('');
  const [cargando, setCargando]   = useState(false);
  const [debugAnimacion, setDebugAnimacion] = useState(false);

  const [form, setForm] = useState<any>({
    peso: '', estatura: '', cintura: '', sexo: '',
    fc: '', glucosa: '', ph_salival: '', temp: '', fitzpatrick: '',
    p_1_3: '', p_2_1: '', p_2_4: '', p_6_7: '', p_6_2: '',
    p_6_3: '', p_6_5: '', p_6_10: '', p_3_1: '', p_3_8: '',
    p_3_6: '', p_3_5: '', p_3_12: '', p_4_1: '', p_4_2: '',
    p_5_4: '', p_5_1: '', p_5_3: '', p_5_7: '', p_6_13: '',
    carga_sintomas: '',
  });

  const set = (key: string, val: any) =>
    setForm((f: any) => ({ ...f, [key]: val }));

  const enviar = async () => {
    setCargando(true);
    setError('');
    setResultado(null);
    try {
      const [, data] = await Promise.all([
        new Promise(resolve => setTimeout(resolve, 4000)),
        predecir(form as DatosPaciente)
      ]);
      setResultado(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verifica que hayas llenado todos los campos antes de enviar.');
    } finally {
      setCargando(false);
    }
  };

  const mostrandoCarga = cargando || debugAnimacion;

  return (
    <div className="flex flex-col flex-1 pb-20 relative">

      <header className="px-10 py-8">
        <div className="flex items-center gap-2 text-xs font-bold text-[#4a8e8b] uppercase tracking-widest mb-2">
          <i className="ti ti-microscope"></i> Sistema de Entrada Clínica
        </div>
        <h1 className="text-3xl font-bold text-[#2d2828]">Nuevo Paciente</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-2xl">
          Completa todos los campos para calcular el Microbiota Score.
        </p>
      </header>

      <div className="px-10">
        {mostrandoCarga ? (
          <div className="bg-white rounded-3xl border border-[#e8e4db] shadow-sm overflow-hidden">
            <PantallaCarga />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

            <div className="col-span-1 lg:col-span-3 flex flex-col gap-8">

              {resultado && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[#2a9d8f] font-bold text-sm">
                    <i className="ti ti-circle-check text-lg"></i> Resultado generado exitosamente
                  </div>
                  <ResultadoCard r={resultado} />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* FASE 1 */}
              <section className="bg-white rounded-3xl border border-[#e8e4db] p-8 shadow-sm">
                <SectionTitle
                  imgSrc="/microbiota_cintura.png"
                  title="Fase 1 — Antropometría"
                  subtitle="Mediciones corporales y constantes vitales"
                />
                <div className="grid grid-cols-2 gap-6">
                  <Campo label="Peso (kg)"><input type="number" placeholder="0" className={inputClass} value={form.peso} onChange={e => set('peso', e.target.value === '' ? '' : +e.target.value)} /></Campo>
                  <Campo label="Estatura (cm)"><input type="number" placeholder="0" className={inputClass} value={form.estatura} onChange={e => set('estatura', e.target.value === '' ? '' : +e.target.value)} /></Campo>
                  <Campo label="Cintura (cm)"><input type="number" placeholder="0" className={inputClass} value={form.cintura} onChange={e => set('cintura', e.target.value === '' ? '' : +e.target.value)} /></Campo>
                  <Campo label="Sexo biológico">
                    <select className={selectClass} value={form.sexo} onChange={e => set('sexo', e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      <option value="F">Femenino</option><option value="M">Masculino</option>
                    </select>
                  </Campo>
                  <Campo label="Frecuencia cardíaca (BPM)"><input type="number" placeholder="0" className={inputClass} value={form.fc} onChange={e => set('fc', e.target.value === '' ? '' : +e.target.value)} /></Campo>
                  <Campo label="Glucosa en sangre (Mg/dL)"><input type="number" placeholder="0" className={inputClass} value={form.glucosa} onChange={e => set('glucosa', e.target.value === '' ? '' : +e.target.value)} /></Campo>
                  <Campo label="pH Salival"><input type="number" step="0.1" placeholder="0.0" className={inputClass} value={form.ph_salival} onChange={e => set('ph_salival', e.target.value === '' ? '' : +e.target.value)} /></Campo>
                  <Campo label="Temperatura (°C)"><input type="number" step="0.1" placeholder="0.0" className={inputClass} value={form.temp} onChange={e => set('temp', e.target.value === '' ? '' : +e.target.value)} /></Campo>

                  <TipClinico>
                    El pH salival es un biomarcador clave; niveles de acidez atípicos pueden correlacionarse con disbiosis sistémica y alteraciones metabólicas tempranas.
                  </TipClinico>

                  <Campo label="Escala Fitzpatrick (1-6)">
                    <select className={selectClass} value={form.fitzpatrick} onChange={e => set('fitzpatrick', +e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </Campo>
                </div>
              </section>

              {/* FASE 2 */}
              <section className="bg-white rounded-3xl border border-[#e8e4db] p-8 shadow-sm">
                <SectionTitle
                  imgSrc="/microbiota_habitos.png"
                  title="Fase 2 — Hábitos"
                  subtitle="Estilo de vida y factores de rutina"
                />
                <div className="grid grid-cols-2 gap-6">
                  <Campo label="Nacimiento por cesárea"><ToggleButtons valor={form.p_1_3} onChange={v => set('p_1_3', v)} opciones={[{ l: 'No / Vaginal', v: 0 }, { l: 'Sí / Cesárea', v: 1 }]} /></Campo>
                  <Campo label="Días de ejercicio por semana">
                    <select className={selectClass} value={form.p_2_1} onChange={e => set('p_2_1', +e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      <option value={0}>Nunca</option><option value={1}>1-2 días</option><option value={2}>3-4 días</option><option value={3}>5 o más días</option>
                    </select>
                  </Campo>
                  <Campo label="Horas sentado al día">
                    <select className={selectClass} value={form.p_2_4} onChange={e => set('p_2_4', +e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      <option value={0}>Menos de 4h</option><option value={1}>4-6h</option><option value={2}>7-9h</option><option value={3}>Más de 9h</option>
                    </select>
                  </Campo>
                  <Campo label="Calidad de sueño">
                    <select className={selectClass} value={form.p_6_7} onChange={e => set('p_6_7', +e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      <option value={1}>Muy mala</option><option value={2}>Mala</option><option value={3}>Adecuada</option><option value={4}>Buena</option><option value={5}>Excelente</option>
                    </select>
                  </Campo>

                  <TipClinico>
                    Altos niveles de estrés sostenido y mala calidad de sueño impactan directamente en el eje intestino-cerebro, alterando la motilidad y la composición bacteriana.
                  </TipClinico>

                  <Campo label="Nivel de estrés">
                    <select className={selectClass} value={form.p_6_2} onChange={e => set('p_6_2', +e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      <option value={1}>Bajo</option><option value={2}>Moderado</option><option value={3}>Alto</option><option value={4}>Muy alto</option>
                    </select>
                  </Campo>
                  <Campo label="Uso de enjuague bucal">
                    <select className={selectClass} value={form.p_6_10} onChange={e => set('p_6_10', +e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      <option value={0}>No uso</option><option value={1}>Ocasional</option><option value={2}>Varias veces/semana</option><option value={3}>Diario</option>
                    </select>
                  </Campo>
                  <Campo label="¿Fumas?"><ToggleButtons valor={form.p_6_3} onChange={v => set('p_6_3', v)} opciones={[{ l: 'No', v: 0 }, { l: 'Sí', v: 1 }]} /></Campo>
                  <Campo label="¿Consumes alcohol?"><ToggleButtons valor={form.p_6_5} onChange={v => set('p_6_5', v)} opciones={[{ l: 'No', v: 0 }, { l: 'Sí', v: 1 }]} /></Campo>
                </div>
              </section>

              {/* FASE 3 */}
              <section className="bg-white rounded-3xl border border-[#e8e4db] p-8 shadow-sm">
                <SectionTitle
                  imgSrc="/microbiota_alimentacion.png"
                  title="Fase 3 — Dieta y digestión"
                  subtitle="Patrones alimenticios y función intestinal"
                />
                <div className="grid grid-cols-2 gap-6">
                  <Campo label="Horas de ayuno diario">
                    <select className={selectClass} value={form.p_3_1} onChange={e => set('p_3_1', +e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      <option value={0}>Menos de 8h</option><option value={1}>8-10h</option><option value={2}>10-12h</option><option value={3}>Más de 12h</option>
                    </select>
                  </Campo>
                  <Campo label="Consumo de fibra">
                    <select className={selectClass} value={form.p_3_8} onChange={e => set('p_3_8', +e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      <option value={0}>Nunca</option><option value={1}>1-2 veces/semana</option><option value={2}>3-5 veces/semana</option><option value={3}>Diario</option>
                    </select>
                  </Campo>

                  <TipClinico>
                    Los pacientes con dietas altas en fibra suelen mostrar una mayor diversidad en el cluster Saludable debido a la fermentación de ácidos grasos de cadena corta.
                  </TipClinico>

                  <Campo label="Consumo de fermentados">
                    <select className={selectClass} value={form.p_3_6} onChange={e => set('p_3_6', +e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      <option value={0}>Nunca</option><option value={1}>Rara vez</option><option value={2}>Ocasional</option><option value={3}>Frecuente</option>
                    </select>
                  </Campo>
                  <Campo label="Consumo de ultraprocesados">
                    <select className={selectClass} value={form.p_3_5} onChange={e => set('p_3_5', +e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      <option value={0}>Nunca</option><option value={1}>1-2 veces/semana</option><option value={2}>3-4 veces/semana</option><option value={3}>5 o más</option>
                    </select>
                  </Campo>
                  <Campo label="Consumo de edulcorantes">
                    <select className={selectClass} value={form.p_3_12} onChange={e => set('p_3_12', +e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      <option value={0}>No consumo</option><option value={1}>Ocasional</option><option value={2}>Varias veces/semana</option><option value={3}>Diario</option>
                    </select>
                  </Campo>
                  <Campo label="Frecuencia de evacuación">
                    <select className={selectClass} value={form.p_4_2} onChange={e => set('p_4_2', +e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      <option value={0}>Menos de 3 veces/semana</option><option value={1}>3 veces por semana a una vez al día</option><option value={2}>2-3 veces al día</option><option value={3}>Más de 3 veces al día</option>
                    </select>
                  </Campo>

                  <div className="col-span-1 lg:col-span-2 bg-[#fdfbf7] rounded-2xl border border-[#e8e4db] p-5 flex flex-col md:flex-row gap-6 items-center shadow-sm mt-2">
                    <div className="flex-1 w-full">
                      <Campo label="Escala de Bristol (forma de heces)">
                        <select className={selectClass} value={form.p_4_1} onChange={e => set('p_4_1', +e.target.value)}>
                          <option value="" disabled hidden>Selecciona una opción...</option>
                          <option value={1}>Tipo 1</option>
                          <option value={2}>Tipo 2</option>
                          <option value={3}>Tipo 3</option>
                          <option value={4}>Tipo 4</option>
                          <option value={5}>Tipo 5</option>
                          <option value={6}>Tipo 6</option>
                          <option value={7}>Tipo 7</option>
                        </select>
                      </Campo>
                      <div className="mt-4 flex gap-2 items-start text-xs text-gray-500">
                        <i className="ti ti-info-circle text-[#4a8e8b] mt-0.5"></i>
                        <p>Apóyate en la escala gráfica para identificar la consistencia actual.</p>
                      </div>
                    </div>
                    <div className="flex-1 w-full flex justify-center bg-white rounded-xl p-3 border border-[#f0e6d3]">
                      <img src="/escaladebristol.png" alt="Escala de Bristol" className="rounded-lg object-contain max-h-56 mix-blend-multiply" />
                    </div>
                  </div>
                </div>
              </section>

              {/* FASE 4 */}
              <section className="bg-white rounded-3xl border border-[#e8e4db] p-8 shadow-sm">
                <SectionTitle
                  imgSrc="/microbiota_capsula.png"
                  title="Fase 4 — Alertas clínicas"
                  subtitle="Antecedentes médicos y sintomatología"
                />
                <div className="grid grid-cols-2 gap-6">
                  <Campo label="Enfermedad digestiva diagnosticada"><ToggleButtons valor={form.p_5_4} onChange={v => set('p_5_4', v)} opciones={[{ l: 'No', v: 0 }, { l: 'Sí (Crohn, Colitis)', v: 1 }]} /></Campo>
                  <Campo label="Veces que te enfermas al año">
                    <select className={selectClass} value={form.p_5_1} onChange={e => set('p_5_1', +e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      <option value={1}>1 vez</option><option value={2}>2-3 veces</option><option value={3}>4 o más veces</option>
                    </select>
                  </Campo>

                  <TipClinico>
                    El uso reciente de antibióticos de amplio espectro puede reducir drásticamente la diversidad del microbioma, requiriendo en ocasiones varios meses para la repoblación basal.
                  </TipClinico>

                  <Campo label="Antibióticos en últimos 3 meses"><ToggleButtons valor={form.p_5_3} onChange={v => set('p_5_3', v)} opciones={[{ l: 'No', v: 0 }, { l: 'Sí, Reciente', v: 1 }]} /></Campo>
                  <Campo label="Infección gastrointestinal reciente"><ToggleButtons valor={form.p_5_7} onChange={v => set('p_5_7', v)} opciones={[{ l: 'No', v: 0 }, { l: 'Sí', v: 1 }]} /></Campo>
                  <Campo label="Problemas digestivos por estrés">
                    <select className={selectClass} value={form.p_6_13} onChange={e => set('p_6_13', +e.target.value)}>
                      <option value="" disabled hidden>Selecciona una opción...</option>
                      <option value={0}>Nunca</option><option value={1}>A veces</option><option value={2}>Frecuentemente</option><option value={3}>Diario</option>
                    </select>
                  </Campo>
                  <Campo label="Total de síntomas frecuentes (0-5)">
                    <input type="number" min={0} max={5} placeholder="0" className={inputClass} value={form.carga_sintomas} onChange={e => set('carga_sintomas', e.target.value === '' ? '' : Math.min(5, Math.max(0, +e.target.value)))} />
                    <span className="text-[10px] text-gray-400 mt-1 pl-1 leading-tight">
                      Elegir de entre los siguientes: Hinchazón, Gases, Diarrea, Estreñimiento, Dolor abdominal.
                    </span>
                  </Campo>
                </div>
              </section>

              <button onClick={enviar} className="w-full mt-4 bg-[#4a8e8b] hover:bg-[#3d7572] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#4a8e8b]/20 transition-all text-sm">
                Calcular Microbiota Score
              </button>

            </div>

            {/* Columna Derecha */}
            <div className="col-span-1">
              <div className="bg-white rounded-3xl border border-[#e8e4db] p-6 shadow-sm sticky top-8">
                <h4 className="text-base font-bold text-[#2d2828] mb-5">Ayuda del Sistema</h4>
                <ul className="flex flex-col gap-5">
                  {[
                    { t: 'Antropometría', d: 'Peso y Estatura deben ser actuales.' },
                    { t: 'Biomarcadores', d: 'Glucosa en ayunas recomendada y pH Salival' },
                    { t: 'Signos vitales', d: 'Frecuencia cardíaca y Temperatura.' },
                    { t: 'Datos biológicos', d: 'Sexo Biológico.' },
                    { t: 'Bristol', d: 'Usar la guía visual de heces.' }
                  ].map(i => (
                    <li key={i.t} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#4a8e8b] mt-1.5 shrink-0"></div>
                      <div>
                        <p className="text-sm font-bold text-[#2d2828]">{i.t}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{i.d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}