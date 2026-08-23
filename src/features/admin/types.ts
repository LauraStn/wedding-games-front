import type { components } from "../../api/schema";

export type Participant = components["schemas"]["Participant"];
export type ParticipantInput = components["schemas"]["ParticipantInput"];
export type Invitation = components["schemas"]["Invitation"];
export type Exclusion = components["schemas"]["Exclusion"];
export type ExclusionInput = components["schemas"]["ExclusionInput"];
export type Role = components["schemas"]["Role"];
export type LobbyState = components["schemas"]["LobbyState"];
export type EventConfig = components["schemas"]["EventAdminConfig"];
export type EventConfigInput = components["schemas"]["EventAdminConfigInput"];

export interface RoleAssignment {
  participantId: string;
  firstName: string;
  lastName: string;
  role: Role;
}
