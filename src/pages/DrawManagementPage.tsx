// src/pages/DrawManagementPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { prizeStructureService } from "../services/prizeStructureService";
import { drawService } from "../services/drawService";
import type { DrawData as ServiceDrawData } from "../services/drawService";

// Matches backend models.Prize (PrizeTier)
export interface PrizeTierData {
  id: string; // uuid
  name: string;
  prizeType: string;
  prizeAmount: number | string;
  prizeDescription?: string;
  winnerCount: number;
  sortOrder: number;
  numberOfRunnerUps: number;
  value?: string;
  valueNGN?: number;
}

// Matches backend models.PrizeStructure
export interface PrizeStructureData {
  id: string; // uuid
  name: string;
  description?: string;
  isActive: boolean;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  prizes: PrizeTierData[];
  createdAt: string;
  applicableDays?: string[];
}

// Matches backend models.DrawWinner
export interface DrawWinnerData {
  id: string; // uuid
  drawId: string;
  prizeId: string;
  prizeTier: string | PrizeTierData;
  msisdn: string;
  isRunnerUp: boolean;
  runnerUpRank?: number;
  selectionOrderInTier?: number;
  originalWinnerId?: string;
  notificationStatus: string;
  paymentStatus: string;
  paymentRemarks?: string;
  createdAt: string;
}

// Matches backend models.Draw
export interface DrawData {
  id: string; // uuid
  drawDate: string;
  executedByAdminId?: string;
  prizeStructureId: string;
  prizeStructure?: PrizeStructureData;
  status: string;
  totalEligibleMsisdns?: number;
  totalTickets?: number;
  executionType: string;
  winners: DrawWinnerData[];
  createdAt: string;
}

// Function to convert from service DrawData to page DrawData
const convertServiceDrawToPageDraw = (serviceDraw: ServiceDrawData): DrawData => {
  return {
    id: serviceDraw.id,
    drawDate: serviceDraw.drawDate,
    executedByAdminId: serviceDraw.executedByAdminID,
    prizeStructureId: serviceDraw.prizeStructureId || "", // Fixed property name
    prizeStructure: serviceDraw.prizeStructure || undefined, // Fixed property name
    status: serviceDraw.status,
    totalEligibleMsisdns: serviceDraw.totalEligibleMSISDNs,
    totalTickets: serviceDraw.totalEntries,
    executionType: "MANUAL", // Default value if not provided
    winners: serviceDraw.winners?.map(w => ({
      id: w.id,
      drawId: w.drawId || w.drawID || "", // Support both property names
      prizeId: w.prizeTierId || w.prizeTierID || "", // Support both property names
      prizeTier: w.prizeTier || w.prizeTierName || "", // Support both property names
      msisdn: w.msisdn,
      isRunnerUp: w.isRunnerUp || false, // Default value
      notificationStatus: w.status,
      paymentStatus: w.paymentStatus || "PENDING",
      paymentRemarks: w.paymentNotes,
      createdAt: w.createdAt
    })) || [],
    createdAt: serviceDraw.createdAt
  };
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  mainContent: {
    display: "flex",
    flexDirection: "row" as "row",
    gap: "20px"
  },
  leftPanel: {
    flex: 2,
    minWidth: "400px"
  },
  rightPanel: {
    flex: 3,
    minWidth: "500px"
  },
  formSection: {
    marginBottom: "20px",
    padding: "20px",
    border: "1px solid #eee",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9"
  },
  infoSection: {
    marginBottom: "20px",
    padding: "15px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#e0f7fa"
  },
  prizeBreakdownSection: {
    padding: "15px",
    border: "1px solid #dcedc8",
    borderRadius: "8px",
    backgroundColor: "#f1f8e9",
    marginBottom: "20px"
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box" as "border-box"
  },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box" as "border-box"
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    marginRight: "10px"
  },
  confirmButton: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px"
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px"
  },
  invokeButton: {
    padding: "8px 12px",
    backgroundColor: "#ffc107",
    color: "black",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    marginLeft: "10px"
  },
  error: {
    color: "red",
    marginBottom: "15px"
  },
  warning: {
    color: "orange",
    marginBottom: "15px",
    padding: "10px",
    border: "1px solid orange",
    borderRadius: "4px",
    backgroundColor: "#fff3e0"
  },
  resultsSection: {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #eee",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9"
  },
  list: {
    listStyleType: "none",
    paddingLeft: 0
  },
  listItem: {
    marginBottom: "8px",
    padding: "10px",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "4px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
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
  prizeTierTable: {
    width: "100%",
    borderCollapse: "collapse" as "collapse",
    marginTop: "10px"
  },
  th: {
    border: "1px solid #ddd",
    padding: "8px",
    backgroundColor: "#f2f2f2",
    textAlign: "left" as "left"
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px"
  },
  totalPot: {
    fontWeight: "bold",
    marginTop: "10px",
    fontSize: "1.1em"
  }
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
        const structures = await prizeStructureService.listPrizeStructures(token || "");
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
          isActive: s.isActive,
          effectiveStartDate: s.validFrom,
          effectiveEndDate: s.validTo || undefined,
          prizes: (s.prizes || []).map(pt => ({
            id: pt.id || "",
            name: pt.name,
            prizeType: pt.prizeType,
            prizeAmount: pt.valueNGN || 0,
            winnerCount: pt.quantity,
            sortOrder: pt.order,
            numberOfRunnerUps: pt.numberOfRunnerUps || 2, // Default value
            value: pt.value || `N${pt.valueNGN?.toLocaleString() || 0}`
          })),
          createdAt: s.createdAt || new Date().toISOString(),
          applicableDays: s.applicableDays
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
    return availablePrizeStructures.find(ps => ps.id === selectedPrizeStructureId);
  }, [availablePrizeStructures, selectedPrizeStructureId]);

  const totalPrizeValue = useMemo(() => {
    if (!selectedStructureDetails) return 0;
    return selectedStructureDetails.prizes.reduce((total, prize) => {
      const amount = typeof prize.prizeAmount === 'string' 
        ? parseFloat(prize.prizeAmount.replace(/[^0-9.]/g, '')) || 0
        : prize.prizeAmount;
      return total + (amount * prize.winnerCount);
    }, 0);
  }, [selectedStructureDetails]);

  const handleDrawDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDrawDate(e.target.value);
  };

  const handlePrizeStructureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPrizeStructureId(e.target.value);
  };

  const handleCheckEligibility = async () => {
    if (!selectedPrizeStructureId) {
      setError("Please select a prize structure first");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Get eligibility stats from the API
      const stats = await drawService.getDrawEligibilityStats(drawDate, token || "");
      
      setEligibleParticipantsCount(stats.totalEligibleMSISDNs);
      setTotalPointsInDraw(stats.totalEntries);
      setSuccessMessage(`Found ${stats.totalEligibleMSISDNs.toLocaleString()} eligible participants with ${stats.totalEntries.toLocaleString()} total points`);
    } catch (err: any) {
      setError("Failed to check eligibility: " + (err.message || "Unknown error"));
    }
    setLoading(false);
  };

  const handleExecuteDraw = async () => {
    if (!selectedPrizeStructureId) {
      setError("Please select a prize structure first");
      return;
    }

    if (!canExecuteDraw) {
      setError("You do not have permission to execute draws");
      return;
    }

    if (eligibleParticipantsCount === 0) {
      setError("Please check eligibility first");
      return;
    }

    setIsExecuting(true);
    setError(null);
    try {
      // Call the draw service to execute the draw
      const drawData = await drawService.executeDraw(drawDate, selectedPrizeStructureId, token || "");
      
      // Handle the response correctly
      if (drawData) {
        // Convert service data to page data format
        const pageDrawData = convertServiceDrawToPageDraw(drawData);
        setDrawResult(pageDrawData);
        setSuccessMessage(drawData.message || "Draw executed successfully");
      } else {
        throw new Error("Invalid response from draw service");
      }
    } catch (err: any) {
      setError("Failed to execute draw: " + (err.message || "Unknown error"));
    }
    setIsExecuting(false);
  };

  const handleRerunDraw = () => {
    setShowRerunConfirm(true);
  };

  const confirmRerun = async () => {
    if (rerunConfirmText !== "RERUN") {
      setError("Please type RERUN to confirm");
      return;
    }

    setIsExecuting(true);
    setError(null);
    try {
      // Call the draw service to re-execute the draw
      const drawData = await drawService.executeDraw(drawDate, selectedPrizeStructureId, token || "");
      
      // Handle the response correctly
      if (drawData) {
        // Convert service data to page data format
        const pageDrawData = convertServiceDrawToPageDraw(drawData);
        setDrawResult(pageDrawData);
        setSuccessMessage(drawData.message || "Draw re-executed successfully");
        setShowRerunConfirm(false);
        setRerunConfirmText("");
      } else {
        throw new Error("Invalid response from draw service");
      }
    } catch (err: any) {
      setError("Failed to re-execute draw: " + (err.message || "Unknown error"));
    }
    setIsExecuting(false);
  };

  const cancelRerun = () => {
    setShowRerunConfirm(false);
    setRerunConfirmText("");
  };

  const handleInvokeRunnerUp = async (winnerId: string) => {
    if (!winnerId) return;
    
    if (!window.confirm("Are you sure you want to invoke a runner-up for this winner? This action cannot be undone.")) {
      return;
    }
    
    setLoading(true);
    try {
      // Use the correct API method for invoking runner-ups
      await drawService.invokeRunnerUp(winnerId, token || "");
      
      // Refresh the draw result
      if (drawResult?.id) {
        // Use the correct API method for getting draw details
        const updatedDraw = await drawService.getDrawById(drawResult.id, token || "");
        if (updatedDraw) {
          const pageDrawData = convertServiceDrawToPageDraw(updatedDraw);
          setDrawResult(pageDrawData);
        }
      }
      
      setSuccessMessage("Runner-up invoked successfully");
    } catch (err: any) {
      setError("Failed to invoke runner-up: " + (err.message || "Unknown error"));
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2>Draw Management</h2>
      
      {error && <div style={styles.error}>{error}</div>}
      {successMessage && <div style={styles.infoSection}>{successMessage}</div>}
      
      <div style={styles.mainContent}>
        <div style={styles.leftPanel}>
          <div style={styles.formSection}>
            <h3>Draw Setup</h3>
            
            <label style={styles.label} htmlFor="drawDate">Draw Date:</label>
            <input
              id="drawDate"
              type="date"
              value={drawDate}
              onChange={handleDrawDateChange}
              style={styles.input}
              disabled={isExecuting}
            />
            
            <label style={styles.label} htmlFor="prizeStructure">Prize Structure:</label>
            <select
              id="prizeStructure"
              value={selectedPrizeStructureId}
              onChange={handlePrizeStructureChange}
              style={styles.select}
              disabled={isExecuting || loading}
            >
              <option value="">-- Select Prize Structure --</option>
              {availablePrizeStructures.map(ps => (
                <option key={ps.id} value={ps.id}>
                  {ps.name} ({ps.applicableDays?.join(', ')})
                </option>
              ))}
            </select>
            
            <button
              onClick={handleCheckEligibility}
              style={styles.button}
              disabled={!selectedPrizeStructureId || isExecuting || loading}
            >
              Check Eligibility
            </button>
          </div>
          
          {selectedStructureDetails && (
            <div style={styles.prizeBreakdownSection}>
              <h3>Prize Structure Details</h3>
              <p><strong>Name:</strong> {selectedStructureDetails.name}</p>
              <p><strong>Description:</strong> {selectedStructureDetails.description}</p>
              <p><strong>Applicable Days:</strong> {selectedStructureDetails.applicableDays?.join(', ') || 'All days'}</p>
              
              <h4>Prize Tiers:</h4>
              <table style={styles.prizeTierTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>Prize</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Value</th>
                    <th style={styles.th}>Winners</th>
                    <th style={styles.th}>Runner-ups</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStructureDetails.prizes.map((prize, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{prize.name}</td>
                      <td style={styles.td}>{prize.prizeType}</td>
                      <td style={styles.td}>{prize.value || `N${prize.prizeAmount}`}</td>
                      <td style={styles.td}>{prize.winnerCount}</td>
                      <td style={styles.td}>{prize.numberOfRunnerUps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <p style={styles.totalPot}>
                Total Prize Pot: N{totalPrizeValue.toLocaleString()}
              </p>
            </div>
          )}
        </div>
        
        <div style={styles.rightPanel}>
          <div style={styles.formSection}>
            <h3>Eligibility Check</h3>
            
            {eligibleParticipantsCount > 0 ? (
              <>
                <p><strong>Eligible Participants:</strong> {eligibleParticipantsCount.toLocaleString()}</p>
                <p><strong>Total Points in Draw:</strong> {totalPointsInDraw.toLocaleString()}</p>
                
                {canExecuteDraw && (
                  <button
                    onClick={handleExecuteDraw}
                    style={styles.confirmButton}
                    disabled={isExecuting || loading}
                  >
                    {isExecuting ? "Executing Draw..." : "Execute Draw"}
                  </button>
                )}
                
                {!canExecuteDraw && (
                  <p style={styles.warning}>
                    Only Super Admins can execute draws. Please contact a Super Admin to execute this draw.
                  </p>
                )}
              </>
            ) : (
              <p>Click "Check Eligibility" to see how many participants are eligible for this draw.</p>
            )}
          </div>
          
          {isExecuting && (
            <div style={styles.animationPlaceholder}>
              <p>Executing Draw...</p>
              <p>Selecting winners from {eligibleParticipantsCount.toLocaleString()} participants</p>
            </div>
          )}
          
          {drawResult && !isExecuting && (
            <div style={styles.resultsSection}>
              <h3>Draw Results</h3>
              <p><strong>Draw ID:</strong> {drawResult.id}</p>
              <p><strong>Draw Date:</strong> {new Date(drawResult.drawDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {drawResult.status}</p>
              
              <h4>Winners:</h4>
              <ul style={styles.list}>
                {drawResult.winners.map((winner, index) => (
                  <li key={index} style={styles.listItem}>
                    <div>
                      <strong>MSISDN:</strong> {winner.msisdn} <br />
                      <strong>Prize:</strong> {typeof winner.prizeTier === 'string' ? winner.prizeTier : winner.prizeTier.name} <br />
                      <strong>Status:</strong> {winner.paymentStatus}
                    </div>
                    <div>
                      {winner.paymentStatus !== "PAID" && winner.paymentStatus !== "FORFEITED" && (
                        <button
                          onClick={() => handleInvokeRunnerUp(winner.id)}
                          style={styles.invokeButton}
                          disabled={loading}
                        >
                          Invoke Runner-up
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              
              {canExecuteDraw && (
                <button
                  onClick={handleRerunDraw}
                  style={styles.cancelButton}
                  disabled={isExecuting || loading}
                >
                  Re-run Draw
                </button>
              )}
              
              {showRerunConfirm && (
                <div style={styles.warning}>
                  <p><strong>Warning:</strong> Re-running the draw will invalidate all current winners and select new ones.</p>
                  <p>Type "RERUN" to confirm:</p>
                  <input
                    type="text"
                    value={rerunConfirmText}
                    onChange={(e) => setRerunConfirmText(e.target.value)}
                    style={styles.input}
                  />
                  <button
                    onClick={confirmRerun}
                    style={styles.confirmButton}
                    disabled={rerunConfirmText !== "RERUN"}
                  >
                    Confirm Re-run
                  </button>
                  <button
                    onClick={cancelRerun}
                    style={styles.button}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawManagementPage;
