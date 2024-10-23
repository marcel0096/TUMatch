import nodemailer from "nodemailer";

/**
 * This function converts an image object to a URL
 * that can be rendered on the frontend.
 *
 * @param {Object} imageObject - The image object to convert
 * @returns {String} - The URL of the image
 */
export const convertObjectToUrl = (imageObject) => {
  if (imageObject && imageObject.data) {
    // This extracts the base64 string which holds the image data
    const base64String = imageObject.data.toString("base64");
    // This constructs the correct image URL the frontend needs to render the image
    const imageUrl = `data:${imageObject.imageType};base64,${base64String}`;
    imageObject.imageUrl = imageUrl;
    return imageUrl;
  }
};

/**
 * This function sends a verification email to the user
 * @param {String} userEmail - The email of the user to send the verification link to
 * @param {String} verificationLink - The verification link to send to the user
 */
export async function generateAndSendVerificationEmail(
  userEmail,
  verificationLink
) {
  // Send the verificationLink via email to the user
  // Create a transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "fastmail", // Use your email provider
    auth: {
      user: "tumatch@fastmail.com", // Your email
      pass: "4j6x8q62934c3u7g", // Your email password or app-specific password
    },
  });
  // Setup email data
  let mailOptions = {
    from: '"TUMatch" <tumatch@fastmail.com>', // Sender address
    to: userEmail, // List of receivers
    subject: "TUMatch | Verify your email", // Subject line
    text: `Please verify your email by clicking on this link: \n ${verificationLink} \n \n Your TUMatch Team`, // Plain text body
    // html: '<b>Please verify your email by clicking on this link: [Verification Link]</b>' // HTML body
  };
  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
}

export async function generateAndSendResetPasswordEmail(
  userEmail,
  resetPasswordLink
) {
  // Send the verificationLink via email to the user
  // Create a transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "fastmail", // Use your email provider
    auth: {
      user: "tumatch@fastmail.com", // Your email
      pass: "4j6x8q62934c3u7g", // Your email password or app-specific password
    },
  });
  let mailOptions = {
    from: '"TUMatch" <tumatch@fastmail.com>', // Sender address
    to: userEmail, // List of receivers
    subject: "TUMatch | Reset your Password", // Subject line
    text: `To reset your password, use the following link: \n ${resetPasswordLink} \n It expires in 24 hours. \n \n Your TUMatch Team`, // Plain text body
    // html: '<b>Please verify your email by clicking on this link: [Verification Link]</b>' // HTML body
  };
  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
}
