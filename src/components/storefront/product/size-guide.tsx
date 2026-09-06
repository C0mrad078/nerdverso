export function SizeGuideTable({ rows }: { rows: unknown }) {
  if (!Array.isArray(rows) || rows.length === 0 || typeof rows[0] !== "object") {
    return <p className="text-sm text-muted-foreground">Guia de medidas indisponível.</p>;
  }

  const columns = Object.keys(rows[0] as Record<string, unknown>);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            {columns.map((col) => (
              <th key={col} className="whitespace-nowrap py-2 pr-4 font-medium capitalize">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows as Record<string, unknown>[]).map((row, i) => (
            <tr key={i} className="border-b border-border/60">
              {columns.map((col) => (
                <td key={col} className="whitespace-nowrap py-2 pr-4 text-foreground">
                  {String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">Medidas em centímetros.</p>
    </div>
  );
}
