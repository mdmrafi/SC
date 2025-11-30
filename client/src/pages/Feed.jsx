import React, { useEffect, useState } from "react";
import { assets, dummyPostsData } from "../assets/assets";
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";

const Feed = () => {
  console.log("Feed rendering StoriesBar");
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchFeeds = async () => {
    setFeeds(dummyPostsData);
    setLoading(false);
  };
  useEffect(() => {
    fetchFeeds();
  }, []);

  return !loading ? (
    <div className="h-full pl-20 overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex flex-row justify-between">
      {/* Main Content */}
      <div className="flex-1">
        {console.log("Feed rendering StoriesBar")}
        <StoriesBar />
        <div className="p-4 space-y-6">
          {feeds.map((post) => (
            <PostCard key={post._id || post.id} post={post} />
          ))}
        </div>
      </div>
      {/* Right Sidebar */}
      <div className="max-xl:hidden w-80">
        <div className="sticky top-5">
          <div className="bg-white text-xs p-4 rounded-md flex flex-col gap-2 shadow">
            <h2 className="text-slate-800 font-medium text-xl pb-0.5">Upcoming Event</h2>
            <img
              src={assets.sponsored_img}
              className="w-80 h-50 rounded-md"
              alt=""
            />
            <p className="text-slate-600 font-bold">CSE Carnival</p>
            <p className="text-slate-500">
              An exclusive event to show your talent   
            </p>
          </div>
          <RecentMessages/>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Feed;
