import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import FindAndConnect from "./pages/user/find_and_connect/page";
import { PractitionerConsultationPage } from "./pages/practioner/Consultation/page";
import MedTechDashboardLayout, {
  PatientListRoute,
  AIResearcherRoute,
  ResearchCenterRoute,
  CaseHistoryRoute
} from "./pages/practioner/different-feature/mira/page/dashboard/page";
import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
// import FeatureSwitch from "./components/FeatureSwitch/Page-feature-Switch";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <main>
      <BrowserRouter>
        {/* <FeatureSwitch /> */}
        <Routes>
          {/* Public */}
          <Route path="/" element={<FindAndConnect />} />
          <Route path="/mira/login" element={<LoginPage />} />

          {/* Practitioner Routes */}
          <Route
            path="/practitioner/consultation"
            element={<PractitionerConsultationPage />}
          />

          {/* MedTech Routes — protected */}
          <Route
            path="/mira/dashboard"
            element={
              <ProtectedRoute>
                <MedTechDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PatientListRoute />} />
            <Route path="agent" element={<AIResearcherRoute />} />
            <Route path="research" element={<ResearchCenterRoute />} />
            <Route path="cases" element={<CaseHistoryRoute />} />
          </Route>
          
          {/* Fallback 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
}

export default App;

// To test from the UI, use the Sandbox test patient:

// Name: Jane Smith
// DOB: 22/10/2010
// Postcode: LS1 6AE
// This will return NHS Number 9000000009. Any other name/DOB combo will return null (expected — the Sandbox only has one canned patient for search).


// first app name - Q-Zero
// second app name - Mira 