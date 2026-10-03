export interface SensorReadingEntry {
  sensorId: string;
  kpaCh1: number | null;
  kpaCh2: number | null;
  kpaCh3: number | null;
  measuredAt: string | null;
}

export function mapSensorReading(raw: any): SensorReadingEntry {
  return {
    sensorId: raw.sensor_id,
    kpaCh1: raw.kpa_ch1,
    kpaCh2: raw.kpa_ch2,
    kpaCh3: raw.kpa_ch3,
    measuredAt: raw.measured_at,
  };
}
