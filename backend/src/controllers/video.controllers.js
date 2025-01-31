import { Videos } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { extractVideoId } from "../utils/extractYoutubeVideoID.js"; // Add YouTube regex utility
import axios from "axios";

// Submit a video (deduct 1 kudo)
export const submitVideo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.kudos < 1) return res.status(400).json({ error: "Insufficient kudos" });

    const videoId = extractVideoId(req.body.url);
    if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL" });

    // Fetch video details from YouTube API
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet",
          id: videoId,
          key: process.env.YOUTUBE_API_KEY, // Add to .env
        },
      }
    );

    if (response.data.items.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    const videoDetails = response.data.items[0].snippet;
    const thumbnailUrl = videoDetails.thumbnails.maxres?.url || videoDetails.thumbnails.default.url;

    // Deduct kudos and save video
    user.kudos -= 1;
    const video = await Videos.create({
      url: req.body.url,
      title: videoDetails.title,
      thumbnail: thumbnailUrl,
      submittedBy: user._id,
    });

    await user.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Appreciate a video (deduct 1 kudo)
export const appreciateVideo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const video = await Videos.findById(req.params.videoId);

    if (user.kudos < 1) return res.status(400).json({ error: "Insufficient kudos" });
    if (video.appreciatedBy.includes(user._id)) {
      return res.status(400).json({ error: "Already appreciated" });
    }

    video.tokenCount += 1;
    video.appreciatedBy.push(user._id);
    user.kudos -= 1;

    await Promise.all([video.save(), user.save()]);
    res.json({ message: "Appreciation added!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get trending videos
export const getTrending = async (req, res) => {
  try {
    const videos = await Videos.find().sort({ tokenCount: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};