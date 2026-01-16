import { useEffect, useState } from 'react';
import useAuthStore from '../Store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Star,
  Clock,
  User,
  Target,
  Zap,
  TrendingUp,
  Filter,
  Search,
  ChevronDown,
  Sparkles,
  Users,
  Calendar,
  ChevronUp,
  X
} from 'lucide-react';
import React from 'react';

const Home = () => {
  const navigate = useNavigate();
  const {
    getPersonalizedFeed,
    personalizedFeed,
    loadingIdeas,
    toggleLikeIdea,
    addCommentToIdea,
    user
  } = useAuthStore();

  // All state declarations properly inside component
  const [filterByScore, setFilterByScore] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [openComments, setOpenComments] = useState({});
  const [likingStates, setLikingStates] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [commentingStates, setCommentingStates] = useState({});
  const isModalOpen = false;
  const selectedIdea = null;


  // Check if likeIdea function exists
  if (!toggleLikeIdea || typeof toggleLikeIdea !== 'function') {
    console.error('likeIdea function is not available in useAuthStore');
  }

  // Handle posting comments
  const handlePostComment = async (ideaId) => {
    const commentText = commentTexts[ideaId];
    if (!commentText?.trim()) return;

    setCommentingStates(prev => ({ ...prev, [ideaId]: true }));

    try {
      const success = await addCommentToIdea(ideaId, commentText.trim());
      if (success) {
        setCommentTexts(prev => ({ ...prev, [ideaId]: '' }));
      } else {
        alert('Failed to post comment. Please try again.');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setCommentingStates(prev => ({ ...prev, [ideaId]: false }));
    }
  };

  // Helper function to update comment text for specific idea
  const updateCommentText = (ideaId, text) => {
    setCommentTexts(prev => ({ ...prev, [ideaId]: text }));
  };

  // Handle viewing details
  const handleViewDetails = (idea) => {
    navigate(`/project/${idea._id}`);
  };

  useEffect(() => {
    getPersonalizedFeed();
  }, []);

  // Enhanced filter and search logic
  const filteredAndSortedFeed = personalizedFeed
    .filter(idea => {
      const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.skillsRequired?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilter = filterByScore === 'all' ||
        (filterByScore === 'high' && idea.matchScore >= 3) ||
        (filterByScore === 'medium' && idea.matchScore >= 1 && idea.matchScore < 3) ||
        (filterByScore === 'low' && idea.matchScore === 0);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'mostLiked':
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        case 'bestMatch':
          return b.matchScore - a.matchScore;
        default:
          return 0;
      }
    });

  // Enhanced toggle like function with optimistic updates
  const handleLike = async (ideaId) => {
    if (likingStates[ideaId] || !user?._id) return;

    if (!toggleLikeIdea || typeof toggleLikeIdea !== 'function') {
      console.error('toggleLikeIdea function is not available in useAuthStore');
      alert('Like functionality is not available. Please check your authentication store.');
      return;
    }

    setLikingStates(prev => ({ ...prev, [ideaId]: true }));

    try {
      await toggleLikeIdea(ideaId);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to toggle like. Please try again.');
    } finally {
      setLikingStates(prev => ({ ...prev, [ideaId]: false }));
    }
  };

  // Check if current user has liked the idea
  const isLikedByUser = (idea) => {
    return idea.likes && Array.isArray(idea.likes) && user?._id &&
      idea.likes.includes(user._id);
  };

  const toggleComments = (ideaId) => {
    setOpenComments(prev => ({
      ...prev,
      [ideaId]: !prev[ideaId]
    }));
  };

  const getMatchScoreColor = (score) => {
    if (score >= 3) return 'from-emerald-500 to-green-500';
    if (score >= 1) return 'from-amber-500 to-orange-500';
    return 'from-slate-500 to-gray-500';
  };

  const getMatchScoreText = (score) => {
    if (score >= 3) return 'Perfect Match';
    if (score >= 1) return 'Good Match';
    return 'Worth Exploring';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMonths > 0) return `${diffInMonths}mo ago`;
    if (diffInWeeks > 0) return `${diffInWeeks}w ago`;
    if (diffInDays > 0) return `${diffInDays}d ago`;
    if (diffInHours > 0) return `${diffInHours}h ago`;
    return 'Just now';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterByScore('all');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header Section */}
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded-3xl blur-xl" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex items-center space-x-6">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                    Your Feed
                  </h1>
                  <p className="text-gray-400 text-base lg:text-lg mt-1">Projects curated just for you</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:flex-shrink-0">
                <div className="flex items-center justify-center space-x-3 px-5 py-3 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold text-sm lg:text-base">
                    {filteredAndSortedFeed.length} projects
                  </span>
                </div>

                <div className="flex items-center justify-center space-x-3 px-5 py-3 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl backdrop-blur-sm">
                  <Users className="w-5 h-5 text-violet-400" />
                  <span className="text-violet-400 font-semibold text-sm lg:text-base">
                    {user?.skills?.length || 0} skills
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Controls with Fixed Z-Index */}
        <div className="relative z-30">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/10 to-cyan-600/10 rounded-2xl blur-lg" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col gap-4">
              {/* Search Bar - Full Width */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-violet-400 transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Search projects, skills, or creators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 focus:bg-white/10 transition-all duration-200"
                />
              </div>

              {/* Filter Controls with Proper Spacing and Z-Index */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Match Filter with Higher Z-Index */}
                <div className="relative flex-1 sm:flex-none sm:min-w-[180px] z-40">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="w-full flex items-center justify-between px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200 relative z-40"
                  >
                    <div className="flex items-center space-x-3">
                      <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {filterByScore === 'all' ? 'All Matches' :
                          filterByScore === 'high' ? 'Perfect Match' :
                            filterByScore === 'medium' ? 'Good Match' : 'Worth Exploring'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isFilterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown with Proper Z-Index and Positioning */}
                  {isFilterOpen && (
                    <>
                      {/* Backdrop to close dropdown when clicking outside */}
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsFilterOpen(false)}
                      />

                      {/* Dropdown Menu */}
                      <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {[
                          { value: 'all', label: 'All Matches', icon: Target },
                          { value: 'high', label: 'Perfect Match', icon: Star },
                          { value: 'medium', label: 'Good Match', icon: Zap },
                          { value: 'low', label: 'Worth Exploring', icon: Eye }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setFilterByScore(option.value);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors duration-200 flex items-center space-x-3 ${filterByScore === option.value ? 'bg-violet-500/20 text-violet-300' : 'text-gray-300'
                              }`}
                          >
                            <option.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Sort Filter */}
                <div className="flex-1 sm:flex-none sm:min-w-[160px]">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 focus:bg-white/10 transition-all duration-200 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    <option value="newest" className="bg-gray-800 text-white">Newest First</option>
                    <option value="oldest" className="bg-gray-800 text-white">Oldest First</option>
                    <option value="mostLiked" className="bg-gray-800 text-white">Most Liked</option>
                    <option value="bestMatch" className="bg-gray-800 text-white">Best Match</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(searchTerm || filterByScore !== 'all' || sortBy !== 'newest') && (
                  <div className="flex-1 sm:flex-none">
                    <button
                      onClick={clearFilters}
                      className="w-full px-6 py-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-200 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section with Lower Z-Index */}
        <div className="relative z-10">
          {loadingIdeas ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-cyan-500/30 border-b-cyan-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Curating your feed</h3>
                <p className="text-gray-400">Finding the perfect projects for you...</p>
              </div>
            </div>
          ) : filteredAndSortedFeed.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Target className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {searchTerm || filterByScore !== 'all' ? 'No matches found' : 'No projects yet'}
              </h3>
              <p className="text-gray-400 text-lg max-w-md mx-auto mb-8">
                {searchTerm || filterByScore !== 'all'
                  ? 'Try adjusting your search terms or filters to find more projects.'
                  : 'Complete your profile with skills to get personalized project recommendations.'}
              </p>
              {(searchTerm || filterByScore !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200 font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAndSortedFeed.map((idea, index) => (
                <div key={idea._id} className="group relative">
                  {/* Enhanced Glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 hover:border-violet-500/30 rounded-3xl p-8 transition-all duration-300 hover:bg-white/10">
                    {/* Enhanced Header */}
                    <div className="mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h3 className="text-xl lg:text-2xl font-bold text-white group-hover:text-violet-300 transition-colors duration-200 leading-tight">
                              {idea.title}
                            </h3>

                            {/* Enhanced Match Score Badge */}
                            <div className={`flex-shrink-0 px-4 py-2 bg-gradient-to-r ${getMatchScoreColor(idea.matchScore)} rounded-full flex items-center space-x-2 shadow-lg`}>
                              <Star className="w-4 h-4 text-white" />
                              <span className="text-white text-sm font-bold">
                                {getMatchScoreText(idea.matchScore)}
                              </span>
                              <span className="text-white/80 text-xs">
                                ({idea.matchScore}/3)
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-300 text-base lg:text-lg leading-relaxed">
                            {idea.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Skills and Tags */}
                    <div className="space-y-4 mb-6">
                      {idea.skillsRequired && idea.skillsRequired.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Required Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {idea.skillsRequired.map((skill, index) => (
                              <span
                                key={index}
                                className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 ${user?.skills?.includes(skill)
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                                  }`}
                              >
                                {skill}
                                {user?.skills?.includes(skill) && (
                                  <span className="ml-2">✓</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {idea.tags && idea.tags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {idea.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-4 py-2 bg-violet-500/20 text-violet-300 border border-violet-500/30 text-sm font-medium rounded-xl hover:bg-violet-500/30 transition-colors duration-200"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Footer */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pt-6 border-t border-white/10">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
                        <div className="flex items-center space-x-3">
                          <Link to={`/${idea.createdBy?.username}`} className="flex items-center space-x-3 group/user hover:opacity-80 transition-opacity">
                            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-semibold text-sm lg:text-base truncate group-hover/user:text-violet-300 transition-colors">
                                {idea.createdBy?.name || 'Unknown Creator'}
                              </p>
                              <p className="text-gray-400 text-xs lg:text-sm truncate">
                                @{idea.createdBy?.username || 'unknown'}
                              </p>
                            </div>
                          </Link>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-400">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs lg:text-sm">
                            {formatTimeAgo(idea.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Action Buttons with Better Alignment */}
                      <div className="flex items-center justify-center lg:justify-end gap-2 lg:flex-shrink-0">
                        {/* View Details Button */}
                        <button
                          onClick={() => handleViewDetails(idea)}
                          className="flex items-center justify-center space-x-2 px-3 lg:px-4 py-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 font-medium"
                        >
                          <Eye className="w-4 lg:w-5 h-4 lg:h-5" />
                          <span className="text-sm">Details</span>
                        </button>

                        <button
                          onClick={() => handleLike(idea._id)}
                          disabled={likingStates[idea._id] || !user?._id}
                          className={`flex items-center justify-center space-x-2 px-3 lg:px-4 py-3 rounded-xl font-medium transition-all duration-200 relative overflow-hidden ${isLikedByUser(idea)
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 shadow-lg shadow-red-500/10'
                            : 'bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 border border-white/10 hover:border-red-500/30'
                            } ${likingStates[idea._id] ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${!user?._id ? 'cursor-not-allowed opacity-30' : ''}`}
                        >
                          {likingStates[idea._id] ? (
                            <div className="w-4 lg:w-5 h-4 lg:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Heart className={`w-4 lg:w-5 h-4 lg:h-5 transition-all duration-200 ${isLikedByUser(idea) ? 'fill-current scale-110' : ''
                              }`} />
                          )}
                          <span className="text-sm font-semibold">
                            {idea.likes?.length || 0}
                          </span>
                          {isLikedByUser(idea) && !likingStates[idea._id] && (
                            <div className="absolute inset-0 bg-red-500/10 rounded-xl animate-pulse" />
                          )}
                        </button>

                        <button
                          onClick={() => toggleComments(idea._id)}
                          className={`flex items-center justify-center space-x-2 px-3 lg:px-4 py-3 rounded-xl font-medium transition-all duration-200 ${openComments[idea._id]
                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                            : 'bg-white/5 text-gray-400 hover:bg-violet-500/20 hover:text-violet-400 border border-white/10 hover:border-violet-500/30'
                            }`}
                        >
                          <MessageCircle className="w-4 lg:w-5 h-4 lg:h-5" />
                          <span className="text-sm">{idea.comments?.length || 0}</span>
                          {openComments[idea._id] ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        <button className="flex items-center justify-center space-x-2 px-3 lg:px-4 py-3 bg-white/5 text-gray-400 hover:bg-cyan-500/20 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/30 rounded-xl font-medium transition-all duration-200">
                          <Share2 className="w-4 lg:w-5 h-4 lg:h-5" />
                        </button>

                        <button className="flex items-center justify-center space-x-2 px-3 lg:px-4 py-3 bg-white/5 text-gray-400 hover:bg-amber-500/20 hover:text-amber-400 border border-white/10 hover:border-amber-500/30 rounded-xl font-medium transition-all duration-200">
                          <Bookmark className="w-4 lg:w-5 h-4 lg:h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {openComments[idea._id] && (
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-white mb-4">Comments</h4>

                          {/* Comment Input */}
                          <div className="flex space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <textarea
                                placeholder="Add a comment..."
                                value={commentTexts[idea._id] || ''}
                                onChange={(e) => updateCommentText(idea._id, e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 focus:bg-white/10 transition-all duration-200"
                                rows="3"
                              />
                              <div className="flex justify-end mt-2">
                                <button
                                  onClick={() => handlePostComment(idea._id)}
                                  disabled={commentingStates[idea._id] || !commentTexts[idea._id]?.trim()}
                                  className={`px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200 font-medium text-sm flex items-center space-x-2 ${commentingStates[idea._id] || !commentTexts[idea._id]?.trim()
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'cursor-pointer'
                                    }`}
                                >
                                  {commentingStates[idea._id] ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      <span>Posting...</span>
                                    </>
                                  ) : (
                                    <span>Post Comment</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Comments List */}
                          <div className="space-y-3">
                            {idea.comments && idea.comments.length > 0 ? (
                              idea.comments.map((comment, commentIndex) => (
                                <div key={commentIndex} className="flex space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-white font-medium text-sm">
                                        {comment.user?.name ? `${comment.user.name} (@${comment.user.username})` : 'Anonymous'}
                                      </span>
                                      <span className="text-gray-400 text-xs">
                                        {formatTimeAgo(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                      {comment.text}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                                <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Modal with Proper Z-Index */}
        {isModalOpen && selectedIdea && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-slate-900/95 to-gray-900/95 backdrop-blur-xl border-b border-white/10 p-6 rounded-t-3xl z-[101]">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Project Details</h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
                  >
                    <X className="w-6 h-6 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-8">
                {/* Project Header */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      {selectedIdea.title}
                    </h1>
                    <div className={`px-4 py-2 bg-gradient-to-r ${getMatchScoreColor(selectedIdea.matchScore)} rounded-full flex items-center space-x-2`}>
                      <Star className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-bold">
                        {getMatchScoreText(selectedIdea.matchScore)} ({selectedIdea.matchScore}/3)
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-300 text-lg leading-relaxed">
                    {selectedIdea.description}
                  </p>
                </div>

                {/* Creator Info */}
                <div className="flex items-center space-x-4 p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {selectedIdea.createdBy?.name || 'Unknown Creator'}
                    </h3>
                    <p className="text-gray-400">@{selectedIdea.createdBy?.username || 'unknown'}</p>
                    <p className="text-gray-400 text-sm">{formatTimeAgo(selectedIdea.createdAt)}</p>
                  </div>
                </div>

                {/* Skills Required */}
                {selectedIdea.skillsRequired && selectedIdea.skillsRequired.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Required Skills</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedIdea.skillsRequired.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-4 py-2 text-sm font-medium rounded-xl border ${user?.skills?.includes(skill)
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-white/5 text-gray-300 border-white/10'
                            }`}
                        >
                          {skill}
                          {user?.skills?.includes(skill) && <span className="ml-2">✓</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedIdea.tags && selectedIdea.tags.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Tags</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedIdea.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-violet-500/20 text-violet-300 border border-violet-500/30 text-sm font-medium rounded-xl"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-3">Project Stats</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Likes</span>
                        <span className="text-white font-semibold">{selectedIdea.likes?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Comments</span>
                        <span className="text-white font-semibold">{selectedIdea.comments?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Match Score</span>
                        <span className="text-white font-semibold">{selectedIdea.matchScore}/3</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-3">Project Info</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created</span>
                        <span className="text-white font-semibold">{formatTimeAgo(selectedIdea.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Skills Required</span>
                        <span className="text-white font-semibold">{selectedIdea.skillsRequired?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tags</span>
                        <span className="text-white font-semibold">{selectedIdea.tags?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons in Modal */}
                <div className="flex flex-wrap gap-4 pt-6 border-t border-white/10">
                  <button
                    onClick={() => handleLike(selectedIdea._id)}
                    disabled={likingStates[selectedIdea._id] || !user?._id}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${isLikedByUser(selectedIdea)
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 border border-white/10'
                      }`}
                  >
                    <Heart className={`w-5 h-5 ${isLikedByUser(selectedIdea) ? 'fill-current' : ''}`} />
                    <span>Like ({selectedIdea.likes?.length || 0})</span>
                  </button>

                  <button className="flex items-center space-x-2 px-6 py-3 bg-white/5 text-gray-400 hover:bg-cyan-500/20 hover:text-cyan-400 border border-white/10 rounded-xl font-medium transition-all duration-200">
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>

                  <button className="flex items-center space-x-2 px-6 py-3 bg-white/5 text-gray-400 hover:bg-amber-500/20 hover:text-amber-400 border border-white/10 rounded-xl font-medium transition-all duration-200">
                    <Bookmark className="w-5 h-5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;