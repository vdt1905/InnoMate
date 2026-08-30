import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  skillsRequired: [String],
  tags: [String],
  projectType: {
    type: String,
    enum: ['personal', 'hackathon'],
    default: 'personal'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  hackathon: {
    isHackathon: { type: Boolean, default: false },
    maxTeamSize: { type: Number },
    description: { type: String }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]

}, { timestamps: true });

// createdBy backs the profile feed, teamMembers backs "my teams", and the
// tag/skill arrays back search.
ideaSchema.index({ createdBy: 1, createdAt: -1 });
ideaSchema.index({ teamMembers: 1 });
ideaSchema.index({ tags: 1 });
ideaSchema.index({ skillsRequired: 1 });

export const Idea = mongoose.model('Idea', ideaSchema);
