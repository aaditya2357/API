import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Clients from "@/pages/clients";
import Apis from "@/pages/apis";
import OAuthConfig from "@/pages/oauth-config";
import TokenManagement from "@/pages/token-management";
import Authorize from "@/pages/authorize";
import { ThemeProvider } from "next-themes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/clients" component={Clients} />
      <Route path="/apis" component={Apis} />
      <Route path="/oauth-config" component={OAuthConfig} />
      <Route path="/tokens" component={TokenManagement} />
      <Route path="/authorize" component={Authorize} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
