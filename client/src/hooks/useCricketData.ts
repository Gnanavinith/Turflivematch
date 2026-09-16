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
  const [isHydrated, setIsHydrated] = useState(false);

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
  const syncMatches = (updated: Match[]) => { setMatches(updated); safeStorage.setItem('cricket_matches', JSON.stringify(updated)); };

  useEffect(() => {
    let active = true;
    const loadInitialData = async () => {
      try {
        const data = await fetchInitialData();
        if (!active) return;
        setPlayers(data.players); safeStorage.setItem('cricket_players', JSON.stringify(data.players));
        setTeams(data.teams); safeStorage.setItem('cricket_teams', JSON.stringify(data.teams));
        setMatches(data.matches); safeStorage.setItem('cricket_matches', JSON.stringify(data.matches));
      } catch (err) { console.error('Error fetching initial data from API:', err); }
      finally { setIsHydrated(true); }
    };
    loadInitialData();
    const pollInterval = setInterval(async () => {
      try {
        const data = await fetchInitialData();
        if (!active) return;
        setPlayers(prev => { if (JSON.stringify(prev) === JSON.stringify(data.players)) return prev; safeStorage.setItem('cricket_players', JSON.stringify(data.players)); return data.players; });
        setTeams(prev => { if (JSON.stringify(prev) === JSON.stringify(data.teams)) return prev; safeStorage.setItem('cricket_teams', JSON.stringify(data.teams)); return data.teams; });
        setMatches(prev => { if (JSON.stringify(prev) === JSON.stringify(data.matches)) return prev; safeStorage.setItem('cricket_matches', JSON.stringify(data.matches)); return data.matches; });
      } catch (_err) { /* silent */ }
    }, 3000);
    return () => { active = false; clearInterval(pollInterval); };
  }, []);

  const handleAddPlayer = useCallback(async (pData: Omit<Player, 'id' | 'stats'>) => {
    const newPlayer: Player = { ...pData, id: uid(), stats: { matches: 0, runs: 0, balls: 0, wickets: 0, fifties: 0, hundreds: 0, fours: 0, sixes: 0 } };
    syncPlayers([...players, newPlayer]);
    try { await savePlayer(newPlayer); } catch (err) { console.error('Error saving new player:', err); }
    triggerToast(`Added player "${pData.name}"`);
  }, [players, triggerToast]);

  const handleEditPlayer = useCallback(async (id: string, pData: Omit<Player, 'id' | 'stats'>) => {
    const original = players.find(p => p.id === id);
    if (!original) return;
    const updatedPlayer = { ...original, ...pData };
    syncPlayers(players.map(p => (p.id === id ? updatedPlayer : p)));
    try { await savePlayer(updatedPlayer); } catch (err) { console.error('Error updating player:', err); }
    triggerToast(`Updated profile for "${pData.name}"`);
  }, [players, triggerToast]);

  const handleDeletePlayer = useCallback(async (id: string) => {
    const target = players.find(p => p.id === id);
    syncPlayers(players.filter(p => p.id !== id));
    try { await removePlayer(id); } catch (err) { console.error('Error removing player:', err); }
    triggerToast(`Removed player "${target?.name || ''}"`, 'warn');
  }, [players, triggerToast]);

  const handleAddTeam = useCallback(async (tData: Omit<Team, 'id'>) => {
    const newTeam: Team = { ...tData, id: uid() };
    syncTeams([...teams, newTeam]);
    try { await saveTeam(newTeam); } catch (err) { console.error('Error saving new team:', err); }
    triggerToast(`Created team "${tData.name}"`);
  }, [teams, triggerToast]);

  const handleEditTeam = useCallback(async (id: string, tData: Omit<Team, 'id'>) => {
    const original = teams.find(t => t.id === id);
    if (!original) return;
    const updatedTeam = { ...original, ...tData };
    syncTeams(teams.map(t => (t.id === id ? updatedTeam : t)));
    try { await saveTeam(updatedTeam); } catch (err) { console.error('Error updating team:', err); }
    triggerToast(`Updated roster for "${tData.name}"`);
  }, [teams, triggerToast]);

  const handleDeleteTeam = useCallback(async (id: string) => {
    const target = teams.find(t => t.id === id);
    syncTeams(teams.filter(t => t.id !== id));
    try { await removeTeam(id); } catch (err) { console.error('Error removing team:', err); }
    triggerToast(`Disbanded team "${target?.name || ''}"`, 'warn');
  }, [teams, triggerToast]);

  const handleDeleteMatch = useCallback(async (id: string) => {
    const target = matches.find(m => m.id === id);
    syncMatches(matches.filter(m => m.id !== id));
    try { await removeMatch(id); } catch (err) { console.error('Error removing match:', err); }
    triggerToast(`Deleted match: ${target?.team1Name} vs ${target?.team2Name}`, 'warn');
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
    try { await saveMatch(newMatch); } catch (err) { console.error('Error starting match:', err); }
    triggerToast('Match initiated! Configure striker & non-striker to begin.');
    return newMatch.id;
  }, [matches, triggerToast]);

  const handleDeliverBall = useCallback(async (activeMatchId: string, outcome: string, wicketDetail?: { type: 'Bowled' | 'Caught' | 'LBW' | 'Run Out' | 'Stumped' | 'Hit Wicket' | 'Retired'; bowlerId?: string; helperId?: string; outPlayerId?: string; runOutRuns?: number }) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = deliverBall(currentMatch, outcome, teams, wicketDetail);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    try { await saveMatch(updated); } catch (err) { console.error('Error delivering ball:', err); }
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
      try { await saveMatch(updated); } catch (err) { console.error('Error undoing ball:', err); }
      triggerToast('Last ball undone', 'info');
    } else { triggerToast('Nothing to undo', 'warn'); }
  }, [matches, triggerToast]);

  const handleSwapBatsmen = useCallback(async (activeMatchId: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = swapBatsmen(currentMatch);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    try { await saveMatch(updated); } catch (err) { console.error('Error swapping batsmen:', err); }
    triggerToast('Strike swapped');
  }, [matches, triggerToast]);

  const handleRetireHurt = useCallback(async (activeMatchId: string, pid: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = retireHurt(currentMatch, pid, teams);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    try { await saveMatch(updated); } catch (err) { console.error('Error retiring batsman:', err); }
    triggerToast('Batter retired hurt', 'warn');
  }, [matches, teams, triggerToast]);

  const handleSelectStriker = useCallback(async (activeMatchId: string, pid: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = selectStriker(currentMatch, pid);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    try { await saveMatch(updated); } catch (err) { console.error('Error selecting striker:', err); }
  }, [matches]);

  const handleSelectNonStriker = useCallback(async (activeMatchId: string, pid: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = selectNonStriker(currentMatch, pid);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    try { await saveMatch(updated); } catch (err) { console.error('Error selecting non-striker:', err); }
  }, [matches]);

  const handleSelectBowler = useCallback(async (activeMatchId: string, pid: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = selectBowler(currentMatch, pid);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    try { await saveMatch(updated); } catch (err) { console.error('Error selecting bowler:', err); }
    triggerToast('Bowler changed successfully!', 'success');
  }, [matches, triggerToast]);

  const handleReplaceBatsman = useCallback(async (activeMatchId: string, type: 'striker' | 'nonStriker', pid: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = replaceBatsman(currentMatch, type, pid);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    try { await saveMatch(updated); } catch (err) { console.error('Error replacing batsman:', err); }
    triggerToast('Batsman changed successfully!', 'success');
  }, [matches, triggerToast]);

  const handleEndMatch = useCallback(async (activeMatchId: string) => {
    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;
    const updated = endMatchManual(currentMatch);
    syncMatches(matches.map(m => (m.id === activeMatchId ? updated : m)));
    try { await saveMatch(updated); } catch (err) { console.error('Error ending match:', err); }
    triggerToast('Match ended manually!', 'info');
  }, [matches, triggerToast]);

  const handleEndSeries = useCallback(async (seriesId: string) => {
    const updatedList = matches.map(m => m.seriesId === seriesId ? { ...m, seriesEnded: true } : m);
    syncMatches(updatedList);
    for (const m of updatedList.filter(m => m.seriesId === seriesId)) { try { await saveMatch(m); } catch (err) { console.error('Error ending series:', err); } }
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
