import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { prizeStructureService } from "../services/prizeStructureService";
import type { PrizeStructureData } from "../services/prizeStructureService";
import { drawService } from "../services/drawService";
import type { ExecuteDrawRequestData, DrawData } from "../services/drawService";

// Basic styling for now, can be moved to CSS modules or a UI library
const styles = {
  container: { padding: "20px", fontFamily: "Arial, sans-serif" },
  formSection: { marginBottom: "30px", padding: "20px", border: "1px solid #eee", borderRadius: "8px" },
  label: { display: "block", marginBottom: "5px", fontWeight: "bold" },
  input: { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" as "border-box" },
  select: { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" as "border-box" }, 
  button: { padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px" },
  error: { color: "red", marginBottom: "15px" },
  resultsSection: { marginTop: "30px", padding: "20px", border: "1px solid #eee", borderRadius: "8px" },
  winnerList: { listStyleType: "none", paddingLeft: 0 },
  winnerItem: { marginBottom: "8px", padding: "8px", backgroundColor: "#f9f9f9", borderRadius: "4px" },
  animationPlaceholder: {
    width: "100%",
    height: "150px",
    backgroundColor: "#222",
    color: "yellow",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center" as "center",
    fontSize: "20px",
  },
};

const DrawManagementPage: React.FC = () => {
  const { token } = useAuth();
  const [drawDate, setDrawDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [prizeStructures, setPrizeStructures] = useState<PrizeStructureData[]>([]);
  const [selectedPrizeStructureId, setSelectedPrizeStructureId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [drawResult, setDrawResult] = useState<DrawData | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false); // For animation

  useEffect(() => {
    const fetchPrizeStructures = async () => {
      if (token) {
        try {
          setLoading(true);
          const structures = await prizeStructureService.listPrizeStructures(token);
          // Filter for active structures suitable for new draws
          setPrizeStructures(structures.filter(s => s.isActive && new Date(s.validFrom) <= new Date() && (!s.validTo || new Date(s.validTo) >= new Date())));
          if (structures.length > 0) {
            const activeValidStructures = structures.filter(s => s.isActive && new Date(s.validFrom) <= new Date() && (!s.validTo || new Date(s.validTo) >= new Date()));
            if (activeValidStructures.length > 0 && activeValidStructures[0].id) {
                 setSelectedPrizeStructureId(activeValidStructures[0].id);
            }
          }
          setError(null);
        } catch (err: any) {
          setError(err.message || "Failed to load prize structures.");
        }
        setLoading(false);
      }
    };
    fetchPrizeStructures();
  }, [token]);

  const handleExecuteDraw = async () => {
    if (!selectedPrizeStructureId || !drawDate) {
      setError("Please select a draw date and a prize structure.");
      return;
    }
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return;
    }

    setLoading(true);
    setIsExecuting(true);
    setError(null);
    setDrawResult(null);

    const requestData: ExecuteDrawRequestData = {
      drawDate: new Date(drawDate).toISOString(), // Ensure it"s full ISO string for backend
      prizeStructureID: selectedPrizeStructureId,
    };

    // Simulate animation delay
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds animation

    try {
      const result = await drawService.executeDraw(requestData, token);
      setDrawResult(result.draw);
    } catch (err: any) {
      setError(err.message || "Failed to execute draw.");
    }
    setIsExecuting(false);
    setLoading(false);
  };
  
  const maskMSISDN = (msisdn: string) => {
    if (msisdn && msisdn.length > 5) {
        return `${msisdn.substring(0, 2)}*****${msisdn.substring(msisdn.length - 3)}`;
    }
    return msisdn; // or some other placeholder if too short
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
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="prizeStructure" style={styles.label}>Prize Structure:</label>
          <select 
            id="prizeStructure" 
            value={selectedPrizeStructureId} 
            onChange={(e) => setSelectedPrizeStructureId(e.target.value)} 
            style={styles.select}
            disabled={loading || prizeStructures.length === 0}
          >
            <option value="">{prizeStructures.length === 0 ? "No active structures found" : "Select a Prize Structure"}</option>
            {prizeStructures.map(ps => (
              ps.id && <option key={ps.id} value={ps.id}>{ps.name} (Valid: {new Date(ps.validFrom).toLocaleDateString()}{ps.validTo ? ` - ${new Date(ps.validTo).toLocaleDateString()}` : ""})</option>
            ))}
          </select>
        </div>
        <button onClick={handleExecuteDraw} disabled={loading || isExecuting} style={styles.button}>
          {isExecuting ? "Executing..." : (loading ? "Loading..." : "Execute Draw")}
        </button>
      </div>

      {isExecuting && (
        <div style={styles.animationPlaceholder}>
          <p>Drawing Jackpot Winner...</p>
          {/* Simple text animation or replace with a GIF/SVG animation later */}
          <p>Selecting winners...</p>
        </div>
      )}

      {drawResult && !isExecuting && (
        <div style={styles.resultsSection}>
          <h2>Draw Results (ID: {drawResult.id})</h2>
          <p><strong>Status:</strong> {drawResult.status}</p>
          <p><strong>Total Eligible MSISDNs:</strong> {drawResult.totalEligibleMSISDNs}</p>
          <p><strong>Total Entries:</strong> {drawResult.totalEntries}</p>
          <h3>Winners (Masked for Livestream)</h3>
          {drawResult.winners && drawResult.winners.length > 0 ? (
            <ul style={styles.winnerList}>
              {drawResult.winners.map(winner => (
                <li key={winner.id} style={styles.winnerItem}>
                  <strong>MSISDN:</strong> {maskMSISDN(winner.msisdn)} <br />
                  <strong>Prize:</strong> {winner.prizeTier?.name} (Value: {winner.prizeTier?.valueNGN} NGN)
                </li>
              ))}
            </ul>
          ) : (
            <p>No winners selected for this draw (this might indicate an issue or insufficient participants).</p>
          )}
          <p><em>Full winner details are available in the secure admin winner list.</em></p>
        </div>
      )}
    </div>
  );
};

export default DrawManagementPage;

