import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import WishCard from "@/components/WishCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [wishes, setWishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWishes(data || []);
    } catch (error) {
      console.error("Error fetching wishes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishes();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        جارٍ التحميل...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">أمنياتي</h1>
            <p className="text-muted-foreground">إدارة أمنياتك للعام الجديد</p>
          </div>
          <Link to="/dashboard/new-wish">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إنشاء أمنية
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : wishes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              لم تقم بإنشاء أي أمنيات بعد.
            </p>
            <Link to="/dashboard/new-wish">
              <Button>أنشئ أمنيتك الأولى</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishes.map((wish) => (
              <WishCard
                key={wish.id}
                wish={wish}
                showDelete
                onDelete={fetchWishes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
