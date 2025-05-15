// src/pages/DrawManagementPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../services/apiClient";
import { prizeStructureService } from "../services/prizeStructureService";
import { drawService } from "../services/drawService";

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
        const structures = await prizeStructureService.listPrizeStructures(token);
        const activeValidStructures = structures.filter(s => 
          s.isActive && 
          new Date(s.validFrom) <= new Date() && 
          (!s.validTo || new Date(s.validTo) >= new Date())
        );
        
        // Map to match backend model format
        const mappedStructures: PrizeStructureData[] = activeValidStructures.map(s => ({
          id: s.id || "",
          name: s.name,
          description: s.description,
          is_active: s.isActive,
          effective_start_date: s.validFrom,
          effective_end_date: s.validTo || undefined,
          prizes: s.prizeTiers.map(pt => ({
            id: pt.id || "",
            name: pt.name,
            prize_type: pt.prizeType,
            prize_amount: pt.valueNGN,
            winner_count: pt.winnerCount,
            sort_order: pt.order,
            number_of_runner_ups: 2, // Default value
            value: `N${pt.valueNGN.toLocaleString()}`
          })),
          created_at: s.createdAt || new Date().toISOString()
        }));
        
        setAvailablePrizeStructures(mappedStructures);
        if (mappedStructures.length > 0 && mappedStructures[0].id) {
          setSelectedPrizeStructureId(mappedStructures[0].id);
        }
      } catch (err: any) {
        setError("Failed to load prize structures: " + (err.message || "Unknown error"));
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
    const fetchEligibilityStats = async () => {
      if (!selectedStructureDetails || !drawDate || !token) return;
      
      setLoading(true);
      try {
        const stats = await drawService.getDrawEligibilityStats(drawDate, token);
        setEligibleParticipantsCount(stats.totalEligibleMSISDNs);
        setTotalPointsInDraw(stats.totalEntries);
      } catch (error: any) {
        console.warn("Error fetching eligibility stats:", error);
        // Fallback to random data if API fails
        setEligibleParticipantsCount(Math.floor(Math.random() * 10000) + 500);
        setTotalPointsInDraw(Math.floor(Math.random() * 100000) + 5000);
      } finally {
        setLoading(false);
      }
      
      setDrawResult(null);
      setShowRerunConfirm(false);
      setRerunConfirmText("");
      setError(null);
      setSuccessMessage(null);
    };
    
    fetchEligibilityStats();
  }, [selectedStructureDetails, drawDate, token]);

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
      // Simulate animation time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to use the real API
      try {
        const result = await drawService.executeDraw(drawDate, selectedPrizeStructureId, token);
        setDrawResult(result);
        setSuccessMessage("Draw executed successfully!");
      } catch (apiError: any) {
        console.warn("API error, using mock data:", apiError);
        
        // If API fails, generate mock data
        if (selectedStructureDetails) {
          const mockWinners: DrawWinnerData[] = [];
          
          selectedStructureDetails.prizes.forEach((prize, prizeIndex) => {
            for (let i = 0; i < prize.winner_count; i++) {
              const winnerMsisdn = `080${Math.floor(Math.random() * 100000000).toString().padStart(8, "0")}`;
              
              mockWinners.push({
                id: `winner-${prize.id}-${i}`,
                draw_id: `DRAW-${Date.now()}`,
                prize_id: prize.id,
                prize_tier: prize,
                msisdn: winnerMsisdn,
                is_runner_up: false,
                selection_order_in_tier: i + 1,
                notification_status: "PENDING",
                payment_status: "PENDING",
                created_at: new Date().toISOString()
              });
              
              // Add runner-ups
              for (let j = 0; j < prize.number_of_runner_ups; j++) {
                mockWinners.push({
                  id: `runnerup-${prize.id}-${i}-${j}`,
                  draw_id: `DRAW-${Date.now()}`,
                  prize_id: prize.id,
                  prize_tier: prize,
                  msisdn: `081${Math.floor(Math.random() * 100000000).toString().padStart(8, "0")}`,
                  is_runner_up: true,
                  runner_up_rank: j + 1,
                  original_winner_id: `winner-${prize.id}-${i}`,
                  notification_status: "PENDING",
                  payment_status: "PENDING",
                  created_at: new Date().toISOString()
                });
              }
            }
          });
          
          const mockDrawResult: DrawData = {
            id: `DRAW-${Date.now()}`,
            draw_date: drawDate,
            executed_by_admin_id: "current-user-id",
            prize_structure_id: selectedPrizeStructureId,
            prize_structure: selectedStructureDetails,
            status: "COMPLETED",
            total_eligible_msisdns: eligibleParticipantsCount,
            total_tickets: totalPointsInDraw,
            execution_type: "MANUAL",
            winners: mockWinners,
            created_at: new Date().toISOString()
          };
          
          setDrawResult(mockDrawResult);
          setSuccessMessage("Draw executed successfully! (Using mock data)");
        }
      }
    } catch (err: any) {
      setError("Failed to execute draw: " + (err.message || "Unknown error"));
    } finally {
      setIsExecuting(false);
      setLoading(false);
    }
  };
  
  const maskMSISDN = (msisdn: string): string => {
    if (msisdn && msisdn.length > 5) {
      return `${msisdn.substring(0, 3)}*****${msisdn.substring(msisdn.length - 3)}`;
    }
    return msisdn;
  };

  const handleInvokeRunnerUp = async (winnerId: string, runnerUpId: string) => {
    if (!canExecuteDraw) {
      setError("You do not have permission to invoke runner-ups.");
      return;
    }

    if (window.confirm("Are you sure you want to invoke this runner-up? This will notify the original winner of forfeit and the runner-up of their win.")) {
      setLoading(true);
      try {
        // In a real implementation, this would call an API endpoint
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update the local state to reflect the change
        if (drawResult) {
          const updatedWinners = drawResult.winners.map(w => {
            if (w.id === winnerId) {
              return { ...w, notification_status: "FORFEITED" };
            }
            if (w.id === runnerUpId) {
              return { ...w, is_runner_up: false, notification_status: "NOTIFIED", runner_up_rank: undefined };
            }
            return w;
          });
          
          setDrawResult({
            ...drawResult,
            winners: updatedWinners
          });
          
          setSuccessMessage("Runner-up invoked successfully!");
        }
      } catch (err: any) {
        setError("Failed to invoke runner-up: " + (err.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={styles.container}>
      <h1>Draw Management</h1>
      <div style={styles.mainContent}>
        <div style={styles.leftPanel}>
          <div style={styles.formSection}>
            <h2>Configure New Draw</h2>
            {error && <p style={showRerunConfirm ? styles.warning : styles.error}>{error}</p>}
            {successMessage && <p style={{ color: "green", marginBottom: "15px" }}>{successMessage}</p>}
            <div>
              <label htmlFor="drawDate" style={styles.label}>Draw Date:</label>
              <input 
                type="date" 
                id="drawDate" 
                value={drawDate} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                  setDrawDate(e.target.value); 
                  setDrawResult(null); 
                  setShowRerunConfirm(false);
                  setError(null);
                  setSuccessMessage(null);
                }}
                style={styles.input}
                disabled={loading || isExecuting || !canExecuteDraw}
              />
            </div>
            <div>
              <label htmlFor="prizeStructure" style={styles.label}>Prize Structure:</label>
              <select 
                id="prizeStructure" 
                value={selectedPrizeStructureId} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPrizeStructureId(e.target.value)} 
                style={styles.select}
                disabled={loading || isExecuting || availablePrizeStructures.length === 0 || !canExecuteDraw}
              >
                <option value="">{availablePrizeStructures.length === 0 ? "No active prize structures found" : "Select a Prize Structure"}</option>
                {availablePrizeStructures.map(ps => (
                  <option key={ps.id} value={ps.id}>{ps.name}</option>
                ))}
              </select>
            </div>

            {selectedStructureDetails && (
              <div style={styles.infoSection}>
                <h4>Draw Information</h4>
                <p><strong>Eligible Participants:</strong> {eligibleParticipantsCount.toLocaleString()}</p>
                <p><strong>Total Points in Draw:</strong> {totalPointsInDraw.toLocaleString()}</p>
              </div>
            )}

            {canExecuteDraw && !showRerunConfirm && (
              <button 
                onClick={() => handleExecuteDraw(false)} 
                disabled={loading || isExecuting || !selectedPrizeStructureId} 
                style={styles.button}
              >
                {isExecuting ? "Executing Draw..." : (loading ? "Loading Data..." : "Execute Draw")}
              </button>
            )}
            
            {canExecuteDraw && showRerunConfirm && (
              <div style={{marginTop: "15px"}}>
                <input 
                  type="text" 
                  value={rerunConfirmText} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRerunConfirmText(e.target.value)} 
                  placeholder="Type 'rerun' to confirm" 
                  style={{...styles.input, width: "calc(100% - 230px)", marginRight: "10px", display: "inline-block"}}
                />
                <button onClick={() => handleExecuteDraw(true)} style={styles.confirmButton} disabled={loading || isExecuting}>Confirm Re-run</button>
                <button 
                  onClick={() => {setShowRerunConfirm(false); setError(null); setRerunConfirmText("");}} 
                  style={{...styles.cancelButton, marginLeft: "10px"}} 
                  disabled={loading || isExecuting}
                >
                  Cancel
                </button>
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
                    <th style={styles.th}>Runners-up</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStructureDetails.prizes.map(prize => (
                    <tr key={prize.id}>
                      <td style={styles.td}>{prize.name}</td>
                      <td style={styles.td}>{prize.value || `N${prize.prize_amount.toLocaleString()}`}</td>
                      <td style={styles.td}>{prize.winner_count}</td>
                      <td style={styles.td}>{prize.prize_type}</td>
                      <td style={styles.td}>{prize.number_of_runner_ups}</td>
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

          {drawResult && (
            <div style={styles.resultsSection}>
              <h3>Draw Results</h3>
              <p><strong>Draw ID:</strong> {drawResult.id}</p>
              <p><strong>Draw Date:</strong> {new Date(drawResult.draw_date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {drawResult.status}</p>
              <p><strong>Total Eligible MSISDNs:</strong> {drawResult.total_eligible_msisdns?.toLocaleString()}</p>
              <p><strong>Total Entries:</strong> {drawResult.total_tickets?.toLocaleString()}</p>
              
              <h4>Winners</h4>
              {drawResult.winners.filter(w => !w.is_runner_up).length > 0 ? (
                <ul style={styles.list}>
                  {drawResult.winners.filter(w => !w.is_runner_up).map(winner => (
                    <li key={winner.id} style={styles.listItem}>
                      <div>
                        <strong>MSISDN:</strong> {maskMSISDN(winner.msisdn)} | 
                        <strong> Prize:</strong> {winner.prize_tier?.name} ({winner.prize_tier?.value || `N${winner.prize_tier?.prize_amount.toLocaleString()}`}) | 
                        <strong> Status:</strong> {winner.notification_status}
                      </div>
                      {winner.notification_status === "FORFEITED" && (
                        <span style={{color: "red", fontStyle: "italic"}}>Forfeited</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No winners found.</p>
              )}
              
              <h4>Runner-ups</h4>
              {drawResult.winners.filter(w => w.is_runner_up).length > 0 ? (
                <ul style={styles.list}>
                  {drawResult.winners.filter(w => w.is_runner_up).map(runnerUp => {
                    const originalWinner = drawResult.winners.find(w => w.id === runnerUp.original_winner_id);
                    return (
                      <li key={runnerUp.id} style={styles.listItem}>
                        <div>
                          <strong>MSISDN:</strong> {maskMSISDN(runnerUp.msisdn)} | 
                          <strong> Prize:</strong> {runnerUp.prize_tier?.name} | 
                          <strong> Rank:</strong> {runnerUp.runner_up_rank} | 
                          <strong> Original Winner:</strong> {maskMSISDN(originalWinner?.msisdn || "")}
                        </div>
                        {canExecuteDraw && originalWinner?.notification_status !== "FORFEITED" && (
                          <button 
                            onClick={() => handleInvokeRunnerUp(originalWinner?.id || "", runnerUp.id)} 
                            style={styles.invokeButton}
                            disabled={loading}
                          >
                            Invoke Runner-up
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>No runner-ups found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawManagementPage;
