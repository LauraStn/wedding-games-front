import type { components } from "../../api/schema";

export type Session = components["schemas"]["SessionMeResponse"];
export type Role = NonNullable<Session["role"]>;
export type ParticipantSession = components["schemas"]["ParticipantSessionResponse"];
export type InvitationResolvePreview = components["schemas"]["InvitationResolveResponse"];
export type StaffLoginInput = components["schemas"]["StaffLoginRequest"];
export type StaffAccount = components["schemas"]["StaffAccountResponse"];
