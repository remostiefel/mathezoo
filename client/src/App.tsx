import { Switch, Route, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


// Core pages - eagerly loaded
import Landing from "./pages/landing";
import Login from "./pages/login";
import NotFound from "./pages/not-found";

// Lazy loaded pages for better performance
const StudentWorkspace = lazy(() => import("./pages/student-workspace"));
const StudentWorkspaceProgressive = lazy(() => import("./pages/student-workspace-progressive"));
const TeacherDashboard = lazy(() => import("./pages/teacher-dashboard"));
const SystemInfo = lazy(() => import("./pages/system-info"));
const InfoPage = lazy(() => import("./pages/info-page"));
const MathLabTest = lazy(() => import("./pages/math-lab-test"));
const NeuralWorkspace = lazy(() => import("./pages/neural-workspace"));
const PracticeOptimized = lazy(() => import("./pages/practice-optimized"));
const TestPatterns = lazy(() => import("./pages/test-patterns"));
const PracticeRepresentation = lazy(() => import("./pages/practice-representation"));
const SimulationViewer = lazy(() => import("./pages/simulation-viewer"));
const SiteOverview = lazy(() => import("./pages/site-overview"));
const ZooOverviewPage = lazy(() => import("./pages/zoo-overview-page"));
const ZooShop = lazy(() => import("./pages/zoo-shop"));
const ZooStatistics = lazy(() => import("./pages/zoo-statistics"));
const ZooPathfinder = lazy(() => import("./pages/zoo-pathfinder"));
const ZooMathAdventure = lazy(() => import("./pages/zoo-math-adventure"));
const GamesSelection = lazy(() => import("./pages/games-selection"));
const TrainingSelection = lazy(() => import("./pages/training-selection"));
const TenWinsGame = lazy(() => import("./pages/ten-wins-game"));
const ZahlenwaageGame = lazy(() => import("./pages/zahlenwaage-game"));
const OneTimesOneGame = lazy(() => import("./pages/one-times-one-game"));
const DoublingExpedition = lazy(() => import("./pages/doubling-expedition"));
const DecompositionSafari = lazy(() => import("./pages/decomposition-safari"));
const AnimalEncyclopedia = lazy(() => import("./pages/animal-encyclopedia"));
const ZooMissions = lazy(() => import("./pages/zoo-missions"));
const ZooPartnerZoos = lazy(() => import("./pages/zoo-partner-zoos"));
const ZooBigGoals = lazy(() => import("./pages/zoo-big-goals"));
const QuickstartPage = lazy(() => import("./pages/quickstart"));
const GameGuidePage = lazy(() => import("./pages/game-guide"));
const NumberStairs = lazy(() => import("./pages/number-stairs"));
const NumberBuilder = lazy(() => import("./pages/number-builder"));
const ImageShowcase = lazy(() => import("./pages/image-showcase"));
const ZooEconomyGuide = lazy(() => import("./pages/zoo-economy-guide"));
const NeighborGame = lazy(() => import("./pages/neighbor-game"));
const QuantityMaster = lazy(() => import("./pages/quantity-master"));
const StructuredPerceptionGame = lazy(() => import("./pages/structured-perception-game"));
const PartWholeHouseGame = lazy(() => import("./pages/part-whole-house-game"));
const HomeworkGenerator = lazy(() => import("./pages/homework-generator"));
const AnimalCards = lazy(() => import("./pages/animal-cards"));
const Campaigns = lazy(() => import("./pages/campaigns"));
const CampaignDetail = lazy(() => import("./pages/campaign-detail"));
const TeamBuilder = lazy(() => import("./pages/team-builder"));
const TeamManager = lazy(() => import("./pages/team-manager"));
const AnimalDetail = lazy(() => import("./pages/animal-detail"));
const ZooBuilder = lazy(() => import("./pages/zoo-builder"));
const ZooGallery = lazy(() => import("./pages/zoo-gallery"));


function ProtectedRoute({
  component: Component,
  requireRole
}: {
  component: React.ComponentType,
  requireRole?: 'teacher' | 'student' | 'admin'
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireRole && user?.role !== requireRole) {
    // Added check for admin role to bypass role restriction if admin
    if (user?.role === 'admin') {
      return <Component />;
    }
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <div className="bg-card border rounded-lg p-6 space-y-4 text-center">
            <h2 className="text-2xl font-bold">Zugriff verweigert</h2>
            <p className="text-muted-foreground">
              Du hast keine Berechtigung für diese Seite.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border shadow-xs min-h-9 px-4 py-2 w-full"
            >
              Zur Login-Seite
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Component />;
}

export default function App() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Auto-redirect authenticated users from login page to their workspace
  useEffect(() => {
    console.log('App useEffect - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user, 'location:', location);

    if (!isLoading && isAuthenticated && user) {
      if (location === '/' || location === '/login') {
        console.log('Redirecting authenticated user, role:', user.role);
        if (user.role === 'student') {
          setLocation('/student');
        } else if (user.role === 'teacher' || user.role === 'admin') {
          setLocation('/teacher');
        }
      }
    } else if (!isLoading && !isAuthenticated && location !== '/login' && location !== '/' && location !== '/info' && location !== '/system-info' && location !== '/quickstart' && location !== '/game-guide') {
      console.log('Redirecting to login');
      setLocation('/login');
    }
  }, [isAuthenticated, user, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/student">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={StudentWorkspaceProgressive} requireRole="student" />
          </Suspense>
        )}
      </Route>
      <Route path="/student-old">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={StudentWorkspace} requireRole="student" />
          </Suspense>
        )}
      </Route>
      <Route path="/practice">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={PracticeOptimized} requireRole="student" />
          </Suspense>
        )}
      </Route>
      <Route path="/practice-optimized">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={PracticeOptimized} requireRole="student" />
          </Suspense>
        )}
      </Route>
      <Route path="/practice-rep">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={PracticeRepresentation} requireRole="student" />
          </Suspense>
        )}
      </Route>
      <Route path="/neural">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={NeuralWorkspace} />
          </Suspense>
        )}
      </Route>
      <Route path="/teacher">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={TeacherDashboard} />
          </Suspense>
        )}
      </Route>
      <Route path="/teacher/student/:studentId">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={TeacherDashboard} />
          </Suspense>
        )}
      </Route>
      <Route path="/teacher/homework">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={HomeworkGenerator} requireRole="teacher" />
          </Suspense>
        )}
      </Route>
      <Route path="/simulation-viewer">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={SimulationViewer} />
          </Suspense>
        )}
      </Route>
      <Route path="/test">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={TestPatterns} />
          </Suspense>
        )}
      </Route>
      <Route path="/zoo-adventure" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ZooMathAdventure />
        </Suspense>
      )} />
      <Route path="/ten-wins-game" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <TenWinsGame />
        </Suspense>
      )} /> {/* Route for the new game */}
      <Route path="/decomposition-safari" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={DecompositionSafari} />
        </Suspense>
      )} />
      <Route path="/doubling-expedition" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={DoublingExpedition} />
        </Suspense>
      )} />
      <Route path="/zoo-pathfinder" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={ZooPathfinder} />
        </Suspense>
      )} />
      <Route path="/zoo-overview" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ZooOverviewPage />
        </Suspense>
      )} />
      <Route path="/zoo-shop" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={ZooShop} requireRole="student" />
        </Suspense>
      )} />
      <Route path="/zoo-statistics" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={ZooStatistics} requireRole="student" />
        </Suspense>
      )} />
      <Route path="/zoo-builder" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={ZooBuilder} requireRole="student" />
        </Suspense>
      )} />
      <Route path="/zoo-gallery" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={ZooGallery} requireRole="student" />
        </Suspense>
      )} />
      <Route path="/zoo-missions" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={ZooMissions} requireRole="student" />
        </Suspense>
      )} />
      <Route path="/zoo-partner-zoos" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={ZooPartnerZoos} requireRole="student" />
        </Suspense>
      )} />
      <Route path="/zoo-big-goals" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={ZooBigGoals} requireRole="student" />
        </Suspense>
      )} />
      <Route path="/zoo-economy-guide" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ZooEconomyGuide />
        </Suspense>
      )} />
      <Route path="/games" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={GamesSelection} requireRole="student" />
        </Suspense>
      )} />
      <Route path="/training" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={TrainingSelection} requireRole="student" />
        </Suspense>
      )} />
      <Route path="/system-info" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <SystemInfo />
        </Suspense>
      )} />
      <Route path="/quickstart" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <QuickstartPage />
        </Suspense>
      )} />
      <Route path="/game-guide" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <GameGuidePage />
        </Suspense>
      )} />
      <Route path="/image-showcase" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ImageShowcase />
        </Suspense>
      )} />
      <Route path="/info" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <InfoPage />
        </Suspense>
      )} />
      <Route path="/math-test">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={MathLabTest} />
          </Suspense>
        )}
      </Route>
      <Route path="/game">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={ZahlenwaageGame} />
          </Suspense>
        )}
      </Route>
      <Route path="/one-times-one">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <OneTimesOneGame />
          </Suspense>
        )}
      </Route>
      <Route path="/number-stairs">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={NumberStairs} requireRole="student" />
          </Suspense>
        )}
      </Route>
      <Route path="/number-builder">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={NumberBuilder} requireRole="student" />
          </Suspense>
        )}
      </Route>
      <Route path="/neighbor-game">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={NeighborGame} requireRole="student" />
          </Suspense>
        )}
      </Route>
      <Route path="/quantity-master">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={QuantityMaster} requireRole="student" />
          </Suspense>
        )}
      </Route>
      <Route path="/structured-perception" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={StructuredPerceptionGame} />
        </Suspense>
      )} />
      <Route path="/part-whole-house" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={PartWholeHouseGame} />
        </Suspense>
      )} />
      <Route path="/animal-encyclopedia" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <AnimalEncyclopedia />
        </Suspense>
      )} />
      <Route path="/animal-cards" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={AnimalCards} />
        </Suspense>
      )} />
      <Route path="/campaigns" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={Campaigns} />
        </Suspense>
      )} />
      <Route path="/campaigns/:id" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={CampaignDetail} requireRole="student" />
        </Suspense>
      )} />
      <Route path="/team-builder" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={TeamBuilder} />
        </Suspense>
      )} />
      <Route path="/team-manager" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={TeamManager} />
        </Suspense>
      )} />
      <Route path="/animal/:animalId" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <ProtectedRoute component={AnimalDetail} />
        </Suspense>
      )} />
      <Route path="/quickstart" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <QuickstartPage />
        </Suspense>
      )} />
      <Route path="/game-guide" component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <GameGuidePage />
        </Suspense>
      )} />
      <Route path="/zoo-missions">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={ZooMissions} requireRole="student" />
          </Suspense>
        )}
      </Route>
      <Route path="/zoo-partner-zoos">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={ZooPartnerZoos} requireRole="student" />
          </Suspense>
        )}
      </Route>
      <Route path="/zoo-big-goals">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ProtectedRoute component={ZooBigGoals} requireRole="student" />
          </Suspense>
        )}
      </Route>
      <Route component={() => (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
          <NotFound />
        </Suspense>
      )} />
    </Switch>
  );
}