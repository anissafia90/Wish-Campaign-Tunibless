import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";

const wishSchema = z.object({
  title: z
    .string()
    .min(3, "يجب أن يكون العنوان 3 أحرف على الأقل")
    .max(120, "يجب ألا يزيد العنوان عن 120 حرفًا"),
  content: z
    .string()
    .min(10, "يجب ألا يقل المحتوى عن 10 أحرف")
    .max(300, "يجب ألا يزيد المحتوى عن 300 حرفًا"),
  image_url: z.string().url("يجب أن يكون رابطًا صالحًا").optional().or(z.literal("")),
});

export default function NewWish() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    is_public: true,
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">جارٍ التحميل...</div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = wishSchema.parse(formData);
      setLoading(true);

      const { error } = await supabase.from("wishes").insert({
        user_id: user.id,
        title: validated.title,
        content: validated.content,
        image_url: validated.image_url || null,
        is_public: formData.is_public,
      });

      if (error) throw error;

      toast.success("Wish created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) errorMap[err.path[0] as string] = err.message;
        });
        setErrors(errorMap);
      } else {
        toast.error(error.message || "Failed to create wish");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">إنشاء أمنية جديدة</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">العنوان *</Label>
                <Input
                  id="title"
                  placeholder="عنوان أمنيتك (بحد أقصى 120 حرفًا)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={120}
                  required
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">المحتوى *</Label>
                <Textarea
                  id="content"
                  placeholder="شارك أمنيتك للعام الجديد... (بحد أقصى 300 حرفًا)"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  maxLength={300}
                  rows={5}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.content.length}/300 حرف
                </p>
                {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">رابط الصورة (اختياري)</Label>
                <Input
                  id="image_url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
                {errors.image_url && <p className="text-sm text-destructive">{errors.image_url}</p>}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="is_public">اجعل الأمنية عامة</Label>
                  <p className="text-sm text-muted-foreground">
                    ستظهر الأمنيات العامة على جدار الأمنيات
                  </p>
                </div>
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "جارٍ الإنشاء..." : "إنشاء أمنية"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
