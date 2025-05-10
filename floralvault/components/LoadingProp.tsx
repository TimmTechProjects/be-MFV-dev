import React from "react";

const Loading = (message: string) => {
  return (
    <div className="flex h-[80vh] items-center justify-center text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81a308] mx-auto mb-4"></div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Loading;
