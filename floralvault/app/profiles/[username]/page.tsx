"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams } from "next/navigation";
import { User } from "@/types/users";
import { getUserByUsername, getUserCollections } from "@/lib/utils";
import Link from "next/link";
import {
  Plus,
  MessageCircle,
  Share2,
  MoreVertical,
  Image as ImageIcon,
  Heart,
} from "lucide-react";
import Image from "next/image";
import { Collection } from "@/types/collections";
import { DUMMY_POSTS } from "@/mock/posts";
import { PostSidePanel } from "@/components/PostSidePanel";

const COVER_PHOTO =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"; // Placeholder

// const DUMMY_POSTS = [
//   {
//     id: 1,
//     text: "Excited to share my new Monstera cutting! 🌱",
//     image:
//       "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=600&q=80",
//     createdAt: "2025-06-01",
//     upvotes: 3,
//     comments: 2,
//     shares: 1,
//   },
//   {
//     id: 2,
//     text: "Just watered all my plants. They look so happy today!",
//     createdAt: "2025-05-28",
//     upvotes: 1,
//     comments: 0,
//     shares: 0,
//   },
//   {
//     id: 3,
//     image:
//       "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
//     createdAt: "2025-05-20",
//     upvotes: 5,
//     comments: 1,
//     shares: 2,
//   },
//   {
//     id: 4,
//     text: "Does anyone know why my fiddle leaf fig has brown spots?",
//     createdAt: "2025-05-15",
//     upvotes: 0,
//     comments: 0,
//     shares: 0,
//   },
// ];

type Comment = {
  id: number;
  user: {
    username: string;
    avatarUrl: string;
  };
  text: string;
  createdAt: string;
};

type Post = {
  id: number;
  text?: string;
  image?: string;
  createdAt: string;
  upvotes?: number;
  comments?: Comment[];
  shares?: number;
  user: {
    username: string;
    avatarUrl: string;
  };
};

type ModalComment = Comment & {
  likes?: number;
  likedByCurrentUser?: boolean;
};

const ProfilePage = () => {
  const { user } = useUser();
  const { username } = useParams();
  const safeUsername = Array.isArray(username) ? username[0] : username || "";

  const [usersCollections, setUsersCollections] = useState<Collection[]>([]);
  const [posts, setPosts] = useState(DUMMY_POSTS);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "posts" | "media" | "marketplace" | "collections"
  >("posts");
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalComments, setModalComments] = useState<ModalComment[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.username === safeUsername) {
        setProfileUser(user);
      } else if (typeof safeUsername === "string") {
        const fetchedUser = await getUserByUsername(safeUsername);
        setProfileUser(fetchedUser);
      }
      setLoading(false);
    };

    const fetchCollections = async () => {
      if (safeUsername) {
        try {
          const collections = await getUserCollections(safeUsername);
          setUsersCollections(collections);
        } catch (err) {
          setUsersCollections([]);
          console.log(err);
        }
      }
    };

    fetchProfile();
    fetchCollections();
  }, [safeUsername, user]);

  const isOwnProfile = user?.username === safeUsername;

  // Upvote handler
  const handleUpvote = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, upvotes: (post.upvotes || 0) + 1 }
          : post
      )
    );
  };

  const handleEditPost = (postId: number) => {
    setDropdownOpen(null);
    alert(`Edit post ${postId}`);
  };
  const handleDeletePost = (postId: number) => {
    setDropdownOpen(null);
    setPostToDelete(postId);
    setDeleteModalOpen(true);
  };

  const confirmDeletePost = () => {
    if (postToDelete !== null) {
      setPosts((prev) => prev.filter((post) => post.id !== postToDelete));
    }
    setDeleteModalOpen(false);
    setPostToDelete(null);
  };

  const cancelDeletePost = () => {
    setDeleteModalOpen(false);
    setPostToDelete(null);
  };

  const handleOpenModal = (post: Post) => {
    setModalImage(post.image!);
    setSelectedPost(post);
    setModalComments(
      (post.comments || []).map((c) => ({
        ...c,
        likes: (c as ModalComment).likes ?? 0,
        likedByCurrentUser: false,
      }))
    );
  };

  const handleLikeComment = (commentId: number) => {
    setModalComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likes: c.likedByCurrentUser
                ? (c.likes || 0) - 1
                : (c.likes || 0) + 1,
              likedByCurrentUser: !c.likedByCurrentUser,
            }
          : c
      )
    );
  };

  useEffect(() => {
    if (!modalImage) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalImage(null);
        setSelectedPost(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [modalImage]);

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

  // Filter for photos/videos tabs
  const photoPosts: Post[] = posts.filter((p) => p.image);
  // const videoPosts: typeof posts = []; // Add video support as needed

  return (
    <div className="min-h-screen">
      {/* Cover Photo */}
      <div className="relative w-full h-64 bg-gray-300">
        <img
          src={COVER_PHOTO}
          alt="Cover"
          className="object-cover w-full h-full"
        />
        {/* Profile Avatar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[-100px] z-20">
          <Avatar className="w-40 h-40 border-4 border-white shadow-xl">
            <AvatarImage
              src={profileUser?.avatarUrl}
              alt={profileUser?.username}
            />
            <AvatarFallback>
              {profileUser?.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-4xl mx-auto mt-24 rounded-lg">
        {/* User Info */}
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold text-white">
            {profileUser.username}
          </h1>
          <p className="text-gray-500 mb-2">
            {profileUser.firstName} {profileUser.lastName}
          </p>
          <p className="text-base text-gray-300 text-center max-w-xl">
            {profileUser.bio || "No bio available yet."}
          </p>
        </div>

        {/* Nav Tabs */}
        <div className="flex justify-center mt-8 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-6 py-3 font-semibold bg-transparent cursor-pointer ${
              activeTab === "posts"
                ? "text-white border-b-2 border-white"
                : "text-[#71767b] hover:text-white"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </button>
          <button
            className={`px-6 py-3 font-semibold bg-transparent cursor-pointer ${
              activeTab === "media"
                ? "text-white border-b-2 border-white"
                : "text-[#71767b] hover:text-white"
            }`}
            onClick={() => setActiveTab("media")}
          >
            Media
          </button>
          <button
            className={`px-6 py-3 font-semibold bg-transparent cursor-pointer ${
              activeTab === "marketplace"
                ? "text-white border-b-2 border-white"
                : "text-[#71767b] hover:text-white"
            }`}
            onClick={() => setActiveTab("marketplace")}
          >
            Marketplace
          </button>
          <button
            className={`px-6 py-3 font-semibold bg-transparent cursor-pointer ${
              activeTab === "collections"
                ? "text-white border-b-2 border-white"
                : "text-[#71767b] hover:text-white"
            }`}
            onClick={() => setActiveTab("collections")}
          >
            Collections
          </button>
        </div>

        {/* Main Content */}
        <div className="flex mt-8 w-full items-center justify-center">
          {/* Posts Section */}
          {activeTab === "posts" && (
            <div className=" flex flex-col">
              {/* Posts heading and list */}
              <div className="flex items-center justify-between mb-4 ">
                <h2 className="text-lg font-semibold text-white">Posts</h2>
                {/* Filters/Manage posts can go here if you want */}
              </div>
              <div className="flex flex-col gap-5">
                {/* Facebook-style Create Post Box */}
                {isOwnProfile && (
                  <div className="bg-[#20253b83] rounded-2xl p-4 mb-6 shadow flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={profileUser.avatarUrl}
                          alt={profileUser.username}
                        />
                        <AvatarFallback>
                          {profileUser.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="text"
                        placeholder="Create new post..."
                        className="flex-1 bg-[#232323] text-gray-200 rounded-full px-4 py-2 outline-none border border-transparent focus:border-[#81a308] transition"
                        onFocus={() => alert("Open create post modal!")}
                        readOnly
                      />
                    </div>
                    <div className="flex justify-center mt-2">
                      {/* <button className="flex items-center gap-2 text-red-500 hover:bg-[#232323] px-3 py-2 rounded transition text-sm font-medium cursor-pointer">
                        <Video className="w-5 h-5" /> Live video
                      </button> */}
                      <button className="flex items-center gap-2 text-green-500 hover:bg-[#232323] px-3 py-2 rounded transition text-sm font-medium cursor-pointer">
                        <ImageIcon className="w-5 h-5" /> Photo/video
                      </button>
                      {/* <button className="flex items-center gap-2 text-blue-500 hover:bg-[#232323] px-3 py-2 rounded transition text-sm font-medium cursor-pointer">
                        <Flag className="w-5 h-5" /> Life event
                      </button> */}
                    </div>
                  </div>
                )}
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/profiles/${username}/status/${post.id}`}
                    className="block"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="bg-[#20253b83] rounded-4xl shadow p-5 flex flex-col gap-3 relative cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={profileUser.avatarUrl}
                            alt={profileUser.username}
                          />
                          <AvatarFallback>
                            {profileUser.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-white">
                            {/* {profileUser.firstName} {profileUser.lastName} */}
                            {profileUser.username}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {/* Kebab menu, only for own profile */}
                        {isOwnProfile && (
                          <div className="ml-auto relative">
                            <button
                              className="p-2 rounded-full hover:bg-[#232323] transition"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDropdownOpen(
                                  dropdownOpen === post.id ? null : post.id
                                );
                              }}
                              aria-label="Post options"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
                            </button>
                            {dropdownOpen === post.id && (
                              <div className="absolute right-0 mt-2 w-32 bg-[#232323] border border-gray-700 rounded shadow-lg z-20">
                                <button
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[#181818] cursor-pointer"
                                  onClick={() => handleEditPost(post.id)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#181818] cursor-pointer"
                                  onClick={() => handleDeletePost(post.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {post.text && (
                        <div className="text-gray-200 text-base">
                          {post.text}
                        </div>
                      )}
                      {post.image && (
                        <div className="relative w-full max-h-96">
                          <Image
                            src={post.image || "/fallback.jpg"}
                            alt={post.text || "Media"}
                            width={800}
                            height={400}
                            className="rounded-lg w-full max-h-96 object-cover border border-gray-800 cursor-pointer"
                            style={{ objectFit: "cover" }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOpenModal(post);
                            }}
                            unoptimized
                            priority={false}
                          />
                        </div>
                      )}
                      {/* Actions */}
                      <div className="flex justify-between gap-8 mt-2">
                        <button
                          className="flex items-center gap-1 text-gray-400"
                          onClick={() => handleUpvote(post.id)}
                        >
                          <Heart className="w-5 h-5 hover:text-[#81a308] transition cursor-pointer" />
                          <span>{post.upvotes || 0}</span>
                          {/* <span className="ml-1">Upvote</span> */}
                        </button>
                        <button
                          className="flex items-center gap-1 text-gray-400 hover:text-[#81a308] transition cursor-pointer"
                          onClick={() => alert("Open comments")}
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.comments?.length || 0}</span>
                          <span className="ml-1">Comment</span>
                        </button>
                        <button
                          className="flex items-center gap-1 text-gray-400 hover:text-[#81a308] transition cursor-pointer"
                          onClick={() => alert("Share post")}
                        >
                          <Share2 className="w-5 h-5" />
                          <span>{post.shares || 0}</span>
                          <span className="ml-1">Share</span>
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Media Section */}
          {activeTab === "media" && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">Media</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photoPosts.length === 0 && (
                  <div className="text-gray-400">No media yet.</div>
                )}
                {photoPosts.map((post) => (
                  <div
                    key={post.id}
                    className="relative w-full h-60 rounded-lg overflow-hidden border border-gray-800"
                  >
                    <Image
                      src={post.image || "/fallback.jpg"}
                      alt={post.text || "Media"}
                      fill
                      className="object-cover cursor-pointer"
                      unoptimized
                      onClick={() => setModalImage(post.image!)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Marketplace Section */}
          {activeTab === "marketplace" && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">
                Marketplace
              </h2>
              <div className="text-gray-400">No Marketplace Items</div>
            </div>
          )}

          {/* Collections Section */}
          {activeTab === "collections" && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">
                Collections
              </h2>
              {usersCollections.length === 0 && (
                <div className="text-gray-400">No collections yet.</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {usersCollections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/profiles/${profileUser.username}/collections/${collection.slug}`}
                    className="block bg-[#181818] rounded-lg shadow p-4 hover:shadow-lg transition"
                  >
                    <div className="relative w-full h-40 mb-3 rounded overflow-hidden">
                      <Image
                        src={
                          collection.thumbnailImage?.url ||
                          collection.plants?.[0]?.images?.[0]?.url ||
                          "/fallback-image.jpg"
                        }
                        alt={collection?.name}
                        fill
                        className="object-cover"
                        unoptimized // Remove if you configure next.config.js for remote images
                      />
                    </div>
                    <div className="font-semibold text-white">
                      {collection.name}
                    </div>
                    <div className="text-sm text-gray-400 line-clamp-2">
                      {collection.description}
                    </div>
                  </Link>
                ))}

                {isOwnProfile && (
                  <div className="w-56 h-72 sm:w-60 sm:h-80 flex items-center justify-center">
                    <Link
                      href={`/profiles/${username}/collections/new`}
                      className="flex flex-col items-center justify-center gap-2 text-gray-300 group hover:text-[#81a308] transition duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-16 h-16 border-2 border-gray-300 rounded-full transition duration-200">
                        <Plus className="w-8 h-8" />
                      </div>
                      <span className="text-sm font-semibold text-center mt-2 text-gray-300">
                        Add New Album
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* About Section */}
          {/* {activeTab === "about" && (
            <div>
              <h2 className="text-lg font-semibold mb-2 text-white">About</h2>
              <p className="text-gray-300">
                {profileUser.bio || "No bio available yet."}
              </p>
              <div className="mt-2 text-sm text-gray-400">
                Member since:{" "}
                {profileUser?.joinedAt
                  ? new Date(profileUser.joinedAt).toLocaleDateString()
                  : "Unknown"}
              </div>
            </div>
          )} */}
        </div>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex bg-black"
          style={{ width: "100vw", height: "100vh" }}
          onClick={() => {
            setModalImage(null);
            setSelectedPost(null);
          }}
        >
          <div
            className="relative flex flex-col md:flex-row w-full h-full"
            // Remove onClick here so only the outer div handles closing
          >
            {/* Image Section */}
            <div
              className="flex-1 flex items-center justify-center bg-black h-full"
              // onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image area
            >
              <img
                src={modalImage}
                alt="Full size"
                className="object-contain max-h-full max-w-full w-auto h-auto"
                style={{ background: "black" }}
              />
            </div>
            {/* Side Panel */}
            {selectedPost && (
              <PostSidePanel
                post={selectedPost}
                comments={modalComments}
                onLikeComment={handleLikeComment}
              />
            )}
            {/* Close Button */}
            <button
              className="absolute top-2 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition z-10 cursor-pointer"
              onClick={() => {
                setModalImage(null);
                setSelectedPost(null);
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#232323] rounded-lg shadow-lg p-8 w-full max-w-sm mx-auto flex flex-col items-center">
            <h3 className="text-lg font-semibold text-white mb-4">
              Delete Post?
            </h3>
            <p className="text-gray-300 mb-6 text-center">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                onClick={confirmDeletePost}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-600 text-white font-semibold hover:bg-gray-700 transition"
                onClick={cancelDeletePost}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
