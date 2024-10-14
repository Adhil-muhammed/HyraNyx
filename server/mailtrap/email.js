import {
  sender,
  mailtrapClient,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./index.js";

export const sendVerificationEmail = async ({ email, verificationToken }) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });
    console.log("Verification email sent successfully: ", response);
  } catch (error) {
    console.log("sendVerificationEmail error: ", error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async ({ email, name }) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient?.send({
      from: sender,
      to: recipient,
      template_uuid: "0d532f58-8b02-4780-bdf3-489e6904bc4b",
      template_variables: {
        name: "hyraNyx",
        company_info_address: "123 Innovation Drive",
        company_info_city: "Tech City",
        company_info_zip_code: "123456",
        company_info_country: "InnovationLand",
      },
    });

    console.log("Welcome email sent successfully", response);
  } catch (error) {
    console.error(`Error sending welcome email`, error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};
