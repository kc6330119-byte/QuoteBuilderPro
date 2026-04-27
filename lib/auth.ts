export function getMockUser() {
  return {
    id: "mock-user-1",
    name: process.env.MOCK_AUTH_NAME ?? "Demo Owner",
    email: process.env.MOCK_AUTH_EMAIL ?? "owner@quotebuilder.pro",
    initials: "DO"
  };
}
