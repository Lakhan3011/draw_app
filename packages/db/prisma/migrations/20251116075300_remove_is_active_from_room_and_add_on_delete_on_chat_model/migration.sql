/*
  Warnings:

  - You are about to drop the column `isActive` on the `Room` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_roomId_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "isActive";

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
