export type AppTheme = {
  dark: boolean;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    primary: string;
    primarySoft: string;
    accent: string;
    accentSoft: string;
    text: string;
    muted: string;
    border: string;
    danger: string;
    white: string;
  };
};

const brand = {
  emerald: "#073F35",
  emeraldSoft: "#DDEBE4",
  gold: "#D6A51E",
  goldSoft: "#F3E7BF",
  ivory: "#F9F7F0",
  cream: "#FFFDF7",
  ink: "#123A34",
  muted: "#6A7771",
  line: "#D9C68D",
  danger: "#B13B35",
  white: "#FFFFFF"
};

export function makeTheme(dark: boolean): AppTheme {
  if (!dark) {
    return {
      dark,
      colors: {
        background: brand.ivory,
        surface: brand.cream,
        surfaceAlt: "#F1EBD9",
        primary: brand.emerald,
        primarySoft: brand.emeraldSoft,
        accent: brand.gold,
        accentSoft: brand.goldSoft,
        text: brand.ink,
        muted: brand.muted,
        border: brand.line,
        danger: brand.danger,
        white: brand.white
      }
    };
  }

  return {
    dark,
    colors: {
      background: "#071614",
      surface: "#10231F",
      surfaceAlt: "#182F29",
      primary: "#C9E5DA",
      primarySoft: "#163C34",
      accent: brand.gold,
      accentSoft: "#3A3216",
      text: "#F7F2E5",
      muted: "#B5C1BC",
      border: "#315149",
      danger: "#F08A80",
      white: brand.white
    }
  };
}
