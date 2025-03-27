import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { mockSession } from "./helpers";

// Mock the providers to avoid undefined components
const SessionProvider = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);
const CartProvider = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={mockSession}>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render method
export { customRender as render };

// Re-export helpers
export * from "./helpers";
