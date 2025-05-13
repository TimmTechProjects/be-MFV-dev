"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { User } from "@/types/users";
import { getUserByUsername } from "@/lib/utils";
import Link from "next/link";

const ProfilePage = () => {
  const { user, logout } = useUser();
  const { username } = useParams();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.username === username) {
        setProfileUser(user);
      } else if (typeof username === "string") {
        const fetchedUser = await getUserByUsername(username);
        setProfileUser(fetchedUser);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [username, user]);

  const isOwnProfile = user?.username === username;
  // const profileUser = isOwnProfile ? user : null;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81a308] mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-white">
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-12 bg-gradient-to-r from-[#3A3A38] to-[#151512] text-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col items-center space-x-4 gap-4 pb-10">
          <Avatar className="w-28 h-28">
            <AvatarImage
              src={profileUser?.avatarUrl}
              alt={profileUser?.username}
            />
            <AvatarFallback>
              {profileUser?.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h1>
            <p>@{profileUser?.username}</p>
          </h1>
          {/* {profileUser?.joinedAt && (
            <p className="text-sm text-gray-300">
              {new Date(profileUser.joinedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}{" "}
              {profileUser.plan}
            </p>
          )} */}
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Bio</h2>
          <p className="text-sm text-gray-300">
            {profileUser?.bio || "No bio available yet."}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Collections</h2>
          <Link
            href={`/profiles/${profileUser.username}/collections`}
            className="text-sm text-[#81a308] hover:underline"
          >
            View All Collections →
          </Link>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Member since</h2>
          {profileUser?.joinedAt && (
            <p className="text-sm text-gray-300">
              {new Date(profileUser.joinedAt).toLocaleDateString()}
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
