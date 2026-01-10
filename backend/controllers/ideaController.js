import { Idea } from '../models/Idea.js';
import { User } from '../models/user.model.js';
import { Message } from '../models/Message.js';

export const createIdea = async (req, res) => {
  try {
    const {
      title,
      description,
      skillsRequired,
      tags,
      projectType,
      hackathon
    } = req.body;

    if (!title || !description || !projectType) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const newIdea = new Idea({
      title,
      description,
      skillsRequired,
      tags,
      projectType,
      createdBy: req.user._id,
      teamMembers: [req.user._id],
    });

    // If it's a hackathon project, validate hackathon fields
    if (projectType === 'hackathon') {
      if (
        !hackathon ||
        !hackathon.maxTeamSize ||
        !hackathon.description
      ) {
        return res.status(400).json({
          message: 'Hackathon projects require team size and description'
        });
      }

      newIdea.hackathon = {
        isHackathon: true,
        maxTeamSize: hackathon.maxTeamSize,
        description: hackathon.description
      };
    }

    const savedIdea = await newIdea.save();
    res.status(201).json(savedIdea);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create project' });
  }
};
export const toggleLikeIdea = async (req, res) => {
  const idea = await Idea.findById(req.params.id);
  if (!idea) return res.status(404).json({ message: 'Idea not found' });

  const userId = req.user._id;
  const index = idea.likes.indexOf(userId);

  if (index === -1) {
    idea.likes.push(userId);
  } else {
    idea.likes.splice(index, 1);
  }

  await idea.save();
  res.status(200).json({ likes: idea.likes.length, liked: index === -1 });
};


export const addComment = async (req, res) => {
  const idea = await Idea.findById(req.params.id);
  if (!idea) return res.status(404).json({ message: 'Idea not found' });

  const comment = {
    user: req.user._id,
    text: req.body.text,
  };

  idea.comments.push(comment);
  await idea.save();

  // Re-fetch the idea to populate the user in comments
  const updatedIdea = await Idea.findById(req.params.id)
    .populate('comments.user', 'name username');

  res.status(201).json(updatedIdea.comments);
};


export const deleteComment = async (req, res) => {
  const idea = await Idea.findById(req.params.ideaId);
  if (!idea) return res.status(404).json({ message: 'Idea not found' });

  const commentIndex = idea.comments.findIndex(
    (c) => c._id.toString() === req.params.commentId
  );

  if (
    commentIndex === -1 ||
    idea.comments[commentIndex].user.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Not allowed to delete this comment' });
  }

  idea.comments.splice(commentIndex, 1);
  await idea.save();

  res.status(200).json({ message: 'Comment deleted' });
};

export const joinTeam = async (req, res) => {
  const idea = await Idea.findById(req.params.id);
  if (!idea) return res.status(404).json({ message: 'Idea not found' });

  // Check if it's a hackathon idea
  if (idea.projectType !== 'hackathon') {
    return res.status(400).json({ message: 'Joining teams is only for hackathon ideas' });
  }

  // Check if already in team
  if (idea.teamMembers.includes(req.user._id)) {
    return res.status(400).json({ message: 'You are already part of the team' });
  }

  // Check if team is full
  if (idea.teamMembers.length >= idea.hackathon.maxTeamSize) {
    return res.status(400).json({ message: 'Team is already full' });
  }

  idea.teamMembers.push(req.user._id);
  await idea.save();

  res.status(200).json({
    message: 'Joined the team',
    teamSize: idea.teamMembers.length,
    team: idea.teamMembers,
  });
};



export const getPersonalizedFeed = async (req, res) => {
  try {
    const userSkills = req.user.skills.map(skill => skill.toLowerCase());

    const allIdeas = await Idea.find().populate('createdBy', 'name username avatar')
      .populate('comments.user', 'name username avatar');

    const scoredIdeas = allIdeas.map(idea => {
      const ideaSkills = idea.skillsRequired.map(s => s.toLowerCase());
      const commonSkills = ideaSkills.filter(skill => userSkills.includes(skill));
      const score = commonSkills.length;
      return { ...idea._doc, matchScore: score };
    });

    // Sort by match score DESC, then createdAt DESC
    const sortedIdeas = scoredIdeas
      .sort((a, b) =>
        b.matchScore === a.matchScore
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : b.matchScore - a.matchScore
      );

    res.status(200).json(sortedIdeas);
  } catch (error) {
    console.error('Feed Error:', error);
    res.status(500).json({ message: 'Failed to generate personalized feed' });
  }
};


// controllers/ideaController.js
export const getAllIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username name avatar') // ✅ Must populate
      .populate('comments.user', 'name username avatar');
    res.status(200).json(ideas);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ideas' });
  }
};




export const getIdeaById = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id)
      .populate('createdBy', 'name username avatar')
      .populate('teamMembers', 'name username avatar')
      .populate('comments.user', 'name username avatar');

    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    res.status(200).json(idea);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch idea' });
  }
};


export const updateIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    if (idea.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this idea' });
    }

    const { title, description, skillsRequired, tags } = req.body;

    if (title) idea.title = title;
    if (description) idea.description = description;
    if (skillsRequired) {
      idea.skillsRequired = Array.isArray(skillsRequired)
        ? skillsRequired
        : skillsRequired.split(',').map(s => s.trim());
    }
    if (tags) {
      idea.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map(t => t.trim());
    }

    const updated = await idea.save();
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating idea' });
  }
};

// @desc Delete idea (only by creator)
export const deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    if (idea.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this idea' });
    }

    await idea.remove();
    res.status(200).json({ message: 'Idea deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting idea' });
  }
};

export const searchIdeas = async (req, res) => {
  try {
    const { tag, skill } = req.query;

    const query = {};

    if (tag) {
      query.tags = { $in: [new RegExp(tag, 'i')] };
    }

    if (skill) {
      query.skillsRequired = { $in: [new RegExp(skill, 'i')] };
    }

    const ideas = await Idea.find(query)
      .populate('createdBy', 'name username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(ideas);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ message: 'Failed to fetch idea' });
  }
};

export const recommendTeammates = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    const ideaSkills = idea.skillsRequired.map(skill => skill.toLowerCase());
    const excludedIds = [...idea.teamMembers, idea.createdBy.toString()];

    const candidates = await User.find({ _id: { $nin: excludedIds } });

    const scoredCandidates = candidates.map(user => {
      const userSkills = (user.skills || []).map(skill => skill.toLowerCase());
      const matchCount = ideaSkills.filter(skill => userSkills.includes(skill)).length;
      return {
        _id: user._id,
        name: user.name,
        username: user.username,
        skills: user.skills,
        matchScore: matchCount
      };
    });

    const sorted = scoredCandidates
      .filter(c => c.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(sorted);
  } catch (err) {
    console.error('Teammate recommendation error:', err);
    res.status(500).json({ message: 'Failed to recommend teammates' });
  }
};

export const getIdeasByUser = async (req, res) => {
  try {
    const ideas = await Idea.find({ createdBy: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username name avatar')
      .populate('teamMembers', 'name username avatar'); // 👈 add this

    res.status(200).json(ideas);
  } catch (err) {
    console.error('Error fetching user ideas:', err);
    res.status(500).json({ message: 'Failed to fetch user ideas' });
  }
};

export const getTeamDetails = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id)
      .populate('createdBy', 'name username email avatar') // Include email
      .populate('teamMembers', 'name username email avatar') // Include email
      .populate('comments.user', 'name username avatar');

    if (!idea) return res.status(404).json({ message: 'Project not found' });

    // Security Check: User must be Owner OR Member
    const isOwner = idea.createdBy._id.toString() === req.user._id.toString();
    const isMember = idea.teamMembers.some(member => member._id.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied: Team members only' });
    }

    res.status(200).json(idea);
  } catch (err) {
    console.error('Error fetching team details:', err);
    res.status(500).json({ message: 'Failed to load team dashboard' });
  }
};

export const getTeamMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ teamId: id }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const idea = await Idea.findById(id);

    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    // Check if requester is owner
    if (idea.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project lead can remove members' });
    }

    // Remove member
    idea.teamMembers = idea.teamMembers.filter(
      (memberId) => memberId.toString() !== userId
    );

    await idea.save();
    res.status(200).json({ message: 'Member removed successfully', teamMembers: idea.teamMembers });
  } catch (err) {
    console.error('Error removing member:', err);
    res.status(500).json({ message: 'Failed to remove member' });
  }
};

export const leaveTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const idea = await Idea.findById(id);

    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    // Check if requester is actually a member
    const isMember = idea.teamMembers.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(400).json({ message: 'You are not a member of this team' });
    }

    // Owner cannot leave
    if (idea.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Project lead cannot leave the team.' });
    }

    // Remove self
    idea.teamMembers = idea.teamMembers.filter(
      (memberId) => memberId.toString() !== req.user._id.toString()
    );

    await idea.save();
    res.status(200).json({ message: 'You have left the team', teamMembers: idea.teamMembers });
  } catch (err) {
    console.error('Error leaving team:', err);
    res.status(500).json({ message: 'Failed to leave team' });
  }
};



