import { useState, useEffect, useRef, useCallback } from 'react';
import { Player, Team, Match, Innings } from '../types';
import {
  getPlayerStats,
  deliverBall,
  undoLastBall,
  swapBatsmen,
  retireHurt,
  selectStriker,
  selectNonStriker,
  selectBowler,
  replaceBatsman,
  endMatchManual,
  uid
} from '../utils/cricket';
import {
  fetchInitialData,
  savePlayer,
  removePlayer,
  saveTeam,
  removeTeam,
  saveMatch,
  removeMatch,
  resetDatabase
} from '../lib/api';
import { safeStorage } from '../utils/storage';

export function useCricketData(triggerToast: (message: string, type?: 'success' | 'warn' | 'info') => void) {
  const [isHydrated, setIsHydrated] = useState(() => {
    return safeStorage.getItem('cricket_players') !== null || safeStorage.getItem('cricket_teams') !== null || safeStorage.getItem('cricket_matches') !== null;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = safeStorage.getItem('cricket_players');
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return [];
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = safeStorage.getItem('cricket_teams');
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return [];
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = safeStorage.getItem('cricket_matches');
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return [];
  });

  const syncPlayers = (updated: Player[]) => { setPlayers(updated); safeStorage.setItem('cricket_players', JSON.stringify(updated)); };
  const syncTeams = (updated: Team[]) => { setTeams(updated); safeStorage.setItem('cricket_teams', JSON.stringify(updated)); };

  // ── Reliable match sync ──────────────────────────────────────────────
  // A match edited on THIS device stays authoritative until the server confirms
  // the save. Polling and the initial fetch never overwrite it, so scored runs
  // can't flicker back to zero when the backend is slow or briefly unavailable.
  // Failed saves are retried on every poll tick and persisted so a page reload
  // doesn't lose them either.
  const PENDING_KEY = 'cricket_pending_sync';
  const pendingSyncRef = useRef<Map<string, Match>>(new Map());
  const syncingRef = useRef<Set<string>>(new Set());
  const lastLocalSyncRef = useRef<Record<string, number>>({});
  const syncWarnedRef = useRef<Set<string>>(new Set());

  const persistPending = () => {
    try { safeStorage.setItem(PENDING_KEY, JSON.stringify(Array.from(pendingSyncRef.current.entries()))); }
    catch (e) { console.error('Error persisting pending sync:', e); }
  };

  useEffect(() => {
    const raw = safeStorage.getItem(PENDING_KEY);
    if (!raw) return;
    try {
      const entries: [string, Match][] = JSON.parse(raw);
      if (Array.isArray(entries)) {
        entries.forEach(([id, match]) => { if (match && match.id) pendingSyncRef.current.set(id, match); });
      }
    } catch (e) { safeStorage.removeItem(PENDING_KEY); }
  }, []);

  const syncMatches = (updated: Match[]) => {
    setMatches(prev => {
      const changedIds = updated
        .filter(nm => { const om = prev.find(p => p.id === nm.id); return !om || JSON.stringify(om) !== JSON.stringify(nm); })
        .map(nm => nm.id);
      if (changedIds.length) {
        const now = Date.now();
        changedIds.forEach(id => {
          const fresh = updated.find(u => u.id === id);
          if (fresh) pendingSyncRef.current.set(id, fresh);
          lastLocalSyncRef.current[id] = now;
        });
        persistPending();
      }
      safeStorage.setItem('cricket_matches', JSON.stringify(updated));
      return updated;
    });
  };

  const attemptSync = useCallback(async (id: string) => {
    const match = pendingSyncRef.current.get(id);
    if (!match || syncingRef.current.has(id)) return;
    syncingRef.current.add(id);
    try {
      await saveMatch(match);
      // Only clear when no newer local edit replaced this entry mid-save.
      if (pendingSyncRef.current.get(id) === match) {
        pendingSyncRef.current.delete(id);
        persistPending();
      }
      syncWarnedRef.current.delete(id);
    } catch (err) {
      console.error('Match sync failed (will retry):', err);
      if (!syncWarnedRef.current.has(id)) {
        syncWarnedRef.current.add(id);
        triggerToast('Connection issue — changes saved on this device. Retrying database sync...', 'warn');
      }
    } finally {
      syncingRef.current.delete(id);
    }
  }, [triggerToast]);

  const proxyMatches = (incoming: Match[]) => {
    setMatches(prev => {
      const incomingMap = new Map(incoming.map(m => [m.id, m]));
      const now = Date.now();
      const merged = prev.map(p => {
        const pendingLocal = pendingSyncRef.current.has(p.id);
        const freshSync = (lastLocalSyncRef.current[p.id] || 0) > now - 10000;
        if (pendingLocal || freshSync) return p;
        return incomingMap.get(p.id) ?? p;
      });
      const seen = new Set(merged.map(m => m.id));
      for (const im of incoming) {
        if (!seen.has(im.id)) { merged.push(im); seen.add(im.id); }
      }
      if (JSON.stringify(merged) === JSON.stringify(prev)) return prev;
      safeStorage.setItem('cricket_matches', JSON.stringify(merged));
      return merged;
    });
  };

  useEffect(() => {
    let active = true;
    const loadInitialData = async () => {
      try {
        const data = await fetchInitialData();
        if (!active) return;
        setPlayers(data.players); safeStorage.setItem('cricket_players', JSON.stringify(data.players));
        setTeams(data.teams); safeStorage.setItem('cricket_teams', JSON.stringify(data.teams));
        proxyMatches(data.matches);
      } catch (err) { console.error('Error fetching initial data from API:', err); }
      finally { setIsHydrated(true); }
    };
    loadInitialData();
    for (const id of Array.from(pendingSyncRef.current.keys())) {
      if (active) attemptSync(id);
    }
    // Render free-tier cold starts can take 20-30s. Never block the whole UI that long —
    // show cached/empty data after a short grace period so the user can interact immediately.
    const hydrationFallback = setTimeout(() => { if (active) setIsHydrated(true); }, 3000);
    const pollInterval = setInterval(async () => {
      // Retry any matches whose save hasn't reached the server yet.
      for (const id of Array.from(pendingSyncRef.current.keys())) {
        if (active) attemptSync(id);
      }
      try {
        const data = await fetchInitialData();
        if (!active) return;
        setPlayers(prev => { if (JSON.stringify(prev) === JSON.stringify(data.players)) return prev; safeStorage.setItem('cricket_players', JSON.stringify(data.players)); return data.players; });
        setTeams(prev => { if (JSON.stringify(prev) === JSON.stringify(data.teams)) return prev; safeStorage.setItem('cricket_teams', JSON.stringify(data.teams)); return data.teams; });
        proxyMatches(data.matches);
      } catch (_err) { /* silent */ }
    }, 3000);
    return () => { active = false; clearTimeout(hydrationFallback); clearInterval(pollInterval); };
  }, [attemptSync]);

  const handleAddPlayer = useCallback(async (pData: Omit<Player, 'id' | 'stats'>): Promise<boolean> => {
    const newPlayer: Player = { ...pData, id: uid(), stats: { matches: 0, runs: 0, balls: 0, wickets: 0, fifties: 0, hundreds: 0, fours: 0, sixes: 0 } };
    try {
      await savePlayer(newPlayer);
      syncPlayers([...players, newPlayer]);
      triggerToast(`Added player "${pData.name}" to the database`);
      return true;
    } catch (err) {
      console.error('Error saving new player:', err);
      triggerToast(`Could not save "${pData.name}" to the database. Please try again.`, 'warn');
      return false;
    }
  }, [players, triggerToast]);

  const handleEditPlayer = useCallback(async (id: string, pData: Omit<Player, 'id' | 'stats'>): Promise<boolean> => {
    const original = players.find(p => p.id === id);
    if (!original) return false;
    const updatedPlayer = { ...original, ...pData };
    try {
      await savePlayer(updatedPlayer);
      syncPlayers(players.map(p => (p.id === id ? updatedPlayer : p)));
      triggerToast(`Updated profile for "${pData.name}"`);
      return true;
    } catch (err) {
      console.error('Error updating player:', err);
      triggerToast(`Could not update "${pData.name}". Please try again.`, 'warn');
      return false;
    }
  }, [players, triggerToast]);

  const handleDeletePlayer = useCallback(async (id: string) => {
    const target = players.find(p => p.id === id);
    try {
      await removePlayer(id);
      syncPlayers(players.filter(p => p.id !== id));
      triggerToast(`Removed player "${target?.name || ''}" from the database`, 'warn');
    } catch (err) {
      console.error('Error removing player:', err);
      triggerToast(`Could not remove "${target?.name || 'player'}". Please try again.`, 'warn');
    }
  }, [players, triggerToast]);

  const handleAddTeam = useCallback(async (tData: Omit<Team, 'id'>): Promise<boolean> => {
    const newTeam: Team = { ...tData, id: uid() };
    try {
      await saveTeam(newTeam);
      syncTeams([...teams, newTeam]);
      triggerToast(`Created team "${tData.name}" in the database`);
      return true;
    } catch (err) {
      console.error('Error saving new team:', err);
      triggerToast(`Could not create team "${tData.name}". Please try again.`, 'warn');
      return false;
    }
  }, [teams, triggerToast]);

  const handleEditTeam = useCallback(async (id: string, tData: Omit<Team, 'id'>): Promise<boolean> => {
    const original = teams.find(t => t.id === id);
    if (!original) return false;
    const updatedTeam = { ...original, ...tData };
    try {
      await saveTeam(updatedTeam);
      syncTeams(teams.map(t => (t.id === id ? updatedTeam : t)));
      triggerToast(`Updated roster for "${tData.name}"`);
      return true;
    } catch (err) {
      console.error('Error updating team:', err);
      triggerToast(`Could not update "${tData.name}". Please try again.`, 'warn');
      return false;
    }
  }, [teams, triggerToast]);

  const handleDeleteTeam = useCallback(async (id: string) => {
    const target = teams.find(t => t.id === id);
    try {
      await removeTeam(id);
      syncTeams(teams.filter(t => t.id !== id));
      triggerToast(`Disbanded team "${target?.name || ''}"`, 'warn');
    } catch (err) {
      console.error('Error removing team:', err);
      triggerToast(`Could not disband "${target?.name || 'team'}". Please try again.`, 'warn');
    }
  }, [teams, triggerToast]);

  const handleDeleteMatch = useCallback(async (id: string) => {
    const target = matches.find(m => m.id === id);
    try {
      await removeMatch(id);
      pendingSyncRef.current.delete(id);
      persistPending();
      syncMatches(matches.filter(m => m.id !== id));
      triggerToast(`Deleted match: ${target?.team1Name} vs ${target?.team2Name}`, 'warn');
    } catch (err) {
      console.error('Error removing match:', err);
      triggerToast('Could not delete the match from the database. Please try again.', 'warn');
    }
  }, [matches, triggerToast]);

  const handleStartMatch = useCallback(async (config: {
    team1Id: string; team2Id: string; totalOvers: number; tossWinnerId: string; tossChoice: 'bat' | 'field';
    matchType: 'single' | 'tournament'; tournamentMatches?: number; tournamentName?: string; seriesId?: string; lastPlayerSolo: boolean;
  }): Promise<string> => {
    const t1 = teams.find(t => t.id === config.team1Id)!;
    const t2 = teams.find(t => t.id === config.team2Id)!;
    const batFirst = config.tossChoice === 'bat' ? (config.tossWinnerId === config.team1Id ? t1 : t2) : (config.tossWinnerId === config.team1Id ? t2 : t1);
    const fieldFirst = batFirst.id === t1.id ? t2 : t1;
    const createEmptyInnings = (): Innings => ({ runs: 0, wickets: 0, overs: 0, balls: 0, extras: { wide: 0, noBall: 0, bye: 0, legBye: 0 }, batting: [], bowling: [], overHistory: [], currentOver: [], striker: null, nonStriker: null, bowler: null, previousBowler: null, retiredHurt: [], history: [] });
    const newMatch: Match = {
      id: uid(), team1Id: t1.id, team2Id: t2.id, team1Name: t1.name, team2Name: t2.name,
      totalOvers: config.totalOvers, status: 'live', battingFirstId: batFirst.id, battingFirstName: batFirst.name,
      fieldingFirstId: fieldFirst.id, fieldingFirstName: fieldFirst.name, currentInnings: 1,
      innings: [createEmptyInnings(), createEmptyInnings()], createdAt: new Date().toISOString(), completedAt: null, result: '',
      matchType: config.matchType, tournamentMatches: config.tournamentMatches, tournamentName: config.tournamentName,
      seriesId: config.seriesId || (config.matchType === 'tournament' ? `series_${Date.now()}` : undefined),
      lastPlayerSolo: config.lastPlayerSolo
    };
    syncMatches([newMatch, ...matches]);
    attemptSync(newMatch.id);
    triggerToast('Match initiated! Configure striker & non-striker to begin.');
    return newMatch.id;
  }, [matches, triggerToast]);

  const handleDeliverBall = useCallback(async (activeMatchId: string, outcome: string, wicketDetail?: { type: 'Bowled' | 'Caught' | 'LBW' | 'Run Out' | 'Stumped' | 'Hit Wicket' | 'Retired'; bowlerId?: string; helperId?: string; outPlayerId?: string; runOutRuns?: number }) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = deliverBall(currentMatch, outcome, teams, wicketDetail);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    attemptSync(activeMatchId);
    if (outcome === 'W') { const typeStr = wicketDetail ? wicketDetail.type : 'Wicket'; triggerToast(`${typeStr} fallen!`, 'warn'); }
    else if (outcome === '4') triggerToast('Brilliant Boundary (4 runs!)');
    else if (outcome === '6') triggerToast('Colossal Six! (6 runs!)');
  }, [matches, teams, triggerToast]);

  const handleUndoLastBall = useCallback(async (activeMatchId: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = undoLastBall(currentMatch);
    if (updated) {
      syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
      attemptSync(activeMatchId);
      triggerToast('Last ball undone', 'info');
    } else { triggerToast('Nothing to undo', 'warn'); }
  }, [matches, triggerToast]);

  const handleSwapBatsmen = useCallback(async (activeMatchId: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = swapBatsmen(currentMatch);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    attemptSync(activeMatchId);
    triggerToast('Strike swapped');
  }, [matches, triggerToast]);

  const handleRetireHurt = useCallback(async (activeMatchId: string, pid: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = retireHurt(currentMatch, pid, teams);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    attemptSync(activeMatchId);
    triggerToast('Batter retired hurt', 'warn');
  }, [matches, teams, triggerToast]);

  const handleSelectStriker = useCallback(async (activeMatchId: string, pid: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = selectStriker(currentMatch, pid);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    attemptSync(activeMatchId);
  }, [matches]);

  const handleSelectNonStriker = useCallback(async (activeMatchId: string, pid: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = selectNonStriker(currentMatch, pid);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    attemptSync(activeMatchId);
  }, [matches]);

  const handleSelectBowler = useCallback(async (activeMatchId: string, pid: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = selectBowler(currentMatch, pid);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    attemptSync(activeMatchId);
    triggerToast('Bowler changed successfully!', 'success');
  }, [matches, triggerToast]);

  const handleReplaceBatsman = useCallback(async (activeMatchId: string, type: 'striker' | 'nonStriker', pid: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = replaceBatsman(currentMatch, type, pid);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    attemptSync(activeMatchId);
    triggerToast('Batsman changed successfully!', 'success');
  }, [matches, triggerToast]);

  const handleEndMatch = useCallback(async (activeMatchId: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = endMatchManual(currentMatch);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    attemptSync(activeMatchId);
    triggerToast('Match ended manually!', 'info');
  }, [matches, triggerToast]);

  const handleEndSeries = useCallback(async (seriesId: string) => {
    const updatedList = matches.map(m => m.seriesId === seriesId ? { ...m, seriesEnded: true } : m);
    syncMatches(updatedList);
    updatedList.filter(m => m.seriesId === seriesId).forEach(m => attemptSync(m.id));
    triggerToast('Series ended successfully!', 'success');
  }, [matches, triggerToast]);

  const handleResetData = useCallback(async () => {
    try {
      await resetDatabase();
      const data = await fetchInitialData();
      setPlayers(data.players); safeStorage.setItem('cricket_players', JSON.stringify(data.players));
      setTeams(data.teams); safeStorage.setItem('cricket_teams', JSON.stringify(data.teams));
      setMatches(data.matches); safeStorage.setItem('cricket_matches', JSON.stringify(data.matches));
      triggerToast('Database reset and seeded to Cloud & SafeStorage!', 'info');
    } catch (err) { console.error('Error resetting database:', err); triggerToast('Error resetting database. Please try again.', 'warn'); }
  }, [triggerToast]);

  const playersWithCalculatedStats = players.map(p => {
    const calc = getPlayerStats(p.id, matches);
    return { ...p, stats: { matches: calc.matches, runs: calc.runs, balls: calc.balls, wickets: calc.wickets, fifties: calc.fifties, hundreds: calc.hundreds, fours: calc.fours, sixes: calc.sixes } };
  });

  return {
    isHydrated,
    players, teams, matches, playersWithCalculatedStats,
    handleAddPlayer, handleEditPlayer, handleDeletePlayer,
    handleAddTeam, handleEditTeam, handleDeleteTeam,
    handleDeleteMatch, handleStartMatch,
    handleDeliverBall, handleUndoLastBall, handleSwapBatsmen, handleRetireHurt,
    handleSelectStriker, handleSelectNonStriker, handleSelectBowler,
    handleReplaceBatsman, handleEndMatch, handleEndSeries, handleResetData,
  };
}
