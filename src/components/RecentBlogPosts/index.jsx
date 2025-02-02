import React from 'react';
import posts from '@site/.docusaurus/docusaurus-plugin-content-blog/default/blog-posts-metadata.json';
import RecentBlogPost from '../RecentBlogPost';

const RecentBlogPosts = ({ nrPosts }) => {
    const recentPosts = posts.slice(0, nrPosts);

    if (recentPosts.length === 0) {
        return null;
    }

    return (
        <div>
            <div className="card__wrapper" style={{ display: 'grid', gap: '1rem' }}>
                {recentPosts.map((post, index) => (
                    <RecentBlogPost key={index} post={post} />
                ))}
            </div>
        </div>
    );
};

export default RecentBlogPosts;