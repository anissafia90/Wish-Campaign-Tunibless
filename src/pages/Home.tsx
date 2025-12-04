import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import WishCard from "@/components/WishCard";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [wishes, setWishes] = useState<any[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchWishes = async () => {
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
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWishes(data || []);

      // Fetch user's likes if logged in
      if (user) {
        const { data: likesData } = await supabase
          .from("likes")
          .select("wish_id")
          .eq("user_id", user.id);

        if (likesData) {
          setUserLikes(new Set(likesData.map((like) => like.wish_id)));
        }
      }
    } catch (error) {
      console.error("Error fetching wishes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();

    // Set up realtime subscription
    const channel = supabase
      .channel("public-wishes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wishes",
          filter: "is_public=eq.true",
        },
        () => {
          fetchWishes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background">
      <Header />

      {/* Hero Section */}
      <section className="container py-16 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            <span>سنة 2026</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            شارك أمنياتك للعام الجديد
            <br />
            <span className="bg-gradient-to-r from-tunibless-blue to-tunibless-red bg-clip-text text-transparent">
              مع TuniBless ✨
            </span>
          </h1>

          <p className="text-lg text-muted-foreground">
            انضم إلى مجتمعنا وشارك آمالك وأحلامك للعام الجديد. ألهم الآخرين
            واستلهم منهم!
          </p>

          {!user && (
            <div className="flex items-center justify-center space-x-4">
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  ابدأ الآن
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Wish Wall */}
      <section className="container pb-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">جدار الأمنيات</h2>
          <p className="text-muted-foreground">أحدث الأمنيات من مجتمعنا</p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : wishes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              لا توجد أمنيات حتى الآن. كن أول من يشارك!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishes.map((wish) => (
              <WishCard
                key={wish.id}
                wish={wish}
                userLiked={userLikes.has(wish.id)}
                onLikeChange={fetchWishes}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
