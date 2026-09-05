import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  User,
  GraduationCap,
  Shield,
  BookOpen,
  Lock,
  Mail,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import { usePublicClasses, publicClassLabel } from "@/lib/classes-public";
import { useSiteSettings } from "@/lib/site-api";

interface PortalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "student" | "staff" | "register";
}

export function PortalDialog({
  open,
  onOpenChange,
  defaultTab = "student",
}: PortalDialogProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Student Login State
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [isStudentSubmitting, setIsStudentSubmitting] = useState(false);

  // Staff Login State
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [isStaffSubmitting, setIsStaffSubmitting] = useState(false);

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);

  const navigate = useNavigate();

  // Reset Form
  const resetForm = () => {
    setStudentEmail("");
    setStudentPassword("");
    setStaffEmail("");
    setStaffPassword("");
    setRegName("");
    setRegEmail("");
    setRegPhone("");
    setRegPassword("");
    setRegConfirmPassword("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Google ile giriş yapılırken bir hata oluştu.");
    }
  };

  // Student Login
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail || !studentPassword) {
      toast.error("Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    setIsStudentSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: studentEmail.trim(),
        password: studentPassword,
      });

      if (error) throw error;

      toast.success("Giriş başarılı!");
      handleOpenChange(false);
      navigate({ to: "/ogrenci" });
    } catch (err: any) {
      toast.error(err.message || "Giriş yapılamadı. Bilgilerinizi kontrol edin.");
    } finally {
      setIsStudentSubmitting(false);
    }
  };

  // Staff / Admin Login (Doğrudan Auth & Rol Kontrolü)
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail || !staffPassword) {
      toast.error("Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    setIsStaffSubmitting(true);
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: staffEmail.trim(),
          password: staffPassword,
        });

      if (authError) throw authError;

      const userId = authData.user?.id;

      // Rol kontrolü
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

      toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
      handleOpenChange(false);

      if (userRole === "super_admin" || userRole === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/panel" });
      }
    } catch (err: any) {
      console.error("Giriş Hatası:", err);
      toast.error(err.message || "E-posta veya şifre hatalı.");
    } finally {
      setIsStaffSubmitting(false);
    }
  };

  // Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }

    setIsRegisterSubmitting(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          data: {
            name: regName,
            phone: regPhone,
          },
        },
      });

      if (authError) throw authError;

      toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
      setActiveTab("student");
    } catch (err: any) {
      toast.error(err.message || "Kayıt işlemi tamamlanamadı.");
    } finally {
      setIsRegisterSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-background border-border max-h-[90vh] overflow-y-auto">
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

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full px-6 pb-6"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#f3f4f1] p-1 rounded-lg">
            <TabsTrigger
              value="student"
              className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              Öğrenci Girişi
            </TabsTrigger>
            <TabsTrigger
              value="staff"
              className="text-xs sm:text-sm data-[state=active]:bg-[#4a5d3f] data-[state=active]:text-white rounded-md"
            >
              Yönetici / Eğitmen
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              Kayıt Ol
            </TabsTrigger>
          </TabsList>

        
          {/* ÖĞRENCİ GİRİŞİ */}
          <TabsContent value="student" className="space-y-4 m-0">
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                 placeholder="E-mail gir"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="rounded-xl py-5"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showStudentPassword ? "text" : "password"}
                    placeholder="Şifre gir"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    className="rounded-xl py-5 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showStudentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#4a5d3f] hover:bg-[#3d4d34] text-white rounded-full py-5"
                disabled={isStudentSubmitting}
              >
                {isStudentSubmitting ? "Giriş yapılıyor..." : "Öğrenci Paneline Gir"}
              </Button>
            </form>
          </TabsContent>

          {/* YÖNETİCİ / EĞİTMEN GİRİŞİ */}
          <TabsContent value="staff" className="space-y-4 m-0">
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="E-mail gir"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="rounded-xl py-5"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showStaffPassword ? "text" : "password"}
                  placeholder="Şifre gir"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="rounded-xl py-5 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPassword(!showStaffPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showStaffPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#4a5d3f] hover:bg-[#3d4d34] text-white rounded-full py-5"
                disabled={isStaffSubmitting}
              >
                {isStaffSubmitting ? "Giriş yapılıyor..." : "Yönetim Paneline Gir"}
              </Button>
            </form>
            <p className="text-[11px] text-muted-foreground text-center mt-2 leading-relaxed">
              Bu alana sadece yetkili yöneticiler ve eğitmenler giriş yapabilir.
              Eğitmenler yalnızca kendilerine atanmış sınıfları görüntüleyebilir.
            </p>
          </TabsContent>

          {/* KAYIT OL */}
          <TabsContent value="register" className="space-y-4 m-0">
            <form onSubmit={handleRegister} className="space-y-3">
              <Input
                type="text"
                placeholder="Ad Soyad"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="rounded-xl py-5"
                required
              />
              <Input
                type="email"
                placeholder="E-posta Adresi"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="rounded-xl py-5"
                required
              />
              <Input
                type="tel"
                placeholder="Telefon Numarası"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="rounded-xl py-5"
              />
              <div className="relative">
                <Input
                  type={showRegPassword ? "text" : "password"}
                  placeholder="Şifre"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="rounded-xl py-5 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showRegPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <Input
                type="password"
                placeholder="Şifre Tekrar"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="rounded-xl py-5"
                required
              />
              <Button
                type="submit"
                className="w-full bg-[#4a5d3f] hover:bg-[#3d4d34] text-white rounded-full py-5 mt-2"
                disabled={isRegisterSubmitting}
              >
                {isRegisterSubmitting ? "Kaydediliyor..." : "Kayıt Ol"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default PortalDialog;
