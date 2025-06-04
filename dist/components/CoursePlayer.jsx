import React, { useState, useMemo } from 'react';
const CoursePlayer = ({ course, currentVideoId, onSelect }) => {
    // State for live search query
    const [query, setQuery] = useState('');
    // Filter sections and videos based on the query, memoized for performance
    const filteredSections = useMemo(() => {
        return course.sections
            .map((section) => (Object.assign(Object.assign({}, section), { videos: section.videos.filter((video) => video.title.toLowerCase().includes(query.toLowerCase())) })))
            .filter((section) => section.videos.length > 0);
    }, [course.sections, query]);
    // Track which sections are expanded or collapsed
    const [openSections, setOpenSections] = useState(() => Object.fromEntries(course.sections.map((s) => [s.title, true])));
    const toggleSection = (title) => {
        setOpenSections(prev => (Object.assign(Object.assign({}, prev), { [title]: !prev[title] })));
    };
    return (<aside className="hidden md:block sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto w-full md:w-1/4 p-4 bg-white shadow rounded">
      {/* Search input */}
      <input type="text" placeholder="Search videos..." value={query} onChange={e => setQuery(e.target.value)} className="w-full mb-4 p-2 border rounded"/>

      {/* Accordion sections */}
      {filteredSections.map((section) => (<div key={section.title} className="mb-3">
          <button onClick={() => toggleSection(section.title)} className="flex justify-between w-full py-2 px-3 bg-gray-100 rounded">
            <span>{section.title}</span>
            <span>{openSections[section.title] ? '−' : '+'}</span>
          </button>

          {/* Video list within expanded section */}
          {openSections[section.title] && (<ul className="mt-2 space-y-1">
              {section.videos.map((video) => (<li key={video.muxPlaybackId}>
                  <button onClick={() => onSelect(video.muxPlaybackId)} className={`block w-full text-left p-2 rounded transition ${currentVideoId === video.muxPlaybackId
                        ? 'bg-blue-100 font-semibold'
                        : 'hover:bg-gray-50'}`}>
                    {video.title}
                  </button>
                </li>))}
            </ul>)}
        </div>))}
    </aside>);
};
export default CoursePlayer;
