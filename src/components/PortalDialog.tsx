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
      // 1. Doğrudan Supabase ile oturum aç
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: staffEmail.trim(),
        password: staffPassword,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      // 2. Kullanıcının rolünü user_roles veya profiles tablosundan al
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const userRole = roleData?.role || profileData?.role;

      toast({
        title: "Giriş Başarılı",
        description: "Yönlendiriliyorsunuz...",
      });

      onOpenChange(false);

      // 3. Role göre doğru sayfaya yönlendir
      if (userRole === 'super_admin' || userRole === 'admin') {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/panel' });
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
