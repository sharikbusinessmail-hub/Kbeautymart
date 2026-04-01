import { RouterProvider } from "react-router";
import { router } from "./routes";
import { StoreProvider } from "./components/store";
import { AuthProvider } from "./components/auth";
import { Toaster } from "sonner";
import WhatsAppButton from "./components/WhatsAppButton";

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <Toaster position="bottom-center" richColors />
        <RouterProvider router={router} />
        <WhatsAppButton />
      </StoreProvider>
    </AuthProvider>
  );
}