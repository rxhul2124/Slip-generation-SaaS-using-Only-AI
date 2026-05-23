export function userDto(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    signatureProfile: user.signatureProfile,
    emailVerifiedAt: user.emailVerifiedAt,
    memberships: user.memberships
  };
}

export function companyDto(company) {
  if (!company) return null;
  return {
    id: company._id,
    name: company.name,
    slug: company.slug,
    logo: company.logo,
    plan: company.plan,
    status: company.status,
    onboarding: company.onboarding
  };
}

export function authDto({ user, company, tokens }) {
  return {
    user: userDto(user),
    company: companyDto(company),
    accessToken: tokens.accessToken
  };
}
