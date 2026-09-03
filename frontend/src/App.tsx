import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Router as WouterRouter } from "wouter";
import { ReduxProvider } from "@/app/providers/ReduxProvider";
import { AppRouter } from "@/app/router";
// import { AppRouter } from "@/app/router/AppRouter";

const queryClient = new QueryClient();

function App() {
  return (
    <ReduxProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRouter />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

export default App;
