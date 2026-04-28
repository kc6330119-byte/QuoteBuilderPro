import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type WorkspaceUser = {
  id: string;
  clerkUserId: string;
  name: string;
  email: string;
  initials: string;
  companyId: string;
  companyName: string;
};

type UserWithCompany = {
  id: string;
  email: string;
  name: string | null;
  company: { id: string; name: string } | null;
};

export async function getCurrentWorkspace(): Promise<WorkspaceUser> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const email = getPrimaryEmail(clerkUser);
  const name = getDisplayName(clerkUser, email);
  const companyName = getCompanyName(name);

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ clerkUserId: clerkUser.id }, { email }]
    },
    include: { company: true }
  });

  if (user?.company) {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        clerkUserId: clerkUser.id,
        email,
        name
      },
      include: { company: true }
    });

    return toWorkspaceUser(updatedUser, clerkUser.id);
  }

  const companyCount = await prisma.company.count();
  const company = await prisma.company.create({
    data: {
      name: companyName,
      slug: await createUniqueCompanySlug(companyName)
    }
  });

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        clerkUserId: clerkUser.id,
        email,
        name,
        companyId: company.id
      },
      include: { company: true }
    });
  } else {
    user = await prisma.user.create({
      data: {
        clerkUserId: clerkUser.id,
        email,
        name,
        companyId: company.id
      },
      include: { company: true }
    });
  }

  await adoptLegacyCalculators(user.id, company.id, companyCount === 0);

  return toWorkspaceUser(user, clerkUser.id);
}

function getPrimaryEmail(clerkUser: Awaited<ReturnType<typeof currentUser>>) {
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress;

  if (!email) {
    redirect("/sign-in");
  }

  return email.toLowerCase();
}

function getDisplayName(clerkUser: Awaited<ReturnType<typeof currentUser>>, email: string) {
  return clerkUser?.fullName || clerkUser?.firstName || email.split("@")[0] || "Workspace owner";
}

function getCompanyName(name: string) {
  return `${name}'s Workspace`;
}

function toWorkspaceUser(user: UserWithCompany, clerkUserId: string): WorkspaceUser {
  if (!user.company) {
    redirect("/sign-in");
  }

  return {
    id: user.id,
    clerkUserId,
    name: user.name ?? user.email,
    email: user.email,
    initials: getInitials(user.name ?? user.email),
    companyId: user.company.id,
    companyName: user.company.name
  };
}

async function adoptLegacyCalculators(userId: string, companyId: string, adoptAllUnassigned: boolean) {
  await prisma.calculator.updateMany({
    where: adoptAllUnassigned ? { companyId: null } : { companyId: null, userId },
    data: {
      companyId,
      userId
    }
  });
}

async function createUniqueCompanySlug(value: string) {
  const baseSlug = slugify(value);
  let slug = baseSlug;
  let suffix = 2;

  while (await prisma.company.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "workspace"
  );
}

function getInitials(value: string) {
  const words = value
    .replace(/@.*/, "")
    .split(/\s+|[._-]+/)
    .filter(Boolean);

  return (words[0]?.[0] ?? "U").toUpperCase() + (words[1]?.[0] ?? "").toUpperCase();
}
