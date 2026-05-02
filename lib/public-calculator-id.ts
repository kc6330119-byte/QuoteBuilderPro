import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export function generatePublicCalculatorId() {
  return `qb-${randomBytes(6).toString("hex")}`;
}

export async function createUniquePublicCalculatorId() {
  let publicId = generatePublicCalculatorId();

  while (await prisma.calculator.findUnique({ where: { publicId }, select: { id: true } })) {
    publicId = generatePublicCalculatorId();
  }

  return publicId;
}
