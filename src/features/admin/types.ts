import type { components } from "../../api/schema";

export type Participant = components["schemas"]["ParticipantResponse"];
export type ParticipantCreateInput = components["schemas"]["ParticipantCreateRequest"];
export type ParticipantUpdateInput = components["schemas"]["ParticipantUpdateRequest"];
export type InvitationStatus = components["schemas"]["InvitationStatusResponse"];
export type InvitationAdmin = components["schemas"]["InvitationAdminResponse"];
export type Exclusion = components["schemas"]["PairingExclusionResponse"];
export type ExclusionInput = components["schemas"]["PairingExclusionCreateRequest"];
export type Role = components["schemas"]["StaffAccountResponse"]["role"];
export type LobbyState = components["schemas"]["LobbyResponse"];
export type EventConfig = components["schemas"]["EventPublicConfigResponse"];
export type EventConfigInput = components["schemas"]["EventConfigUpdateRequest"];
export type StaffAccount = components["schemas"]["StaffAccountResponse"];
