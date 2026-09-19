import React, { useState } from 'react';
import { Plus, Users, Code, X, Search, ChevronDown } from 'lucide-react';
import useAuthStore from '../Store/authStore';

const Newproject = () => {
  const { createIdea, loading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillsRequired: '',
    tags: '',
    projectType: 'personal',
    hackathon: {
      maxTeamSize: '',
      description: '',
    },
  });

  // Skills management state (similar to Profile component)
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [skillSearchTerm, setSkillSearchTerm] = useState('');

  // Tags management state
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [tagSearchTerm, setTagSearchTerm] = useState('');

  // Predefined skills list
  const availableSkills = [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js',
    'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C++', 'C#', '.NET',
    'PHP', 'Laravel', 'Ruby', 'Ruby on Rails', 'Go', 'Rust', 'Swift', 'Kotlin',
    'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap', 'Material-UI',
    'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Firebase',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
    'Git', 'GitHub', 'GitLab', 'Jira', 'Slack', 'Figma', 'Adobe XD',
    'Machine Learning', 'Data Science', 'AI', 'Blockchain', 'DevOps',
    'Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android',
    'UI/UX Design', 'Graphic Design', 'Product Management', 'Project Management'
  ];

  // Predefined tags list
  const availableTags = [
    'Web Development', 'Mobile App', 'Desktop App', 'API', 'Database',
    'Frontend', 'Backend', 'Full Stack', 'Data Science', 'Machine Learning',
    'AI', 'Blockchain', 'IoT', 'Game Development', 'E-commerce',
    'Social Media', 'Education', 'Healthcare', 'Finance', 'Entertainment',
    'Productivity', 'Utility', 'Open Source', 'Startup', 'Enterprise',
    'Beginner Friendly', 'Advanced', 'Research', 'Prototype', 'MVP'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('hackathon.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        hackathon: {
          ...prev.hackathon,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Skills management functions
  const filteredSkills = availableSkills.filter(skill => 
    !selectedSkills.includes(skill) && 
    skill.toLowerCase().includes(skillSearchTerm.toLowerCase())
  );

  const handleSkillSelect = (skill) => {
    if (!selectedSkills.includes(skill)) {
      const newSkills = [...selectedSkills, skill];
      setSelectedSkills(newSkills);
      setFormData(prev => ({
        ...prev,
        skillsRequired: newSkills.join(', ')
      }));
    }
    setSkillsDropdownOpen(false);
    setSkillSearchTerm('');
  };

  const handleSkillRemove = (skillToRemove) => {
    const newSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    setSelectedSkills(newSkills);
    setFormData(prev => ({
      ...prev,
      skillsRequired: newSkills.join(', ')
    }));
  };

  const handleCustomSkillAdd = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      const newSkills = [...selectedSkills, customSkill.trim()];
      setSelectedSkills(newSkills);
      setFormData(prev => ({
        ...prev,
        skillsRequired: newSkills.join(', ')
      }));
      setCustomSkill('');
    }
  };

  // Tags management functions
  const filteredTags = availableTags.filter(tag => 
    !selectedTags.includes(tag) && 
    tag.toLowerCase().includes(tagSearchTerm.toLowerCase())
  );

  const handleTagSelect = (tag) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setFormData(prev => ({
        ...prev,
        tags: newTags.join(', ')
      }));
    }
    setTagsDropdownOpen(false);
    setTagSearchTerm('');
  };

  const handleTagRemove = (tagToRemove) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    setFormData(prev => ({
      ...prev,
      tags: newTags.join(', ')
    }));
  };

  const handleCustomTagAdd = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      const newTags = [...selectedTags, customTag.trim()];
      setSelectedTags(newTags);
      setFormData(prev => ({
        ...prev,
        tags: newTags.join(', ')
      }));
      setCustomTag('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ideaData = {
      title: formData.title,
      description: formData.description,
      skillsRequired: selectedSkills,
      tags: selectedTags,
      projectType: formData.projectType,
    };

    if (formData.projectType === 'hackathon') {
      ideaData.hackathon = {
        maxTeamSize: parseInt(formData.hackathon.maxTeamSize),
        description: formData.hackathon.description,
      };
    } else if (formData.hackathon.maxTeamSize) {
      // Personal projects can build a team too; the size cap is optional.
      ideaData.hackathon = { maxTeamSize: parseInt(formData.hackathon.maxTeamSize) };
    }

    const { success } = await createIdea(ideaData);
    if (success) {
      alert('Project created successfully!');
      // Reset form
      setFormData({
        title: '',
        description: '',
        skillsRequired: '',
        tags: '',
        projectType: 'personal',
        hackathon: {
          maxTeamSize: '',
          description: '',
        },
      });
      setSelectedSkills([]);
      setSelectedTags([]);
    } else {
      alert('Failed to create project');
    }
  };


  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      skillsRequired: '',
      tags: '',
      projectType: 'personal',
      hackathon: {
        maxTeamSize: '',
        description: '',
      },
    });
    setSelectedSkills([]);
    setSelectedTags([]);
  };

  const projectTypes = [
    { value: 'personal', label: 'Personal project', text: 'Build at your own pace — invite a team anytime', Icon: Code },
    { value: 'hackathon', label: 'Hackathon', text: 'Time-limited competitive project', Icon: Users },
  ];

  return (
    <div className="page-narrow">
      <header className="mb-6">
        <h1 className="page-title">Create a project</h1>
        <p className="page-subtitle">
          Describe your idea and the skills you need. We&apos;ll help you find the right collaborators.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basics */}
        <section className="card p-5">
          <h2 className="section-title">Basics</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="np-title" className="label">
                Title <span className="text-subtle">*</span>
              </label>
              <input
                id="np-title"
                name="title"
                placeholder="Give your project a clear name"
                value={formData.title}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="np-description" className="label">
                Description <span className="text-subtle">*</span>
              </label>
              <textarea
                id="np-description"
                name="description"
                placeholder="What problem does it solve? What will you build, and what's the expected outcome?"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="input min-h-32 resize-y"
              />
              <p className="help">Be specific about goals, scope and expected deliverables.</p>
            </div>
          </div>
        </section>

        {/* Skills & tags */}
        <section className="card p-5">
          <h2 className="section-title">Skills &amp; tags</h2>
          <div className="mt-4 space-y-6">
            {/* Skills */}
            <div>
              <span className="label">Required skills</span>

              {selectedSkills.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {selectedSkills.map((skill, index) => (
                    <span key={index} className="chip">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skill)}
                        className="-mr-0.5 rounded text-subtle transition-colors hover:text-fg"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="h-3 w-3" strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSkillsDropdownOpen(!skillsDropdownOpen)}
                  className="input flex cursor-pointer items-center justify-between text-left text-subtle"
                  aria-expanded={skillsDropdownOpen}
                >
                  Choose from common skills
                  <ChevronDown
                    className={`h-4 w-4 text-muted transition-transform ${skillsDropdownOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2}
                  />
                </button>

                {skillsDropdownOpen && (
                  <div className="card absolute z-20 mt-2 w-full overflow-hidden shadow-lg">
                    <div className="border-b border-line p-3">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                        <input
                          type="text"
                          placeholder="Search skills"
                          value={skillSearchTerm}
                          onChange={(e) => setSkillSearchTerm(e.target.value)}
                          className="input pl-9"
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto p-3">
                      {filteredSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {filteredSkills.map((skill, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSkillSelect(skill)}
                              className="chip cursor-pointer transition-colors hover:border-line-strong hover:bg-surface-3"
                            >
                              <Plus className="h-3 w-3 text-muted" strokeWidth={2.5} />
                              {skill}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="py-2 text-center text-sm text-muted">
                          No skills match &ldquo;{skillSearchTerm}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a custom skill"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCustomSkillAdd(); } }}
                  className="input min-w-0 flex-1"
                />
                <button type="button" onClick={handleCustomSkillAdd} className="btn btn-secondary btn-sm shrink-0">
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Add
                </button>
              </div>
              <p className="help">Pick from the list or add your own.</p>
            </div>

            <div className="divider" />

            {/* Tags */}
            <div>
              <span className="label">Tags</span>

              {selectedTags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {selectedTags.map((tag, index) => (
                    <span key={index} className="chip">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="-mr-0.5 rounded text-subtle transition-colors hover:text-fg"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="h-3 w-3" strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTagsDropdownOpen(!tagsDropdownOpen)}
                  className="input flex cursor-pointer items-center justify-between text-left text-subtle"
                  aria-expanded={tagsDropdownOpen}
                >
                  Choose from common tags
                  <ChevronDown
                    className={`h-4 w-4 text-muted transition-transform ${tagsDropdownOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2}
                  />
                </button>

                {tagsDropdownOpen && (
                  <div className="card absolute z-20 mt-2 w-full overflow-hidden shadow-lg">
                    <div className="border-b border-line p-3">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                        <input
                          type="text"
                          placeholder="Search tags"
                          value={tagSearchTerm}
                          onChange={(e) => setTagSearchTerm(e.target.value)}
                          className="input pl-9"
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto p-3">
                      {filteredTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {filteredTags.map((tag, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleTagSelect(tag)}
                              className="chip cursor-pointer transition-colors hover:border-line-strong hover:bg-surface-3"
                            >
                              <Plus className="h-3 w-3 text-muted" strokeWidth={2.5} />
                              {tag}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="py-2 text-center text-sm text-muted">
                          No tags match &ldquo;{tagSearchTerm}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a custom tag"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCustomTagAdd(); } }}
                  className="input min-w-0 flex-1"
                />
                <button type="button" onClick={handleCustomTagAdd} className="btn btn-secondary btn-sm shrink-0">
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Add
                </button>
              </div>
              <p className="help">Tags help people discover your project.</p>
            </div>
          </div>
        </section>

        {/* Project type */}
        <section className="card p-5">
          <h2 className="section-title">Project type</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {projectTypes.map((type) => {
              const { value, label, text } = type;
              const TypeIcon = type.Icon;
              const selected = formData.projectType === value;
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    selected ? 'border-link bg-accent-soft' : 'border-line hover:border-line-strong'
                  }`}
                >
                  <input
                    type="radio"
                    name="projectType"
                    value={value}
                    checked={selected}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <TypeIcon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-link' : 'text-muted'}`} strokeWidth={1.8} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-fg">{label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{text}</span>
                  </span>
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      selected ? 'border-link' : 'border-line-strong'
                    }`}
                    aria-hidden="true"
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-link" />}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Personal projects: optional team size */}
          {formData.projectType === 'personal' && (
            <div className="mt-5 border-t border-line pt-5">
              <h3 className="text-sm font-semibold text-fg">Team</h3>
              <p className="mt-1 text-sm text-muted">
                People can request to join, and you choose who gets in. Accepted members share a team dashboard and chat.
              </p>
              <div className="mt-4 max-w-xs">
                <label htmlFor="np-personal-team-size" className="label">
                  Maximum team size <span className="text-subtle">(optional)</span>
                </label>
                <input
                  id="np-personal-team-size"
                  name="hackathon.maxTeamSize"
                  placeholder="No limit"
                  value={formData.hackathon.maxTeamSize}
                  onChange={handleChange}
                  type="number"
                  min="2"
                  max="50"
                  className="input"
                />
                <p className="help">Including you. Leave empty for no limit.</p>
              </div>
            </div>
          )}

          {/* Hackathon specific fields */}
          {formData.projectType === 'hackathon' && (
            <div className="mt-5 space-y-4 border-t border-line pt-5">
              <h3 className="text-sm font-semibold text-fg">Hackathon details</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="np-team-size" className="label">
                    Maximum team size <span className="text-subtle">*</span>
                  </label>
                  <input
                    id="np-team-size"
                    name="hackathon.maxTeamSize"
                    placeholder="e.g. 4"
                    value={formData.hackathon.maxTeamSize}
                    onChange={handleChange}
                    required
                    type="number"
                    min="1"
                    max="20"
                    className="input"
                  />
                  <p className="help">Between 1 and 20 people.</p>
                </div>

                <div>
                  <span className="label">Team status</span>
                  <div className="flex h-[38px] items-center">
                    <span className="badge">
                      <span className="dot bg-success" />
                      Looking for teammates
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="np-hackathon-description" className="label">
                  Goals and timeline <span className="text-subtle">*</span>
                </label>
                <textarea
                  id="np-hackathon-description"
                  name="hackathon.description"
                  placeholder="Hackathon-specific goals, timeline, expected deliverables and any special requirements"
                  value={formData.hackathon.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="input min-h-32 resize-y"
                />
              </div>
            </div>
          )}
        </section>

        {error && <div className="alert-error">{error}</div>}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={resetForm} className="btn btn-ghost">
            Reset
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? (
              <>
                <span className="spinner h-4 w-4" />
                Creating…
              </>
            ) : (
              'Create project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Newproject;
