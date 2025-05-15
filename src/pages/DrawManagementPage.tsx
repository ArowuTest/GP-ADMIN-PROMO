// src/pages/DrawManagementPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../services/apiClient"; // Assuming you have an API client

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
  // UI specific, might not come from backend directly in this structure
  value?: string; // For display, e.g., "N1,000,000"
  valueNGN?: number; // For calculations, should be prize_amount
}

// Matches backend models.PrizeStructure
export interface PrizeStructureData {
  id: string; // uuid
  name: string;
  description?: string;
  is_active: boolean;
  effective_start_date?: string;
  effective_end_date?: string;
  prizes: PrizeTierData[]; // Renamed from prize_tiers to prizes to match frontend, but backend uses Prizes
  created_at: string; 
  // validFrom and validTo were UI specific, use effective_start_date & effective_end_date
}

// Matches backend models.DrawWinner
export interface DrawWinnerData {
  id: string; // uuid
  draw_id: string;
  prize_id: string; // This is PrizeTierID
  prize_tier?: PrizeTierData; // For displaying prize name/value
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
  winners: DrawWinnerData[]; // This will contain both actual winners and runner-ups
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
  const { userRole, token } = useAuth(); // Assuming token is available for API calls
  const [drawDate, setDrawDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [availablePrizeStructures, setAvailablePrizeStructures] = useState<PrizeStructureData[]>([]);
  const [selectedPrizeStructureId, setSelectedPrizeStructureId] = useState<string>("");
  // Mock participant counts, replace with API calls if needed for display before draw
  const [eligibleParticipantsCount, setEligibleParticipantsCount] = useState<number>(0);
  const [totalPointsInDraw, setTotalPointsInDraw] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [drawResult, setDrawResult] = useState<DrawData | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [showRerunConfirm, setShowRerunConfirm] = useState<boolean>(false); // Retain re-run logic if needed
  const [rerunConfirmText, setRerunConfirmText] = useState<string>("");

  const canExecuteDraw = userRole === "SuperAdmin"; // Backend enforces this, but good for UI too

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
    fetchPrizeStructures();
  }, [token]);

  const selectedStructureDetails = useMemo(() => {
    return availablePrizeStructures.find(s => s.id === selectedPrizeStructureId);
  }, [availablePrizeStructures, selectedPrizeStructureId]);

  // Mock data for eligible participants, replace if API exists to fetch this pre-draw
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

    // TODO: Implement re-run check against actual backend draw history if needed
    // For now, simplified re-run confirmation
    if (drawResult && !isRerun) { // Basic check if results for current selection are shown
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
      // Simulate animation delay
      await new Promise(resolve => setTimeout(resolve, 2000)); 

      const response = await apiClient.post("/admin/draws/execute", 
        { drawDate: drawDate, prizeStructureID: selectedPrizeStructureId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDrawResult(response.data.draw); // Backend returns { message: string, draw: DrawData }
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
    if (!canExecuteDraw) { // Or a more specific permission if exists
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
        // Refresh draw details to show updated statuses
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

  // Group winners and runner-ups by prize tier for display
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
    // Sort runner-ups by rank
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
                <option value="">{availablePrizeStructures.length === 0 ? "Loading structures..." : "Select a Prize Structure"}</option>
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
              <h4>Prize Breakdown for: {selectedStructureDetails.name}</h4>
              <table style={styles.prizeTierTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>Prize Name</th><th style={styles.th}>Value</th>
                    <th style={styles.th}>Winners</th><th style={styles.th}>Runners-Up</th><th style={styles.th}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStructureDetails.prizes.map(prize => (
                    <tr key={prize.id}>
                      <td style={styles.td}>{prize.name}</td>
                      <td style={styles.td}>{prize.prize_amount.toLocaleString()} {prize.prize_type === "Cash" ? "NGN" : ""}</td>
                      <td style={styles.td}>{prize.winner_count}</td>
                      <td style={styles.td}>{prize.number_of_runner_ups}</td>
                      <td style={styles.td}>{prize.prize_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={styles.totalPot}>Total Prize Pot Value (NGN): {calculateTotalPrizePot(selectedStructureDetails.prizes).toLocaleString()}</p>
            </div>
          )}

          {isExecuting && (
            <div style={styles.animationPlaceholder}>
              <p>Executing Draw...</p>
              <p>Please wait while winners are selected...</p>
            </div>
          )}

          {drawResult && (
            <div style={styles.resultsSection}>
              <h2>Draw Results (ID: {drawResult.id})</h2>
              <p><strong>Status:</strong> {drawResult.status}</p>
              <p><strong>Total Eligible MSISDNs:</strong> {drawResult.total_eligible_msisdns?.toLocaleString() || "N/A"}</p>
              <p><strong>Total Entries/Tickets:</strong> {drawResult.total_tickets?.toLocaleString() || "N/A"}</p>

              {Object.entries(groupedResults).map(([prizeTierId, group]) => (
                <div key={prizeTierId} style={{marginTop: "15px"}}>
                  <h4>{group.tier?.name || `Prize Tier ${prizeTierId}`} (Value: {group.tier?.prize_amount.toLocaleString()} {group.tier?.prize_type === "Cash" ? "NGN" : ""})</h4>
                  <h5>Winners:</h5>
                  {group.actualWinners.length > 0 ? (
                    <ul style={styles.list}>
                      {group.actualWinners.map(winner => (
                        <li key={winner.id} style={styles.listItem}>
                          <span>MSISDN: <strong>{maskMSISDN(winner.msisdn)}</strong> (Status: {winner.payment_status})</span>
                          {/* Placeholder for future actions like view details or if runner-ups can be invoked per winner */}
                        </li>
                      ))}
                    </ul>
                  ) : <p>No winners for this tier.</p>}

                  {group.tier && group.tier.number_of_runner_ups > 0 && (
                    <>
                        <h5 style={{marginTop: "10px"}}>Runner-Ups:</h5>
                        {group.runnerUps.length > 0 ? (
                            <ul style={styles.list}>
                            {group.runnerUps.map(ru => (
                                <li key={ru.id} style={styles.listItem}>
                                <span>
                                    {ru.runner_up_rank}. MSISDN: <strong>{maskMSISDN(ru.msisdn)}</strong> (Status: {ru.payment_status})
                                    {ru.original_winner_id && ` (Promoted for ${ru.original_winner_id.substring(0,6)}...)`}
                                </span>
                                {canExecuteDraw && ru.payment_status === "NotApplicable" && group.actualWinners.find(w => w.payment_status !== "Paid" && w.payment_status !== "Reverted") && (
                                    // Find an original winner for this tier that can be replaced
                                    // This logic is simplified: assumes any non-paid/non-reverted winner can be replaced by any available runner-up for the tier.
                                    // A more robust UI might let admin pick which winner to replace.
                                    // For now, enable invoke if there's *any* winner that could be replaced.
                                    // The backend call requires specific originalWinnerMsisdn.
                                    // This button is illustrative; a modal or selection for originalWinnerMsisdn would be better.
                                    <button 
                                        onClick={() => {
                                            const originalWinnerToReplace = group.actualWinners.find(w => w.payment_status !== "Paid" && w.payment_status !== "Reverted");
                                            if (originalWinnerToReplace) {
                                                handleInvokeRunnerUp(drawResult.id, prizeTierId, originalWinnerToReplace.msisdn, ru.msisdn);
                                            } else {
                                                alert("No replaceable winner found for this tier to invoke this runner-up.");
                                            }
                                        }}
                                        style={styles.invokeButton} 
                                        disabled={loading}
                                    >
                                        Invoke Runner-Up
                                    </button>
                                )}
                                </li>
                            ))}
                            </ul>
                        ) : <p>No runner-ups selected for this tier or all have been processed.</p>}
                    </>
                  )}
                </div>
              ))}
              {Object.keys(groupedResults).length === 0 && <p>No winners or runner-ups for this draw.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawManagementPage;

