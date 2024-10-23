import User from "../models/userModel.js";
import Startup from "../models/startupModel.js";
import { response } from "express";
import { convertObjectToUrl } from "../utils.js";

/* This function should return a list of recommended startups for the user
  The recommendations are based on the user's skills and the required skills of the startups jobOffers
  The recommendations are sorted by relevance and
  The recommendations are returned as an array of startup ids
  */
export async function calculateRecommendations(userId) {
  try {
    const userObject = await User.findById(userId);

    const userSkills = userObject.skills;

    const startups = await Startup.find();

    let recommendedStartups = [];

    startups.forEach((startup) => {
      let score = 0;
      startup.jobOffers.forEach((jobOffer) => {
        const requiredSkills = jobOffer.requiredSkills;
        userSkills.forEach((userSkill) => {
          if (requiredSkills.includes(userSkill)) {
            score++;
          }
        });
      });

      // Add the startup to the recommended startups
      recommendedStartups.push({ startupId: startup._id, score: score });
    });
    // Sort the recommended startups by score
    recommendedStartups.sort((a, b) => b.score - a.score);
    // Return the recommended startups
    let mapped = recommendedStartups.map((startup) => startup.startupId);
    return mapped;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getRecommendedStartups(req, res) {
  try {
    const { userId, initialLoadSize } = req.body;

    const recommendedStartups = await calculateRecommendations(userId);

    let initialStartupLoad = [];
    // Return the first initalLoadSize recommended startups
    for (
      let i = 0;
      i < initialLoadSize && i < recommendedStartups.length;
      i++
    ) {
      const startupObj = await Startup.findById(recommendedStartups[i]);
      if (startupObj.startupLogo && startupObj.startupLogo.data) {
        convertObjectToUrl(startupObj.startupLogo);
      }
      initialStartupLoad.push(startupObj);
    }

    let response = {
      recommendation: recommendedStartups,
      initialStartupLoad: initialStartupLoad,
    };
    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export { getRecommendedStartups };
