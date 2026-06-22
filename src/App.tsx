import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import FindAndConnect from "./pages/user/find_and_connect/page";
import { PractitionerConsultationPage } from "./pages/practioner/Consultation/page";
import MedTechDashboard from "./pages/practioner/different-feature/mira/page/dashboard/page";
import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import FeatureSwitch from "./components/FeatureSwitch/Page-feature-Switch";

function App() {
  return (
    <main>
      <BrowserRouter>
        <FeatureSwitch />
        <Routes>
          {/* Public */}
          <Route path="/" element={<FindAndConnect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Practitioner Routes */}
          <Route
            path="/practitioner/consultation"
            element={<PractitionerConsultationPage />}
          />

          {/* MedTech Routes — protected */}
          <Route
            path="/practioner/medTech/dashboard"
            element={
              <ProtectedRoute>
                <MedTechDashboard />
              </ProtectedRoute>
            }
          />
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