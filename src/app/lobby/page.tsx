"use client";

import { RoleGuard } from "../../features/auth/RoleGuard";
import { ParticipantLobbyContent } from "./LobbyContent";

export default function LobbyPage() {
  return (
    <RoleGuard allow={["PARTICIPANT"]}>
      <ParticipantLobbyContent />
    </RoleGuard>
  );
}
