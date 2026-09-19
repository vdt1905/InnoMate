import React, { useState, useCallback } from 'react';
import { ChevronDown, Github, Globe, Heart, Linkedin, Mail, MessageCircle, Search, Twitter, X, FolderOpen, UserPlus } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import Avatar from '../components/Avatar';
import InviteModal from '../components/InviteModal';

export default function Profile() {
  const { user, logout, fetchUser, openConversation } = useAuthStore();
  const navigate = useNavigate();
  const [openingChat, setOpeningChat] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const closeInvite = useCallback(() => setInviteOpen(false), []);
  const [activeTab, setActiveTab] = useState('overview');
  const { detailedUser, getDetailedUser, getUserByUsername, loading } = useAuthStore();
  const { username } = useParams();
  const isOwnProfile = !username || (user && user.username === username);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: '',
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['github', 'linkedin', 'twitter', 'portfolio'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.put('/users/me', formData);
      await fetchUser();
      await getDetailedUser();
      alert('Profile updated!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    }
  };

  const {

    getUserIdeas,
    userIdeas,
  } = useAuthStore();

  useEffect(() => {
    if (username) {
      getUserByUsername(username);
    } else {
      getDetailedUser();
    }
  }, [username]);

  useEffect(() => {
    if (detailedUser?._id) {
      getUserIdeas(detailedUser._id); // Fetch ideas after user is loaded
    }
  }, [detailedUser]);

  const [selectedSkills, setSelectedSkills] = useState(formData.skills ? formData.skills.split(',').map(s => s.trim()) : []);
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [skillSearchTerm, setSkillSearchTerm] = useState('');

  // Seed the edit form from the saved profile. It used to start blank, so
  // saving without retyping every field sent empty values and wiped the profile.
  useEffect(() => {
    if (!isOwnProfile || !detailedUser?._id || detailedUser._id !== user?._id) return;
    const skills = detailedUser.skills || [];
    setFormData({
      name: detailedUser.name || '',
      username: detailedUser.username || '',
      bio: detailedUser.bio || '',
      skills: skills.join(', '),
      socialLinks: {
        github: detailedUser.socialLinks?.github || '',
        linkedin: detailedUser.socialLinks?.linkedin || '',
        twitter: detailedUser.socialLinks?.twitter || '',
        portfolio: detailedUser.socialLinks?.portfolio || '',
      },
    });
    setSelectedSkills(skills);
  }, [isOwnProfile, detailedUser, user?._id]);

  if (!user) {
    return (
      <div className="empty">
        <span className="spinner" />
        <p className="empty-text mt-3">Loading profile…</p>
      </div>
    );
  }

  // Predefined skills list for easy selection
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

  // Filter skills based on search term
  const filteredSkills = availableSkills.filter(skill =>
    !selectedSkills.includes(skill) &&
    skill.toLowerCase().includes(skillSearchTerm.toLowerCase())
  );

  const handleSkillSelect = (skill) => {
    if (!selectedSkills.includes(skill)) {
      const newSkills = [...selectedSkills, skill];
      setSelectedSkills(newSkills);
      // Update formData
      const updatedFormData = {
        ...formData,
        skills: newSkills.join(', ')
      };
      // Assuming you have a setFormData function
      setFormData(updatedFormData);
    }
    setSkillsDropdownOpen(false);
    setSkillSearchTerm(''); // Clear search after selection
  };

  const handleSkillRemove = (skillToRemove) => {
    const newSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    setSelectedSkills(newSkills);
    // Update formData
    const updatedFormData = {
      ...formData,
      skills: newSkills.join(', ')
    };
    setFormData(updatedFormData);
  };

  const handleCustomSkillAdd = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      const newSkills = [...selectedSkills, customSkill.trim()];
      setSelectedSkills(newSkills);
      setFormData({
        ...formData,
        skills: newSkills.join(', ')
      });
      setCustomSkill('');
    }
  };

  const handleDropdownToggle = () => {
    setSkillsDropdownOpen(!skillsDropdownOpen);
    if (!skillsDropdownOpen) {
      setSkillSearchTerm(''); // Clear search when opening dropdown
    }
  };


  const handleSkillSearchChange = (e) => {
    setSkillSearchTerm(e.target.value);
  };


  const tabs = [
    { id: 'overview', label: 'Projects' },
    ...(isOwnProfile ? [
      { id: 'settings', label: 'Edit profile' }
    ] : [])
  ];

  const isProfileLoading = loading || !detailedUser;

  // Instagram-style header: avatar left, identity + stats + bio right.
  const renderHeader = () => {
    if (isProfileLoading) {
      return (
        <div className="empty">
          <span className="spinner" />
          <p className="empty-text mt-3">Loading profile…</p>
        </div>
      );
    }

    const {
      name,
      username,
      email,
      bio,
      skills,
      socialLinks = {},
    } = detailedUser;

    const skillCount = skills?.length || 0;
    const projectCount = userIdeas.length;

    const links = [
      socialLinks.github && { href: socialLinks.github, label: 'GitHub', icon: Github },
      socialLinks.linkedin && { href: socialLinks.linkedin, label: 'LinkedIn', icon: Linkedin },
      socialLinks.twitter && { href: socialLinks.twitter, label: 'Twitter', icon: Twitter },
      socialLinks.portfolio && { href: socialLinks.portfolio, label: 'Portfolio', icon: Globe },
    ].filter(Boolean);

    return (
      <header className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10 md:gap-20 md:px-8">
        <div className="relative shrink-0">
          <Avatar src={detailedUser.avatar} name={name} size="xl" />
        </div>

        <div className="w-full min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <h1 className="truncate text-xl text-fg">{username}</h1>
            {isOwnProfile && (
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveTab('settings')} className="btn btn-secondary btn-sm">
                  Edit profile
                </button>
                <button onClick={logout} className="btn btn-ghost btn-sm">
                  Sign out
                </button>
              </div>
            )}
            {!isOwnProfile && detailedUser?._id && (
              <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  setOpeningChat(true);
                  const res = await openConversation(detailedUser._id);
                  setOpeningChat(false);
                  if (res.ok) navigate(`/chat/${res.id}`);
                  else alert(res.error);
                }}
                disabled={openingChat}
                className="btn btn-primary btn-sm"
              >
                <MessageCircle className="h-4 w-4 -scale-x-100" strokeWidth={2} />
                Message
              </button>
              <button onClick={() => setInviteOpen(true)} className="btn btn-secondary btn-sm">
                <UserPlus className="h-4 w-4" strokeWidth={2} />
                Invite to project
              </button>
              <InviteModal person={detailedUser} open={inviteOpen} onClose={closeInvite} />
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-center gap-8 text-sm sm:justify-start">
            <span>
              <span className="font-semibold text-fg">{projectCount}</span>{' '}
              <span className="text-muted">{projectCount === 1 ? 'project' : 'projects'}</span>
            </span>
            <span>
              <span className="font-semibold text-fg">{skillCount}</span>{' '}
              <span className="text-muted">{skillCount === 1 ? 'skill' : 'skills'}</span>
            </span>
          </div>

          <div className="mt-4 space-y-1 text-sm">
            <p className="font-semibold text-fg">{name}</p>
            {bio && <p className="whitespace-pre-line leading-relaxed text-fg/90">{bio}</p>}
          </div>

          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm sm:justify-start">
            {email && (
              <span className="inline-flex min-w-0 items-center gap-1.5 text-muted">
                <Mail className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                <span className="truncate">{email}</span>
              </span>
            )}
            {links.map((link) => {
              const LinkIcon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-link hover:underline"
                >
                  <LinkIcon className="h-4 w-4" strokeWidth={1.8} />
                  {link.label}
                </a>
              );
            })}
          </div>

          {skillCount > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {skills.map((skill) => (
                <span key={skill} className="chip">{skill}</span>
              ))}
            </div>
          )}
        </div>
      </header>
    );
  };

  const renderOverview = () => {
    if (isProfileLoading) return null;

    if (userIdeas.length === 0) {
      return (
        <div className="empty">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-fg">
            <FolderOpen className="h-7 w-7" strokeWidth={1.5} />
          </span>
          <h3 className="empty-title">No projects yet</h3>
          <p className="empty-text">
            {isOwnProfile
              ? "Start by uploading your first project to showcase your work."
              : "This user hasn't uploaded any projects yet."}
          </p>
          {isOwnProfile && (
            <Link to="/newproject" className="btn btn-primary mt-5">
              Upload first project
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {userIdeas.map((idea) => (
          <Link
            key={idea._id}
            to={`/project/${idea._id}`}
            className="card card-hover flex flex-col p-4"
          >
            <h3 className="line-clamp-1 text-sm font-semibold text-fg">{idea.title}</h3>
            <p className="mt-0.5 text-xs text-subtle">
              {idea.createdBy?.name || detailedUser?.name || 'Unknown'} · {new Date(idea.createdAt).toLocaleDateString()}
            </p>
            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{idea.description}</p>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <Heart className="h-4 w-4" strokeWidth={1.8} />
                {idea.likes?.length || 0}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-4 w-4 -scale-x-100" strokeWidth={1.8} />
                {idea.comments?.length || 0}
              </span>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderSettings = () => {

    return (
      <div className="mx-auto max-w-[630px]">
        <div className="mb-5">
          <h2 className="section-title">Edit profile</h2>
          <p className="mt-1 text-sm text-muted">Keep your profile information up to date</p>
        </div>

        <div className="card space-y-8 p-5">
          {/* Personal information */}
          <section className="space-y-4">
            <h3 className="eyebrow">Personal information</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="label">Full name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  value={formData.username ? `@${formData.username}` : ''}
                  disabled
                  className="input cursor-not-allowed text-subtle"
                />
                <p className="help">Username cannot be changed</p>
              </div>
            </div>

            <div>
              <label className="label">Bio</label>
              <textarea
                name="bio"
                placeholder="Tell people about yourself, e.g. full-stack developer who likes building tools for small teams"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="input resize-none"
              />
              <p className="help">Maximum 200 characters</p>
            </div>
          </section>

          <div className="divider" />

          {/* Skills */}
          <section className="space-y-4">
            <h3 className="eyebrow">Skills</h3>

            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedSkills.map((skill, index) => (
                  <span key={index} className="chip">
                    {skill}
                    <button
                      onClick={() => handleSkillRemove(skill)}
                      className="-mr-0.5 text-subtle transition-colors hover:text-danger"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="h-3 w-3" strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Skills dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={handleDropdownToggle}
                className="input flex items-center justify-between text-left"
              >
                <span className="text-subtle">Select skills from list</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted transition-transform ${skillsDropdownOpen ? 'rotate-180' : ''}`}
                  strokeWidth={2}
                />
              </button>

              {skillsDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-line-strong bg-surface-2 shadow-lg">
                  <div className="border-b border-line p-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                      <input
                        type="text"
                        placeholder="Search skills"
                        value={skillSearchTerm}
                        onChange={handleSkillSearchChange}
                        className="input bg-surface pl-9"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {filteredSkills.length > 0 ? (
                      <div className="p-1">
                        {filteredSkills.map((skill, index) => (
                          <button
                            key={index}
                            onClick={() => handleSkillSelect(skill)}
                            className="w-full rounded-md px-3 py-2 text-left text-sm text-fg transition-colors hover:bg-surface-3"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-subtle">
                        {skillSearchTerm ? `No skills found matching "${skillSearchTerm}"` : 'No more skills available'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Custom skill */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a custom skill"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomSkillAdd()}
                className="input min-w-0 flex-1"
              />
              <button
                type="button"
                onClick={handleCustomSkillAdd}
                className="btn btn-outline"
              >
                Add
              </button>
            </div>
          </section>

          <div className="divider" />

          {/* Social links */}
          <section className="space-y-4">
            <h3 className="eyebrow">Social links</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="label">GitHub</label>
                <input
                  type="url"
                  name="github"
                  placeholder="https://github.com/username"
                  value={formData.socialLinks?.github || ''}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="label">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.socialLinks?.linkedin || ''}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Twitter</label>
                <input
                  type="url"
                  name="twitter"
                  placeholder="https://twitter.com/username"
                  value={formData.socialLinks?.twitter || ''}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Portfolio</label>
                <input
                  type="url"
                  name="portfolio"
                  placeholder="https://yourportfolio.com"
                  value={formData.socialLinks?.portfolio || ''}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                // Reset form logic here
                setSelectedSkills([]);
                setCustomSkill('');
                setSkillSearchTerm('');
              }}
              className="btn btn-ghost"
            >
              Reset
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="page">
      {renderHeader()}

      {/* Tab navigation */}
      <nav className="tabs mt-10 justify-center sm:gap-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab shrink-0 ${activeTab === tab.id ? 'tab-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div className="pt-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
