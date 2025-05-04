// app/profiles/page.tsx
"use client";

import React from "react";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { userData } from "@/mock/userData";
import { useParams } from "next/navigation";

const ProfilePage = () => {
  const { user, logout } = useUser();
  const { username } = useParams();

  const isOwnProfile = user?.username === username;
  const displayUser = isOwnProfile
    ? user
    : userData.find((u) => u.username === username);
  // if (!user) {
  //   return (
  //     <div className="flex h-screen items-center justify-center text-white">
  //       <p>You must be logged in to view this page.</p>
  //     </div>
  //   );
  // }

  return !displayUser ? (
    <div className="flex h-[80vh] items-center justify-center text-white">
      <p>User not found</p>
    </div>
  ) : (
    <div className="min-h-screen px-4 py-8 md:px-12 bg-gradient-to-r from-[#3A3A38] to-[#151512] text-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage
              src={displayUser?.avatarUrl}
              alt={displayUser?.username}
            />
            <AvatarFallback>
              {displayUser?.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h1>
            {displayUser?.firstName} {displayUser?.lastName}
          </h1>
          <p>@{displayUser?.username}</p>
          <p>{displayUser?.email}</p>
          <p>{displayUser?.bio || "No bio available yet."}</p>
          {displayUser?.joinedAt && (
            <p className="text-sm text-gray-300">
              {new Date(displayUser.joinedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Bio</h2>
          <p className="text-sm text-gray-300">
            {displayUser?.bio || "No bio available yet."}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Member since</h2>
          {displayUser?.joinedAt && (
            <p className="text-sm text-gray-300">
              {new Date(displayUser.joinedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div>
          {isOwnProfile && (
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
