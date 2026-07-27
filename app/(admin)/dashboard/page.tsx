import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";
import type { DashboardStats } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  SCHEDULED: "Scheduled",
  ARCHIVED: "Archived",
};

export default async function DashboardPage() {
  const stats = await apiFetch<DashboardStats>("/dashboard/stats");

  const cards = [
    { label: "Total Users", value: stats.totalUsers },
    { label: "Total Blogs", value: stats.totalBlogs },
    { label: "Total Categories", value: stats.totalCategories },
    { label: "Total Views", value: stats.totalViews },
  ];

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Blogs by Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {Object.entries(stats.blogsByStatus).map(([status, count]) => (
            <Badge key={status} variant="outline" className="gap-2 px-3 py-1.5 text-sm">
              {STATUS_LABELS[status] ?? status}
              <span className="font-semibold">{count}</span>
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
