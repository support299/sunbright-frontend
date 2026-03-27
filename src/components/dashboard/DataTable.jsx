export default function DataTable({ data, columns }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-3 py-3 text-left font-medium text-muted-foreground">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data || []).map((row, i) => (
            <tr key={i} className="border-b border-border/50 transition-colors hover:bg-accent/30">
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-3 py-3 text-foreground">
                  {col.format ? col.format(row[col.key], row) : (row[col.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
