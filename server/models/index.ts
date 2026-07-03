import mongoose from 'mongoose';

const playerStatsSchema = new mongoose.Schema({
  matches: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  fifties: { type: Number, default: 0 },
  hundreds: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
}, { _id: false });

const playerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'], required: true },
  jerseyNo: { type: String, required: true },
  age: { type: Number },
  stats: { type: playerStatsSchema, default: () => ({}) },
});

export const Player = mongoose.model('Player', playerSchema);

const teamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  playerIds: [{ type: String }],
});

export const Team = mongoose.model('Team', teamSchema);

const batterStatsSchema = new mongoose.Schema({
  pid: { type: String, required: true },
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  out: { type: Boolean, default: false },
  retiredHurt: { type: Boolean, default: false },
  wicketDetail: {
    type: { type: String },
    bowlerId: String,
    helperId: String,
    runOutRuns: Number,
  },
}, { _id: false });

const bowlerStatsSchema = new mongoose.Schema({
  pid: { type: String, required: true },
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  maidens: { type: Number, default: 0 },
}, { _id: false });

const inningsSchema = new mongoose.Schema({
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  extras: {
    wide: { type: Number, default: 0 },
    noBall: { type: Number, default: 0 },
    bye: { type: Number, default: 0 },
    legBye: { type: Number, default: 0 },
  },
  batting: [batterStatsSchema],
  bowling: [bowlerStatsSchema],
  overHistory: [[String]],
  currentOver: [String],
  striker: { type: String, default: null },
  nonStriker: { type: String, default: null },
  bowler: { type: String, default: null },
  previousBowler: { type: String, default: null },
  retiredHurt: [String],
  history: [mongoose.Schema.Types.Mixed],
}, { _id: false });

const matchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  team1Id: { type: String, required: true },
  team2Id: { type: String, required: true },
  team1Name: { type: String, required: true },
  team2Name: { type: String, required: true },
  totalOvers: { type: Number, required: true },
  status: { type: String, enum: ['live', 'complete'], default: 'live' },
  battingFirstId: String,
  battingFirstName: String,
  fieldingFirstId: String,
  fieldingFirstName: String,
  currentInnings: { type: Number, default: 1 },
  innings: [inningsSchema],
  createdAt: { type: String },
  completedAt: { type: String, default: null },
  result: { type: String, default: '' },
  matchType: { type: String, enum: ['single', 'tournament'] },
  tournamentMatches: Number,
  tournamentName: String,
  seriesId: String,
  lastPlayerSolo: { type: Boolean, default: true },
  seriesEnded: { type: Boolean, default: false },
});

export const Match = mongoose.model('Match', matchSchema);
