import { Switch, Route, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import Survey from "@/pages/Survey";
import Results from "@/pages/Results";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/survey" component={Survey} />
      <Route path="/results" component={Results} />
      <Route>
        <div className="min-h-screen flex items-center justify-center text-neutral-500">
          Page not found.
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
