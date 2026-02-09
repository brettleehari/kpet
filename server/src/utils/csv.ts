import { parse } from 'csv-parse/sync';

export interface CsvPlayerRow {
  name: string;
  whatsapp: string;
  role: string;
  location: string;
}

const VALID_ROLES = ['BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'];

export function parseCsv(buffer: Buffer): CsvPlayerRow[] {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  return records.map((row, i) => {
    const name = row.name || row.Name;
    const whatsapp = row.whatsapp || row.WhatsApp || row.phone || row.Phone;
    const role = (row.role || row.Role || '').toUpperCase().replace(/[\s-]/g, '_');
    const location = row.location || row.Location || '';

    if (!name || !whatsapp) {
      throw new Error(`Row ${i + 1}: name and whatsapp are required`);
    }

    if (!VALID_ROLES.includes(role)) {
      throw new Error(
        `Row ${i + 1}: invalid role "${role}". Must be one of: ${VALID_ROLES.join(', ')}`
      );
    }

    return { name, whatsapp, role, location };
  });
}
