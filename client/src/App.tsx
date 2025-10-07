import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "./state";
import Home from "./pages/Home";
import Vault from "./pages/Vault";
import NotFound from "@/pages/not-found";
import SwapWidget from "./components/SwapWidget";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/vault/:id" component={Vault} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <div className="dark">
            <Router />
            <SwapWidget />
          </div>
        </AppProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
