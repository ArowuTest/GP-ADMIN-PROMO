// src/pages/DrawManagementPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";

export interface PrizeTierData {
  id?: number | string;
  name: string;
  value: string; 
  quantity: number;
  prizeType: string;
  order: number;
  valueNGN?: number; 
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

interface Winner {
  id: string;
  msisdn: string;
  prizeTierName: string;
  prizeValue: string;
}

interface RunnerUp {
  id: string;
  msisdn: string;
  originalWinnerMsisdn: string;
  prizeTierName: string;
}

interface MockDrawResult {
  id: string;
  status: string;
  totalEligibleMSISDNs: number;
  totalEntries: number;
  winners: Winner[];
  runnerUps: RunnerUp[];
  prizeStructureId: string | number;
  drawDate: string;
}

const styles = {
  container: { padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto" },
  mainContent: { display: "flex", flexDirection: "row" as "row", gap: "20px" },
  leftPanel: { flex: 2, minWidth: "400px" }, // Configuration panel
  rightPanel: { flex: 3, minWidth: "500px" }, // Prize breakdown and results panel
  formSection: { marginBottom: "20px", padding: "20px", border: "1px solid #eee", borderRadius: "8px", backgroundColor: "#f9f9f9" },
  infoSection: { marginBottom: "20px", padding: "15px", border: "1px solid #e0e0e0", borderRadius: "8px", backgroundColor: "#e0f7fa" },
  prizeBreakdownSection: { padding: "15px", border: "1px solid #dcedc8", borderRadius: "8px", backgroundColor: "#f1f8e9", marginBottom: "20px" },
  label: { display: "block", marginBottom: "5px", fontWeight: "bold" },
  input: { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" as "border-box" },
  select: { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" as "border-box" }, 
  button: { padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px", marginRight: "10px" },
  confirmButton: { padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px" },
  cancelButton: { padding: "10px 20px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px" },
  error: { color: "red", marginBottom: "15px" },
  warning: { color: "orange", marginBottom: "15px", padding: "10px", border: "1px solid orange", borderRadius: "4px", backgroundColor: "#fff3e0"},
  resultsSection: { padding: "20px", border: "1px solid #eee", borderRadius: "8px", backgroundColor: "#f9f9f9" },
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
  prizeTierTable: { width: "100%", borderCollapse: "collapse" as "collapse", marginTop: "10px" },
  th: { border: "1px solid #ddd", padding: "8px", backgroundColor: "#f2f2f2", textAlign: "left" as "left" },
  td: { border: "1px solid #ddd", padding: "8px" }, 
  totalPot: { fontWeight: "bold", marginTop: "10px", fontSize: "1.1em" }
};

const mockPrizeStructures: PrizeStructureData[] = [
  {
    id: "1",
    name: "Daily Draw Week 1 (Active)",
    description: "Standard daily draw for the first week.",
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    validFrom: new Date(Date.now() - 86400000 * 7).toISOString(),
    validTo: new Date(Date.now() + 86400000 * 7).toISOString(),
    prizes: [
      { id: "p1", name: "Jackpot", value: "N1,000,000", valueNGN: 1000000, quantity: 1, prizeType: "Cash", order: 0 },
      { id: "p2", name: "Consolation", value: "N10,000 Airtime", valueNGN: 10000, quantity: 5, prizeType: "Airtime", order: 1 },
    ],
  },
  {
    id: "2",
    name: "Weekend Special (Active)",
    description: "Special draw for weekend participants.",
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    validFrom: new Date(Date.now() - 86400000 * 2).toISOString(),
    validTo: new Date(Date.now() + 86400000 * 5).toISOString(),
    prizes: [
      { id: "p3", name: "Grand Weekend Prize", value: "N5,000,000", valueNGN: 5000000, quantity: 1, prizeType: "Cash", order: 0 },
      { id: "p4", name: "Weekend Mini", value: "N50,000 Airtime", valueNGN: 50000, quantity: 10, prizeType: "Airtime", order: 1 },
    ],
  },
  {
    id: "3",
    name: "Old Expired Draw",
    description: "This draw is old and expired.",
    isActive: false,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    validFrom: new Date(Date.now() - 86400000 * 30).toISOString(),
    validTo: new Date(Date.now() - 86400000 * 20).toISOString(),
    prizes: [
      { id: "p5", name: "Expired Prize", value: "N100", valueNGN: 100, quantity: 1, prizeType: "Cash", order: 0 },
    ],
  },
];

const getExecutedDraws = (): MockDrawResult[] => {
  const stored = sessionStorage.getItem("executedDraws");
  return stored ? JSON.parse(stored) : [];
};

const addExecutedDraw = (draw: MockDrawResult) => {
  const draws = getExecutedDraws();
  sessionStorage.setItem("executedDraws", JSON.stringify([...draws, draw]));
};

const DrawManagementPage: React.FC = () => {
  const { userRole } = useAuth();
  const [drawDate, setDrawDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [availablePrizeStructures, setAvailablePrizeStructures] = useState<PrizeStructureData[]>([]);
  const [selectedPrizeStructureId, setSelectedPrizeStructureId] = useState<string | number>("");
  const [eligibleParticipantsCount, setEligibleParticipantsCount] = useState<number>(0);
  const [totalPointsInDraw, setTotalPointsInDraw] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [drawResult, setDrawResult] = useState<MockDrawResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [showRerunConfirm, setShowRerunConfirm] = useState<boolean>(false);
  const [rerunConfirmText, setRerunConfirmText] = useState<string>("");

  const canExecuteDraw = userRole === "SUPER_ADMIN";

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const activeValidStructures = mockPrizeStructures.filter(s => 
        s.isActive && 
        new Date(s.validFrom) <= new Date() && 
        (!s.validTo || new Date(s.validTo) >= new Date())
      );
      setAvailablePrizeStructures(activeValidStructures);
      if (activeValidStructures.length > 0 && activeValidStructures[0].id) {
        setSelectedPrizeStructureId(activeValidStructures[0].id.toString());
      }
      setLoading(false);
    }, 500);
  }, []);

  const selectedStructureDetails = useMemo(() => {
    return availablePrizeStructures.find(s => s.id.toString() === selectedPrizeStructureId.toString());
  }, [availablePrizeStructures, selectedPrizeStructureId]);

  useEffect(() => {
    if (selectedStructureDetails) {
      setEligibleParticipantsCount(Math.floor(Math.random() * 10000) + 500);
      setTotalPointsInDraw(Math.floor(Math.random() * 100000) + 5000);
      setDrawResult(null); 
      setShowRerunConfirm(false); 
      setRerunConfirmText("");
    } else {
      setEligibleParticipantsCount(0);
      setTotalPointsInDraw(0);
    }
  }, [selectedStructureDetails]);

  const calculateTotalPrizePot = (prizes: PrizeTierData[]): number => {
    return prizes.reduce((total, prize) => total + (prize.valueNGN || 0) * prize.quantity, 0);
  };

  const handleExecuteDraw = async (isRerun: boolean = false) => {
    if (!selectedPrizeStructureId || !drawDate) {
      setError("Please select a draw date and a prize structure.");
      return;
    }
    if (!canExecuteDraw) {
      setError("You do not have permission to execute draws.");
      return;
    }

    const executedDraws = getExecutedDraws();
    const alreadyRun = executedDraws.find(d => d.drawDate === drawDate && d.prizeStructureId.toString() === selectedPrizeStructureId.toString());

    if (alreadyRun && !isRerun) {
      setShowRerunConfirm(true);
      setError("A draw for this date and prize structure has already been run. Confirm to re-run.");
      return;
    }
    
    if (isRerun && rerunConfirmText.toLowerCase() !== "rerun") {
        setError("To confirm re-run, please type \"rerun\" in the box.");
        return;
    }

    setLoading(true);
    setIsExecuting(true);
    setError(null);
    setDrawResult(null);
    setShowRerunConfirm(false);
    setRerunConfirmText("");

    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockWinners: Winner[] = [];
    const mockRunnerUps: RunnerUp[] = [];

    if (selectedStructureDetails && selectedStructureDetails.prizes.length > 0) {
      selectedStructureDetails.prizes.forEach(prizeTier => {
        for (let i = 0; i < prizeTier.quantity; i++) {
          const winnerMsisdn = `080${Math.floor(Math.random() * 100000000).toString().padStart(8, "0")}`;
          mockWinners.push({
            id: `winner-${prizeTier.id}-${i}`,
            msisdn: winnerMsisdn,
            prizeTierName: prizeTier.name,
            prizeValue: prizeTier.value.toString(),
          });
          mockRunnerUps.push({
            id: `runnerup-${prizeTier.id}-${i}`,
            msisdn: `081${Math.floor(Math.random() * 100000000).toString().padStart(8, "0")}`,
            originalWinnerMsisdn: winnerMsisdn,
            prizeTierName: prizeTier.name,
          });
        }
      });
    } else {
        // If no prizes in structure, still complete draw but with no winners
        console.warn("Selected prize structure has no prize tiers defined. No winners will be generated.");
    }

    const newDrawResult: MockDrawResult = {
      id: `DRAW-${Date.now()}`,
      status: "Completed",
      totalEligibleMSISDNs: eligibleParticipantsCount,
      totalEntries: totalPointsInDraw,
      winners: mockWinners,
      runnerUps: mockRunnerUps,
      prizeStructureId: selectedPrizeStructureId,
      drawDate: drawDate,
    };
    setDrawResult(newDrawResult);
    if (!alreadyRun || isRerun) { 
        addExecutedDraw(newDrawResult);
    }

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
      <div style={styles.mainContent}>
        <div style={styles.leftPanel}>
          <div style={styles.formSection}>
            <h2>Configure New Draw</h2>
            {error && <p style={showRerunConfirm ? styles.warning : styles.error}>{error}</p>}
            <div>
              <label htmlFor="drawDate" style={styles.label}>Draw Date:</label>
              <input 
                type="date" 
                id="drawDate" 
                value={drawDate} 
                onChange={(e) => { setDrawDate(e.target.value); setDrawResult(null); setShowRerunConfirm(false); }}
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
                  <option key={ps.id} value={ps.id.toString()}>{ps.name}</option>
                ))}
              </select>
            </div>

            {selectedStructureDetails && (
              <div style={styles.infoSection}>
                <h4>Draw Information (Mock Data)</h4>
                <p><strong>Eligible Participants:</strong> {eligibleParticipantsCount.toLocaleString()}</p>
                <p><strong>Total Points in Draw:</strong> {totalPointsInDraw.toLocaleString()}</p>
              </div>
            )}

            {canExecuteDraw && !showRerunConfirm && (
              <button onClick={() => handleExecuteDraw(false)} disabled={loading || isExecuting || !selectedPrizeStructureId} style={styles.button}>
                {isExecuting ? "Executing Draw..." : (loading ? "Loading Data..." : "Execute Draw")}
              </button>
            )}
            {canExecuteDraw && showRerunConfirm && (
              <div style={{marginTop: "15px"}}>
                <input 
                  type="text" 
                  value={rerunConfirmText} 
                  onChange={(e) => setRerunConfirmText(e.target.value)} 
                  placeholder="Type 'rerun' to confirm" 
                  style={{...styles.input, width: "calc(100% - 230px)", marginRight: "10px", display: "inline-block"}}
                />
                <button onClick={() => handleExecuteDraw(true)} style={styles.confirmButton} disabled={loading || isExecuting}>Confirm Re-run</button>
                <button onClick={() => {setShowRerunConfirm(false); setError(null); setRerunConfirmText("");}} style={{...styles.cancelButton, marginLeft: "10px"}} disabled={loading || isExecuting}>Cancel</button>
              </div>
            )}
            {!canExecuteDraw && (
                <p style={{color: "orange"}}>You do not have permission to execute draws. (Requires SUPER_ADMIN role)</p>
            )}
          </div>
        </div>

        <div style={styles.rightPanel}>
          {selectedStructureDetails && (
            <div style={styles.prizeBreakdownSection}>
              <h4>Prize Breakdown for: {selectedStructureDetails.name}</h4>
              <table style={styles.prizeTierTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>Prize Name</th>
                    <th style={styles.th}>Value</th>
                    <th style={styles.th}>Quantity</th>
                    <th style={styles.th}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStructureDetails.prizes.map(prize => (
                    <tr key={prize.id}>
                      <td style={styles.td}>{prize.name}</td>
                      <td style={styles.td}>{prize.value}</td>
                      <td style={styles.td}>{prize.quantity}</td>
                      <td style={styles.td}>{prize.prizeType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={styles.totalPot}>Total Prize Pot Value: N{calculateTotalPrizePot(selectedStructureDetails.prizes).toLocaleString()}</p>
            </div>
          )}

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
                <p>No winners selected for this draw. (This may occur if the selected prize structure has no prize tiers defined).</p>
              )}
              <h3 style={{marginTop: "20px"}}>Runner-Ups</h3>
              {drawResult.runnerUps && drawResult.runnerUps.length > 0 ? (
                <ul style={styles.list}>
                  {drawResult.runnerUps.map(runnerUp => (
                    <li key={runnerUp.id} style={styles.listItem}>
                      <strong>MSISDN:</strong> {maskMSISDN(runnerUp.msisdn)} <br />
                      <strong>Prize Tier:</strong> {runnerUp.prizeTierName} (Runner-up for winner: {maskMSISDN(runnerUp.originalWinnerMsisdn)})
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
      </div>
    </div>
  );
};

export default DrawManagementPage;

