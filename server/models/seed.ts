export const SEED_PLAYERS = [
  { id: 'p1', name: 'Virat Kohli', role: 'Batsman', jerseyNo: '18', age: 35, stats: { matches: 0, runs: 0, balls: 0, wickets: 0, fifties: 0, hundreds: 0, fours: 0, sixes: 0 } },
  { id: 'p2', name: 'Rohit Sharma', role: 'Batsman', jerseyNo: '45', age: 37, stats: { matches: 0, runs: 0, balls: 0, wickets: 0, fifties: 0, hundreds: 0, fours: 0, sixes: 0 } },
  { id: 'p3', name: 'MS Dhoni', role: 'Wicket-keeper', jerseyNo: '7', age: 42, stats: { matches: 0, runs: 0, balls: 0, wickets: 0, fifties: 0, hundreds: 0, fours: 0, sixes: 0 } },
  { id: 'p4', name: 'Jasprit Bumrah', role: 'Bowler', jerseyNo: '93', age: 30, stats: { matches: 0, runs: 0, balls: 0, wickets: 0, fifties: 0, hundreds: 0, fours: 0, sixes: 0 } },
  { id: 'p5', name: 'Ravindra Jadeja', role: 'All-rounder', jerseyNo: '8', age: 35, stats: { matches: 0, runs: 0, balls: 0, wickets: 0, fifties: 0, hundreds: 0, fours: 0, sixes: 0 } },
  { id: 'p6', name: 'Joe Root', role: 'Batsman', jerseyNo: '66', age: 33, stats: { matches: 0, runs: 0, balls: 0, wickets: 0, fifties: 0, hundreds: 0, fours: 0, sixes: 0 } },
  { id: 'p7', name: 'Ben Stokes', role: 'All-rounder', jerseyNo: '55', age: 33, stats: { matches: 0, runs: 0, balls: 0, wickets: 0, fifties: 0, hundreds: 0, fours: 0, sixes: 0 } },
  { id: 'p8', name: 'Jofra Archer', role: 'Bowler', jerseyNo: '22', age: 29, stats: { matches: 0, runs: 0, balls: 0, wickets: 0, fifties: 0, hundreds: 0, fours: 0, sixes: 0 } },
  { id: 'p9', name: 'Jos Buttler', role: 'Wicket-keeper', jerseyNo: '63', age: 33, stats: { matches: 0, runs: 0, balls: 0, wickets: 0, fifties: 0, hundreds: 0, fours: 0, sixes: 0 } },
];

export const SEED_TEAMS = [
  { id: 't1', name: 'India Kings', playerIds: ['p1', 'p2', 'p3', 'p4', 'p5'] },
  { id: 't2', name: 'England Stars', playerIds: ['p6', 'p7', 'p8', 'p9'] },
];

export const SEED_MATCHES = [
  {
    id: 'm1',
    team1Id: 't1', team2Id: 't2', team1Name: 'India Kings', team2Name: 'England Stars',
    totalOvers: 2, status: 'complete',
    battingFirstId: 't1', battingFirstName: 'India Kings',
    fieldingFirstId: 't2', fieldingFirstName: 'England Stars',
    currentInnings: 2,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 23).toISOString(),
    result: 'India Kings won by 12 runs',
    matchType: 'single',
    innings: [
      {
        runs: 24, wickets: 1, overs: 2, balls: 0,
        extras: { wide: 1, noBall: 0, bye: 0, legBye: 0 },
        batting: [
          { pid: 'p1', runs: 14, balls: 7, fours: 2, sixes: 0, out: true },
          { pid: 'p2', runs: 9, balls: 5, fours: 1, sixes: 0, out: false }
        ],
        bowling: [
          { pid: 'p8', overs: 1, balls: 0, runs: 12, wickets: 1, maidens: 0 },
          { pid: 'p7', overs: 1, balls: 0, runs: 12, wickets: 0, maidens: 0 }
        ],
        overHistory: [['1', '4', '1', 'W', '4', '2'], ['1', 'Wd', '2', '0', '4', '2']],
        currentOver: [], striker: 'p2', nonStriker: null, bowler: null, retiredHurt: [], history: []
      },
      {
        runs: 12, wickets: 2, overs: 2, balls: 0,
        extras: { wide: 0, noBall: 1, bye: 0, legBye: 0 },
        batting: [
          { pid: 'p6', runs: 6, balls: 6, fours: 0, sixes: 0, out: true },
          { pid: 'p9', runs: 5, balls: 6, fours: 1, sixes: 0, out: true }
        ],
        bowling: [
          { pid: 'p4', overs: 1, balls: 0, runs: 4, wickets: 1, maidens: 0 },
          { pid: 'p5', overs: 1, balls: 0, runs: 8, wickets: 1, maidens: 0 }
        ],
        overHistory: [['0', '1', 'W', '2', '0', '1'], ['Nb', '1', '4', '0', 'W', '1']],
        currentOver: [], striker: null, nonStriker: null, bowler: null, retiredHurt: [], history: []
      }
    ]
  }
];
