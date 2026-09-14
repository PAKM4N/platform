export const SINGLE_EMAIL_PATTERN = /^[^\s@<>,;:"\\[\]\u0000-\u001F\u007F]+@[^\s@<>,;:"\\[\]\u0000-\u001F\u007F]+$/;

function comparableSubmission(lead) {
  const contact = lead.contact || {};
  const answers = lead.answers || {};
  return JSON.stringify({
    contact: Object.fromEntries(
      ["name", "company", "email", "phone", "observations"].map((key) => [key, contact[key] || ""]),
    ),
    answers: {
      needs: [...(answers.needs || [])].sort(),
      channel: answers.channel,
      interaction: answers.interaction,
      extras: [...(answers.extras || [])].sort(),
      hosting: answers.hosting,
      websiteScope: answers.websiteScope,
    },
  });
}

export function assertSameLeadSubmission(existing, incoming) {
  if (comparableSubmission(existing) !== comparableSubmission(incoming)) {
    const error = new Error("submission_conflict");
    error.code = "submission_conflict";
    throw error;
  }
}
