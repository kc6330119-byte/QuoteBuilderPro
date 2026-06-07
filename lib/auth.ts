import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getInitials, slugify } from "@/lib/utils";

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

export const getCurrentWorkspace = cache(async (): Promise<WorkspaceUser> => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const email = getPrimaryEmail(clerkUser);
  const name = getDisplayName(clerkUser, email);
  const companyName = getCompanyName(name);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ clerkUserId: clerkUser.id }, { email }]
    },
    include: { company: true }
  });

  if (user?.company) {
    if (user.clerkUserId === clerkUser.id && user.email === email && user.name === name) {
      return toWorkspaceUser(user, clerkUser.id);
    }

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

  try {
    const createdOrUpdatedUser = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: {
          OR: [{ clerkUserId: clerkUser.id }, { email }]
        },
        include: { company: true }
      });

      if (existingUser?.company) {
        return tx.user.update({
          where: { id: existingUser.id },
          data: {
            clerkUserId: clerkUser.id,
            email,
            name
          },
          include: { company: true }
        });
      }

      const company = await tx.company.create({
        data: {
          name: companyName,
          slug: await createUniqueCompanySlug(companyName, tx)
        }
      });

      const workspaceUser = existingUser
        ? await tx.user.update({
            where: { id: existingUser.id },
            data: {
              clerkUserId: clerkUser.id,
              email,
              name,
              companyId: company.id
            },
            include: { company: true }
          })
        : await tx.user.create({
            data: {
              clerkUserId: clerkUser.id,
              email,
              name,
              companyId: company.id
            },
            include: { company: true }
          });

      await adoptLegacyCalculators(tx, workspaceUser.id, company.id);

      return workspaceUser;
    });

    return toWorkspaceUser(createdOrUpdatedUser, clerkUser.id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const recoveredUser = await prisma.user.findFirst({
        where: {
          OR: [{ clerkUserId: clerkUser.id }, { email }]
        },
        include: { company: true }
      });

      if (recoveredUser?.company) {
        return toWorkspaceUser(recoveredUser, clerkUser.id);
      }
    }

    throw error;
  }
});

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

// Only adopts calculators that already belong to this user (companyId was null). Never claims another
// user's unassigned rows — the previous "first company adopts everything" branch was a tenant-isolation hazard.
async function adoptLegacyCalculators(client: Prisma.TransactionClient, userId: string, companyId: string) {
  await client.calculator.updateMany({
    where: { companyId: null, userId },
    data: {
      companyId,
      userId
    }
  });
}

async function createUniqueCompanySlug(value: string, client: Prisma.TransactionClient | typeof prisma = prisma) {
  const baseSlug = slugify(value, "workspace");
  let slug = baseSlug;
  let suffix = 2;

  while (await client.company.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
