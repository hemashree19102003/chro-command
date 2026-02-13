import { Layout } from "@/components/Layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const hiringData = [
  { stage: "Applied", count: 120 },
  { stage: "Screened", count: 85 },
  { stage: "Interviewed", count: 40 },
  { stage: "Offered", count: 15 },
  { stage: "Hired", count: 10 },
];

const aiAccuracy = [
  { month: "Sep", accuracy: 82 },
  { month: "Oct", accuracy: 85 },
  { month: "Nov", accuracy: 88 },
  { month: "Dec", accuracy: 90 },
  { month: "Jan", accuracy: 91 },
  { month: "Feb", accuracy: 93 },
];

const pieData = [
  { name: "Auto-Approved", value: 68 },
  { name: "Manual Review", value: 22 },
  { name: "Rejected", value: 10 },
];

const COLORS = ["hsl(152, 60%, 45%)", "hsl(249, 100%, 65%)", "hsl(0, 72%, 51%)"];

export default function Analytics() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">AI-powered HR insights and metrics</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Hiring Conversion" value="8.3%" sub="Applied → Hired" />
          <MetricCard label="AI Accuracy" value="93%" sub="Recommendation accuracy" />
          <MetricCard label="Payroll Errors" value="↓ 64%" sub="Reduction since AI" />
          <MetricCard label="Leave Auto-Approval" value="68%" sub="Of all leave requests" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 enterprise-shadow">
            <h3 className="mb-4 text-sm font-semibold">Hiring Conversion Funnel</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hiringData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(249, 100%, 65%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border bg-card p-5 enterprise-shadow">
            <h3 className="mb-4 text-sm font-semibold">AI Recommendation Accuracy</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={aiAccuracy}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[75, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="hsl(249, 100%, 65%)" strokeWidth={2} dot={{ fill: "hsl(249, 100%, 65%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 enterprise-shadow">
          <h3 className="mb-4 text-sm font-semibold">Leave Auto-Approval Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 enterprise-shadow">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
