const Stats = ({ stats, className, toShow }) => {
  return (
    <section className={className}>
        {stats?.slice(0, toShow || 4).map((stat) => (
            <div 
                key={stat?.label} 
                className="bg-white rounded-lg border border-(--border-default) p-6 hover:shadow-lg transition-shadow duration-300 hover:border-(--border-primary) cursor-pointer"
            >
                <div className="flex items-start gap-4">
                    {/* Icon Container */}
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-(--bg-surface) flex items-center justify-center text-(--icon-default)">
                        {stat?.icon || null}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-(--text-secondary) mb-1">
                            {stat?.label || 'Label'}
                        </p>
                        <p className="text-2xl font-bold text-(--text-heading) tracking-tight">
                            {stat?.value || 0}
                        </p>
                        {stat?.change && (
                            <p className={`text-xs font-medium mt-2 ${
                                stat?.change > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {stat?.change > 0 ? '↑' : '↓'} {Math.abs(stat?.change)}%
                            </p>
                        )}
                    </div>
                </div>
            </div>
        ))}
    </section>
  )
}

export default Stats