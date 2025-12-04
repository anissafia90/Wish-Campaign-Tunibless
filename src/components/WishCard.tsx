import { Heart, Trash2, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface WishCardProps {
  wish: {
    id: string;
    title: string;
    content: string;
    image_url?: string | null;
    likes_count: number;
    created_at: string;
    profiles: {
      full_name: string;
      avatar_url?: string | null;
      country?: string | null;
    };
  };
  userLiked?: boolean;
  onLikeChange?: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

export default function WishCard({
  wish,
  userLiked = false,
  onLikeChange,
  onDelete,
  showDelete,
}: WishCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(userLiked);
  const [likesCount, setLikesCount] = useState(wish.likes_count);
  const [loading, setLoading] = useState(false);
  const defaultImage =
    "https://www.iphone2lovely.com/newyear/wp-content/uploads/2024/09/Happy-New-Year-Wishes-2026-for-Neighbors-Status-min.jpg";
  const imageSrc = wish.image_url || defaultImage;

  const handleLike = async () => {
    if (!user) {
      toast.error("يرجى تسجيل الدخول للإعجاب بالأمنيات");
      return;
    }

    setLoading(true);
    try {
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("wish_id", wish.id);

        if (error) throw error;

        setLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        // Like
        const { error } = await supabase
          .from("likes")
          .insert({ user_id: user.id, wish_id: wish.id });

        if (error) throw error;

        setLiked(true);
        setLikesCount((prev) => prev + 1);
      }

      onLikeChange?.();
    } catch (error: any) {
      toast.error(error.message || "فشل تحديث الإعجاب");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذه الأمنية؟")) return;

    try {
      const { error } = await supabase
        .from("wishes")
        .delete()
        .eq("id", wish.id);

      if (error) throw error;

      toast.success("تم حذف الأمنية بنجاح");
      onDelete?.();
    } catch (error: any) {
      toast.error(error.message || "فشل حذف الأمنية");
    }
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={imageSrc}
          alt={wish.title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>

      <CardHeader>
        <CardTitle className="text-xl">{wish.title}</CardTitle>
        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={wish.profiles.avatar_url || undefined} />
              <AvatarFallback>{wish.profiles.full_name[0]}</AvatarFallback>
            </Avatar>
            <span>{wish.profiles.full_name}</span>
          </div>
          {wish.profiles.city && <span>• {wish.profiles.city}</span>}
          <span>• {format(new Date(wish.created_at), "MMM d, yyyy")}</span>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-foreground">{wish.content}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <Button
          variant={liked ? "default" : "outline"}
          size="sm"
          onClick={handleLike}
          disabled={loading}
          className="gap-2"
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          <span>{likesCount}</span>
        </Button>

        {showDelete && (
          <div className="flex items-center gap-2">
            <Link to={`/dashboard/new-wish?wishId=${wish.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                تحديث
              </Button>
            </Link>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              حذف
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
