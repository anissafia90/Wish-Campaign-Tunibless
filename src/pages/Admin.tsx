import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import WishCard from "@/components/WishCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Heart } from "lucide-react";

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [wishes, setWishes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWishes: 0,
    totalLikes: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch all wishes
      const { data: wishesData, error: wishesError } = await supabase
        .from("wishes")
        .select(
          `
          *,
          profiles (
            full_name,
            avatar_url,
            city
          )
        `
        )
        .order("created_at", { ascending: false });

      if (wishesError) throw wishesError;
      setWishes(wishesData || []);

      // Fetch stats
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: wishesCount } = await supabase
        .from("wishes")
        .select("*", { count: "exact", head: true });

      const { count: likesCount } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalWishes: wishesCount || 0,
        totalLikes: likesCount || 0,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        جارٍ التحميل...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <h1 className="mb-8 text-3xl font-bold">لوحة تحكم المسؤول</h1>

        {/* الإحصاءات */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الأمنيات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWishes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإعجابات</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
            </CardContent>
          </Card>
        </div>

        {/* جميع الأمنيات */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">جميع الأمنيات</h2>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : wishes.length === 0 ? (
            <p className="text-muted-foreground">لا توجد أمنيات بعد.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {wishes.map((wish) => (
                <WishCard
                  key={wish.id}
                  wish={wish}
                  showDelete
                  onDelete={fetchData}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
