import React, { useState } from 'react';
import { User, Edit3, Settings, Shield, Activity, Calendar, Mail, Phone, MapPin, Award, TrendingUp, Clock, Database, Camera } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
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
    if (['github', 'linkedin', 'twitter'].includes(name)) {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }
  const [selectedSkills, setSelectedSkills] = useState(formData.skills ? formData.skills.split(',').map(s => s.trim()) : []);
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [skillSearchTerm, setSkillSearchTerm] = useState('');

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
    { id: 'overview', label: 'Overview', icon: User },
    ...(isOwnProfile ? [
      { id: 'activity', label: 'Activity', icon: Activity },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'security', label: 'Security', icon: Shield }
    ] : [])
  ];

  const achievements = [
    { title: 'Early Adopter', description: 'Joined in the first month', icon: '🌟', date: 'Jan 2024' },
    { title: 'Project Master', description: 'Completed 50+ projects', icon: '🏆', date: 'Mar 2024' },
    { title: 'Team Player', description: 'Collaborated with 20+ members', icon: '🤝', date: 'May 2024' },
    { title: 'Innovation Leader', description: 'Introduced 5 new features', icon: '💡', date: 'Jul 2024' }
  ];

  const activityData = [
    { action: 'Updated project Alpha', time: '2 hours ago', type: 'update' },
    { action: 'Completed task review', time: '4 hours ago', type: 'complete' },
    { action: 'Added new team member', time: '1 day ago', type: 'create' },
    { action: 'Deployed to production', time: '2 days ago', type: 'deploy' },
    { action: 'Fixed critical bug', time: '3 days ago', type: 'fix' }
  ];


  const renderOverview = () => {
    if (loading || !detailedUser) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading profile...</p>
          </div>
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

    return (
      <div className="space-y-12">
        {/* === Profile Header Section === */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Profile Picture */}
            <div className="relative group flex-shrink-0">
              <div className="w-40 h-40 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <User className="w-20 h-20 text-white" />
              </div>
              {isOwnProfile && (
                <button className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full flex items-center justify-center border-4 border-gray-800 shadow-lg transition-all duration-300 group">
                  <Camera className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              {/* Name and Username */}
              <div className="space-y-2">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight">
                  {name}
                </h1>
                <p className="text-2xl text-gray-400">@{username}</p>
                {bio && (
                  <div className="mt-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                    <p className="text-gray-300 text-lg italic leading-relaxed">{bio}</p>
                  </div>
                )}
              </div>

              {/* Contact Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-blue-300 text-sm font-medium">Email</p>
                    <p className="text-white truncate">{email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500/10 to-green-600/5 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-green-300 text-sm font-medium">Username</p>
                    <p className="text-white truncate">@{username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 md:col-span-2 lg:col-span-1">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400 font-bold text-lg">⚡</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-purple-300 text-sm font-medium">Skills</p>
                    <p className="text-white truncate">{skills?.join(', ') || 'No skills listed'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          {Object.keys(socialLinks).length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">🔗</span>
                Social Links
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {socialLinks.github && (
                  <a
                    href={socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-colors duration-200">
                      <span className="text-white font-bold text-sm">GH</span>
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition-colors duration-200 font-medium">GitHub</span>
                  </a>
                )}

                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-3 bg-blue-900/30 rounded-xl border border-blue-600/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-8 h-8 bg-blue-600/50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-200">
                      <span className="text-white font-bold text-sm">IN</span>
                    </div>
                    <span className="text-blue-300 group-hover:text-blue-200 transition-colors duration-200 font-medium">LinkedIn</span>
                  </a>
                )}

                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-3 bg-sky-900/30 rounded-xl border border-sky-600/30 hover:border-sky-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-8 h-8 bg-sky-600/50 rounded-lg flex items-center justify-center group-hover:bg-sky-600 transition-colors duration-200">
                      <span className="text-white font-bold text-sm">TW</span>
                    </div>
                    <span className="text-sky-300 group-hover:text-sky-200 transition-colors duration-200 font-medium">Twitter</span>
                  </a>
                )}

                {socialLinks.portfolio && (
                  <a
                    href={socialLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-3 bg-emerald-900/30 rounded-xl border border-emerald-600/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-8 h-8 bg-emerald-600/50 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 transition-colors duration-200">
                      <span className="text-white font-bold text-sm">🌐</span>
                    </div>
                    <span className="text-emerald-300 group-hover:text-emerald-200 transition-colors duration-200 font-medium">Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* === Projects Section === */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <span className="mr-3 text-2xl">🚀</span>
              Projects Portfolio
            </h2>
            <div className="text-gray-400">
              <span className="text-2xl font-bold text-purple-400">{userIdeas.length}</span>
              <span className="ml-2">Projects</span>
            </div>
          </div>

          {userIdeas.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Projects Yet</h3>
              <p className="text-gray-500 text-lg">Start by uploading your first project to showcase your work.</p>
              <Link to="/newproject">
                <button className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
                  Upload First Project
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {userIdeas.map((idea, index) => (
                <div
                  key={idea._id}
                  className="group bg-gray-700/30 hover:bg-gray-700/50 rounded-2xl p-6 border border-gray-600/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors duration-200 mb-1">
                          {idea.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Created {new Date(idea.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 border border-purple-500/30 transition-all duration-200 text-sm font-medium">
                      View Details
                    </button>
                  </div>

                  <p className="text-gray-300 text-lg leading-relaxed mb-6">{idea.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-400 text-lg">⚡</span>
                        <span className="text-blue-300 font-semibold">Required Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(idea.skillsRequired || []).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm border border-blue-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                        {(!idea.skillsRequired || idea.skillsRequired.length === 0) && (
                          <span className="text-blue-300/70 italic">No specific skills required</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-400 text-lg">🏷️</span>
                        <span className="text-green-300 font-semibold">Tags</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(idea.tags || []).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm border border-green-500/30"
                          >
                            {tag}
                          </span>
                        ))}
                        {(!idea.tags || idea.tags.length === 0) && (
                          <span className="text-green-300/70 italic">No tags assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderActivity = () => {

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start mb-2">
            <User className="w-8 h-8 mr-3 text-purple-400" />
            Update Profile
          </h2>
          <p className="text-gray-400 text-lg">Keep your profile information up to date</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <div className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white border-b border-gray-700/50 pb-3 flex items-center">
                <span className="mr-2">👤</span>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username || '@username'}
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-gray-600/30 border border-gray-600/30 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">Username cannot be changed</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Bio
                </label>
                <textarea
                  name="bio"
                  placeholder="Tell us about yourself... (e.g., Full-stack Developer passionate about creating innovative solutions)"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 resize-none"
                />
                <p className="text-xs text-gray-500">Maximum 200 characters</p>
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white border-b border-gray-700/50 pb-3 flex items-center">
                <span className="mr-2">⚡</span>
                Skills & Expertise
              </h3>

              {/* Selected Skills Display */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  Your Skills
                </label>

                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                    {selectedSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 text-sm font-medium group hover:bg-purple-500/30 transition-colors duration-200"
                      >
                        {skill}
                        <button
                          onClick={() => handleSkillRemove(skill)}
                          className="text-purple-400 hover:text-red-400 transition-colors duration-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Skills Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleDropdownToggle}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-left text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 flex items-center justify-between"
                  >
                    <span className="text-gray-400">Select skills from list...</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${skillsDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {skillsDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-600/50 rounded-xl shadow-2xl max-h-72 overflow-hidden">
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-700/50">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search skills..."
                            value={skillSearchTerm}
                            onChange={handleSkillSearchChange}
                            className="w-full px-4 py-2 pl-10 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 text-sm"
                            autoFocus
                          />
                          <svg
                            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* Skills List */}
                      <div className="max-h-48 overflow-y-auto">
                        {filteredSkills.length > 0 ? (
                          <div className="p-2">
                            {filteredSkills.map((skill, index) => (
                              <button
                                key={index}
                                onClick={() => handleSkillSelect(skill)}
                                className="w-full text-left px-3 py-2 text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 rounded-lg transition-colors duration-200 text-sm"
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            {skillSearchTerm ? `No skills found matching "${skillSearchTerm}"` : 'No more skills available'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Skill Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom skill..."
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomSkillAdd()}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={handleCustomSkillAdd}
                    className="px-6 py-3 bg-purple-600/20 text-purple-300 rounded-xl hover:bg-purple-600/30 border border-purple-500/30 transition-all duration-200 font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white border-b border-gray-700/50 pb-3 flex items-center">
                <span className="mr-2">🔗</span>
                Social Links
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <span className="mr-2">🐙</span>
                    GitHub
                  </label>
                  <input
                    type="url"
                    name="github"
                    placeholder="https://github.com/username"
                    value={formData.socialLinks?.github || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <span className="mr-2">💼</span>
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.socialLinks?.linkedin || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <span className="mr-2">🐦</span>
                    Twitter
                  </label>
                  <input
                    type="url"
                    name="twitter"
                    placeholder="https://twitter.com/username"
                    value={formData.socialLinks?.twitter || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <span className="mr-2">🌐</span>
                    Portfolio
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    placeholder="https://yourportfolio.com"
                    value={formData.socialLinks?.portfolio || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700/50">
              <button
                onClick={handleSubmit}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/25 flex items-center justify-center"
              >
                <span className="mr-2">💾</span>
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  // Reset form logic here
                  setSelectedSkills([]);
                  setCustomSkill('');
                  setSkillSearchTerm('');
                }}
                className="px-8 py-4 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
              >
                Reset Form
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };



  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'activity':
        return renderActivity();

      case 'settings':
        return <div className="text-white text-center py-12">Settings panel coming soon...</div>;
      case 'security':
        return <div className="text-white text-center py-12">Security settings coming soon...</div>;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Profile Dashboard</h1>
              <p className="text-gray-400">Manage your account and view your activity</p>
            </div>
            <button
              onClick={logout}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/50 p-2 rounded-2xl border border-gray-700/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}