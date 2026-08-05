import { useEffect, useState } from "react";

/**
 * Geliştirici modu süper admin bypass'ı.
 * Yalnızca `import.meta.env.DEV` iken çalışır; üretimde tamamen devre dışıdır.
 * Sunucu tarafındaki RLS kuralları bu bayraktan etkilenmez.
 */
const KEY = "is_dev_admin";
const ROLE_KEY = "user_role";
const EVENT = "dev-admin-changed";

export function isDevAdmin(): boolean {
  if (!import.meta.env.DEV || typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "true";
}

export function enableDevAdmin() {
  if (!import.meta.env.DEV || typeof window === "undefined") return;
  window.localStorage.setItem(KEY, "true");
  window.localStorage.setItem(ROLE_KEY, "super_admin");
  window.dispatchEvent(new Event(EVENT));
}

export function disableDevAdmin() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.localStorage.removeItem(ROLE_KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useDevAdmin(): boolean {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(isDevAdmin());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return on;
}
