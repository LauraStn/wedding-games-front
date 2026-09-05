import { fetchCurrentEventConfig, type PublicEventConfig } from "../../api/currentEvent";

export interface EventThemeColors {
  primary?: string;
  secondary?: string;
}

export interface EventTheme {
  eventTitle: string;
  spouseNames: string[];
  eventDate: string | null;
  colors: EventThemeColors;
  logoUrl?: string;
}

/** Reflète la convention de src/features/admin/EventConfigForm.tsx : visualConfig.{primaryColor,secondaryColor,logoUrl}. */
function readVisualConfig(visualConfig: PublicEventConfig["visualConfig"]): EventThemeColors & { logoUrl?: string } {
  const visual = (visualConfig ?? {}) as Record<string, unknown>;
  const asString = (value: unknown) => (typeof value === "string" ? value : undefined);
  return {
    primary: asString(visual.primaryColor),
    secondary: asString(visual.secondaryColor),
    logoUrl: asString(visual.logoUrl),
  };
}

export async function fetchTheme(): Promise<EventTheme> {
  const config = await fetchCurrentEventConfig();
  const { primary, secondary, logoUrl } = readVisualConfig(config.visualConfig);
  return {
    eventTitle: config.title ?? "Weddup",
    spouseNames: [config.spouseOneName, config.spouseTwoName].filter((name): name is string => Boolean(name)),
    eventDate: config.eventDate ?? null,
    colors: { primary, secondary },
    logoUrl,
  };
}
