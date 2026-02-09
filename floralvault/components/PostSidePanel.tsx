import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2 } from "lucide-react";

type User = {
  username: string;
  avatarUrl: string;
};

type ModalComment = {
  id: number;
  user: User;
  text: string;
  createdAt: string;
  likes?: number;
  likedByCurrentUser?: boolean;
};

type Post = {
  text?: string;
  createdAt: string;
  upvotes?: number;
  comments?: ModalComment[];
  shares?: number;
  user: User;
};

interface PostSidePanelProps {
  post: Post;
  comments: ModalComment[];
  onLikeComment: (commentId: number) => void;
  onReplyComment?: (commentId: number) => void;
}

export const PostSidePanel: React.FC<PostSidePanelProps> = ({
  post,
  comments,
  onLikeComment,
  onReplyComment,
}) => (
  <div className="w-full md:w-[480px] flex flex-col bg-[#20253b] h-full p-0 pt-14 overflow-y-auto border-l border-[#232323]">
    {/* Modal Header */}
    <div className="flex items-center gap-3 px-6 pt-2 pb-4 border-t border-[#a9a4a4]">
      <Avatar className="w-9 h-9">
        <AvatarImage src={post.user.avatarUrl} alt={post.user.username} />
        <AvatarFallback>
          {post.user.username?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="font-semibold text-white">{post.user.username}</div>
        <div className="text-xs text-gray-400">
          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
        </div>
      </div>
    </div>
    {/* Post Caption */}
    {post.text && (
      <div className="text-white text-base px-6 pt-4 pb-2">{post.text}</div>
    )}
    {/* Actions */}
    <div className="flex gap-6 mb-4 px-6 pb-5 border-b border-[#a9a4a4]">
      <button className="flex items-center gap-1 text-gray-400 hover:text-[#81a308] transition cursor-pointer">
        <Heart className="w-5 h-5" />
        <span>{post.upvotes || 0}</span>
      </button>
      <button className="flex items-center gap-1 text-gray-400 hover:text-[#81a308] transition cursor-pointer">
        <MessageCircle className="w-5 h-5" />
        <span>{comments.length || 0}</span>
      </button>
      <button className="flex items-center gap-1 text-gray-400 hover:text-[#81a308] transition cursor-pointer">
        <Share2 className="w-5 h-5" />
        <span>{post.shares || 0}</span>
      </button>
    </div>
    {/* Comments */}
    <div className="flex-1 overflow-y-auto px-5">
      <h4 className="text-gray-300 font-semibold mb-2 border-b border-[#232323] pb-2">
        Comments
      </h4>
      {comments.length ? (
        comments.map((comment) => (
          <div key={comment.id} className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="w-7 h-7">
                <AvatarImage
                  src={comment.user.avatarUrl}
                  alt={comment.user.username}
                />
                <AvatarFallback>
                  {comment.user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-white font-semibold">
                {comment.user.username}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="text-gray-200 text-sm ml-9">{comment.text}</div>
            <div className="flex items-center gap-4 ml-9 mt-1">
              <button
                className={`text-xs font-semibold focus:outline-none ${
                  comment.likedByCurrentUser
                    ? "text-[#81a308]"
                    : "text-gray-400 hover:text-[#81a308]"
                }`}
                onClick={() => onLikeComment(comment.id)}
              >
                <Heart className="inline w-4 h-4 mr-1" />
                {comment.likes || 0} <span>Like</span>
              </button>
              {onReplyComment && (
                <button
                  className="text-xs text-gray-400 hover:text-[#81a308] font-semibold"
                  onClick={() => onReplyComment(comment.id)}
                >
                  Reply
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-400">No comments yet.</div>
      )}
    </div>
  </div>
);
