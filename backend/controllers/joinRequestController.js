import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Idea } from '../models/Idea.js';
import { JoinRequest } from '../models/JoinRequest.js';
import { notify } from '../utils/notify.js';

const sameId = (a, b) => a?.toString() === b?.toString();

const isOnTeam = (idea, userId) =>
  sameId(idea.createdBy?._id || idea.createdBy, userId) ||
  idea.teamMembers.some((m) => sameId(m?._id || m, userId));

// Hackathons must cap their team size, personal projects may.
const isTeamFull = (idea) =>
  Boolean(idea.hackathon?.maxTeamSize) && idea.teamMembers.length >= idea.hackathon.maxTeamSize;

// Shared by "leader accepts a request" and "person accepts an invite".
const addToTeam = async (idea, request) => {
  if (!idea.teamMembers.some((m) => sameId(m, request.requester))) {
    idea.teamMembers.push(request.requester);
  }
  request.status = 'accepted';
  await Promise.all([request.save(), idea.save()]);
};

// A request/invite whose person has since left or been removed is stale, so
// the next request or invite reuses the record rather than being refused.
const isStale = (request, idea) =>
  request.status === 'rejected' || (request.status === 'accepted' && !isOnTeam(idea, request.requester));

// POST /api/ideas/:id/join-request — you ask to join someone's project.
export const sendJoinRequest = async (req, res) => {
  try {
    const ideaId = req.params.id;
    const requesterId = req.user._id;

    const idea = await Idea.findById(ideaId).populate('createdBy');
    if (!idea) return res.status(404).json({ message: 'Project not found' });
    if (isOnTeam(idea, requesterId)) return res.status(400).json({ message: 'You are already on this team' });

    const existing = await JoinRequest.findOne({ ideaId, requester: requesterId });

    if (existing?.status === 'pending' && existing.type === 'invite') {
      // They'd already invited you — asking to join is the same as saying yes.
      if (isTeamFull(idea)) return res.status(400).json({ message: 'Team is full' });
      await addToTeam(idea, existing);
      await notify(req, { recipient: idea.createdBy._id, actor: requesterId, type: 'invite_accepted', idea: idea._id, joinRequest: existing._id });
      return res.status(200).json({ message: 'You joined the team', request: existing, joined: true });
    }
    if (existing?.status === 'pending') {
      return res.status(400).json({ message: 'Request already pending' });
    }

    let request;
    if (existing && isStale(existing, idea)) {
      existing.status = 'pending';
      existing.type = 'request';
      request = await existing.save();
    } else {
      const requester = await User.findById(requesterId);
      request = await JoinRequest.create({
        ideaId,
        projectTitle: idea.title,
        leaderId: idea.createdBy._id,
        leaderName: idea.createdBy.name,
        requester: requesterId,
        requesterName: requester.name,
        type: 'request',
      });
    }

    await notify(req, { recipient: idea.createdBy._id, actor: requesterId, type: 'join_request', idea: idea._id, joinRequest: request._id });
    res.status(201).json({ message: 'Join request sent', request });
  } catch (err) {
    console.error('Join request error:', err);
    res.status(500).json({ message: 'Failed to send join request' });
  }
};

// GET /api/ideas/:id/requests — leader's inbox of people asking to join.
export const getJoinRequests = async (req, res) => {
  const { id } = req.params;
  const idea = await Idea.findById(id);

  if (!idea) return res.status(404).json({ message: 'Idea not found' });
  if (!sameId(idea.createdBy, req.user._id))
    return res.status(403).json({ message: 'Only team leader can view requests' });

  // Invites you sent aren't requests for you to approve. Older records have
  // no type, which counts as a request.
  const requests = await JoinRequest.find({ ideaId: id, status: 'pending', type: { $ne: 'invite' } })
    .populate('requester', 'name username skills bio avatar');
  res.status(200).json(requests);
};

// Loads a pending request for a leader acting on it, or sends the error.
const loadRequestForLeader = async (req, res) => {
  const { id, requestId } = req.params;
  const idea = await Idea.findById(id);

  if (!idea) {
    res.status(404).json({ message: 'Idea not found' });
    return {};
  }
  if (!sameId(idea.createdBy, req.user._id)) {
    res.status(403).json({ message: 'Only team leader can manage requests' });
    return {};
  }

  const request = mongoose.isValidObjectId(requestId) ? await JoinRequest.findById(requestId) : null;
  // The request must belong to THIS project — otherwise a leader could pass
  // another project's request id and pull that person into their own team.
  if (!request || !sameId(request.ideaId, idea._id) || request.status !== 'pending' || request.type === 'invite') {
    res.status(400).json({ message: 'Invalid request' });
    return {};
  }
  return { idea, request };
};

export const acceptJoinRequest = async (req, res) => {
  const { idea, request } = await loadRequestForLeader(req, res);
  if (!request) return;

  if (isTeamFull(idea)) return res.status(400).json({ message: 'Team is full' });

  await addToTeam(idea, request);
  await notify(req, { recipient: request.requester, actor: req.user._id, type: 'request_accepted', idea: idea._id, joinRequest: request._id });

  const populated = await Idea.findById(idea._id)
    .populate('createdBy', 'name username')
    .populate('teamMembers', 'name username');

  res.status(200).json({ message: 'Request accepted and user added to team', idea: populated });
};

export const rejectJoinRequest = async (req, res) => {
  const { idea, request } = await loadRequestForLeader(req, res);
  if (!request) return;

  request.status = 'rejected';
  await request.save();
  await notify(req, { recipient: request.requester, actor: req.user._id, type: 'request_declined', idea: idea._id, joinRequest: request._id });

  res.status(200).json({ message: 'Request rejected' });
};

// POST /api/ideas/:id/invite  { userId } — leader invites someone.
export const inviteToProject = async (req, res) => {
  try {
    const { userId } = req.body || {};
    if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ message: 'A valid userId is required' });

    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Project not found' });
    if (!sameId(idea.createdBy, req.user._id)) return res.status(403).json({ message: 'Only the project lead can invite people' });

    const invitee = await User.findById(userId).select('name');
    if (!invitee) return res.status(404).json({ message: 'User not found' });
    if (isOnTeam(idea, userId)) return res.status(400).json({ message: `${invitee.name} is already on this team` });
    if (isTeamFull(idea)) return res.status(400).json({ message: 'Team is full' });

    const existing = await JoinRequest.findOne({ ideaId: idea._id, requester: userId });

    if (existing?.status === 'pending' && existing.type !== 'invite') {
      // They'd already asked to join — inviting them is an approval.
      await addToTeam(idea, existing);
      await notify(req, { recipient: userId, actor: req.user._id, type: 'request_accepted', idea: idea._id, joinRequest: existing._id });
      return res.status(200).json({ message: `${invitee.name} had already asked to join — they're on the team now`, joined: true });
    }
    if (existing?.status === 'pending') {
      return res.status(400).json({ message: `${invitee.name} has already been invited` });
    }

    let invite;
    if (existing && isStale(existing, idea)) {
      existing.status = 'pending';
      existing.type = 'invite';
      invite = await existing.save();
    } else {
      invite = await JoinRequest.create({
        ideaId: idea._id,
        projectTitle: idea.title,
        leaderId: req.user._id,
        leaderName: req.user.name,
        requester: userId,
        requesterName: invitee.name,
        type: 'invite',
      });
    }

    await notify(req, { recipient: userId, actor: req.user._id, type: 'invite', idea: idea._id, joinRequest: invite._id });
    res.status(201).json({ message: `Invite sent to ${invitee.name}`, request: invite });
  } catch (err) {
    console.error('Invite error:', err);
    res.status(500).json({ message: 'Failed to send invite' });
  }
};

// POST /api/ideas/invites/:requestId/(accept|decline) — the invitee answers.
const respondToInvite = (accept) => async (req, res) => {
  const { requestId } = req.params;
  const invite = mongoose.isValidObjectId(requestId) ? await JoinRequest.findById(requestId) : null;

  // Only the invited person can answer, and only once.
  if (!invite || invite.type !== 'invite' || !sameId(invite.requester, req.user._id)) {
    return res.status(404).json({ message: 'Invite not found' });
  }
  if (invite.status !== 'pending') {
    return res.status(400).json({ message: `You already ${invite.status === 'accepted' ? 'accepted' : 'declined'} this invite` });
  }

  const idea = await Idea.findById(invite.ideaId);
  if (!idea) return res.status(404).json({ message: 'This project no longer exists' });

  if (accept) {
    if (isTeamFull(idea)) return res.status(400).json({ message: 'Sorry — this team is already full' });
    await addToTeam(idea, invite);
  } else {
    invite.status = 'rejected';
    await invite.save();
  }

  await notify(req, {
    recipient: idea.createdBy,
    actor: req.user._id,
    type: accept ? 'invite_accepted' : 'invite_declined',
    idea: idea._id,
    joinRequest: invite._id,
  });

  res.status(200).json({ message: accept ? `You joined ${idea.title}` : 'Invite declined', ideaId: idea._id, status: invite.status });
};

export const acceptInvite = respondToInvite(true);
export const declineInvite = respondToInvite(false);

// GET /api/ideas/:ideaId/join-request/status — your relationship to a project.
export const getJoinRequestStatus = async (req, res) => {
  try {
    const request = await JoinRequest.findOne({ ideaId: req.params.ideaId, requester: req.user._id });
    if (!request) return res.status(404).json({ message: 'No join request found' });

    res.status(200).json({ status: request.status, type: request.type || 'request', request });
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
      // Invites the leader sent aren't requests waiting on them.
      { $match: { ideaId: { $in: ideaIds }, status: 'pending', type: { $ne: 'invite' } } },
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