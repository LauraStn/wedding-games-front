export type ApiErrorKind =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "conflict"
  | "offline"
  | "server"
  | "unknown";

export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly code?: string;

  constructor(kind: ApiErrorKind, message: string, status?: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
  }
}

function kindFromStatus(status: number | undefined): ApiErrorKind {
  if (status === undefined) return "unknown";
  if (status === 400 || status === 422) return "validation";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status === 409 || status === 410) return "conflict";
  if (status >= 500) return "server";
  return "unknown";
}

const DEFAULT_MESSAGES: Record<ApiErrorKind, string> = {
  validation: "Certaines informations sont invalides.",
  unauthorized: "Vous devez confirmer votre identité pour continuer.",
  forbidden: "Vous n'avez pas accès à cette action.",
  "not-found": "Cette ressource est introuvable.",
  conflict: "Cette action n'est plus possible dans l'état actuel.",
  offline: "Connexion au serveur perdue. Vérifiez votre réseau.",
  server: "Une erreur est survenue côté serveur. Réessayez dans un instant.",
  unknown: "Une erreur inattendue est survenue.",
};

export function toApiError(problem: ProblemDetail | undefined, fallbackStatus?: number): ApiError {
  const status = problem?.status ?? fallbackStatus;
  const kind = kindFromStatus(status);
  const message = problem?.detail || DEFAULT_MESSAGES[kind];
  return new ApiError(kind, message, status, problem?.code);
}

export function networkError(): ApiError {
  return new ApiError("offline", DEFAULT_MESSAGES.offline);
}

/**
 * Déballe une réponse openapi-fetch : renvoie `data` ou lève une ApiError typée.
 * Les réponses sans contenu (204) renvoient `undefined` typé `T` (ex. `Promise<void>`).
 */
export async function unwrap<T>(
  promise: Promise<{ data?: T; error?: ProblemDetail; response: Response }>,
): Promise<T> {
  let result: { data?: T; error?: ProblemDetail; response: Response };
  try {
    result = await promise;
  } catch {
    throw networkError();
  }
  if (!result.response.ok) {
    throw toApiError(result.error, result.response.status);
  }
  return result.data as T;
}
