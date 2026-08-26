"use client";

import { useMutation } from "@tanstack/react-query";
import { confirmInvitation, resolveFallbackCode, resolveInvitation, staffLogin } from "./api";
import { useInvalidateSession } from "./useSession";

export function useResolveInvitation() {
  return useMutation({ mutationFn: resolveInvitation });
}

export function useResolveFallbackCode() {
  return useMutation({ mutationFn: resolveFallbackCode });
}

export function useConfirmInvitation() {
  const invalidateSession = useInvalidateSession();
  return useMutation({
    mutationFn: confirmInvitation,
    onSuccess: () => invalidateSession(),
  });
}

export function useStaffLogin() {
  const invalidateSession = useInvalidateSession();
  return useMutation({
    mutationFn: staffLogin,
    onSuccess: () => invalidateSession(),
  });
}
