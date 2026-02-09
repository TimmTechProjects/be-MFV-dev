"use client";

import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, MoreVertical } from "lucide-react";
import Image from "next/image";
import { DUMMY_POSTS } from "@/mock/posts"; // <-- Use shared dummy posts
import { formatRelativeTime } from "@/lib/utils";

type Reply = {
  id: number;
  user: {
    username: string;
    avatarUrl: string;
  };
  text: string;
  createdAt: string;
};

type CommentWithExtras = {
  id: number;
  user: {
    username: string;
    avatarUrl: string;
  };
  text: string;
  createdAt: string;
  likes?: number;
  likedByCurrentUser?: boolean;
  replies?: Reply[];
};

const StatusPostPage = () => {
  const { postId } = useParams();

  // Find the post by ID (string to number)
  const post = useMemo(
    () => DUMMY_POSTS.find((p) => String(p.id) === String(postId)),
    [postId]
  );

  // For comment input
  const [commentInput, setCommentInput] = useState("");
  // Enhance comments with likes and replies if not present
  const [comments, setComments] = useState<CommentWithExtras[]>(
    (post?.comments || []).map((c) => {
      // Handle likes being either a number or array of user IDs
      const rawComment = c as unknown as Record<string, unknown>;
      const rawLikes = rawComment.likes;
      const likesCount = Array.isArray(rawLikes) ? rawLikes.length : (typeof rawLikes === 'number' ? rawLikes : 0);
      const rawReplies = rawComment.replies;
      return {
        id: rawComment.id as number,
        user: rawComment.user as { username: string; avatarUrl: string },
        text: rawComment.text as string,
        createdAt: rawComment.createdAt as string,
        likes: likesCount,
        likedByCurrentUser: false,
        replies: Array.isArray(rawReplies) ? rawReplies as Reply[] : [],
      };
    })
  );
  const [commentSort, setCommentSort] = useState<"relevant" | "newest" | "all">(
    "relevant"
  );
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [replyInput, setReplyInput] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Example sort logic (customize as needed)
  const sortedComments = useMemo(() => {
    if (commentSort === "newest") {
      return [...comments].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    if (commentSort === "all") {
      return comments; // No filter, show all
    }
    // "relevant" - for demo, just show the first 3, or implement your own logic
    return comments.slice(0, 3);
  }, [comments, commentSort]);

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        user: {
          username: "currentuser",
          avatarUrl: "/fallback.png",
        },
        text: commentInput,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedByCurrentUser: false,
        replies: [],
      },
    ]);
    setCommentInput("");
  };

  const handleLikeComment = (commentId: number) => {
    setComments((prev) =>
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

  const handleReplyInputChange = (key: number | string, value: string) => {
    setReplyInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddReply = (commentId: number) => {
    const replyText = replyInput[commentId]?.trim();
    if (!replyText) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...(c.replies || []),
                {
                  id: (c.replies?.length || 0) + 1,
                  user: {
                    username: "currentuser",
                    avatarUrl: "/fallback.png",
                  },
                  text: replyText,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : c
      )
    );
    setReplyInput((prev) => ({ ...prev, [commentId]: "" }));
    setReplyingTo(null);
  };

  // const handleReplyToReply = (commentId: number, replyId: number) => {
  //   setReplyingTo(`${commentId}-${replyId}`);
  // };

  const handleAddReplyToReply = (commentId: number, replyId: number) => {
    const replyText = replyInput[`${commentId}-${replyId}`]?.trim();
    if (!replyText) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...(c.replies || []),
                {
                  id: (c.replies?.length || 0) + 1,
                  user: {
                    username: "currentuser",
                    avatarUrl: "/fallback.png",
                  },
                  text: replyText,
                  createdAt: new Date().toISOString(),
                  // No further nesting, just flat replies
                },
              ],
            }
          : c
      )
    );
    setReplyInput((prev) => ({ ...prev, [`${commentId}-${replyId}`]: "" }));
    setReplyingTo(null);
  };

  // When image is clicked, open modal
  const handleOpenModal = () => {
    setModalImage(post?.image || null);
  };

  // ESC key closes modal
  React.useEffect(() => {
    if (!modalImage) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalImage(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [modalImage]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[#232323] p-8 rounded-lg shadow-lg w-full max-w-2xl">
          <h1 className="text-2xl font-bold text-white mb-4">Post Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181818]">
      {/* Modal for image + side panel */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(24,24,24,0.6)",
            backdropFilter: "blur(12px)",
          }}
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative flex items-center justify-center"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              width: "auto",
              height: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImage}
              alt="Full size"
              className="object-contain rounded-2xl shadow-2xl"
              style={{
                maxWidth: "85vw",
                maxHeight: "85vh",
                width: "auto",
                height: "auto",
              }}
            />
            <button
              className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition z-10"
              onClick={() => setModalImage(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Hide original post content when modal is open */}
      {!modalImage && (
        <>
          <div className="bg-[#20253b83] rounded-4xl shadow p-8 flex flex-col gap-6 relative w-full max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={post.user.avatarUrl}
                  alt={post.user.username}
                />
                <AvatarFallback>
                  {post.user.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-white">
                  {post.user.username}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="ml-auto relative">
                <button
                  className="p-2 rounded-full hover:bg-[#232323] transition"
                  aria-label="Post options"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
                </button>
              </div>
            </div>
            {post.text && (
              <div className="text-gray-200 text-lg">{post.text}</div>
            )}
            {post.image && (
              <div
                className="relative w-full max-h-[500px] h-96 rounded-lg overflow-hidden border border-gray-800 cursor-pointer"
                onClick={handleOpenModal}
              >
                <Image
                  src={post.image}
                  alt={post.text || "Media"}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0" />
              </div>
            )}
            <div className="flex justify-between gap-8 mt-2">
              <button
                className="flex items-center gap-1 text-gray-400"
                onClick={() => alert("Upvote")}
              >
                <Heart className="w-5 h-5 hover:text-[#81a308] transition cursor-pointer" />
                <span>{post.upvotes || 0}</span>
              </button>
              <button
                className="flex items-center gap-1 text-gray-400 hover:text-[#81a308] transition cursor-pointer"
                onClick={() => {
                  const commentBox = document.getElementById("comment-input");
                  if (commentBox) commentBox.focus();
                }}
              >
                <MessageCircle className="w-5 h-5" />
                <span>{comments.length}</span>
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

          {/* Comment Section */}
          <div className="bg-[#20253b83] rounded-3xl shadow p-5 md:p-7 flex flex-col gap-4 relative w-full max-w-2xl mt-6">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">
                Comments
              </h3>
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="w-9 h-9 mt-1">
                  <AvatarImage src="/fallback.png" alt="currentuser" />
                  <AvatarFallback>CU</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input
                    id="comment-input"
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-[#232323] text-gray-200 rounded-full px-4 py-2 text-base outline-none border border-[#232323] focus:border-[#81a308] transition"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddComment();
                    }}
                  />
                </div>
                <button
                  className="ml-2 px-4 py-2 bg-[#81a308] text-white rounded-full text-base font-semibold hover:bg-[#6e8c07] transition"
                  onClick={handleAddComment}
                >
                  Post
                </button>
              </div>
              <div className="flex items-center mb-3 relative">
                <button
                  className="text-sm text-gray-300 bg-[#232323] px-3 py-2 rounded-full flex items-center gap-1"
                  onClick={() => setShowSortDropdown((v) => !v)}
                >
                  {commentSort === "relevant" && "Most relevant"}
                  {commentSort === "newest" && "Newest"}
                  {commentSort === "all" && "All comments"}
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showSortDropdown && (
                  <div className="absolute left-0 top-11 bg-[#232323] rounded-2xl shadow-lg z-10 w-56 text-sm py-2">
                    <button
                      className={`block w-full text-left px-5 py-3 rounded-xl hover:bg-[#181818] ${
                        commentSort === "relevant"
                          ? "text-white"
                          : "text-gray-300"
                      }`}
                      onClick={() => {
                        setCommentSort("relevant");
                        setShowSortDropdown(false);
                      }}
                    >
                      Most relevant
                      <div className="text-gray-400 text-xs mt-1">
                        Show friends`&apos; comments and the most engaging
                        comments first.
                      </div>
                    </button>
                    <button
                      className={`block w-full text-left px-5 py-3 rounded-xl hover:bg-[#181818] ${
                        commentSort === "newest"
                          ? "text-white"
                          : "text-gray-300"
                      }`}
                      onClick={() => {
                        setCommentSort("newest");
                        setShowSortDropdown(false);
                      }}
                    >
                      Newest
                      <div className="text-gray-400 text-xs mt-1">
                        Show all comments with the newest comments first.
                      </div>
                    </button>
                    <button
                      className={`block w-full text-left px-5 py-3 rounded-xl hover:bg-[#181818] ${
                        commentSort === "all" ? "text-white" : "text-gray-300"
                      }`}
                      onClick={() => {
                        setCommentSort("all");
                        setShowSortDropdown(false);
                      }}
                    >
                      All comments
                      <div className="text-gray-400 text-xs mt-1">
                        Show all comments, including potential spam.
                      </div>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {sortedComments.length === 0 && (
                  <div className="text-gray-400 text-base">
                    No comments yet.
                  </div>
                )}
                {sortedComments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarImage
                        src={comment.user.avatarUrl || "/fallback.png"}
                        alt={comment.user.username}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/fallback.png";
                        }}
                      />
                      <AvatarFallback>
                        {comment.user.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-[#181818] rounded-2xl px-4 py-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-sm text-white leading-tight">
                          {comment.user.username}
                        </div>
                      </div>
                      <div className="text-gray-200 text-sm leading-tight">
                        {comment.text}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(comment.createdAt)}
                        </span>

                        <button
                          className={`text-xs font-semibold focus:outline-none ${
                            comment.likedByCurrentUser
                              ? "text-[#81a308]"
                              : "text-gray-400 hover:text-[#81a308]"
                          }`}
                          onClick={() => handleLikeComment(comment.id)}
                        >
                          <Heart className="inline w-4 h-4 mr-1" />
                          {comment.likes || 0}
                        </button>
                        <button
                          className="text-xs text-gray-400 hover:text-[#81a308] font-semibold ml-2"
                          onClick={() =>
                            setReplyingTo(
                              replyingTo === String(comment.id)
                                ? null
                                : String(comment.id)
                            )
                          }
                        >
                          Reply
                        </button>
                      </div>
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-2 pl-4 border-l border-[#232323] flex flex-col gap-2">
                          {comment.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="flex items-start gap-2"
                            >
                              <Avatar className="w-7 h-7 mt-0.5">
                                <AvatarImage
                                  src={reply.user.avatarUrl || "/fallback.png"}
                                  alt={reply.user.username}
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                      "/fallback.png";
                                  }}
                                />
                                <AvatarFallback>
                                  {reply.user.username
                                    ?.slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="bg-[#232323] rounded-2xl px-3 py-1.5 flex-1">
                                <div className="font-semibold text-xs text-white leading-tight">
                                  {reply.user.username}
                                </div>
                                <div className="text-gray-200 text-xs leading-tight">
                                  {reply.text}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[11px] text-gray-500">
                                    {formatRelativeTime(reply.createdAt)}
                                  </span>
                                  <button
                                    className="text-xs text-gray-400 hover:text-[#81a308] font-semibold"
                                    onClick={() =>
                                      handleLikeComment(comment.id)
                                    }
                                  >
                                    Like
                                  </button>
                                  <button
                                    className="text-xs text-gray-400 hover:text-[#81a308] font-semibold"
                                    onClick={() =>
                                      setReplyingTo(
                                        replyingTo ===
                                          `${comment.id}-${reply.id}`
                                          ? null
                                          : `${comment.id}-${reply.id}`
                                      )
                                    }
                                  >
                                    Reply
                                  </button>
                                </div>
                                {/* Reply input for replies */}
                                {replyingTo === `${comment.id}-${reply.id}` && (
                                  <div className="flex items-start gap-2 mt-2">
                                    <Avatar className="w-7 h-7 mt-0.5">
                                      <AvatarImage
                                        src="/fallback.png"
                                        alt="currentuser"
                                      />
                                      <AvatarFallback>CU</AvatarFallback>
                                    </Avatar>
                                    <input
                                      type="text"
                                      value={
                                        replyInput[
                                          `${comment.id}-${reply.id}`
                                        ] || ""
                                      }
                                      onChange={(e) =>
                                        handleReplyInputChange(
                                          `${comment.id}-${reply.id}`,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Write a reply..."
                                      className="w-full bg-[#232323] text-gray-200 rounded-full px-3 py-1.5 text-xs outline-none border border-[#232323] focus:border-[#81a308] transition"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                          handleAddReplyToReply(
                                            comment.id,
                                            reply.id
                                          );
                                      }}
                                    />
                                    <button
                                      className="ml-1 px-3 py-1.5 bg-[#81a308] text-white rounded-full text-xs font-semibold hover:bg-[#6e8c07] transition"
                                      onClick={() =>
                                        handleAddReplyToReply(
                                          comment.id,
                                          reply.id
                                        )
                                      }
                                    >
                                      Reply
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Reply input */}
                      {replyingTo === String(comment.id) && (
                        <div className="flex items-start gap-2 mt-2">
                          <Avatar className="w-7 h-7 mt-0.5">
                            <AvatarImage
                              src="/fallback.png"
                              alt="currentuser"
                            />
                            <AvatarFallback>CU</AvatarFallback>
                          </Avatar>
                          <input
                            type="text"
                            value={replyInput[comment.id] || ""}
                            onChange={(e) =>
                              handleReplyInputChange(comment.id, e.target.value)
                            }
                            placeholder="Write a reply..."
                            className="w-full bg-[#232323] text-gray-200 rounded-full px-3 py-1.5 text-xs outline-none border border-[#232323] focus:border-[#81a308] transition"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddReply(comment.id);
                            }}
                          />
                          <button
                            className="ml-1 px-3 py-1.5 bg-[#81a308] text-white rounded-full text-xs font-semibold hover:bg-[#6e8c07] transition"
                            onClick={() => handleAddReply(comment.id)}
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatusPostPage;
