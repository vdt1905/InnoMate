import React, { useEffect, useState } from 'react';
import { Search, Filter, Lightbulb, User, Tag, Calendar, Heart, MessageCircle, Share2, TrendingUp, Plus } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import { useNavigate } from 'react-router-dom';

const AllIdeas = () => {
  const navigate = useNavigate();
  const { allIdeas, getAllIdeas } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    getAllIdeas();
  }, []);

  // Get all unique tags
  const allTags = [...new Set(allIdeas.flatMap(idea => idea.tags || []))];

  // Filter and sort ideas
  const filteredIdeas = allIdeas
    .filter(idea => {
      const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = !selectedTag || (idea.tags && idea.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          const aLikes = Array.isArray(a.likes) ? a.likes.length : (a.likes || 0);
          const bLikes = Array.isArray(b.likes) ? b.likes.length : (b.likes || 0);
          return bLikes - aLikes;
        case 'trending':
          const aViews = Array.isArray(a.views) ? a.views.length : (a.views || 0);
          const bViews = Array.isArray(b.views) ? b.views.length : (b.views || 0);
          return bViews - aViews;
        default:
          return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
      }
    });

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRandomGradient = (index) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500'
    ];
    return gradients[index % gradients.length];
  };

  const IdeaCard = ({ idea, index }) => (
    <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getRandomGradient(index)} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-200">
              {idea.title}
            </h3>
            <div className="flex items-center space-x-2 text-gray-400 text-sm mt-1">
              <User className="w-4 h-4" />
              <span>{idea.createdBy?.name || 'Anonymous'}</span>
              <span>•</span>
              <Calendar className="w-4 h-4" />
              <span>{formatDate(idea.createdAt)}</span>
            </div>
          </div>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-700/50 rounded-lg">
          <Share2 className="w-4 h-4 text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Description */}
      <p className="text-gray-300 leading-relaxed mb-4 line-clamp-3">
        {idea.description}
      </p>

      {/* Tags */}
      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {idea.tags.slice(0, 3).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30 hover:bg-purple-500/30 transition-colors duration-200 cursor-pointer"
            >
              {tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="px-3 py-1 bg-gray-700/50 text-gray-400 rounded-full text-sm">
              +{idea.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors duration-200">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{Array.isArray(idea.likes) ? idea.likes.length : (idea.likes || 0)}</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors duration-200">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{Array.isArray(idea.comments) ? idea.comments.length : (idea.comments || 0)}</span>
          </button>
          <div className="flex items-center space-x-2 text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">{Array.isArray(idea.views) ? idea.views.length : (idea.views || 0)} views</span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/project/${idea._id}`)}
          className="px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 border border-purple-500/30 transition-all duration-200 text-sm font-medium">
          View Details
        </button>
      </div>
    </div>
  );

  const ListView = () => (
    <div className="space-y-4">
      {filteredIdeas.map((idea, index) => (
        <div key={idea._id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-start space-x-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${getRandomGradient(index)} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-white truncate">{idea.title}</h3>
                <div className="flex items-center space-x-2 ml-4">
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors duration-200">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{Array.isArray(idea.likes) ? idea.likes.length : (idea.likes || 0)}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{Array.isArray(idea.comments) ? idea.comments.length : (idea.comments || 0)}</span>
                  </button>
                </div>
              </div>
              <p className="text-gray-300 mb-3 line-clamp-2">{idea.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-gray-400 text-sm">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{idea.createdBy?.name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(idea.createdAt)}</span>
                  </div>
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="w-4 h-4" />
                      <span>{idea.tags.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/project/${idea._id}`)}
                  className="px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 border border-purple-500/30 transition-all duration-200 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2">
                💡 All Ideas
              </h1>
              <p className="text-gray-400 text-lg">
                Discover innovative ideas from our community
              </p>
            </div>
            <button className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
              <Plus className="w-4 h-4" />
              <span>Add New Idea</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{allIdeas.length}</div>
              <div className="text-gray-400 text-sm">Total Ideas</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{allTags.length}</div>
              <div className="text-gray-400 text-sm">Categories</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{filteredIdeas.length}</div>
              <div className="text-gray-400 text-sm">Filtered Results</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">
                {[...new Set(allIdeas.map(idea => idea.createdBy?.name).filter(Boolean))].length}
              </div>
              <div className="text-gray-400 text-sm">Contributors</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search ideas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              />
            </div>

            {/* Tag Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 appearance-none min-w-[200px]"
              >
                <option value="">All Categories</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 appearance-none"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="trending">Trending</option>
            </select>

            {/* View Mode */}
            <div className="flex bg-gray-700/50 rounded-xl p-1 border border-gray-600/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${viewMode === 'grid'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${viewMode === 'list'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Ideas Display */}
        {filteredIdeas.length === 0 ? (
          <div className="text-center py-16">
            <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No ideas found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea, index) => (
              <IdeaCard key={idea._id} idea={idea} index={index} />
            ))}
          </div>
        ) : (
          <ListView />
        )}
      </div>
    </div>
  );
};

export default AllIdeas;