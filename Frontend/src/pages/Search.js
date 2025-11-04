import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Search() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const location = useLocation();

  // Extract search query from URL
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query")?.toLowerCase() || "";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/posts");
        const data = await res.json();

        // Filter posts by title, body, or author
        const filtered = data.filter(
          (post) =>
            post.title?.toLowerCase().includes(searchQuery) ||
            post.body?.toLowerCase().includes(searchQuery) ||
            post.author?.username?.toLowerCase().includes(searchQuery)
        );

        setPosts(filtered);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery]);

  const handleNextImage = (postId, totalImages) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] + 1) % totalImages,
    }));
  };

  const handlePrevImage = (postId, totalImages) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] - 1 + totalImages) % totalImages,
    }));
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading search results...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        🔍 Search Results for{" "}
        <span style={{ textDecoration: "underline", color: "blueviolet" }}>
          {searchQuery}
        </span>
      </h1>

      {posts.length === 0 ? (
        <p style={{ textAlign: "center" }}>No posts found.</p>
      ) : (
        posts.map((post) => {
          // Combine single and multiple images into an array
          let images = [];
          if (post.images && post.images.length > 0) images = post.images;
          else if (post.image) images = [post.image]; // single image support

          const currentIndex = currentImageIndex[post._id] || 0;

          return (
            <div
              key={post._id}
              style={{
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "25px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {/* Post Title */}
              <h2 style={{ color: "#222" }}>{post.title}</h2>

              {/* Author Info */}
              <p style={{ color: "gray", fontSize: "14px", marginBottom: "10px" }}>
                By <b>{post.author?.username || "Anonymous"}</b>
              </p>

              {/* Image Display */}
              {images.length > 0 && (
                <div style={{ position: "relative", textAlign: "center" }}>
                  <img
                    src={`http://localhost:5000${images[currentIndex]}`}
                    alt="Post"
                    style={{
                      width: "100%",
                      maxHeight: "400px",
                      objectFit: "contain", // full image visible
                      borderRadius: "10px",
                      background: "#f0f0f0",
                    }}
                  />

                  {/* Navigation buttons only if multiple images */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => handlePrevImage(post._id, images.length)}
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "10px",
                          transform: "translateY(-50%)",
                          background: "rgba(0,0,0,0.5)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "35px",
                          height: "35px",
                          cursor: "pointer",
                        }}
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => handleNextImage(post._id, images.length)}
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: "10px",
                          transform: "translateY(-50%)",
                          background: "rgba(0,0,0,0.5)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "35px",
                          height: "35px",
                          cursor: "pointer",
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Full Post Body */}
              <p
                style={{
                  color: "#444",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  marginTop: "15px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {post.body}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}
