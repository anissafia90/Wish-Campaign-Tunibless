import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z
    .string()
    .min(4, "يجب أن يكون الاسم 4 أحرف على الأقل")
    .max(100, "يجب ألا يزيد الاسم عن 100 حرفًا"),
  city: z.string().optional(),
  avatar_url: z
    .string()
    .url("يجب أن يكون رابطًا صالحًا")
    .optional()
    .or(z.literal("")),
});

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState({
    full_name: "",
    city: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          city: data.city || "",
          avatar_url: data.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = profileSchema.parse(profile);
      setLoading(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: validated.full_name,
          city: validated.city || null,
          avatar_url: validated.avatar_url || null,
        })
        .eq("id", user!.id);

      if (error) throw error;

      toast.success("تم تحديث الملف الشخصي بنجاح!");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) errorMap[err.path[0] as string] = err.message;
        });
        setErrors(errorMap);
      } else {
        toast.error(error.message || "فشل تحديث الملف الشخصي");
      }
    } finally {
      setLoading(false);
    }
  };

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

      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">إعدادات الملف الشخصي</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {profile.full_name[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{user.email}</p>
                  <p>قم بتحديث معلومات ملفك الشخصي</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">الاسم الكامل *</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  required
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">المدينة</Label>
                <Input
                  id="city"
                  placeholder="مثال: تونس"
                  value={profile.city}
                  onChange={(e) =>
                    setProfile({ ...profile, city: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">رابط الصورة</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profile.avatar_url}
                  onChange={(e) =>
                    setProfile({ ...profile, avatar_url: e.target.value })
                  }
                />
                {errors.avatar_url && (
                  <p className="text-sm text-destructive">
                    {errors.avatar_url}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
