// src/pages/DrawManagementPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext"; // UserRole import removed as it's not directly used
import { apiClient } from "../services/apiClient.ts"; // Corrected import path

// Matches backend models.Prize (PrizeTier)
export interface PrizeTierData {
  id: string; // uuid
  name: string;
  prize_type: string;
  prize_amount: number;
  prize_description?: string;
  winner_count: number;
  sort_order: number;
  number_of_runner_ups: number;
  value?: string; 
  valueNGN?: number; 
}

// Matches backend models.PrizeStructure
export interface PrizeStructureData {
  id: string; // uuid
  name: string;
  description?: string;
  is_active: boolean;
  effective_start_date?: string;
  effective_end_date?: string;
  prizes: PrizeTierData[]; 
  created_at: string; 
  applicableDays?: string[]; 
}

// Matches backend models.DrawWinner
export interface DrawWinnerData {
  id: string; // uuid
  draw_id: string;
  prize_id: string; 
  prize_tier?: PrizeTierData; 
  msisdn: string;
  is_runner_up: boolean;
  runner_up_rank?: number;
  selection_order_in_tier?: number;
  original_winner_id?: string;
  notification_status: string;
  payment_status: string;
  payment_remarks?: string;
  created_at: string;
}

// Matches backend models.Draw
export interface DrawData {
  id: string; // uuid
  draw_date: string;
  executed_by_admin_id?: string;
  prize_structure_id: string;
  prize_structure?: PrizeStructureData;
  status: string;
  total_eligible_msisdns?: number;
  total_tickets?: number;
  execution_type: string;
  winners: DrawWinnerData[]; 
  created_at: string;
}

const styles = {
  container: { padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto" },
  mainContent: { display: "flex", flexDirection: "row" as "row", gap: "20px" },
  leftPanel: { flex: 2, minWidth: "400px" },
  rightPanel: { flex: 3, minWidth: "500px" },
  formSection: { marginBottom: "20px", padding: "20px", border: "1px solid #eee", borderRadius: "8px", backgroundColor: "#f9f9f9" },
  infoSection: { marginBottom: "20px", padding: "15px", border: "1px solid #e0e0e0", borderRadius: "8px", backgroundColor: "#e0f7fa" },
  prizeBreakdownSection: { padding: "15px", border: "1px solid #dcedc8", borderRadius: "8px", backgroundColor: "#f1f8e9", marginBottom: "20px" },
  label: { display: "block", marginBottom: "5px", fontWeight: "bold" },
  input: { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" as "border-box" },
  select: { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" as "border-box" }, 
  button: { padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px", marginRight: "10px" },
  confirmButton: { padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px" },
  cancelButton: { padding: "10px 20px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px" },
  invokeButton: { padding: "8px 12px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", marginLeft: "10px" },
  error: { color: "red", marginBottom: "15px" },
  warning: { color: "orange", marginBottom: "15px", padding: "10px", border: "1px solid orange", borderRadius: "4px", backgroundColor: "#fff3e0"},
  resultsSection: { marginTop: "20px", padding: "20px", border: "1px solid #eee", borderRadius: "8px", backgroundColor: "#f9f9f9" },
  list: { listStyleType: "none", paddingLeft: 0 },
  listItem: { marginBottom: "8px", padding: "10px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  animationPlaceholder: {
    width: "100%", height: "150px", backgroundColor: "#222", color: "yellow", display: "flex", 
    flexDirection: "column" as "column", alignItems: "center", justifyContent: "center", 
    borderRadius: "8px", marginBottom: "20px", textAlign: "center" as "center", fontSize: "20px",
  },
  prizeTierTable: { width: "100%", borderCollapse: "collapse" as "collapse", marginTop: "10px" },
  th: { border: "1px solid #ddd", padding: "8px", backgroundColor: "#f2f2f2", textAlign: "left" as "left" },
  td: { border: "1px solid #ddd", padding: "8px" }, 
  totalPot: { fontWeight: "bold", marginTop: "10px", fontSize: "1.1em" }
};

const DrawManagementPage: React.FC = () => {
  const { userRole, token } = useAuth(); 
  const [drawDate, setDrawDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [availablePrizeStructures, setAvailablePrizeStructures] = useState<PrizeStructureData[]>([]);
  const [selectedPrizeStructureId, setSelectedPrizeStructureId] = useState<string>("");
  const [eligibleParticipantsCount, setEligibleParticipantsCount] = useState<number>(0);
  const [totalPointsInDraw, setTotalPointsInDraw] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [drawResult, setDrawResult] = useState<DrawData | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [showRerunConfirm, setShowRerunConfirm] = useState<boolean>(false); 
  const [rerunConfirmText, setRerunConfirmText] = useState<string>("");

  const canExecuteDraw = userRole === "SUPER_ADMIN";

  useEffect(() => {
    const fetchPrizeStructures = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/admin/prize-structures?active=true", { headers: { Authorization: `Bearer ${token}` } });
        const structures: PrizeStructureData[] = response.data.filter((s: PrizeStructureData) => 
            s.is_active && 
            new Date(s.effective_start_date || 0) <= new Date() && 
            (!s.effective_end_date || new Date(s.effective_end_date) >= new Date())
        );
        setAvailablePrizeStructures(structures);
        if (structures.length > 0 && structures[0].id) {
          setSelectedPrizeStructureId(structures[0].id);
        }
      } catch (err: any) {
        setError("Failed to load prize structures: " + (err.response?.data?.error || err.message));
      }
      setLoading(false);
    };
    if (token) { 
        fetchPrizeStructures();
    }
  }, [token]);

  const selectedStructureDetails = useMemo(() => {
    return availablePrizeStructures.find(s => s.id === selectedPrizeStructureId);
  }, [availablePrizeStructures, selectedPrizeStructureId]);

  useEffect(() => {
    if (selectedStructureDetails) {
      setEligibleParticipantsCount(Math.floor(Math.random() * 10000) + 500); 
      setTotalPointsInDraw(Math.floor(Math.random() * 100000) + 5000);
      setDrawResult(null); 
      setShowRerunConfirm(false); 
      setRerunConfirmText("");
      setError(null);
      setSuccessMessage(null);
    } else {
      setEligibleParticipantsCount(0);
      setTotalPointsInDraw(0);
    }
  }, [selectedStructureDetails]);

  const calculateTotalPrizePot = (prizes: PrizeTierData[] = []): number => {
    return prizes.reduce((total, prize) => total + (prize.prize_amount || 0) * prize.winner_count, 0);
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

    if (drawResult && !isRerun) { 
        setShowRerunConfirm(true);
        setError("A draw result is already displayed. Confirm to re-run for this date and prize structure.");
        return;
    }
    if (isRerun && rerunConfirmText.toLowerCase() !== "rerun") {
        setError("To confirm re-run, please type \"rerun\" in the box.");
        return;
    }

    setLoading(true);
    setIsExecuting(true);
    setError(null);
    setSuccessMessage(null);
    setDrawResult(null);
    setShowRerunConfirm(false);
    setRerunConfirmText("");

    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); 

      const response = await apiClient.post("/admin/draws/execute", 
        { drawDate: drawDate, prizeStructureID: selectedPrizeStructureId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDrawResult(response.data.draw); 
      setSuccessMessage(response.data.message || "Draw executed successfully!");
    } catch (err: any) {
      setError("Failed to execute draw: " + (err.response?.data?.error || err.message));
      setDrawResult(null);
    } finally {
      setIsExecuting(false);
      setLoading(false);
    }
  };

  const handleInvokeRunnerUp = async (drawId: string, prizeTierId: string, originalWinnerMsisdn: string, runnerUpMsisdn: string) => {
    if (!canExecuteDraw) { 
        setError("You do not have permission to invoke runner-ups.");
        return;
    }
    if (!window.confirm(`Are you sure you want to promote runner-up ${maskMSISDN(runnerUpMsisdn)} for original winner ${maskMSISDN(originalWinnerMsisdn)}?`)) {
        return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
        const response = await apiClient.post("/admin/draws/invoke-runner-up", 
            { drawId, prizeTierId, originalWinnerMsisdn, runnerUpMsisdn },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage(response.data.message || "Runner-up invoked successfully!");
        if (drawResult) {
            const updatedDrawDetails = await apiClient.get(`/admin/draws/${drawResult.id}`, { headers: { Authorization: `Bearer ${token}` } });
            setDrawResult(updatedDrawDetails.data);
        }
    } catch (err: any) {
        setError("Failed to invoke runner-up: " + (err.response?.data?.error || err.message));
    } finally {
        setLoading(false);
    }
  };
  
  const maskMSISDN = (msisdn: string) => {
    if (msisdn && msisdn.length > 5) {
      return `${msisdn.substring(0, 3)}*****${msisdn.substring(msisdn.length - 3)}`;
    }
    return msisdn;
  };

  const groupedResults = useMemo(() => {
    if (!drawResult || !drawResult.winners) return {};
    const groups: { [prizeTierId: string]: { tier: PrizeTierData | undefined, actualWinners: DrawWinnerData[], runnerUps: DrawWinnerData[] } } = {};

    for (const dw of drawResult.winners) {
        if (!groups[dw.prize_id]) {
            const tierInfo = selectedStructureDetails?.prizes.find(p => p.id === dw.prize_id);
            groups[dw.prize_id] = { tier: tierInfo, actualWinners: [], runnerUps: [] };
        }
        if (dw.is_runner_up) {
            groups[dw.prize_id].runnerUps.push(dw);
        } else {
            groups[dw.prize_id].actualWinners.push(dw);
        }
    }
    Object.values(groups).forEach(group => group.runnerUps.sort((a, b) => (a.runner_up_rank || 0) - (b.runner_up_rank || 0)));
    return groups;
  }, [drawResult, selectedStructureDetails]);

  return (
    <div style={styles.container}>
      <h1>Draw Management</h1>
      {error && <p style={showRerunConfirm ? styles.warning : styles.error}>{error}</p>}
      {successMessage && <p style={{ color: "green", marginBottom: "15px" }}>{successMessage}</p>}

      <div style={styles.mainContent}>
        <div style={styles.leftPanel}>
          <div style={styles.formSection}>
            <h2>Configure New Draw</h2>
            <div>
              <label htmlFor="drawDate" style={styles.label}>Draw Date:</label>
              <input type="date" id="drawDate" value={drawDate} 
                onChange={(e) => { setDrawDate(e.target.value); setDrawResult(null); setShowRerunConfirm(false); setError(null); setSuccessMessage(null); }}
                style={styles.input} disabled={loading || isExecuting || !canExecuteDraw}
              />
            </div>
            <div>
              <label htmlFor="prizeStructure" style={styles.label}>Prize Structure:</label>
              <select id="prizeStructure" value={selectedPrizeStructureId} 
                onChange={(e) => setSelectedPrizeStructureId(e.target.value)} 
                style={styles.select} disabled={loading || isExecuting || availablePrizeStructures.length === 0 || !canExecuteDraw}
              >
                <option value="">{availablePrizeStructures.length === 0 && loading ? "Loading structures..." : (availablePrizeStructures.length === 0 ? "No active structures found" : "Select a Prize Structure")}</option>
                {availablePrizeStructures.map(ps => (
                  <option key={ps.id} value={ps.id}>{ps.name}</option>
                ))}
              </select>
            </div>

            {selectedStructureDetails && (
              <div style={styles.infoSection}>
                <h4>Draw Information (Estimates/Mock)</h4>
                <p><strong>Eligible Participants (Mock):</strong> {eligibleParticipantsCount.toLocaleString()}</p>
                <p><strong>Total Points in Draw (Mock):</strong> {totalPointsInDraw.toLocaleString()}</p>
              </div>
            )}

            {canExecuteDraw && !showRerunConfirm && (
              <button onClick={() => handleExecuteDraw(false)} disabled={loading || isExecuting || !selectedPrizeStructureId} style={styles.button}>
                {isExecuting ? "Executing Draw..." : (loading && !availablePrizeStructures.length ? "Loading Data..." : "Execute Draw")}
              </button>
            )}
            {canExecuteDraw && showRerunConfirm && (
              <div style={{marginTop: "15px"}}>
                <input type="text" value={rerunConfirmText} onChange={(e) => setRerunConfirmText(e.target.value)} 
                  placeholder="Type 'rerun' to confirm" 
                  style={{...styles.input, width: "calc(100% - 230px)", marginRight: "10px", display: "inline-block"}}
                />
                <button onClick={() => handleExecuteDraw(true)} style={styles.confirmButton} disabled={loading || isExecuting}>Confirm Re-run</button>
                <button onClick={() => {setShowRerunConfirm(false); setError(null); setRerunConfirmText("");}} style={{...styles.cancelButton, marginLeft: "10px"}} disabled={loading || isExecuting}>Cancel</button>
              </div>
            )}
            {!canExecuteDraw && (
                <p style={{color: "orange"}}>You do not have permission to execute draws.</p>
            )}
          </div>
        </div>

        <div style={styles.rightPanel}>
          {selectedStructureDetails && (
            <div style={styles.prizeBreakdownSection}>
              <h4>Prize Breakdown: {selectedStructureDetails.name}</h4>
              <table style={styles.prizeTierTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>Tier Name</th>
                    <th style={styles.th}>Value</th>
                    <th style={styles.th}>Winners</th>
                    <th style={styles.th}>Runner-ups</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStructureDetails.prizes.map(prize => (
                    <tr key={prize.id}>
                      <td style={styles.td}>{prize.name}</td>
                      <td style={styles.td}>{prize.value || prize.prize_amount.toLocaleString()}</td>
                      <td style={styles.td}>{prize.winner_count}</td>
                      <td style={styles.td}>{prize.number_of_runner_ups}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={styles.totalPot}>Total Prize Pot (NGN): {calculateTotalPrizePot(selectedStructureDetails.prizes).toLocaleString()}</p>
            </div>
          )}

          {isExecuting && (
            <div style={styles.animationPlaceholder}>
              <p>Executing Draw...</p>
              <p>Please wait, this may take a moment.</p>
              <div className="spinner"></div> 
            </div>
          )}

          {drawResult && !isExecuting && (
            <div style={styles.resultsSection}>
              <h3>Draw Results - ID: {drawResult.id.substring(0,8)}...</h3>
              <p><strong>Executed At:</strong> {new Date(drawResult.created_at).toLocaleString()}</p>
              <p><strong>Status:</strong> {drawResult.status}</p>
              {Object.entries(groupedResults).map(([prizeTierId, group]) => (
                <div key={prizeTierId} style={{ marginBottom: "20px" }}>
                  <h4>{group.tier?.name || `Prize Tier ${prizeTierId.substring(0,6)}...`} (Value: {group.tier?.value || group.tier?.prize_amount.toLocaleString()})</h4>
                  <h5>Winners:</h5>
                  {group.actualWinners.length > 0 ? (
                    <ul style={styles.list}>
                      {group.actualWinners.map(winner => (
                        <li key={winner.id} style={styles.listItem}>
                          <span>MSISDN: {maskMSISDN(winner.msisdn)} (Status: {winner.notification_status} / {winner.payment_status})</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p>No main winners for this tier.</p>}
                  
                  {group.runnerUps.length > 0 && (
                    <>
                      <h5>Runner-ups:</h5>
                      <ul style={styles.list}>
                        {group.runnerUps.map(runnerUp => (
                          <li key={runnerUp.id} style={styles.listItem}>
                            <span>
                                MSISDN: {maskMSISDN(runnerUp.msisdn)} (Rank: {runnerUp.runner_up_rank}, Status: {runnerUp.notification_status} / {runnerUp.payment_status})
                            </span>
                            {canExecuteDraw && runnerUp.notification_status !== "NotifiedAsWinner" && runnerUp.payment_status !== "Paid" && (
                                <button onClick={() => handleInvokeRunnerUp(drawResult.id, prizeTierId, group.actualWinners.find(w => w.prize_id === prizeTierId)?.msisdn || "N/A", runnerUp.msisdn)} 
                                        style={styles.invokeButton} 
                                        disabled={loading || isExecuting}>
                                    Invoke Runner-up
                                </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawManagementPage;

