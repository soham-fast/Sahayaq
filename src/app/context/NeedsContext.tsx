/**
 * NeedsContext – shared state for community-reported needs.
 * Reports created via AddReportScreen flow into the map + dashboard.
 */
import React, { createContext, useContext, useState, useEffect } from "react";

export type NeedCategory = "Food" | "Health" | "Education" | "Shelter" | "Water" | "Mental Health" | "Logistics" | "Other";
export type NeedUrgency  = "Low" | "Medium" | "High" | "Critical";

export interface Need {
  id: string;
  category: NeedCategory;
  urgency: NeedUrgency;
  affected: number;
  location: string;
  needs: string[];
  summary: string;
  volunteersNeeded: number;
  confidence: number;
  action: string;
  rawText: string;
  createdAt: string;
  status: "open" | "in-progress" | "resolved";
  addedToMap: boolean;
}

interface NeedsCtx {
  needs: Need[];
  addNeed: (need: Need) => void;
  updateNeedStatus: (id: string, status: Need["status"]) => void;
  totalAffected: number;
  openCount: number;
}

const Ctx = createContext<NeedsCtx>({
  needs: [], addNeed: () => {}, updateNeedStatus: () => {},
  totalAffected: 0, openCount: 0,
});

export function NeedsProvider({ children }: { children: React.ReactNode }) {
  const [needs, setNeeds] = useState<Need[]>(() => {
    try {
      const saved = localStorage.getItem("sahayaq_needs");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("sahayaq_needs", JSON.stringify(needs));
  }, [needs]);

  const addNeed = (need: Need) => setNeeds(p => [need, ...p]);

  const updateNeedStatus = (id: string, status: Need["status"]) =>
    setNeeds(p => p.map(n => n.id === id ? { ...n, status } : n));

  const totalAffected = needs.reduce((s, n) => s + n.affected, 0);
  const openCount     = needs.filter(n => n.status === "open").length;

  return (
    <Ctx.Provider value={{ needs, addNeed, updateNeedStatus, totalAffected, openCount }}>
      {children}
    </Ctx.Provider>
  );
}

export const useNeeds = () => useContext(Ctx);
