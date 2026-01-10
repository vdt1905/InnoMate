
import { User } from '../models/user.model.js';
import { Idea } from '../models/Idea.js';
import { JoinRequest } from '../models/JoinRequest.js';

export const sendJoinRequest = async (req, res) => {
  try {
    const ideaId = req.params.id;
    const requesterId = req.user._id;

    const idea = await Idea.findById(ideaId).populate('createdBy');
    if (!idea) return res.status(404).json({ message: 'Project not found' });

    const existing = await JoinRequest.findOne({ ideaId, requester: requesterId });
    if (existing) {
      if (existing.status === 'pending') {
        return res.status(400).json({ message: 'Request already pending' });
      }
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: 'You are already a member' });
      }
      // If rejected, allow re-request (reset to pending)
      existing.status = 'pending';
      await existing.save();
      return res.status(200).json({ message: 'Join request sent again', request: existing });
    }

    const requester = await User.findById(requesterId);

    const request = await JoinRequest.create({
      ideaId,
      projectTitle: idea.title,
      leaderId: idea.createdBy._id,
      leaderName: idea.createdBy.name,
      requester: requesterId,
      requesterName: requester.name,
    });

    res.status(201).json({ message: 'Join request sent', request });
  } catch (err) {
    console.error('Join request error:', err);
    res.status(500).json({ message: 'Failed to send join request' });
  }
};

export const getJoinRequests = async (req, res) => {
  const { id } = req.params;
  const idea = await Idea.findById(id);

  if (!idea) return res.status(404).json({ message: 'Idea not found' });
  if (idea.createdBy.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Only team leader can view requests' });

  const requests = await JoinRequest.find({ ideaId: id, status: 'pending' }).populate('requester', 'name skills bio');
  res.status(200).json(requests);
};


export const acceptJoinRequest = async (req, res) => {
  const { id, requestId } = req.params; // id = ideaId
  const idea = await Idea.findById(id);

  if (!idea) return res.status(404).json({ message: 'Idea not found' });
  if (idea.createdBy.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Only team leader can accept requests' });

  const request = await JoinRequest.findById(requestId);
  if (!request || request.status !== 'pending')
    return res.status(400).json({ message: 'Invalid request' });

  if (idea.hackathon?.isHackathon && idea.teamMembers.length >= idea.hackathon.maxTeamSize) {
    return res.status(400).json({ message: 'Team is full' });
  }

  // Add member
  idea.teamMembers.push(request.requester);
  request.status = 'accepted';
  await request.save();
  await idea.save();

  // ⬇️ Re-fetch populated document for immediate UI update
  const populated = await Idea.findById(id)
    .populate('createdBy', 'name username')
    .populate('teamMembers', 'name username');

  res.status(200).json({
    message: 'Request accepted and user added to team',
    idea: populated, // 👈 send populated idea back
  });
};



export const rejectJoinRequest = async (req, res) => {
  const { id, requestId } = req.params;
  const idea = await Idea.findById(id);

  if (!idea) return res.status(404).json({ message: 'Idea not found' });
  if (idea.createdBy.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Only team leader can reject requests' });

  const request = await JoinRequest.findById(requestId);
  if (!request || request.status !== 'pending')
    return res.status(400).json({ message: 'Invalid request' });

  request.status = 'rejected';
  await request.save();

  res.status(200).json({ message: 'Request rejected' });
};


export const getJoinRequestStatus = async (req, res) => {
  try {
    const { ideaId } = req.params;
    const requesterId = req.user._id;

    const request = await JoinRequest.findOne({ ideaId, requester: requesterId });

    if (!request) {
      return res.status(404).json({ message: 'No join request found' });
    }

    res.status(200).json({ status: request.status, request });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ message: 'Error checking join request status' });
  }
};


export const getUserTeams = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find ideas where the user is the leader or a member
    const ideas = await Idea.find({
      $or: [{ createdBy: userId }, { teamMembers: userId }]
    })
      .sort({ updatedAt: -1 })
      .populate('createdBy', 'name username')
      .populate('teamMembers', 'name username');

    // Build a map of pending requests count per idea (for leader UX)
    const ideaIds = ideas.map((i) => i._id);
    const pendingCounts = await JoinRequest.aggregate([
      { $match: { ideaId: { $in: ideaIds }, status: 'pending' } },
      { $group: { _id: '$ideaId', count: { $sum: 1 } } }
    ]);
    const pendingMap = pendingCounts.reduce((acc, row) => {
      acc[row._id.toString()] = row.count;
      return acc;
    }, {});

    // Enrich ideas with role + pending count
    const teams = ideas.map((idea) => {
      const isLeader = String(idea.createdBy?._id || idea.createdBy) === String(userId);
      return {
        ...idea.toObject(),
        role: isLeader ? 'leader' : 'member',
        pendingRequests: isLeader ? (pendingMap[idea._id.toString()] || 0) : 0
      };
    });

    // Optionally also return split lists (handy for UI)
    const leadTeams = teams.filter((t) => t.role === 'leader');
    const memberTeams = teams.filter((t) => t.role === 'member');

    res.status(200).json({ teams, leadTeams, memberTeams });
  } catch (err) {
    console.error('getUserTeams error:', err);
    res.status(500).json({ message: 'Failed to load your teams' });
  }
};