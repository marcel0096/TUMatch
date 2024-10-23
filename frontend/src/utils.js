import { useState, useEffect } from "react";
import {
  fetchUserById,
  getSkillsFromSkillIds,
  getAllSkills,
} from "./components/api.js";

export const formatDate = (date) => {
  if (!date) return "";
  const formattedDate = new Date(date).toISOString().split("T")[0];
  return formattedDate;
};

// Debounce function to set delay for search
export function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const context = this;

    clearTimeout(timeout);

    if (!args[0]) {
      // If the first argument (search query) is empty, clear results immediately
      func.call(context, ...args);
      return;
    }

    // Execute func only after "wait" milliseconds have passed
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}
export function useEmployeeDetails(employees) {
  const [employeeDetails, setEmployeeDetails] = useState(null);

  useEffect(() => {
    if (!employees || employees.length === 0) {
      setEmployeeDetails([]);
      return;
    }

    async function fetchDetails() {
      try {
        const details = await getUserDetails(employees);
        setEmployeeDetails(details);
      } catch (error) {
        console.error("Failed to fetch employee details:", error);
      }
    }

    fetchDetails();
  }, [employees]); // Empty dependency array means this runs once on mount

  async function getUserDetails(employees) {
    const userDetails = await Promise.all(
      employees.map(async (employeeId) => {
        const user = await fetchUserById(employeeId);
        let userProfilePicture;
        if (user.profilePicture && user.profilePicture.data) {
          userProfilePicture = user.profilePicture.imageUrl;
        } else {
          userProfilePicture = null;
        }
        return {
          firstName: user.firstName,
          lastName: user.lastName,
          position: user.position,
          profilePicture: userProfilePicture,
        };
      })
    );
    return userDetails;
  }

  return employeeDetails;
}

export async function getSkillNamesFromIds(skillIds) {
  const userSkills = await getSkillsFromSkillIds(skillIds);
  const userSkillNames = userSkills.map((skill) => ({
    label: skill.label,
    value: skill.value,
  }));
  return userSkillNames;
}

export async function getAllSkillNames() {
  const allSkills = await getAllSkills();
  const allSkillNames = allSkills.map((skill) => ({
    label: skill.label,
    value: skill.value,
  }));
  return allSkillNames;
}
