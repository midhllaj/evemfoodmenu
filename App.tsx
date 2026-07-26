import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppShell } from "./src/AppShell";
import { seedStore } from "./src/storage/store";
import { AppTheme, makeTheme } from "./src/theme/theme";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [ready, setReady] = useState(false);
  const theme = useMemo<AppTheme>(() => makeTheme(darkMode), [darkMode]);

  useEffect(() => {
    seedStore().finally(() => setReady(true));
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <AppShell
        ready={ready}
        theme={theme}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((value) => !value)}
      />
    </SafeAreaProvider>
  );
}
