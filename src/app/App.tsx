import { RouterProvider } from "react-router";
import { router } from "./routes";
import { StoreProvider } from "./components/store";
import { Toaster } from "sonner";

export default function App() {
  return (
    <StoreProvider>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </StoreProvider>
  );
}
