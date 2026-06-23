import { render, screen, waitFor } from "@testing-library/react";
import { CaseHistory } from "./CaseHistory";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the useAuthStore
vi.mock("@/store/auth.store", () => ({
  default: (selector: any) => selector({ user: { id: 1, name: "Test Doctor", email: "doc@test.com", role: "practitioner" } }),
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("CaseHistory Component", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("renders case list and does not render trash icon for deleted status", async () => {
    const mockCases = [
      {
        id: "conv_1",
        title: "Test Case 1",
        preview: "Preview 1",
        status: "success",
        date: "Jun 23",
        timestamp: "12:00",
      },
      {
        id: "conv_2",
        title: "Test Case 2",
        preview: "Preview 2",
        status: "deleted",
        date: "Jun 23",
        timestamp: "12:05",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockCases,
    });

    const setCaseMode = vi.fn();
    const setCaseFilter = vi.fn();

    render(
      <CaseHistory
        caseMode="patient"
        setCaseMode={setCaseMode}
        caseFilter="all"
        setCaseFilter={setCaseFilter}
      />
    );

    // Wait for fetch to complete and items to render
    await waitFor(() => {
      expect(screen.getByText("Test Case 1")).toBeInTheDocument();
      expect(screen.getByText("Test Case 2")).toBeInTheDocument();
    });

    // Check status badges inside the card
    const badgeSpans = Array.from(document.querySelectorAll("span")).map(s => s.textContent);
    expect(badgeSpans).toContain("Success");
    expect(badgeSpans).toContain("Deleted");

    // Verify status icons:
    // Success has CheckCircle2 icon (SVG exists).
    // Deleted has no icon.
    // The SVGs list should have length 1.
    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBe(1);
  });
});
