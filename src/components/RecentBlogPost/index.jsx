import React from 'react';

const RecentBlogPost = ({ post }) => {
    const { metadata } = post;
    const formattedDate = new Date(metadata.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const readingTime = Math.round(metadata.readingTime);

    return (
        <a href={metadata.permalink} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card__header">
                <h3>{metadata.title}</h3>
            </div>
            <div className="card__body">
                <p>{metadata.description}</p>
            </div>
            <div className="card__footer">
                <p>{formattedDate} · {readingTime} min read</p>
            </div>
        </a>
    );
};

export default RecentBlogPost;