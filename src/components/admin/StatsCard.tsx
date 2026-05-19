type StatsCardProps = {
  title: string
  value: string | number
  icon: string
  subtitle?: string
  color?: 'amber' | 'green' | 'red' | 'blue'
}

const colorMap = {
  amber: 'bg-amber-50 border-amber-200 text-amber-900',
  green: 'bg-green-50 border-green-200 text-green-900',
  red: 'bg-red-50 border-red-200 text-red-900',
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
}

export function StatsCard({ title, value, icon, subtitle, color = 'amber' }: StatsCardProps) {
  const cls = colorMap[color]
  return (
    <div className={`rounded-2xl border-2 p-6 ${cls}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium opacity-70">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-xs mt-1 opacity-60">{subtitle}</p>}
    </div>
  )
}
