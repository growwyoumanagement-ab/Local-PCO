import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';



const COLORS = [
    '#34d399', // Emerald 400 - brighter for dark mode
    '#fbbf24', // Amber 400
    '#fb7185', // Rose 400
    '#a78bfa', // Violet 400
];

interface BookingStatusChartProps {
    data?: { name: string, value: number, color?: string }[];
}

export function BookingStatusChart({ data = [] }: BookingStatusChartProps) {
    const defaultData = [
        { name: 'No Data', value: 1, color: '#e4e4e7' } // Zinc-200
    ];

    const chartData = data.length > 0 ? data : defaultData;

    return (
        <div className="h-[300px] w-full min-w-0 mt-4 relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={data.length > 0 ? COLORS[index % COLORS.length] : entry.color}
                                style={{
                                    filter: `drop-shadow(0px 0px 8px ${data.length > 0 ? COLORS[index % COLORS.length] : entry.color}40)`
                                }}
                            />
                        ))}
                    </Pie>
                    {data.length > 0 && (
                        <Tooltip
                            contentStyle={{
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: 'rgba(9,9,11,0.8)',
                                backdropFilter: 'blur(12px)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                padding: '12px 16px'
                            }}
                            itemStyle={{ color: '#e4e4e7', fontWeight: 600, fontSize: '14px' }}
                            labelStyle={{ color: '#a1a1aa' }}
                        />
                    )}
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-sm font-medium text-zinc-400 ml-2 tracking-wide">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
