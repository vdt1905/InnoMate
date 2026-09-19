import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Search, Check, Compass } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import Avatar from '../components/Avatar';
import HomeSidebar from '../components/HomeSidebar';

const MATCH_FILTERS = [
  { value: 'all', label: 'All matches' },
  { value: 'high', label: 'Perfect match' },
  { value: 'medium', label: 'Good match' },
  { value: 'low', label: 'Worth exploring' },
];

// Native selects keep keyboard + mobile pickers; this just draws the chevron.
const selectChevron = {
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a8a8a8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 0.5rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.25em 1.25em',
};

const Home = () => {
  const navigate = useNavigate();
  const {
    getPersonalizedFeed,
    personalizedFeed,
    loadingFeed,
    toggleLikeIdea,
    addCommentToIdea,
    user
  } = useAuthStore();

  // All state declarations properly inside component
  const [filterByScore, setFilterByScore] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [openComments, setOpenComments] = useState({});
  const [likingStates, setLikingStates] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [commentingStates, setCommentingStates] = useState({});
  const [copiedId, setCopiedId] = useState(null);


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

  const getMatchDot = (score) => {
    if (score >= 3) return 'bg-success';
    if (score >= 1) return 'bg-warning';
    return 'bg-subtle';
  };

  const getMatchScoreText = (score) => {
    if (score >= 3) return 'Perfect match';
    if (score >= 1) return 'Good match';
    return 'Worth exploring';
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

  const handleShare = async (ideaId) => {
    const url = `${window.location.origin}/project/${ideaId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(ideaId);
      setTimeout(() => setCopiedId((id) => (id === ideaId ? null : id)), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterByScore('all');
    setSortBy('newest');
  };

  const hasFilters = searchTerm || filterByScore !== 'all' || sortBy !== 'newest';

  return (
    <div className="mx-auto flex w-full max-w-[1120px] gap-8 px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full min-w-0 max-w-[680px] flex-1 xl:mx-0">
      <header className="mb-6">
        <h1 className="page-title">Home</h1>
        <p className="page-subtitle">
          Projects matched to your skills · {filteredAndSortedFeed.length}{' '}
          {filteredAndSortedFeed.length === 1 ? 'project' : 'projects'}
        </p>
        {!user?.skills?.length && (
          <p className="mt-3 text-sm text-muted">
            Add skills to{' '}
            <Link to={`/${user?.username}`} className="font-semibold text-link hover:underline">
              your profile
            </Link>{' '}
            to get better matches.
          </p>
        )}
      </header>

      {/* Search + filters */}
      <div className="mb-8 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            type="text"
            placeholder="Search projects or skills"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterByScore}
            onChange={(e) => setFilterByScore(e.target.value)}
            className="input w-auto cursor-pointer appearance-none pr-8"
            style={selectChevron}
            aria-label="Filter by match"
          >
            {MATCH_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-auto cursor-pointer appearance-none pr-8"
            style={selectChevron}
            aria-label="Sort"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="mostLiked">Most liked</option>
            <option value="bestMatch">Best match</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="link-btn ml-1">
              Clear
            </button>
          )}
        </div>
      </div>

      {loadingFeed ? (
        <div className="empty">
          <span className="spinner" />
        </div>
      ) : filteredAndSortedFeed.length === 0 ? (
        <div className="empty">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-fg">
            <Compass className="h-8 w-8" strokeWidth={1.5} />
          </span>
          <h3 className="empty-title">
            {searchTerm || filterByScore !== 'all' ? 'No matching projects' : 'No projects yet'}
          </h3>
          <p className="empty-text">
            {searchTerm || filterByScore !== 'all'
              ? 'Try a different search or filter.'
              : 'Add skills to your profile to get personalised recommendations.'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn btn-primary mt-5">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedFeed.map((idea) => {
            const liked = isLikedByUser(idea);
            const likeCount = idea.likes?.length || 0;
            const commentCount = idea.comments?.length || 0;

            return (
              <article key={idea._id} className="card card-hover p-5">
                {/* Author */}
                <div className="flex items-center gap-3">
                  <Link to={`/${idea.createdBy?.username}`}>
                    <Avatar src={idea.createdBy?.avatar} name={idea.createdBy?.name} size="sm" />
                  </Link>
                  <div className="min-w-0 flex-1 truncate text-sm">
                    <Link to={`/${idea.createdBy?.username}`} className="font-semibold text-fg hover:text-muted">
                      {idea.createdBy?.username || 'unknown'}
                    </Link>
                    <span className="text-subtle"> · {formatTimeAgo(idea.createdAt)}</span>
                  </div>
                  <span className="badge shrink-0" title={`${idea.matchScore} of your skills match`}>
                    <span className={`dot ${getMatchDot(idea.matchScore)}`} />
                    {getMatchScoreText(idea.matchScore)}
                  </span>
                </div>

                {/* Content */}
                <button onClick={() => handleViewDetails(idea)} className="mt-4 block text-left">
                  <h2 className="text-lg font-semibold leading-snug text-fg hover:underline">{idea.title}</h2>
                </button>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-fg/90">{idea.description}</p>

                {idea.skillsRequired?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {idea.skillsRequired.map((skill) =>
                      user?.skills?.includes(skill) ? (
                        <span key={skill} className="chip-accent" title="You have this skill">
                          <Check className="h-3 w-3" strokeWidth={3} />
                          {skill}
                        </span>
                      ) : (
                        <span key={skill} className="chip">{skill}</span>
                      )
                    )}
                  </div>
                )}

                {idea.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1">
                    {idea.tags.map((tag) => (
                      <span key={tag} className="tag">#{tag.replace(/\s+/g, '')}</span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleLike(idea._id)}
                    disabled={likingStates[idea._id] || !user?._id}
                    className="icon-btn -ml-1.5"
                    aria-label={liked ? 'Unlike' : 'Like'}
                  >
                    <Heart className={`h-6 w-6 ${liked ? 'fill-danger text-danger' : ''}`} strokeWidth={1.8} />
                  </button>
                  <button onClick={() => toggleComments(idea._id)} className="icon-btn" aria-label="Comments">
                    <MessageCircle className="h-6 w-6 -scale-x-100" strokeWidth={1.8} />
                  </button>
                  <button onClick={() => handleShare(idea._id)} className="icon-btn" aria-label="Copy link">
                    <Send className="h-6 w-6" strokeWidth={1.8} />
                  </button>
                  {copiedId === idea._id && <span className="text-xs text-muted">Link copied</span>}

                  <button onClick={() => handleViewDetails(idea)} className="btn btn-secondary btn-sm ml-auto">
                    View project
                  </button>
                </div>

                <p className="mt-2 text-sm font-semibold text-fg">
                  {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                </p>

                {/* Comments */}
                {commentCount > 0 && !openComments[idea._id] && (
                  <button onClick={() => toggleComments(idea._id)} className="mt-1 text-sm text-subtle hover:text-muted">
                    View {commentCount === 1 ? '1 comment' : `all ${commentCount} comments`}
                  </button>
                )}

                {openComments[idea._id] && (
                  <div className="mt-3 space-y-3">
                    {idea.comments?.map((comment, commentIndex) => (
                      <div key={comment._id || commentIndex} className="flex gap-3 text-sm">
                        <Avatar src={comment.user?.avatar} name={comment.user?.name} size="xs" className="mt-0.5" />
                        <p className="min-w-0 flex-1 leading-relaxed">
                          <span className="mr-1.5 font-semibold text-fg">{comment.user?.username || 'anonymous'}</span>
                          <span className="text-fg/90">{comment.text}</span>
                          <span className="ml-2 text-xs text-subtle">{formatTimeAgo(comment.createdAt)}</span>
                        </p>
                      </div>
                    ))}
                    {commentCount > 0 && (
                      <button onClick={() => toggleComments(idea._id)} className="text-xs text-subtle hover:text-muted">
                        Hide comments
                      </button>
                    )}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePostComment(idea._id);
                  }}
                  className="mt-3 flex items-center gap-3 border-t border-line pt-3"
                >
                  <input
                    type="text"
                    placeholder="Add a comment…"
                    value={commentTexts[idea._id] || ''}
                    onChange={(e) => updateCommentText(idea._id, e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-subtle focus:outline-none"
                    aria-label="Add a comment"
                  />
                  <button
                    type="submit"
                    disabled={commentingStates[idea._id] || !commentTexts[idea._id]?.trim()}
                    className="link-btn"
                  >
                    {commentingStates[idea._id] ? 'Posting…' : 'Post'}
                  </button>
                </form>
              </article>
            );
          })}
        </div>
      )}
      </div>

      <HomeSidebar />
    </div>
  );
};

export default Home;