import { postRequest } from "../api/NetworkManager";
import { apiPath } from "../../config/api-path";

type AssistantReply = { reply: string };

export type AssistantPage = "rooms" | "guests" | "services" | "dispatch" | "property" | "other";
/** Where the staff member is, so Yoonie answers about that page (and the room they have open). */
export type AssistantContext = { page: AssistantPage; roomNumber?: string; date?: string };
type AssistantBody = { sessionId: string; message: string; context?: AssistantContext };

/** Guest concierge on the booking site: no login. */
export const askGuestYoonie = (body: AssistantBody) =>
  postRequest<AssistantReply, AssistantBody>(apiPath("assistant/guest"), body, { isPublic: true });

/** Staff assistant in the ops dashboard: acts as the signed-in user, with their permissions. */
export const askStaffYoonie = (body: AssistantBody) =>
  postRequest<AssistantReply, AssistantBody>(apiPath("assistant/staff"), body);
