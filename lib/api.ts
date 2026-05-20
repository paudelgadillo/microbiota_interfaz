const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface ResultadoPaciente {
  id_paciente:          string;
  microbiota_score:     number;
  perfil:               string;
  es_anomalia:          boolean;
  imc:                  number;
  diet_score:           number;
  lifestyle_score:      number;
  microbiota_stress:    number;
  metabolic_risk_score: number;
  fecha?:               string;
}

export interface DatosPaciente {
  peso:          number;
  estatura:      number;
  cintura:       number;
  sexo:          'M' | 'F';
  fc:            number;
  glucosa:       number;
  ph_salival:    number;
  temp:          number;
  fitzpatrick:   number;
  p_1_3:         number;
  p_2_1:         number;
  p_2_4:         number;
  p_6_7:         number;
  p_6_2:         number;
  p_6_3:         number;
  p_6_5:         number;
  p_6_10:        number;
  p_3_1:         number;
  p_3_8:         number;
  p_3_6:         number;
  p_3_5:         number;
  p_3_12:        number;
  p_4_1:         number;
  p_4_2:         number;
  p_5_4:         number;
  p_5_1:         number;
  p_5_3:         number;
  p_5_7:         number;
  p_6_13:        number;
  carga_sintomas:number;
}

export interface DatoGrafica {
  id_paciente:      string;
  perfil:           string;
  es_anomalia:      boolean;
  microbiota_score: number;
  tsne_x:           number;
  tsne_y:           number;
}

export async function predecir(datos: DatosPaciente): Promise<ResultadoPaciente> {
  const res = await fetch(`${API_URL}/predecir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al procesar los datos');
  }
  return res.json();
}

export async function obtenerResultados(): Promise<ResultadoPaciente[]> {
  const res = await fetch(`${API_URL}/resultados`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener resultados');
  return res.json();
}

export async function buscarPorId(id: string): Promise<ResultadoPaciente> {
  const res = await fetch(`${API_URL}/resultados/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Paciente no encontrado');
  return res.json();
}

export async function obtenerDatosGraficas(): Promise<DatoGrafica[]> {
  const res = await fetch(`${API_URL}/graficas`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener datos de gráficas');
  return res.json();
}