import React, { useEffect } from "react";
import { useState } from "react";
import { dummyRecentMessagesData } from "../assets/assets";
import { Link } from "react-router-dom";
import moment from "moment";

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);
  const fetchRecentMessages = async () => {
    setMessages(dummyRecentMessagesData);
  };
  useEffect(() => {
    fetchRecentMessages();
  }, []);

  return (
    <div
      className="bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800"
    >
      <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>
      <div className="flex flex-col max-h-56 overflow-y-auto no-scrollbar">
        {messages.map((message, index) => (
          <Link
            key={message._id || index}
            to={`/messages/${message.from_user_id._id}`}
            className="flex items-start gap-3 py-3 px-2 hover:bg-slate-50 rounded-md"
          >
            <img
              src={message.from_user_id.profile_picture}
              alt={message.from_user_id.full_name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm">{message.from_user_id.full_name}</p>
                <p className="text-[11px] text-slate-400">
                  {moment(message.createdAt).fromNow()}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm truncate">
                  {message.text ? message.text : "Media"}
                </p>
                {!message.seen && (
                  <p
                    className="bg-green-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] ml-2"
                    title="unread"
                  >
                    1
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default RecentMessages;
