import React from 'react';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useToast } from './hooks/useToast';
import { useAuth } from './hooks/useAuth';
import { useCricketData } from './hooks/useCricketData';
import { useNavigation } from './hooks/useNavigation';

import AppHeader from './components/layout/AppHeader';
import BottomNav from './components/layout/BottomNav';
import Toast from './components/layout/Toast';
import LoginView from './components/layout/LoginView';

// Views - Admin
import PlayersView from './components/admin/PlayersView';
import TeamsView from './components/admin/TeamsView';
import DatabaseView from './components/admin/DatabaseView';
import LiveScoringView from './components/admin/LiveScoringView';
import NewMatchModal from './components/admin/NewMatchModal';

// Views - Viewer
import HomeView from './components/viewer/HomeView';
import HistoryView from './components/viewer/HistoryView';
import ScorecardDetailView from './components/viewer/ScorecardDetailView';
import PlayerProfileView from './components/viewer/PlayerProfileView';

// Skeletons
import HomeSkeleton from './components/skeletons/HomeSkeleton';
import PlayersSkeleton from './components/skeletons/PlayersSkeleton';
import TeamsSkeleton from './components/skeletons/TeamsSkeleton';
import StatsSkeleton from './components/skeletons/StatsSkeleton';
import HistorySkeleton from './components/skeletons/HistorySkeleton';
import LiveScoringSkeleton from './components/skeletons/LiveScoringSkeleton';
import PlayerProfileSkeleton from './components/skeletons/PlayerProfileSkeleton';
import ScorecardSkeleton from './components/skeletons/ScorecardSkeleton';

export default function App() {
  const { toast, triggerToast } = useToast();
  const auth = useAuth(triggerToast);
  const data = useCricketData(triggerToast);
  const nav = useNavigation(data.matches, triggerToast);

  return (
    <div className="min-h-screen bg-page font-sans text-ink flex flex-col pb-24 selection:bg-emerald-500/20 selection:text-emerald-950">
      {/* Toast Notification Banner */}
      <Toast toast={toast} />

      {/* Top Role/Access Header Bar */}
      <AppHeader isAdmin={auth.isAdmin} onLogin={() => nav.setView('login')} onLogout={auth.logout} />

      {/* Main Container Wrapper */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={nav.view + (nav.activePlayerId || '') + (nav.activeMatchId || '') + (nav.activeScorecardId || '')}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {nav.view === 'login' && (
              <LoginView
                adminIdInput={auth.adminIdInput}
                adminPasswordInput={auth.adminPasswordInput}
                loginError={auth.loginError}
                onAdminIdChange={auth.setAdminIdInput}
                onPasswordChange={auth.setAdminPasswordInput}
                onSubmit={(e) => auth.handleLoginSubmit(e, () => nav.setView('home'))}
                onCancel={() => nav.setView('home')}
              />
            )}
            {nav.view === 'home' && (
              !data.isHydrated ? <HomeSkeleton /> :
              <HomeView
                matches={data.matches}
                players={data.players}
                teams={data.teams}
                isAdmin={auth.isAdmin}
                onStartNewMatch={() => {
                  if (data.teams.length < 2) {
                    triggerToast('Please create at least 2 teams with players first.', 'warn');
                    nav.setView('teams');
                  } else {
                    nav.openNewMatch();
                  }
                }}
                onResumeMatch={nav.resumeMatch}
                onViewMatchDetails={nav.goMatchDetails}
                onNavigate={v => nav.setView(v)}
              />
            )}

            {nav.view === 'players' && (
              !data.isHydrated ? <PlayersSkeleton /> :
              <PlayersView
                players={data.playersWithCalculatedStats}
                teams={data.teams}
                isAdmin={auth.isAdmin}
                onAddPlayer={data.handleAddPlayer}
                onEditPlayer={data.handleEditPlayer}
                onDeletePlayer={data.handleDeletePlayer}
                onSelectPlayer={nav.goPlayers}
              />
            )}

            {nav.view === 'teams' && (
              !data.isHydrated ? <TeamsSkeleton /> :
              <TeamsView
                teams={data.teams}
                players={data.players}
                matches={data.matches}
                isAdmin={auth.isAdmin}
                onAddTeam={data.handleAddTeam}
                onEditTeam={data.handleEditTeam}
                onDeleteTeam={data.handleDeleteTeam}
              />
            )}

            {nav.view === 'db' && (
              !data.isHydrated ? <StatsSkeleton /> :
              <DatabaseView
                players={data.players}
                matches={data.matches}
                onSelectPlayer={nav.goPlayers}
              />
            )}

            {nav.view === 'history' && (
              !data.isHydrated ? <HistorySkeleton /> :
              <HistoryView
                matches={data.matches}
                isAdmin={auth.isAdmin}
                onDeleteMatch={data.handleDeleteMatch}
                onViewDetails={nav.goMatchDetails}
              />
            )}

            {nav.view === 'live' && nav.activeMatchId && (() => {
              if (!data.isHydrated) return <LiveScoringSkeleton />;
              const activeMatch = data.matches.find(m => m.id === nav.activeMatchId);
              if (!activeMatch) {
                return (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
                    <p className="text-sm font-semibold text-neutral-500 mt-4">Connecting to live match feed...</p>
                  </div>
                );
              }
              return (
                <LiveScoringView
                  match={activeMatch}
                  players={data.players}
                  teams={data.teams}
                  isAdmin={auth.isAdmin}
                  allMatches={data.matches}
                  onContinueSeries={(seriesId, team1Id, team2Id, totalSeriesMatches, tournamentName) =>
                    nav.openNewMatch({ team1Id, team2Id, matchType: 'tournament', tournamentMatches: totalSeriesMatches, tournamentName, seriesId })
                  }
                  onEndSeries={data.handleEndSeries}
                  onDeliverBall={(outcome, wicketDetail) => data.handleDeliverBall(nav.activeMatchId!, outcome, wicketDetail)}
                  onUndoLastBall={() => data.handleUndoLastBall(nav.activeMatchId!)}
                  onSwapBatsmen={() => data.handleSwapBatsmen(nav.activeMatchId!)}
                  onRetireHurt={pid => data.handleRetireHurt(nav.activeMatchId!, pid)}
                  onSelectStriker={pid => data.handleSelectStriker(nav.activeMatchId!, pid)}
                  onSelectNonStriker={pid => data.handleSelectNonStriker(nav.activeMatchId!, pid)}
                  onSelectBowler={pid => data.handleSelectBowler(nav.activeMatchId!, pid)}
                  onReplaceBatsman={(type, pid) => data.handleReplaceBatsman(nav.activeMatchId!, type, pid)}
                  onEndMatch={() => data.handleEndMatch(nav.activeMatchId!)}
                  onExit={() => {
                    nav.setHasManuallyExited(true);
                    const completedId = nav.activeMatchId;
                    nav.setActiveMatchId(null);
                    if (completedId && activeMatch?.status === 'complete') {
                      nav.setActiveScorecardId(completedId);
                      nav.setView('detail');
                    } else {
                      nav.setView('home');
                    }
                  }}
                />
              );
            })()}

            {nav.view === 'dash' && nav.activePlayerId && (
              !data.isHydrated ? <PlayerProfileSkeleton /> :
              <PlayerProfileView
                playerId={nav.activePlayerId}
                players={data.players}
                matches={data.matches}
                onBack={() => {
                  nav.setActivePlayerId(null);
                  nav.setView('players');
                }}
              />
            )}

            {nav.view === 'detail' && nav.activeScorecardId && (() => {
              if (!data.isHydrated) return <ScorecardSkeleton />;
              const selectedMatch = data.matches.find(m => m.id === nav.activeScorecardId);
              if (!selectedMatch) {
                return (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
                    <p className="text-sm font-semibold text-neutral-500 mt-4">Retrieving scorecard details...</p>
                  </div>
                );
              }
              return (
                <ScorecardDetailView
                  match={selectedMatch}
                  players={data.players}
                  isAdmin={auth.isAdmin}
                  onDeleteMatch={data.handleDeleteMatch}
                  allMatches={data.matches}
                  onContinueSeries={(seriesId, team1Id, team2Id, totalSeriesMatches, tournamentName) =>
                    nav.openNewMatch({ team1Id, team2Id, matchType: 'tournament', tournamentMatches: totalSeriesMatches, tournamentName, seriesId })
                  }
                  onEndSeries={data.handleEndSeries}
                  onBack={() => {
                    nav.setActiveScorecardId(null);
                    nav.setView('history');
                  }}
                />
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Navigation Drawer (Hidden in deep view states) */}
      {!['live', 'dash', 'detail', 'login'].includes(nav.view) && (
        <BottomNav view={nav.view} onNavigate={nav.setView} />
      )}

      {/* New Match setup modal */}
      {nav.isNewMatchOpen && (
        <NewMatchModal
          teams={data.teams}
          prefill={nav.newMatchPrefill}
          onClose={nav.closeNewMatch}
          onStartMatch={async (config) => {
            const newMatchId = await data.handleStartMatch(config);
            nav.setHasManuallyExited(false);
            nav.setActiveMatchId(newMatchId);
            nav.closeNewMatch();
            nav.setView('live');
          }}
        />
      )}
    </div>
  );
}