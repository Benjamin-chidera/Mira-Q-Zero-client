import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FeatureSwitch from "./Page-feature-Switch";

// Mock useNavigate to verify redirect behavior
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("FeatureSwitch Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders both option buttons", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <FeatureSwitch />
      </MemoryRouter>
    );

    expect(screen.getByText("HealthConnect")).toBeInTheDocument();
    expect(screen.getByText("MedTech AI")).toBeInTheDocument();
  });

  it("navigates to HealthConnect home path on clicking HealthConnect button", () => {
    render(
      <MemoryRouter initialEntries={["/practioner/medTech/dashboard"]}>
        <FeatureSwitch />
      </MemoryRouter>
    );

    const healthConnectButton = screen.getByText("HealthConnect");
    fireEvent.click(healthConnectButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("navigates to MedTech dashboard on clicking MedTech AI button", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <FeatureSwitch />
      </MemoryRouter>
    );

    const medTechButton = screen.getByText("MedTech AI");
    fireEvent.click(medTechButton);

    expect(mockNavigate).toHaveBeenCalledWith("/practioner/medTech/dashboard");
  });
});
