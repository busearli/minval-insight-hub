import { PortalDialog } from "@/components/PortalDialog";

/**
 * Ön kayıt ile üyelik kaydı aynı akışa bağlandı: her ikisi de portalın
 * "Kayıt Ol" formunu açar.
 */
export function RegistrationModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultProgramId?: string;
}) {
  return <PortalDialog open={open} onOpenChange={onOpenChange} defaultTab="register" />;
}
