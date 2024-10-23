const API_URL = "http://localhost:8080";

/**
 * Sends a get request to the backend and if successfull,
 * returns the currently logged in user as user object
 * returns null if no user is logged in
 *
 * @returns {Promise<{user: user}>}
 */
export async function getUser() {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data;
}

/**
 * Sends a post request to the backend with the provided email and password
 * to login the user, if email and password match a user in the database
 * it returns user data: userId, profession, validSubscription that are
 * needed for local storage and context
 *
 * @param {String} email
 * @param {String} password
 * @returns {Promise<{message: string, succes: boolean, userId: string, profession: string, validSubscription: boolean}>}
 * @throws {Error} if login failed
 */
export async function performLogin(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  if (!response.ok) {
    const text = response.text();
    throw new Error(text);
  }
  const data = response.json();
  return data;
}

/**
 * Sends a post request to the backend with the provided email, password and profession
 * to sign up the user, if email is not already in use.
 * also logs the user in, if the signup was successfull
 * it returns user data that are needed for local storage and context
 *
 * @param {String} email
 * @param {String} password
 * @param {String} profession
 * @returns {Promise<{message: string, succes: boolean, userId: string, profession: string, validSubscription: boolean}>}
 * @throws {Error} if signup failed
 */
export async function performSignup(email, password, profession) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, profession }),
    credentials: "include",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
  const data = await response.json();
  return data;
}

/**
 * Sends a get request to the backend to logout the user
 * if successfull, returns true
 *
 * @returns {Promise<boolean>}
 * @throws {Error} if logout failed
 */
export async function performLogout() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to logout");
  }
  return true;
}

/**
 * Sends a get request to the backend to get a user by id
 *
 * @param {String} id
 * @returns {Promise<{user: user}>}
 * @throws {Error} if fetching users failed
 */
export async function fetchUserById(id) {
  const response = await fetch(`${API_URL}/users/byID/${id}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  const data = await response.json();
  return data;
}
/**
 * Sends a get request to the backend to get a user by id
 * the user object contains jobPositions and studyPrograms in descending order
 * based on the startDate
 *
 * @param {String} id
 * @returns {Promise<{user: user}>}
 * @throws {Error} if fetching users failed
 */
export async function fetchUserWithSortedInformationById(id) {
  const response = await fetch(`${API_URL}/users/byID/${id}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  const data = await response.json();
  if (
    data.jobPositions &&
    Array.isArray(data.jobPositions) &&
    data.studyPrograms &&
    Array.isArray(data.studyPrograms)
  ) {
    data.jobPositions.sort((a, b) => b.startDate.localeCompare(a.startDate));
    data.studyPrograms.sort((a, b) => b.startDate.localeCompare(a.startDate));
  }

  return data;
}

/**
 * Sends a get request to the backend to get a startup object by
 * a user id, given that the user is a co-founder of the startup
 *
 * @param {String} id
 * @returns {Promise<{startup: startup}>}
 * @throws {Error} if fetching startup failed
 * @throws {Error} if no user id is provided
 * @throws {Error} if user is not a co-founder of a startup
 */
export async function fetchStartupByUserId(id) {
  const response = await fetch(`${API_URL}/startups/byUserID/${id}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch startup data");
  }
  const data = await response.json();
  return data;
}

/**
 * Sends a get request to the backend to get a startup object by
 * a startup id
 *
 * @param {String} id
 * @returns {Promise<{startup: startup}>}
 * @throws {Error} if fetching startup failed
 * @throws {Error} if no startup id is provided
 * @throws {Error} if startup id is not found
 * @throws {Error} if startup id is not valid
 * @throws {Error} if startup id is not a string
 */
export async function fetchStartupByStartupId(id) {
  const response = await fetch(`${API_URL}/startups/byID/${id}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch startup data");
  }
  const data = await response.json();
  return data;
}

/**
 * Sends a get request to the backend to get a chat object by
 * a user id, given that the user is a participant in the chat
 *
 * @param {String} id
 * @returns {Promise<{chat: chat}>}
 * @throws {Error} if fetching chat failed
 * @throws {Error} if no user id is provided
 * @throws {Error} if user is not a participant in a chat
 * @throws {Error} if user id is not found
 * @throws {Error} if user id is not valid
 * @throws {Error} if user id is not a string
 */
export async function fetchChatsbyUserId(id) {
  if (!id) {
    throw new Error("No user id provided");
  }
  const response = await fetch(`${API_URL}/chat/byParticipant/${id}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch chats");
  }
  const data = await response.json();
  return data;
}

/**
 * Sends a get request to the backend to delete a chat object by
 * a chat id
 *
 * @param {String} chatId
 * @returns {Promise<{chat: chat}>}
 * @throws {Error} if fetching chat failed
 * @throws {Error} if no chat id is provided
 * @throws {Error} if chat id is not found
 * @throws {Error} if chat id is not valid
 * @throws {Error} if chat id is not a string
 */
export async function deleteChat(chatId) {
  const response = await fetch(`${API_URL}/chat/delete/${chatId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to delete chat");
  }
  return true;
}

/**
 * Sends a get request to the backend to get all startups
 * from the database
 *
 * @returns {Promise<{startups: startup[]}>}
 * @throws {Error} if fetching startups failed
 * @throws {Error} if no startups are found
 */
export async function fetchAllStartups() {
  const response = await fetch(`${API_URL}/startups/getAll`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch startup data");
  }
  const data = await response.json();
  return data;
}

/**
 * Sends a get request to the backend to get an investment
 * institution object by a investment institution id
 *
 * @param {String} id
 * @returns {Promise<{company: investmentInstitution}>}
 * @throws {Error} if fetching company failed
 * @throws {Error} if no id is provided
 * @throws {Error} if investment institution id is not found
 * @throws {Error} if investment institution id is not valid
 */
export async function fetchCompanyByCompanyId(id) {
  const response = await fetch(
    `${API_URL}/investment-institutions/byID/${id}`,
    {
      method: "GET",
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch company data");
  }
  const data = await response.json();
  return data;
}

/**
 * Sends a get request to the backend to get an investment
 * institution object by a user id, given that the user is an
 * employee of the institution
 *
 * @param {String} id
 * @returns {Promise<{company: investmentInstitution}>}
 * @throws {Error} if fetching company failed
 * @throws {Error} if no user id is provided
 * @throws {Error} if user is not an employee of an institution
 * @throws {Error} if user id is not found
 * @throws {Error} if user id is not valid
 */
export async function fetchCompanyByEmployeeId(id) {
  const response = await fetch(
    `${API_URL}/investment-institutions/byEmployeeID/${id}`,
    {
      method: "GET",
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch company data");
  }
  const data = await response.json();
  return data;
}

/**
 * send a get request to the backend to create a new unique invitation
 * code for the institution type. This code can be used to create a
 * invite link for the institution
 *
 * @param {String} companyId
 * @param {String} institutionType
 * @returns {Promise<{code: string}>}
 * @throws {Error} if fetching invitation code failed
 * @throws {Error} if no company id is provided
 * @throws {Error} if no institution type is provided
 * @throws {Error} if institution type is not valid
 * @throws {Error} if company id is not found
 * @throws {Error} if company id is not valid
 * @throws {Error} if company id is not a string
 * @throws {Error} if institution type is not a string
 */
export async function getNewInvitationCode(companyId, institutionType) {
  const response = await fetch(
    `${API_URL}/${institutionType}/getInvitationCode/${companyId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to get invitation code");
  }
  const data = await response.json();
  return data;
}

/**
 * send a get request to the backend to validate an invitation code
 * for the institution type. If the code is valid, the institution
 * details are returned and can be used to style the acceptInvitation page
 *
 * @param {String} code
 * @param {String} institutionType
 * @returns {Promise<{valid: boolean, company_id: string, company_name: string, company_image: string, message: string}>}
 * @throws {Error} if validating invitation failed
 * @throws {Error} if no code is provided
 * @throws {Error} if no institution type is provided
 * @throws {Error} if no user id is provided
 * @throws {Error} if institution type is not valid
 */
export async function validateInvitation(code, institutionType) {
  const response = await fetch(
    `${API_URL}/${institutionType}/invite/validate?code=${code}`,
    {
      method: "GET",
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to validate invitation");
  }
  const data = await response.json();
  return data;
}

/**
 * send a post request to the backend to answer an invitation link
 * for the institution type. If the user accepts the invitation, the
 * user id is added to the institutions employees/co-founders list,
 * the invitation code is deleted in database`s institution object and
 * the company id is returned. If the user declines the invitation,
 * the invitation code is deleted in database`s institution object as
 * well
 *
 * @param {String} code
 * @param {String} institutionType
 * @param {String} userId
 * @param {boolean} accept
 * @returns {Promise<{company_id: string}>}
 * @throws {Error} if answering invitation failed
 * @throws {Error} if institution type is not valid
 * @throws {Error} if user id is not valid
 * @throws {Error} if code is not valid
 */
export async function answerInvitation(code, institutionType, userId, accept) {
  const response = await fetch(`${API_URL}/${institutionType}/invite/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: code,
      userId: userId,
      accept: accept,
    }),
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to accept invitation");
  }
  const data = await response.json();
  return data;
}

/**
 * send a get request to the backend to get all users
 * from the database and return them as an array
 * including only their ids and first and lastnames
 *
 * @returns {Promise<[{id: string, firstName: string, lastName: string }]>}
 * @throws {Error} if fetching users failed
 */
export async function getAlIDsAndUsernames() {
  const response = await fetch(`${API_URL}/users/getUsersNamesAndIds`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  const data = await response.json();
  return data;
}

/**
 * send a get request to the backend to get all users
 * from the database that match the query string
 *
 * @param {String} query
 * @returns {Promise<[{id: string, firstName: string, lastName: string, profession: string, getProfilePicture: string }]>}
 * @throws {Error} if fetching users failed
 * @throws {Error} if no query string is provided
 */
export async function getAllUsersFromQuery(query) {
  const response = await fetch(`${API_URL}/users/search?q=${query}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  const data = await response.json();
  return data;
}

export async function getProfilePicture(id) {
  const response = await fetch(`${API_URL}/users/getProfilePicture/${id}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch profile picture");
  }
  const data = await response.json();
  return data;
}

export async function fetchCheckoutSession(amount) {
  const response = await fetch(
    `${API_URL}/payment/create-checkout-session?amount=${amount}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
  const data = await response.json();
  return data;
}

export async function fetchSubscriptionInfo() {
  const response = await fetch(`${API_URL}/payment/subscription-info`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  const data = await response.json();
  return data;
}

export async function cancelSubscription() {
  const response = await fetch(`${API_URL}/payment/cancel-subscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
}

export async function switchPlan(amount) {
  const response = await fetch(
    `${API_URL}/payment/switch-plan?amount=${amount}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
}

export async function reactivateSubscription() {
  const response = await fetch(`${API_URL}/payment/reactivate-subscription`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
}

/**
 * send a post request to the backend to generate a verification token
 * unique for the user profile with the given user id. The token is
 * stored in the user object in the database and is used to verify
 * the user email address. The token is sent to the user email address.
 *
 * @param {String} userId
 * @returns {Promise<{message: string}>}
 * @throws {Error} if updating user failed
 * @throws {Error} if no user id is provided
 * @throws {Error} if no data is provided
 */
export async function generateVerificationToken(userId) {
  const response = await fetch(`${API_URL}/auth/send-verification-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
    credentials: "include",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
  const data = await response.json();
  return data;
}

/**
 * send a get request to the backend to verify the verification token
 * that is sent to the user email address. If the token is valid, the
 * user email address is verified and the user object in the database
 * is updated with the verified boolean set to true.
 *
 * @param {String} token
 * @param {String} userId
 * @returns {Promise<{message: string}>}
 * @throws {Error} if verifying token failed
 * @throws {Error} if no token is provided
 */
export async function verifyVerificationToken(token, userId) {
  console.log("SENDING REQUEST for verification");
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, userId }),
    credentials: "include",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
  const data = await response.json();
  return data;
}

/**
 * send a get request to the backend to get all skills
 * that are stored in the database in the skills table
 *
 * @returns {Promise<[{label: string, value, string}]>}
 * @throws {Error} if updating user failed
 */
export async function getAllSkills() {
  const response = await fetch(`${API_URL}/users/skills/getAll`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch skill data");
  }
  const data = await response.json();
  return data;
}

/**
 * send a post request to the backend to get the skill names
 * of the given skill ids array
 *
 * @param {String[]} skillIds
 * @returns {Promise<[{label: string, value, string}]>}
 * @throws {Error} if skill ids are not valid
 * @throws {Error} if skill ids are not an array
 * @throws {Error} if skill ids fetching failed
 */
export async function getSkillsFromSkillIds(skillIds) {
  const response = await fetch(`${API_URL}/users/getSkillNames`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(skillIds),
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch skill data");
  }
  const data = await response.json();
  return data;
}

export async function getRecommendedStartups(userId, initialLoadSize) {
  const response = await fetch(`${API_URL}/startups/getRecommendedStartups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, initialLoadSize }),
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to get recommended startups");
  }
  const data = await response.json();
  return data;
}

export async function getStartupsByPage(page, limit, order) {
  const response = await fetch(
    `${API_URL}/startups/getStartupsByPage?page=${page}&limit=${limit}&order=${order}`,
    {
      method: "GET",
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to get startups by page");
  }
  const data = await response.json();
  return data;
}

export async function getUserProfilePageEnums() {
  const response = await fetch(`${API_URL}/users/get-profile-enums`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch Enums");
  }
  const data = await response.json();
  return data;
}

export async function getStartupEnums() {
  const response = await fetch(`${API_URL}/startups/get-startup-enums`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch Enums");
  }
  const data = await response.json();
  return data;
}

export async function performChangePassword(currentPassword, newPassword) {
  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentPassword, newPassword }),
    credentials: "include",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
  const data = await response.json();
  return data;
}

export async function performForgotPassword(email) {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
    credentials: "include",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
  const data = await response.json();
  return data;
}

export async function validateResetPassword(id, newPassword, confirmPassword) {
  const response = await fetch(`${API_URL}/auth/validate-reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, newPassword, confirmPassword }),
    credentials: "include",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
  return response;
}
