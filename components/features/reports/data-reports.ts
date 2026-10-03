interface ExportInterface1{
  watering_area: string;
  area_name: string;
  watering_frequency: number;
  amount_of_wateringrounds: number;
  critical_attention_needed: number;
  water_amount?: number;
};

interface ExportInterface2{
    watering_area: string;
    area_name: string;
    planed_at: Date;
    watered_at: Date;
    created_by: string;
    watered_by: string;
}

export function exportToCSV<T extends object>(data: T[], filename: string) {
  if (!data || data.length === 0) {
    console.warn("Keine Daten zum exportieren");
    return;
  }

  // Alle Keys dynamisch holen
  const headers = Object.keys(data[0]);

  // CSV-Zeilen erstellen
  const csvRows = [
    headers.join(","), 
    ...data.map(row =>
      headers
        .map(key => {
          let value = (row as any)[key];

          if (value instanceof Date) {
            value = value.toISOString();
          }

          if (typeof value === "string") {
            value = value.replace(/"/g, '""'); // doppelte Quotes escapen
            if (value.match(/([",\n])/)) {
              value = `"${value}"`;
            }
          }

          return value ?? "";
        })
        .join(",")
    )
  ];

  const csvContent = csvRows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
