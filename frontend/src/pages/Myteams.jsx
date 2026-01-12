import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Crown, Eye, Sparkles, AlertCircle, ArrowRight, Calendar } from 'lucide-react';
import useAuthStore from '../Store/authStore';

export default function MyTeams() {
  const navigate = useNavigate();
  const {
    user,
    fetchUser,
    fetchUserTeams,
    myLeadTeams,
    myMemberTeams,
    loadingTeams,
    errorTeams,
  } = useAuthStore();

  useEffect(() => {
    const initializeData = async () => {
      if (!user) await fetchUser();
      await fetchUserTeams();
    };
    initializeData();
  }, [fetchUser, fetchUserTeams, user]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTeamStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const TeamCard = ({ team, isLeader = false }) => {
    return (
      <div className="group relative bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden transition-all duration-300 hover:border-slate-600/70 hover:shadow-lg">
        <div className="p-6">
          {/* Header with status indicator */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-white font-semibold text-lg">{team.title}</h3>
                {isLeader && (
                  <span className="px-2 py-1 bg-orange-500/80 text-white text-xs font-medium rounded-md flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Leader
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                {team.description || 'Building something amazing together...'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${getTeamStatusColor(team.status)} flex-shrink-0 mt-1`} />
          </div>

          {/* Required Skills Section */}
          <div className="mb-4">
            <div className="text-slate-500 text-xs uppercase tracking-wide font-medium mb-2">Required Skills</div>
            <div className="flex flex-wrap gap-2">
              {team.category && (
                <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-md border border-slate-600/30">
                  {team.category}
                </span>
              )}
              {team.skillsRequired && team.skillsRequired.length > 0 ? (
                team.skillsRequired.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-md border border-slate-600/30">
                    {skill}
                  </span>
                ))
              ) : (
                <>
                  <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-md border border-slate-600/30">
                    Collaboration
                  </span>
                  <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-md border border-slate-600/30">
                    Communication
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div className="mb-4">
            <div className="text-slate-500 text-xs uppercase tracking-wide font-medium mb-2">Tags</div>
            <div className="flex flex-wrap gap-2">
              {team.tags && team.tags.length > 0 ? (
                team.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded border border-violet-500/30">
                    #{tag}
                  </span>
                ))
              ) : (
                <>
                  <span className="px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded border border-violet-500/30">
                    #teamwork
                  </span>
                  <span className="px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded border border-violet-500/30">
                    #collaboration
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Bottom section with creator info and actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {getInitials(team.createdBy?.name || team.createdBy?.username || 'U')}
              </div>
              <div>
                <div className="text-white text-sm font-medium">
                  {isLeader ? 'You' : (team.createdBy?.name || team.createdBy?.username || 'Unknown')}
                </div>
                <div className="text-slate-400 text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(team.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Member count */}
              <div className="flex items-center gap-4 text-xs text-slate-400 mr-3">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{team.teamMembers?.length || 0}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/project/${team._id}`)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors duration-200 flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loadingTeams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500/20 border-r-blue-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <div className="text-white font-semibold text-lg mb-2">Loading your teams</div>
          <div className="text-slate-400">Fetching your collaborative projects...</div>
        </div>
      </div>
    );
  }

  if (errorTeams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-white font-semibold text-lg mb-2">Unable to load teams</div>
          <div className="text-slate-400 mb-6">{errorTeams}</div>
          <button
            onClick={() => fetchUserTeams()}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-violet-500/20 rounded-xl">
              <Sparkles className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              My Teams
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Manage your collaborative projects and team interactions
          </p>
        </div>

        {/* Teams I Lead */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Crown className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Teams I Lead</h2>
              <p className="text-slate-400">Projects where you're the visionary</p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="px-3 py-1 bg-orange-400/20 text-orange-300 text-sm font-medium rounded-md">
                {myLeadTeams.length} {myLeadTeams.length === 1 ? 'team' : 'teams'}
              </span>
            </div>
          </div>

          {myLeadTeams.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-10 h-10 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Ready to lead?</h3>
                <p className="text-slate-400 mb-6">You haven't created any teams yet. Start building something amazing!</p>
                <button
                  onClick={() => navigate('/create-project')}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  Create Your First Project
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myLeadTeams.map(team => (
                <TeamCard key={team._id} team={team} isLeader={true} />
              ))}
            </div>
          )}
        </section>

        {/* Teams I'm In */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Teams I'm In</h2>
              <p className="text-slate-400">Collaborative projects you're part of</p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="px-3 py-1 bg-blue-400/20 text-blue-300 text-sm font-medium rounded-md">
                {myMemberTeams.length} {myMemberTeams.length === 1 ? 'team' : 'teams'}
              </span>
            </div>
          </div>

          {myMemberTeams.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Join the collaboration</h3>
                <p className="text-slate-400 mb-6">You're not part of any teams yet. Discover exciting projects to join!</p>
                <button
                  onClick={() => navigate('/allideas')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  Browse Projects
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myMemberTeams.map(team => (
                <TeamCard key={team._id} team={team} isLeader={false} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}