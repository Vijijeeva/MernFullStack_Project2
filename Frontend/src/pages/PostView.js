import React, { useEffect, useState } from "react";
import './PostView.css';

function PostView() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null); 

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (selectedPost) {
    return (
      <div className="container">
        <h1>{selectedPost.title}</h1>
        <p>by {selectedPost.author?.name || "Anonymous"}</p>
        <div className="post-full">{selectedPost.body}</div>

      </div>
    );
  }

  return (
    <div className="container">
      <h1>Latest Posts</h1>
      {posts.length === 0 ? (
        <p>No posts yet. Create one!</p>
      ) : (
        posts.map((post) => (
          <div key={post._id} className="post-card">
            <h2
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedPost(post)}
            >
              {post.title}
            </h2>
           <p>by {post.author?.username || "Anonymous"}</p>

            <p>
              {post.body.length > 200
                ? post.body.slice(0, 200) + "..."
                : post.body}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default PostView;
