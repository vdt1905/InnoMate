import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Sparkles, Users, Calendar, Star, ArrowRight, Code, Hash, TrendingUp, Clock } from 'lucide-react';
import useAuthStore from '../Store/authStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { getPersonalizedFeed, personalizedFeed, loadingFeed } = useAuthStore();

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState('matchScore');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    getPersonalizedFeed();
  }, []);

  // Filter and sort logic
  const filteredProjects = personalizedFeed
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'high-match') return matchesSearch && project.matchScore >= 80;
      if (filterBy === 'hackathon') return matchesSearch && project.projectType === 'hackathon';
      if (filterBy === 'normal') return matchesSearch && project.projectType === 'normal';

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'matchScore') return b.matchScore - a.matchScore;
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 70) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    if (score >= 50) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  const getMatchScoreIcon = (score) => {
    if (score >= 90) return '🎯';
    if (score >= 70) return '⭐';
    if (score >= 50) return '✨';
    return '💫';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
              Personalized Project Feed
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover projects tailored to your skills and interests. Find your perfect collaboration opportunity.
            </p>
          </div>

          {/* Search and Filter Section - Fixed positioning issues */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 relative">
            <div className="flex flex-col lg:flex-row gap-4 items-center">

              {/* Search Bar */}
              <div className="flex-1 relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search projects by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  />
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Filter Dropdown - Enhanced z-index management */}
              <div className="relative">
                <button
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 rounded-xl text-white transition-all duration-200 min-w-[140px] justify-between"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {filterBy === 'all' && 'All Projects'}
                    {filterBy === 'high-match' && 'High Match'}
                    {filterBy === 'hackathon' && 'Hackathons'}
                    {filterBy === 'normal' && 'Normal'}
                  </span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${filterDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu - Higher z-index to prevent overlap */}
                {filterDropdownOpen && (
                  <>
                    {/* Overlay to close dropdown when clicking outside */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setFilterDropdownOpen(false)}
                    />

                    {/* Dropdown content with very high z-index */}
                    <div className="absolute right-0 top-full mt-2 w-56 bg-gray-800 border border-gray-600/50 rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-2 border-b border-gray-700/50">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2">Filter Projects</p>
                      </div>

                      <div className="p-2">
                        {[
                          { value: 'all', label: 'All Projects', icon: '📋' },
                          { value: 'high-match', label: 'High Match (80%+)', icon: '🎯' },
                          { value: 'hackathon', label: 'Hackathons', icon: '⚡' },
                          { value: 'normal', label: 'Normal Projects', icon: '🔧' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setFilterBy(option.value);
                              setFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${filterBy === option.value
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                              }`}
                          >
                            <span className="text-sm">{option.icon}</span>
                            <span className="text-sm font-medium">{option.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="p-2 border-t border-gray-700/50">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2">Sort By</p>
                        {[
                          { value: 'matchScore', label: 'Match Score', icon: '🎯' },
                          { value: 'newest', label: 'Newest First', icon: '⏰' },
                          { value: 'title', label: 'Title A-Z', icon: '📝' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${sortBy === option.value
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                              }`}
                          >
                            <span className="text-sm">{option.icon}</span>
                            <span className="text-sm font-medium">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Results Count */}
              <div className="flex items-center gap-2 px-4 py-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 font-medium text-sm">
                  {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative z-10">
          {loadingFeed ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading personalized projects...</p>
                <p className="text-gray-400 text-sm mt-2">Finding the perfect matches for you</p>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {searchTerm || filterBy !== 'all' ? 'No matching projects found' : 'No personalized projects available yet'}
              </h3>
              <p className="text-gray-500 text-lg mb-6">
                {searchTerm || filterBy !== 'all'
                  ? 'Try adjusting your search terms or filters'
                  : 'Complete your profile to get personalized project recommendations'
                }
              </p>
              {(searchTerm || filterBy !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredProjects.map((idea, index) => (
                <div
                  key={idea._id}
                  className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:bg-gray-800/70 relative z-0"
                  style={{ position: 'relative' }}
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors duration-200 mb-1">
                          {idea.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            by {idea.createdBy?.name || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(idea.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {idea.projectType === 'hackathon' && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-500/30">
                              ⚡ Hackathon
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${getMatchScoreColor(idea.matchScore)}`}>
                      <span className="text-lg">{getMatchScoreIcon(idea.matchScore)}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold">{idea.matchScore}%</div>
                        <div className="text-xs opacity-80">Match</div>
                      </div>
                    </div>
                  </div>

                  {/* Project Description */}
                  <p className="text-gray-300 text-lg leading-relaxed mb-6 line-clamp-3">
                    {idea.description}
                  </p>

                  {/* Skills and Tags */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {/* Skills */}
                    <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Code className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300 font-semibold text-sm">Required Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(idea.skillsRequired || []).slice(0, 4).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded-lg text-xs font-medium border border-blue-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                        {(idea.skillsRequired || []).length > 4 && (
                          <span className="px-2 py-1 bg-blue-500/10 text-blue-300 rounded-lg text-xs">
                            +{(idea.skillsRequired || []).length - 4} more
                          </span>
                        )}
                        {(!idea.skillsRequired || idea.skillsRequired.length === 0) && (
                          <span className="text-blue-300/70 italic text-xs">No specific skills required</span>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Hash className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 font-semibold text-sm">Project Tags</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(idea.tags || []).slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-green-500/20 text-green-200 rounded-lg text-xs font-medium border border-green-500/30"
                          >
                            #{tag}
                          </span>
                        ))}
                        {(idea.tags || []).length > 3 && (
                          <span className="px-2 py-1 bg-green-500/10 text-green-300 rounded-lg text-xs">
                            +{(idea.tags || []).length - 3} more
                          </span>
                        )}
                        {(!idea.tags || idea.tags.length === 0) && (
                          <span className="text-green-300/70 italic text-xs">No tags assigned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                    <div className="text-sm text-gray-400">
                      @{idea.createdBy?.username || 'unknown'}
                    </div>
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 hover:text-white rounded-lg transition-all duration-200 text-sm font-medium">
                        <Star className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => navigate(`/project/${idea._id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 text-purple-300 hover:text-purple-200 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200 text-sm font-medium">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;