import React, { useEffect, useState } from 'react';
import { Search, Compass, Heart, MessageCircle, Share2, Plus, LayoutGrid, List } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';

// Native selects keep keyboard + mobile pickers; this just draws the chevron.
const selectChevron = {
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a8a8a8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 0.5rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.25em 1.25em',
};

const countOf = (value) => (Array.isArray(value) ? value.length : (value || 0));

const norm = (value = '') => value.toString().trim().toLowerCase();

// How well a project matches the search text. Skills weigh most, so typing
// "react" puts projects that need React above ones that merely mention it.
const relevance = (idea, query) => {
  if (!query) return 1;
  const skills = (idea.skillsRequired || []).map(norm);
  const tags = (idea.tags || []).map(norm);
  let score = 0;
  if (skills.includes(query)) score += 10;
  else if (skills.some((s) => s.includes(query))) score += 6;
  if (norm(idea.title).includes(query)) score += 5;
  if (tags.some((t) => t.includes(query))) score += 3;
  if (norm(idea.createdBy?.username).includes(query) || norm(idea.createdBy?.name).includes(query)) score += 2;
  if (norm(idea.description).includes(query)) score += 1;
  return score;
};

const AllIdeas = () => {
  const navigate = useNavigate();
  const { allIdeas, getAllIdeas } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedSkills, setSelectedSkills] = useState([]); // lower-cased

  useEffect(() => {
    getAllIdeas();
  }, []);

  // Get all unique tags
  const allTags = [...new Set(allIdeas.flatMap(idea => idea.tags || []))];

  // Most-requested skills across all projects, for the quick filter row.
  // Counted case-insensitively; shown with the first spelling seen.
  const popularSkills = Object.values(
    allIdeas.flatMap((idea) => idea.skillsRequired || []).reduce((acc, skill) => {
      const key = norm(skill);
      if (key) acc[key] = { key, label: acc[key]?.label || skill.trim(), count: (acc[key]?.count || 0) + 1 };
      return acc;
    }, {})
  )
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 14);

  const toggleSkill = (skill) => {
    const key = norm(skill);
    setSelectedSkills((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  };

  const query = norm(searchTerm);

  // Filter and sort ideas
  const filteredIdeas = allIdeas
    .map((idea) => ({ idea, score: relevance(idea, query) }))
    .filter(({ idea, score }) => {
      const ideaSkills = (idea.skillsRequired || []).map(norm);
      const matchesSkills = selectedSkills.every((s) => ideaSkills.includes(s));
      const matchesTag = !selectedTag || (idea.tags && idea.tags.includes(selectedTag));
      return score > 0 && matchesSkills && matchesTag;
    })
    .sort((a, b) => {
      // While searching, best matches first; the chosen sort breaks ties.
      if (query && b.score !== a.score) return b.score - a.score;
      switch (sortBy) {
        case 'popular':
          return countOf(b.idea.likes) - countOf(a.idea.likes);
        case 'trending':
          return countOf(b.idea.views) - countOf(a.idea.views);
        default:
          return new Date(b.idea.createdAt || Date.now()) - new Date(a.idea.createdAt || Date.now());
      }
    })
    .map(({ idea }) => idea);

  // A skill chip is highlighted when it's a selected filter or matches the search.
  const isHighlighted = (skill) => {
    const key = norm(skill);
    return selectedSkills.includes(key) || (query.length > 1 && key.includes(query));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const openIdea = (idea) => navigate(`/project/${idea._id}`);

  const [copiedId, setCopiedId] = useState(null);
  const shareIdea = async (idea) => {
    const url = `${window.location.origin}/project/${idea._id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(idea._id);
      setTimeout(() => setCopiedId((id) => (id === idea._id ? null : id)), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  const hasFilters = searchTerm || selectedTag || selectedSkills.length > 0 || sortBy !== 'recent';
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    setSelectedSkills([]);
    setSortBy('recent');
  };

  // Skills are the most useful thing to scan for; fall back to tags when a project has none.
  const chipsFor = (idea) => (idea.skillsRequired?.length ? idea.skillsRequired : idea.tags || []);

  const Counts = ({ idea }) => (
    <span className="flex shrink-0 items-center gap-3 text-xs text-subtle">
      <span className="inline-flex items-center gap-1" aria-label={`${countOf(idea.likes)} likes`}>
        <Heart className="h-3.5 w-3.5" strokeWidth={2} />
        {countOf(idea.likes)}
      </span>
      <span className="inline-flex items-center gap-1" aria-label={`${countOf(idea.comments)} comments`}>
        <MessageCircle className="h-3.5 w-3.5 -scale-x-100" strokeWidth={2} />
        {countOf(idea.comments)}
      </span>
    </span>
  );

  const IdeaCard = ({ idea }) => {
    // Matching skills first, so the reason a project showed up is visible.
    const chips = [...chipsFor(idea)].sort((a, b) => isHighlighted(b) - isHighlighted(a));
    const areSkills = Boolean(idea.skillsRequired?.length);
    return (
      <article
        role="link"
        tabIndex={0}
        onClick={() => openIdea(idea)}
        onKeyDown={(e) => { if (e.key === 'Enter') openIdea(idea); }}
        className="card card-hover group flex cursor-pointer flex-col p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
      >
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug text-fg group-hover:underline">
            {idea.title}
          </h3>
          {copiedId === idea._id && <span className="text-xs text-muted">Link copied</span>}
          <button
            onClick={(e) => {
              e.stopPropagation();
              shareIdea(idea);
            }}
            className="icon-btn -mr-1.5 -mt-1 text-muted"
            aria-label="Copy link"
          >
            <Share2 className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted">{idea.description}</p>

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.slice(0, 3).map((chip) =>
              areSkills ? (
                <button
                  key={chip}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSkill(chip);
                  }}
                  className={`${isHighlighted(chip) ? 'chip-accent' : 'chip'} hover:border-line-strong`}
                  title={`Show projects that need ${chip}`}
                >
                  {chip}
                </button>
              ) : (
                <span key={chip} className="chip">{chip}</span>
              )
            )}
            {chips.length > 3 && <span className="chip text-muted">+{chips.length - 3} more</span>}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-4">
          <Avatar src={idea.createdBy?.avatar} name={idea.createdBy?.name} size="xs" />
          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-fg">
            {idea.createdBy?.username || idea.createdBy?.name || 'anonymous'}
          </span>
          <Counts idea={idea} />
        </div>
      </article>
    );
  };

  const ListView = () => (
    <div className="card divide-y divide-line">
      {filteredIdeas.map((idea) => (
        <button
          key={idea._id}
          onClick={() => openIdea(idea)}
          className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-surface-2"
        >
          <Avatar src={idea.createdBy?.avatar} name={idea.createdBy?.name} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-3">
              <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">{idea.title}</h3>
              <Counts idea={idea} />
            </div>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted">{idea.description}</p>
            <p className="mt-1 truncate text-xs text-subtle">
              {idea.createdBy?.username || idea.createdBy?.name || 'anonymous'} · {formatDate(idea.createdAt)}
              {chipsFor(idea).length > 0 && ` · ${chipsFor(idea).slice(0, 3).join(', ')}`}
            </p>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Explore</h1>
          <p className="page-subtitle">
            {selectedSkills.length > 0
              ? `${filteredIdeas.length} ${filteredIdeas.length === 1 ? 'project needs' : 'projects need'} ${selectedSkills
                  .map((k) => popularSkills.find((p) => p.key === k)?.label || k)
                  .join(' + ')}`
              : `Browse every project on InnoMate · ${filteredIdeas.length} ${filteredIdeas.length === 1 ? 'project' : 'projects'}`}
          </p>
        </div>
        <button onClick={() => navigate('/newproject')} className="btn btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" strokeWidth={2} />
          New project
        </button>
      </header>

      {/* Search + filters */}
      <div className="mb-8 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            type="text"
            placeholder="Search by skill, project or person — e.g. React"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="input w-auto max-w-full cursor-pointer appearance-none pr-8"
            style={selectChevron}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-auto cursor-pointer appearance-none pr-8"
            style={selectChevron}
            aria-label="Sort"
          >
            <option value="recent">Most recent</option>
            <option value="popular">Most popular</option>
            <option value="trending">Trending</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="link-btn ml-1">
              Clear
            </button>
          )}

          <div className="ml-auto flex items-center gap-1" role="group" aria-label="View">
            <button
              onClick={() => setViewMode('grid')}
              className={`icon-btn ${viewMode === 'grid' ? 'text-fg' : 'text-subtle'}`}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid className="h-5 w-5" strokeWidth={1.8} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`icon-btn ${viewMode === 'list' ? 'text-fg' : 'text-subtle'}`}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {popularSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="mr-1 text-xs font-semibold text-muted">Skills</span>
            {popularSkills.map(({ key, label, count }) => {
              const active = selectedSkills.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleSkill(label)}
                  aria-pressed={active}
                  className={`${active ? 'chip-accent' : 'chip'} cursor-pointer transition-colors hover:border-line-strong`}
                >
                  {label}
                  <span className={active ? 'text-link/70' : 'text-subtle'}>{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Ideas display */}
      {filteredIdeas.length === 0 ? (
        <div className="empty">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-fg">
            <Compass className="h-8 w-8" strokeWidth={1.5} />
          </span>
          <h3 className="empty-title">{hasFilters ? 'No matching projects' : 'No projects yet'}</h3>
          <p className="empty-text">
            {hasFilters ? 'Try a different search or category.' : 'Projects shared by the community will show up here.'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn btn-secondary mt-5">
              Clear filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredIdeas.map((idea) => (
            <IdeaCard key={idea._id} idea={idea} />
          ))}
        </div>
      ) : (
        <ListView />
      )}
    </div>
  );
};

export default AllIdeas;
