import { create } from 'zustand';
import axios from '../api/axiosInstance';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,
  allIdeas: [],
  detailedUser: null,
  userIdeas: [],
  loadingIdeas: false,
  personalizedFeed: [],
  loadingFeed: false,
  joinRequestsByIdea: {},           // { [ideaId]: Array<JoinRequest> }
  joinStatusByIdea: {},             // { [ideaId]: 'pending'|'accepted'|'rejected'|null }
  loadingJoin: false,
  loadingRequests: false,
  myTeams: [],           // all teams (with role + populated members)
  myLeadTeams: [],       // teams where I'm the leader
  myMemberTeams: [],     // teams where I'm just a member
  loadingTeams: false,
  errorTeams: null,


  get isAuthenticated() {
    return !!get().user;
  },

  fetchUser: async () => {
    try {
      const res = await axios.get('/users/me');
      set({ user: res.data });
    } catch (err) {
      set({ user: null });
      console.log('Not logged in or token expired.');
    }
  },


  register: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/auth/register', formData); // Make sure your backend route is /auth/register
      set({ user: res.data.user, loading: false });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Registration failed',
        loading: false,
      });
      return false;
    }
  },

  login: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/auth/login', formData);
      set({ user: res.data.user, loading: false });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Login failed',
        loading: false,
      });
      return null;
    }
  },

  logout: async () => {
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      console.warn('Logout failed on server.');
    }
    set({ user: null });
  },
  // src/Store/authStore.js
  getAllIdeas: async () => {
    try {
      const res = await axios.get('/ideas/all');
      set({ allIdeas: res.data });
    } catch (err) {
      console.error('Failed to fetch all ideas', err);
    }
  },
  getDetailedUser: async () => {
    set({ loading: true });
    try {
      const res = await axios.get('/users/me');  // Assumes your backend supports /users/me for logged-in user
      set({ detailedUser: res.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch user', loading: false });
    }
  },
  getUserIdeas: async (userId) => {
    try {
      set({ loadingIdeas: true, errorIdeas: null });
      const res = await axios.get(`/ideas/user/${userId}`);
      set({ userIdeas: res.data, loadingIdeas: false });
    } catch (error) {
      console.error('Error fetching user ideas:', error);
      set({
        errorIdeas: error.response?.data?.message || 'Failed to fetch ideas',
        loadingIdeas: false
      });
    }
  },

  getIdeaById: async (ideaId) => {
    try {
      const res = await axios.get(`/ideas/${ideaId}`);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch idea details', err);
      return null;
    }
  },


  getPersonalizedFeed: async () => {
    set({ loadingFeed: true });
    try {
      const res = await axios.get('/ideas/feed'); // This hits your backend route
      set({ personalizedFeed: res.data, loadingFeed: false });
    } catch (error) {
      console.error('Failed to fetch personalized feed:', error);
      set({ loadingFeed: false });
    }
  },
  toggleLikeIdea: async (ideaId) => {
    const { user, personalizedFeed } = get();

    if (!user?._id) {
      console.warn('User not authenticated');
      return;
    }

    try {
      const res = await axios.put(`/ideas/${ideaId}/like`);
      const { liked } = res.data;

      const updatedFeed = personalizedFeed.map((idea) => {
        if (idea._id === ideaId) {
          const currentLikes = idea.likes || [];
          const updatedLikes = liked
            ? [...currentLikes, user._id]            // add user id
            : currentLikes.filter(id => id !== user._id); // remove user id

          return {
            ...idea,
            likes: updatedLikes,
          };
        }
        return idea;
      });

      set({ personalizedFeed: updatedFeed });

      return { liked };
    } catch (error) {
      console.error('Error in toggleLikeIdea:', error);
      throw new Error(error.response?.data?.message || 'Failed to toggle like');
    }
  },

  addCommentToIdea: async (ideaId, commentText) => {
    try {
      const res = await axios.post(`/ideas/${ideaId}/comments`, {
        text: commentText,
      });

      const { personalizedFeed } = get();

      // Replace updated comments in the idea
      const updatedFeed = personalizedFeed.map(idea => {
        if (idea._id === ideaId) {
          return {
            ...idea,
            comments: res.data, // updated populated comments
          };
        }
        return idea;
      });

      set({ personalizedFeed: updatedFeed });
      return true;
    } catch (err) {
      console.error('Failed to add comment:', err);
      return false;
    }
  },
  createIdea: async (ideaData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/ideas/createIdea', ideaData);
      set({ loading: false });
      return { success: true, idea: res.data };
    } catch (err) {
      console.error('Create Idea Error:', err);
      set({
        error: err.response?.data?.message || 'Failed to create project',
        loading: false,
      });
      return { success: false };
    }
  },
  sendJoinRequest: async (ideaId) => {
    try {
      set({ loadingJoin: true, error: null });
      const { data } = await axios.post(`/ideas/${ideaId}/join-request`);
      // mark status locally so UI can show "Pending"
      set((state) => ({
        loadingJoin: false,
        joinStatusByIdea: { ...state.joinStatusByIdea, [ideaId]: data?.request?.status || 'pending' },
      }));
      return { ok: true, data };
    } catch (err) {
      set({ loadingJoin: false, error: err.response?.data?.message || 'Failed to send join request' });
      return { ok: false, error: err.response?.data?.message };
    }
  },

  // ---- CHECK MY REQUEST STATUS (member) ----
  getJoinRequestStatus: async (ideaId) => {
    try {
      const { data } = await axios.get(`/ideas/${ideaId}/join-request/status`);
      set((state) => ({
        joinStatusByIdea: { ...state.joinStatusByIdea, [ideaId]: data?.status || null },
      }));
      return { ok: true, status: data?.status, data };
    } catch (err) {
      // 404 means "no request yet" -> clear status
      const msg = err.response?.data?.message || 'Failed to get request status';
      set((state) => ({
        joinStatusByIdea: { ...state.joinStatusByIdea, [ideaId]: null },
      }));
      return { ok: false, error: msg };
    }
  },

  // ---- GET PENDING REQUESTS FOR AN IDEA (leader) ----
  getJoinRequests: async (ideaId) => {
    try {
      set({ loadingRequests: true, error: null });
      const { data } = await axios.get(`/ideas/${ideaId}/requests`);
      set((state) => ({
        loadingRequests: false,
        joinRequestsByIdea: { ...state.joinRequestsByIdea, [ideaId]: data || [] },
      }));
      return { ok: true, data };
    } catch (err) {
      set({ loadingRequests: false, error: err.response?.data?.message || 'Failed to fetch join requests' });
      return { ok: false, error: err.response?.data?.message };
    }
  },

  // ---- ACCEPT REQUEST (leader) ----
  acceptJoinRequest: async (ideaId, requestId) => {
    try {
      const { data } = await axios.put(`/ideas/${ideaId}/requests/${requestId}/accept`);

      // 1) Remove request from pending cache
      set((state) => {
        const list = state.joinRequestsByIdea[ideaId] || [];
        const updated = list.filter((r) => r._id !== requestId);
        return { joinRequestsByIdea: { ...state.joinRequestsByIdea, [ideaId]: updated } };
      });

      // 2) Update teamMembers inside personalizedFeed (optional but nice)
      set((state) => {
        const updatedFeed = state.personalizedFeed.map((idea) => {
          if (idea._id !== ideaId) return idea;
          // If you return team members in accept response you can use it directly.
          // Otherwise just append the requester from the removed request cache (best-effort).
          const prevRequests = state.joinRequestsByIdea[ideaId] || [];
          const accepted = prevRequests.find((r) => r._id === requestId);
          if (!accepted) return idea;
          return {
            ...idea,
            teamMembers: idea.teamMembers
              ? [...idea.teamMembers, { _id: accepted.requester, name: accepted.requesterName }]
              : [{ _id: accepted.requester, name: accepted.requesterName }],
          };
        });
        return { personalizedFeed: updatedFeed };
      });

      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err.response?.data?.message || 'Failed to accept request' };
    }
  },

  // ---- REJECT REQUEST (leader) ----
  rejectJoinRequest: async (ideaId, requestId) => {
    try {
      const { data } = await axios.put(`/ideas/${ideaId}/requests/${requestId}/reject`);

      set((state) => {
        const list = state.joinRequestsByIdea[ideaId] || [];
        const updated = list.filter((r) => r._id !== requestId);
        return { joinRequestsByIdea: { ...state.joinRequestsByIdea, [ideaId]: updated } };
      });

      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err.response?.data?.message || 'Failed to reject request' };
    }
  },
  fetchUserTeams: async () => {
    try {
      set({ loadingTeams: true, errorTeams: null });
      // GET /ideas/teams/mine returns: { teams, leadTeams, memberTeams }
      const { data } = await axios.get('/ideas/teams/mine');
      set({
        myTeams: data?.teams || [],
        myLeadTeams: data?.leadTeams || [],
        myMemberTeams: data?.memberTeams || [],
        loadingTeams: false,
      });
      return { ok: true, data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load your teams';
      set({ loadingTeams: false, errorTeams: msg });
      return { ok: false, error: msg };
    }
  },

  // Optional: quick selector
  getTeamById: (teamId) => {
    const { myTeams } = get();
    return myTeams.find(t => t._id === teamId);
  },

  // Optional: refresh a single team after an action (accept/reject/join)
  refreshTeam: async (teamId) => {
    try {
      // If you have a single-team endpoint, prefer that:
      // const { data } = await axios.get(`/ideas/${teamId}`); // with populate
      // Otherwise re-fetch all (simple + safe):
      await get().fetchUserTeams();
      return { ok: true };
    } catch (e) {
      return { ok: false };
    }
  },





  getUserByUsername: async (username) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/users/username/${username}`);
      set({ detailedUser: res.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch user', loading: false });
    }
  },

  searchUsers: async (query) => {
    try {
      const { data } = await axios.get(`/users/search?query=${query}`);
      return data;
    } catch (err) {
      console.error('Search failed:', err);
      return [];
    }
  },

  getTeamDetails: async (ideaId) => {
    try {
      const { data } = await axios.get(`/ideas/${ideaId}/dashboard`);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err.response?.data?.message || 'Access Denied' };
    }
  },

  removeMember: async (ideaId, userId) => {
    try {
      await axios.put(`/ideas/${ideaId}/members/${userId}/remove`);
      // Refresh idea data
      await get().getIdeaById(ideaId);
      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, error: error.response?.data?.message || 'Failed to remove member' };
    }
  },

  leaveTeam: async (ideaId) => {
    try {
      await axios.put(`/ideas/${ideaId}/leave`);
      // Refresh idea data
      await get().getIdeaById(ideaId);
      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, error: error.response?.data?.message || 'Failed to leave team' };
    }
  },
}));

export default useAuthStore;
