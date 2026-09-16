import { useState, useEffect, useRef, useCallback } from 'react';
import { Match } from '../types';

export type ViewType = 'home' | 'players' | 'teams' | 'db' | 'history' | 'live' | 'dash' | 'detail' | 'login';

export interface NewMatchPrefill {
  team1Id: string;
  team2Id: string;
  matchType: 'single' | 'tournament';
  tournamentMatches?: number;
  tournamentName?: string;
  seriesId?: string;
}

export function useNavigation(matches: Match[], triggerToast: (message: string, type?: 'success' | 'warn' | 'info') => void) {
  const [view, setView] = useState<ViewType>('home');
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [activeScorecardId, setActiveScorecardId] = useState<string | null>(null);
  const [hasManuallyExited, setHasManuallyExited] = useState<boolean>(false);
  const [isNewMatchOpen, setIsNewMatchOpen] = useState(false);
  const [newMatchPrefill, setNewMatchPrefill] = useState<NewMatchPrefill | null>(null);
  const [isResetConfirming, setIsResetConfirming] = useState(false);

  const hasSetLiveMatchOnInit = useRef(false);

  useEffect(() => {
    if (!hasManuallyExited && !hasSetLiveMatchOnInit.current) {
      const liveMatch = matches.find(m => m.status === 'live');
      if (liveMatch) {
        hasSetLiveMatchOnInit.current = true;
        setActiveMatchId(liveMatch.id);
        setView('live');
      }
    }
  }, [matches, hasManuallyExited]);

  const initialLoadRef = useRef(true);
  useEffect(() => {
    if (!initialLoadRef.current) return;
    initialLoadRef.current = false;
    const params = new URLSearchParams(window.location.search);
    const urlMatchId = params.get('matchId');
    const urlScorecardId = params.get('scorecardId');
    const urlView = params.get('view') as ViewType | null;
    if (urlMatchId) {
      setHasManuallyExited(false);
      setActiveMatchId(urlMatchId);
      setView('live');
    } else if (urlScorecardId) {
      setActiveScorecardId(urlScorecardId);
      setView('detail');
    } else if (urlView) {
      setView(urlView);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (view === 'live' && activeMatchId) params.set('matchId', activeMatchId);
    else if (view === 'detail' && activeScorecardId) params.set('scorecardId', activeScorecardId);
    else if (view !== 'home') params.set('view', view);
    const queryString = params.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [view, activeMatchId, activeScorecardId]);

  useEffect(() => {
    if (view === 'home' && !activeMatchId && !activeScorecardId && !hasManuallyExited) {
      const liveMatch = matches.find(m => m.status === 'live');
      if (liveMatch) {
        setActiveMatchId(liveMatch.id);
        setView('live');
        triggerToast(`Spectator Mode: Loaded live match ${liveMatch.team1Name} vs ${liveMatch.team2Name}`, 'info');
      }
    }
  }, [matches, view, activeMatchId, activeScorecardId, hasManuallyExited, triggerToast]);

  const hasSetViewOnInit = useRef(view);
  useEffect(() => {
    if (hasSetViewOnInit.current !== view) {
      hasSetViewOnInit.current = view;
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [view]);

  useEffect(() => {
    if (activeMatchId || activePlayerId || activeScorecardId) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [activeMatchId, activePlayerId, activeScorecardId]);

  const openNewMatch = useCallback((prefill?: NewMatchPrefill) => {
    setNewMatchPrefill(prefill || null);
    setIsNewMatchOpen(true);
  }, []);

  const closeNewMatch = useCallback(() => {
    setIsNewMatchOpen(false);
    setNewMatchPrefill(null);
  }, []);

  const goPlayers = useCallback((id: string) => { setActivePlayerId(id); setView('dash'); }, []);
  const goMatchDetails = useCallback((id: string) => { setActiveScorecardId(id); setView('detail'); }, []);
  const resumeMatch = useCallback((id: string) => { setHasManuallyExited(false); setActiveMatchId(id); setView('live'); }, []);

  return {
    view, setView,
    activeMatchId, setActiveMatchId,
    activePlayerId, setActivePlayerId,
    activeScorecardId, setActiveScorecardId,
    hasManuallyExited, setHasManuallyExited,
    isNewMatchOpen, newMatchPrefill,
    isResetConfirming, setIsResetConfirming,
    openNewMatch, closeNewMatch,
    goPlayers, goMatchDetails, resumeMatch,
  };
}