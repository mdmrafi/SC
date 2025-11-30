import React, { useEffect, useState } from 'react'
import { BadgeCheck, X } from 'lucide-react'

const StoryViewer = ({ viewStory, setViewStory }) => {
  const [progress,setProgress] = useState(0);
  
  useEffect(()=>{
    let timer,progressInterval;
    if(viewStory && viewStory.media_type!=='video'){
        setProgress(0);
        const duration = 10000;
        const setTime = 100;    
        let elapsed = 0;

        progressInterval=setInterval(()=>{
            elapsed+=setTime;
            setProgress((elapsed/duration)*100)
        },setTime);
        // Close Story After 10s 
        timer= setTimeout(()=>{
            setViewStory(null);
        },duration)
    }  
    
    return ()=>{
        clearTimeout(timer);
        clearInterval(progressInterval);
    }
  },[viewStory,setViewStory])

  if (!viewStory) return null;

  const handleClose = () => setViewStory(null)

  const isText = viewStory.media_type === 'text'
  const backgroundColor = isText ? viewStory.background_color || '#4f46e5' : '#000000'

  const renderContent = () => {
    const type = viewStory.media_type
    switch (type) {
      case 'image':
        return (
          <img
            src={viewStory.media_url}
            alt="story"
            className="max-w-full max-h-[90vh] object-contain rounded"
          />
        )
      case 'video':
        return (
          <video
            onEnded={() => setViewStory(null)}
            src={viewStory.media_url}
            controls autoPlay
            className="max-h-[90vh] max-w-full rounded"  
          />
        )
      case 'text':
        return (
          <div className="max-w-[640px] w-full p-8 rounded-lg text-white text-center text-lg">
            {viewStory.content || ' '}
          </div>
        )
      default:
        return <div className="text-white">No content</div>
    }
  }

  return (
    <div
      className="fixed inset-0 h-screen bg-black bg-opacity-90 z-[110] flex items-center justify-center"
      style={{ backgroundColor }}
    >
      {/* Progress Bar */}
      <div className='absolute top-0 left-0 w-full h-1 bg-gray-700'>
        <div className='h-full bg-white transition-all duration-100 linear' style=
          {{width: `${progress}%`}}>

        </div>
      </div>
      {/* User Info -Top Left */}
      <div className="absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl bg-black/50 rounded">
        <img
          src={viewStory.user?.profile_picture}
          alt=""
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white"
        />
        <div className="text-white font-medium flex items-center gap-1.5">
          <span>{viewStory.user?.full_name}</span>
          <BadgeCheck size={18} />
        </div>
      </div>
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none"
        aria-label="close story"
      >
        <X className="w-8 h-8 hover:scale-110 transition cursor-pointer" />
      </button>
      {/* Content Wrapper */}
      <div className='max-w-[90vw] max-h-[90vh] flex items-center justify-center'>
        {renderContent()}
      </div>
    </div>
  )
}

export default StoryViewer;