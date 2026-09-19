import { Player, Team, Match } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const NO_CACHE: RequestInit = { cache: 'no-store' };

// ============ PLAYERS ============
export async function fetchPlayers(): Promise<Player[]> {
  const res = await fetch(`${API_URL}/players`, NO_CACHE);
  if (!res.ok) throw new Error('Failed to fetch players');
  return res.json();
}

export async function savePlayer(player: Player): Promise<void> {
  const existing = await fetch(`${API_URL}/players/${player.id}`, NO_CACHE);
  if (existing.ok) {
    const res = await fetch(`${API_URL}/players/${player.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Failed to update player (${res.status})`);
  } else {
    const res = await fetch(`${API_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Failed to create player (${res.status})`);
  }
}

export async function removePlayer(playerId: string): Promise<void> {
  const res = await fetch(`${API_URL}/players/${playerId}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to delete player (${res.status})`);
}

// ============ TEAMS ============
export async function fetchTeams(): Promise<Team[]> {
  const res = await fetch(`${API_URL}/teams`, NO_CACHE);
  if (!res.ok) throw new Error('Failed to fetch teams');
  return res.json();
}

export async function saveTeam(team: Team): Promise<void> {
  const existing = await fetch(`${API_URL}/teams/${team.id}`, NO_CACHE);
  if (existing.ok) {
    const res = await fetch(`${API_URL}/teams/${team.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Failed to update team (${res.status})`);
  } else {
    const res = await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Failed to create team (${res.status})`);
  }
}

export async function removeTeam(teamId: string): Promise<void> {
  const res = await fetch(`${API_URL}/teams/${teamId}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to delete team (${res.status})`);
}

// ============ MATCHES ============
export async function fetchMatches(): Promise<Match[]> {
  const res = await fetch(`${API_URL}/matches`, NO_CACHE);
  if (!res.ok) throw new Error('Failed to fetch matches');
  return res.json();
}

export async function saveMatch(match: Match): Promise<void> {
  const res = await fetch(`${API_URL}/matches/${match.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(match),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to save match (${res.status})`);
}

export async function removeMatch(matchId: string): Promise<void> {
  const res = await fetch(`${API_URL}/matches/${matchId}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to delete match (${res.status})`);
}

// ============ RESET ============
export async function resetDatabase(): Promise<void> {
  await fetch(`${API_URL}/reset`, { method: 'POST', cache: 'no-store' });
}

// ============ INITIAL DATA LOAD ============
export async function fetchInitialData(): Promise<{ players: Player[]; teams: Team[]; matches: Match[] }> {
  const [players, teams, matches] = await Promise.all([
    fetchPlayers(),
    fetchTeams(),
    fetchMatches(),
  ]);
  return { players, teams, matches };
}
