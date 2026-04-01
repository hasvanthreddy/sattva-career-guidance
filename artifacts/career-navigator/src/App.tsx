import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import { ThemeProvider } from "@/contexts/theme";
import { LanguageProvider } from "@/contexts/language";

import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import Careers from "@/pages/careers";
import CareerDetail from "@/pages/career-detail";
import Roadmap from "@/pages/roadmap";
import Resume from "@/pages/resume";
import Courses from "@/pages/courses";
import Centers from "@/pages/centers";
import Chat from "@/pages/chat";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/careers" component={Careers} />
      <Route path="/career/:name" component={CareerDetail} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/resume" component={Resume} />
      <Route path="/courses" component={Courses} />
      <Route path="/centers" component={Centers} />
      <Route path="/chat" component={Chat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Layout>
                <Router />
              </Layout>
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
