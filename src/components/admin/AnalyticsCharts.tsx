import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

interface Props {
  profiles: any[] | undefined;
  boards: any[] | undefined;
  roles: any[] | undefined;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];
const CHART_COLORS = ["#6366f1", "#f43f5e", "#a3a3a3"];

const AnalyticsCharts = ({ profiles, boards, roles }: Props) => {
  const signupData = useMemo(() => {
    if (!profiles) return [];
    const last30 = Array.from({ length: 30 }, (_, i) => {
      const day = startOfDay(subDays(new Date(), 29 - i));
      return { date: format(day, "MMM dd"), count: 0, _ts: day.getTime() };
    });
    profiles.forEach((p) => {
      const ts = startOfDay(new Date(p.created_at)).getTime();
      const entry = last30.find((d) => d._ts === ts);
      if (entry) entry.count++;
    });
    return last30.map(({ date, count }) => ({ date, count }));
  }, [profiles]);

  const boardData = useMemo(() => {
    if (!boards) return [];
    const last30 = Array.from({ length: 30 }, (_, i) => {
      const day = startOfDay(subDays(new Date(), 29 - i));
      return { date: format(day, "MMM dd"), count: 0, _ts: day.getTime() };
    });
    boards.forEach((b) => {
      const ts = startOfDay(new Date(b.created_at)).getTime();
      const entry = last30.find((d) => d._ts === ts);
      if (entry) entry.count++;
    });
    return last30.map(({ date, count }) => ({ date, count }));
  }, [boards]);

  const roleData = useMemo(() => {
    if (!roles) return [];
    const counts: Record<string, number> = {};
    roles.forEach((r) => { counts[r.role] = (counts[r.role] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [roles]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">User Signups (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={signupData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Boards Created (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={boardData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ResponsiveContainer width={300} height={200}>
            <PieChart>
              <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {roleData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;
