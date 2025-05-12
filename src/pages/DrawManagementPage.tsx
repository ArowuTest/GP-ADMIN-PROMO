// src/pages/DrawManagementPage.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
// Assuming PrizeStructureData and PrizeTierData are defined and exported from a shared types file or PrizeStructureListComponent
// For now, let's redefine or import them if they are in PrizeStructureListComponent
// To avoid circular dependencies or too much prop drilling for mock data, we will use a local mock for prize structures here.

export interface PrizeTierData {
  id?: number | string;
  name: string;
  value: string; // Or number, depending on prize type
  quantity: number;
  prizeType: string;
  order: number;
}

export interface PrizeStructureData {
  id: number | string;
  name: string;
  description: string;
  isActive: boolean;
  prizes: PrizeTierData[];
  createdAt: string;
  validFrom: string;
  validTo?: string | null;
}

// Mock data for Draw Results
interface Winner {
  id: string;
  msisdn: string;
  prizeTierName: string;
  prizeValue: string;
}

interface RunnerUp {
  id: string;
  msisdn: string;
  originalWinnerMsisdn: string; // To link to the winner they might replace
  prizeTierName: string;
}

interface MockDrawResult {
  id: string;
  status: string;
  totalEligibleMSISDNs: number;
  totalEntries: number;
  winners: Winner[];
  runnerUps: RunnerUp[];
}

// Re-using styles from the original file for consistency
const styles = {
  container: { padding: "20px", fontFamily: "Arial, sans-serif" },
  formSection: { marginBottom: "30px", padding: "20px", border: "1px solid #eee", borderRadius: "8px", backgroundColor: "#f9f9f9" },
  infoSection: { marginBottom: "20px", padding: "15px", border: "1px solid #e0e0e0", borderRadius: "8px", backgroundColor: "#f0f8ff" },
  label: { display: "block", marginBottom: "5px", fontWeight: "bold" },
  input: { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" as "border-box" },
  select: { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" as "border-box" }, 
  button: { padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px" },
  error: { color: "red", marginBottom: "15px" },
  resultsSection: { marginTop: "30px", padding: "20px", border: "1px solid #eee", borderRadius: "8px", backgroundColor: "#f9f9f9" },
  list: { listStyleType: "none", paddingLeft: 0 },
  listItem: { marginBottom: "8px", padding: "10px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "4px" },
  animationPlaceholder: {
    width: "100%",
    height: "150px",
    backgroundColor: "#222",
    color: "yellow",
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center" as "center",
    fontSize: "20px",
  },
};

// Mock prize structures similar to PrizeStructureListComponent for now
const mockPrizeStructures: PrizeStructureData[] = [
  {
    id: 1,
    name: "Daily Draw Week 1 (Active)",
    description: "Standard daily draw for the first week.",
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    validFrom: new Date(Date.now() - 86400000 * 7).toISOString(),
    validTo: new Date(Date.now() + 86400000 * 7).toISOString(), // Valid for next 7 days
    prizes: [
      { id: 1, name: "Jackpot", value: "N1,000,000", quantity: 1, prizeType: "Cash", order: 0 },
      { id: 2, name: "Consolation", value: "N10,000 Airtime", quantity: 5, prizeType: "Airtime", order: 1 },
    ],
  },
  {
    id: 2,
    name: "Weekend Special (Active)",
    description: "Special draw for weekend participants.",
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    validFrom: new Date(Date.now() - 86400000 * 2).toISOString(),
    validTo: new Date(Date.now() + 86400000 * 5).toISOString(), // Valid for next 5 days
    prizes: [
      { id: 3, name: "Grand Weekend Prize", value: "N5,000,000", quantity: 1, prizeType: "Cash", order: 0 },
    ],
  },
  {
    id: 3,
    name: "Old Expired Draw",
    description: "This draw is old and expired.",
    isActive: false, // Or true but validTo is in the past
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    validFrom: new Date(Date.now() - 86400000 * 30).toISOString(),
    validTo: new Date(Date.now() - 86400000 * 20).toISOString(), // Expired
    prizes: [
      { id: 4, name: "Expired Prize", value: "N100", quantity: 1, prizeType: "Cash", order: 0 },
    ],
  },
];

const DrawManagementPage: React.FC = () => {
  const { userRole } = useAuth(); // Use userRole for permission checks
  const [drawDate, setDrawDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [availablePrizeStructures, setAvailablePrizeStructures] = useState<PrizeStructureData[]>([]);
  const [selectedPrizeStructureId, setSelectedPrizeStructureId] = useState<string | number>("");
  
  // Mock data for display
  const [eligibleParticipantsCount, setEligibleParticipantsCount] = useState<number>(0);
  const [totalPointsInDraw, setTotalPointsInDraw] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false); // For any async operations like fetching structures (even mock)
  const [error, setError] = useState<string | null>(null);
  const [drawResult, setDrawResult] = useState<MockDrawResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false); // For animation

  // Check if user has permission to execute draws (SUPER_ADMIN only as per requirements)
  const canExecuteDraw = userRole === "SUPER_ADMIN";

  useEffect(() => {
    // Simulate fetching and filtering prize structures
    setLoading(true);
    setTimeout(() => {
      const activeValidStructures = mockPrizeStructures.filter(s => 
        s.isActive && 
        new Date(s.validFrom) <= new Date() && 
        (!s.validTo || new Date(s.validTo) >= new Date())
      );
      setAvailablePrizeStructures(activeValidStructures);
      if (activeValidStructures.length > 0 && activeValidStructures[0].id) {
        setSelectedPrizeStructureId(activeValidStructures[0].id);
      }
      setLoading(false);
    }, 500); // Simulate API delay
  }, []);

  // Update mock participant/points data when prize structure changes
  useEffect(() => {
    if (selectedPrizeStructureId) {
      // Simulate fetching these details based on selected structure
      setEligibleParticipantsCount(Math.floor(Math.random() * 10000) + 500); // Random mock data
      setTotalPointsInDraw(Math.floor(Math.random() * 100000) + 5000);    // Random mock data
    } else {
      setEligibleParticipantsCount(0);
      setTotalPointsInDraw(0);
    }
  }, [selectedPrizeStructureId]);

  const handleExecuteDraw = async () => {
    if (!selectedPrizeStructureId || !drawDate) {
      setError("Please select a draw date and a prize structure.");
      return;
    }
    if (!canExecuteDraw) {
        setError("You do not have permission to execute draws.");
        return;
    }

    setLoading(true);
    setIsExecuting(true);
    setError(null);
    setDrawResult(null);

    // Simulate animation delay
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds animation

    // Mock draw execution logic
    const selectedStructure = availablePrizeStructures.find(s => s.id === selectedPrizeStructureId);
    const mockWinners: Winner[] = [];
    const mockRunnerUps: RunnerUp[] = [];

    if (selectedStructure) {
        selectedStructure.prizes.forEach(prizeTier => {
            for (let i = 0; i < prizeTier.quantity; i++) {
                const winnerMsisdn = `080${Math.floor(Math.random() * 100000000).toString().padStart(8, "0")}`;
                mockWinners.push({
                    id: `winner-${prizeTier.id}-${i}`,
                    msisdn: winnerMsisdn,
                    prizeTierName: prizeTier.name,
                    prizeValue: prizeTier.value.toString(),
                });
                // Generate 1 runner-up for each winner slot
                mockRunnerUps.push({
                    id: `runnerup-${prizeTier.id}-${i}`,
                    msisdn: `081${Math.floor(Math.random() * 100000000).toString().padStart(8, "0")}`,
                    originalWinnerMsisdn: winnerMsisdn,
                    prizeTierName: prizeTier.name,
                });
            }
        });
    }

    setDrawResult({
      id: `DRAW-${Date.now()}`,
      status: "Completed",
      totalEligibleMSISDNs: eligibleParticipantsCount,
      totalEntries: totalPointsInDraw,
      winners: mockWinners,
      runnerUps: mockRunnerUps,
    });

    setIsExecuting(false);
    setLoading(false);
  };
  
  const maskMSISDN = (msisdn: string) => {
    if (msisdn && msisdn.length > 5) {
        return `${msisdn.substring(0, 3)}*****${msisdn.substring(msisdn.length - 3)}`;
    }
    return msisdn;
  };

  return (
    <div style={styles.container}>
      <h1>Draw Management</h1>

      <div style={styles.formSection}>
        <h2>Configure New Draw</h2>
        {error && <p style={styles.error}>{error}</p>}
        <div>
          <label htmlFor="drawDate" style={styles.label}>Draw Date:</label>
          <input 
            type="date" 
            id="drawDate" 
            value={drawDate} 
            onChange={(e) => setDrawDate(e.target.value)} 
            style={styles.input}
            disabled={loading || isExecuting || !canExecuteDraw}
          />
        </div>
        <div>
          <label htmlFor="prizeStructure" style={styles.label}>Prize Structure:</label>
          <select 
            id="prizeStructure" 
            value={selectedPrizeStructureId} 
            onChange={(e) => setSelectedPrizeStructureId(e.target.value)} 
            style={styles.select}
            disabled={loading || isExecuting || availablePrizeStructures.length === 0 || !canExecuteDraw}
          >
            <option value="">{availablePrizeStructures.length === 0 ? "No active prize structures found" : "Select a Prize Structure"}</option>
            {availablePrizeStructures.map(ps => (
              <option key={ps.id} value={ps.id}>{ps.name}</option>
            ))}
          </select>
        </div>

        {selectedPrizeStructureId && (
          <div style={styles.infoSection}>
            <h4>Draw Information (Mock Data)</h4>
            <p><strong>Eligible Participants:</strong> {eligibleParticipantsCount.toLocaleString()}</p>
            <p><strong>Total Points in Draw:</strong> {totalPointsInDraw.toLocaleString()}</p>
          </div>
        )}

        {canExecuteDraw ? (
            <button onClick={handleExecuteDraw} disabled={loading || isExecuting || !selectedPrizeStructureId} style={styles.button}>
            {isExecuting ? "Executing Draw..." : (loading ? "Loading Data..." : "Execute Draw")}
            </button>
        ) : (
            <p style={{color: "orange"}}>You do not have permission to execute draws. (Requires SUPER_ADMIN role)</p>
        )}
      </div>

      {isExecuting && (
        <div style={styles.animationPlaceholder}>
          <p>Executing Draw...</p>
          <p>Please wait while winners are selected...</p>
        </div>
      )}

      {drawResult && !isExecuting && (
        <div style={styles.resultsSection}>
          <h2>Draw Results (ID: {drawResult.id})</h2>
          <p><strong>Status:</strong> {drawResult.status}</p>
          <p><strong>Total Eligible MSISDNs (Mock):</strong> {drawResult.totalEligibleMSISDNs.toLocaleString()}</p>
          <p><strong>Total Entries (Mock):</strong> {drawResult.totalEntries.toLocaleString()}</p>
          
          <h3>Winners</h3>
          {drawResult.winners && drawResult.winners.length > 0 ? (
            <ul style={styles.list}>
              {drawResult.winners.map(winner => (
                <li key={winner.id} style={styles.listItem}>
                  <strong>MSISDN:</strong> {maskMSISDN(winner.msisdn)} <br />
                  <strong>Prize:</strong> {winner.prizeTierName} (Value: {winner.prizeValue})
                </li>
              ))}
            </ul>
          ) : (
            <p>No winners selected for this draw.</p>
          )}

          <h3 style={{marginTop: "20px"}}>Runner-Ups</h3>
          {drawResult.runnerUps && drawResult.runnerUps.length > 0 ? (
            <ul style={styles.list}>
              {drawResult.runnerUps.map(runnerUp => (
                <li key={runnerUp.id} style={styles.listItem}>
                  <strong>MSISDN:</strong> {maskMSISDN(runnerUp.msisdn)} <br />
                  <strong>Prize Tier:</strong> {runnerUp.prizeTierName} (Runner-up for winner: {maskMSISDN(runnerUp.originalWinnerMsisdn)})
                  {/* Add button to invoke runner-up later based on requirements */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No runner-ups generated for this draw.</p>
          )}
          <p style={{marginTop: "15px", fontStyle: "italic"}}>Full winner and runner-up details will be available in the secure admin winner list and audit logs.</p>
        </div>
      )}
    </div>
  );
};

export default DrawManagementPage;
