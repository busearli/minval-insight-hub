import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Shield, User, GraduationCap, Lock, Mail } from "lucide-react";

interface PortalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "student" | "staff" | "register";
}

export function PortalDialog({ open, onOpenChange, defaultTab = "staff" }: PortalDialogProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isStaffSubmitting, setIsStaffSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail || !staffPassword) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen e-posta ve şifrenizi girin.",
        variant: "destructive",
      });
      return;
    }

    setIsStaffSubmitting(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: staffEmail.trim(),
        password: staffPassword,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      const userRole = roleData?.role || profileData?.role;

      toast({
        title: "Giriş Başarılı",
        description: "Yönlendiriliyorsunuz...",
      });

      onOpenChange(false);

      if (userRole === "super_admin" || userRole === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/panel" });
      }
    } catch (err: any) {
      console.error("Giriş Hatası:", err);
      toast({
        title: "Giriş Başarısız",
        description: err.message || "E-posta veya şifre hatalı.",
        variant: "destructive",
      });
    } finally {
      setIsStaffSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-background border-border">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif font-bold text-foreground">
              Minval Portal
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Kursiyerler, eğitmenler ve yöneticiler için tek giriş noktası.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-6 pb-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="student" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Öğrenci Girişi
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2">
              <Shield className="w-4 h-4" />
              Yönetici / Eğitmen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="space-y-4">
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff-email">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="staff-email"
                    type="email"
                    placeholder="ornek@minval.com"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff-password">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="staff-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="pl-9 pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#4a5d3f] hover:bg-[#3d4d34] text-white"
                disabled={isStaffSubmitting}
              >
                {isStaffSubmitting ? "Giriş yapılıyor..." : "Yönetim Paneline Gir"}
              </Button>
            </form>

            <div className="text-xs text-muted-foreground text-center bg-muted/40 p-3 rounded-md">
              Bu alana sadece yetkili yöneticiler ve eğitmenler giriş yapabilir.
            </div>
          </TabsContent>

          <TabsContent value="student" className="space-y-4 text-center py-4">
            <p className="text-sm text-muted-foreground">
              Öğrenci girişi için ana sayfadaki kayıt ve program alanlarını kullanabilirsiniz.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default PortalDialog;
