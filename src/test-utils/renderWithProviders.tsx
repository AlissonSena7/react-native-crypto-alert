import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react-native";
import { AlertProvider } from "@context/AlertProvider/AlertProvider";

/**
 * Renderiza um componente dentro do `AlertProvider` real (com o
 * `AsyncStorage` mockado no setup global do Jest).
 */
export async function renderWithAlertProvider(
  ui: ReactElement,
  options?: RenderOptions,
) {
  return render(<AlertProvider>{ui}</AlertProvider>, options);
}
