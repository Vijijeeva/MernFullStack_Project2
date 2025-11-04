import React, { useEffect, useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";

function Home() {
  const [posts, setPosts] = useState([]);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [commentText, setCommentText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentMedia, setCurrentMedia] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});
  const textareaRef = useRef(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editBody, editingPostId]);

  const handleStartEdit = (post) => {
    setEditingPostId(post._id);
    setExpandedPostId(post._id);
    setEditTitle(post.title);
    setEditBody(post.body);
    setPendingChanges(prev => ({
      ...prev,
      [post._id]: {
        media: getAllMedia(post),
        title: post.title,
        body: post.body
      }
    }));
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditTitle("");
    setEditBody("");
    setPendingChanges({});
    fetchPosts();
  };

  const handleSaveChanges = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to edit posts.");
    
    try {
      const postChanges = pendingChanges[postId];
      if (!postChanges) return;

      console.log("Saving changes:", postChanges);

      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ 
          title: postChanges.title,
          body: postChanges.body,
          media: postChanges.media
        }),
      });

      const data = await res.json();
      if (res.ok) {
        await fetchPosts();
        handleCancelEdit();
        alert("All changes saved successfully!");
      } else {
        alert(data.msg || "Failed to save changes");
        await fetchPosts();
      }
    } catch (err) {
      console.error("Error saving changes:", err);
      alert("Server error while saving changes");
      await fetchPosts();
    }
  };

  const handleTextChange = (postId, field, value) => {
    if (field === 'title') setEditTitle(value);
    if (field === 'body') setEditBody(value);
    
    setPendingChanges(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [field]: value
      }
    }));
  };

  const handleRemoveMedia = (postId, mediaUrl) => {
    if (!window.confirm("Are you sure you want to remove this media?")) return;

    const currentMediaArray = pendingChanges[postId]?.media || getAllMedia(posts.find(p => p._id === postId));
    const updatedMedia = currentMediaArray.filter(media => media !== mediaUrl);
    
    console.log("Removing media:", mediaUrl);
    console.log("Updated media array:", updatedMedia);

    setPendingChanges(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        media: updatedMedia
      }
    }));

    const currentIndex = currentMedia[postId] || 0;
    if (currentIndex >= updatedMedia.length && updatedMedia.length > 0) {
      setCurrentMedia(prev => ({
        ...prev,
        [postId]: updatedMedia.length - 1
      }));
    }

    alert("Media marked for removal. Click 'Save Changes' to confirm.");
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to delete posts.");
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      if (res.ok) {
        await fetchPosts();
        alert("Post deleted successfully");
      } else {
        const err = await res.json();
        alert(err.msg || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting post");
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) await fetchPosts();
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return alert("Enter a comment before posting!");
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        setCommentText("");
        await fetchPosts();
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setCommentText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handlePrevMedia = (postId, length) => {
    setCurrentMedia((prev) => ({
      ...prev,
      [postId]: prev[postId] === undefined ? 0 : (prev[postId] - 1 + length) % length,
    }));
  };

  const handleNextMedia = (postId, length) => {
    setCurrentMedia((prev) => ({
      ...prev,
      [postId]: prev[postId] === undefined ? 0 : (prev[postId] + 1) % length,
    }));
  };

  const isVideoFile = (filename) => {
    if (!filename) return false;
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v', '.3gp'];
    return videoExtensions.some(ext => filename.toLowerCase().includes(ext));
  };

  const getAllMedia = (post) => {
    if (post.media && post.media.length > 0) {
      return post.media;
    }
    if (post.images && post.images.length > 0) {
      return post.images;
    }
    if (post.image) {
      return [post.image];
    }
    return [];
  };

  const hasMedia = (post) => {
    return getAllMedia(post).length > 0;
  };

  return (
    <div className="container" style={{ maxWidth: 900, margin: "20px auto" }}>
      <h1 style={{ background: "linear-gradient(orange, yellow)", padding: 12, borderRadius: 6 }}>
        <b style={{ color: "darkblue" }}>Latest Posts</b>
      </h1>

      {posts.length === 0 ? (
        <p>No posts yet. Create Post!</p>
      ) : (
        posts.map((post) => {
          const isExpanded = expandedPostId === post._id;
          const isEditing = editingPostId === post._id;
          const postHasMedia = hasMedia(post);
          const currentChanges = pendingChanges[post._id];
          const displayTitle = isEditing ? (currentChanges?.title ?? post.title) : post.title;
          const displayBody = isEditing ? (currentChanges?.body ?? post.body) : post.body;
          const displayMedia = isEditing ? (currentChanges?.media ?? getAllMedia(post)) : getAllMedia(post);
          const currentIndex = currentMedia[post._id] || 0;
          const currentMediaItem = displayMedia[currentIndex];

          return (
            <div key={post._id} style={{ background: "white", border: "1px solid black", padding: 14, marginBottom: 14, borderRadius: 8 }}>
              {isEditing ? (
                <input
                  type="text"
                  value={displayTitle}
                  onChange={(e) => handleTextChange(post._id, 'title', e.target.value)}
                  style={{ width: "98%",background:"lightblue", color:"black", padding: 6, fontSize: 18, marginBottom: 8,  border: "2px solid black", borderRadius: 4}}
                />
              ) : (
                <h2 style={{ marginTop: 0, color: "darkblue" }}>{displayTitle}</h2>
              )}

              <h4>
                <p style={{ marginTop: 0, color: "darkred" }}>
                  @ <b>{post.author?.username || "Anonymous"}</b>
                </p>
              </h4>

              {isEditing ? (
                <textarea
                  ref={textareaRef}
                  value={displayBody}
                  onChange={(e) => handleTextChange(post._id, 'body', e.target.value)}
                  rows={6}
                  style={{ width: "98%",background:"lightblue",color:"black", padding: 6, fontSize: 16, resize: "vertical", border: "2px solid black", borderRadius: 4 }}
                  placeholder="Write your post content..."
                />
              ) : (
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {isExpanded ? displayBody : displayBody.length > 200 ? displayBody.slice(0, 200) + "..." : displayBody}
                </p>
              )}

              {displayMedia.length > 0 && (
                <>
                  {isEditing ? (
                    <div style={{ margin: "10px 0" }}>
                      <h4 style={{ marginBottom: 10, color: "darkblue" }}></h4>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {displayMedia.map((media, index) => (
                          <div key={index} style={{ position: "relative" }}>
                            {isVideoFile(media) ? (
                              <video
                                src={`http://localhost:5000${media}`}
                                controls
                                style={{
                                  width: 150,
                                  height: 120,
                                  objectFit: "cover",
                                  borderRadius: 6,
                                  background: "#ddd",
                                }}
                              />
                            ) : (
                              <img
                                src={`http://localhost:5000${media}`}
                                alt="media"
                                style={{
                                  width: 150,
                                  height: 120,
                                  objectFit: "cover",
                                  borderRadius: 6,
                                  background: "#ddd",
                                }}
                              />
                            )}
                            <button
                              onClick={() => handleRemoveMedia(post._id, media)}
                              style={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                background: "rgba(255,0,0,0.8)",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: 24,
                                height: 24,
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                              title="Remove this media"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div style={{ 
                        background: "#e7f3ff", 
                        padding: "8px", 
                        borderRadius: "4px", 
                        fontSize: "14px",
                        color: "#0066cc",
                        marginBottom: "10px"
                      }}>
                        Click the × button for removal. Click "Save" to confirm deletion.
                      </div>
                    </div>
                  ) : (
                    currentMediaItem && (
                      <div style={{ position: "relative", width: "100%", margin: "10px 0", textAlign: "center" }}>
                        {isVideoFile(currentMediaItem) ? (
                          <video
                            src={`http://localhost:5000${currentMediaItem}`}
                            controls
                            style={{
                              width: "100%",
                              maxHeight: "400px",
                              objectFit: "contain",
                              borderRadius: 10,
                              background: "#f0f0f0",
                            }}
                          />
                        ) : (
                          <img
                            src={`http://localhost:5000${currentMediaItem}`}
                            alt="Post"
                            style={{
                              width: "100%",
                              maxHeight: "400px",
                              objectFit: "contain",
                              borderRadius: 10,
                              background: "#f0f0f0",
                            }}
                          />
                        )}

                        {displayMedia.length > 1 && (
                          <>
                            <button
                              onClick={() => handlePrevMedia(post._id, displayMedia.length)}
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: 5,
                                transform: "translateY(-50%)",
                                background: "rgba(0,0,0,0.5)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "50%",
                                width: 30,
                                height: 30,
                                cursor: "pointer",
                              }}
                            >
                              ◀
                            </button>
                            <button
                              onClick={() => handleNextMedia(post._id, displayMedia.length)}
                              style={{
                                position: "absolute",
                                top: "50%",
                                right: 5,
                                transform: "translateY(-50%)",
                                background: "rgba(0,0,0,0.5)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "50%",
                                width: 30,
                                height: 30,
                                cursor: "pointer",
                              }}
                            >
                              ▶
                            </button>
                          </>
                        )}

                        {displayMedia.length > 1 && (
                          <div style={{
                            position: "absolute",
                            bottom: 10,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "rgba(0,0,0,0.5)",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: 10,
                            fontSize: "12px"
                          }}>
                            {currentIndex + 1} / {displayMedia.length}
                            {isVideoFile(currentMediaItem) ? ' (Video)' : ' (Image)'}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <div>
                  {displayBody.length > 200 && !isEditing && (
                    <button
                      onClick={() => setExpandedPostId(isExpanded ? null : post._id)}
                      style={{ background: "none", border: "none", color: "blue", textDecoration: "underline", cursor: "pointer" }}
                    >
                      {isExpanded ? "Show Less" : "Read More"}
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {isEditing ? (
                    <>
                      <button 
                        onClick={() => handleSaveChanges(post._id)}
                        style={{ 
                          background: "green", 
                          color: "white", 
                          border: "none", 
                          padding: "6px 12px", 
                          borderRadius: 6, 
                          fontWeight: "bold" 
                        }}
                      >
                         Save 
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        style={{ 
                          background: "red", 
                          color: "white", 
                          border: "none", 
                          padding: "6px 12px", 
                          borderRadius: 6 
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleStartEdit(post)}
                        style={{ 
                          background: "blue", 
                          color: "white", 
                          border: "none", 
                          padding: "6px 12px", 
                          borderRadius: 6 
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(post._id)}
                        style={{ 
                          background: "red", 
                          color: "white", 
                          border: "none", 
                          padding: "6px 12px", 
                          borderRadius: 6 
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div
                style={{
                  background: "whitesmoke",
                  height: "45px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                  borderRadius: "0 0 8px 8px",
                  marginTop: "10px",
                  borderTop: "1px solid #ddd",
                }}
              >
                <button
                  onClick={() => handleLike(post._id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "black",
                    fontWeight: "bold",
                  }}
                >
                  ❤️ {post.likes || 0} Likes
                </button>
                <button
                  onClick={() => setExpandedPostId(expandedPostId === post._id ? null : post._id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "black",
                    fontWeight: "bold",
                  }}
                >
                  💬 {post.comments?.length || 0} Comments
                </button>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 10 }}>
                  {post.comments?.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#fff",
                        padding: "6px 8px",
                        borderRadius: 6,
                        marginBottom: 6,
                      }}
                    >
                      <b>Comment:</b> {c.text}
                    </div>
                  ))}

                  <div
                    style={{
                      display: "flex",
                      marginTop: 6,
                      gap: 6,
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "22px",
                      }}
                      title="Add emoji"
                    >
                      😊
                    </button>

                    {showEmojiPicker && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "45px",
                          left: "0",
                          zIndex: 1000,
                        }}
                      >
                        <EmojiPicker onEmojiClick={handleEmojiClick} height={350} width={300} />
                      </div>
                    )}

                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      style={{
                        flex: 1,
                        padding: 6,
                        borderRadius: 4,
                        border: "1px solid #ccc",
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      style={{
                        background: "orange",
                        border: "none",
                        borderRadius: 4,
                        padding: "6px 12px",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default Home;