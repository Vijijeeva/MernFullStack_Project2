import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreatePost.css";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const navigate = useNavigate();

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setMedia((prev) => [...prev, ...files]);
  };

  const handleRemoveMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to publish a post.");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", content);
    media.forEach((file) => formData.append("media", file));

    try {
      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: { "x-auth-token": token },
        body: formData,
      });

      if (response.ok) {
        alert("Post published successfully!");
        navigate("/home");
      } else {
        const err = await response.json();
        alert(err.msg || "Failed to publish post");
      }
    } catch (error) {
      console.error("Error publishing post:", error);
      alert("Server error while publishing post");
    }
  };

  return (
    <div className="create-post-page">
      <div className="create-post-box">
        <h1><b>Create New Post</b></h1>
        <form onSubmit={handleSubmit}>
          <label className="title-label">Post Title :</label>
          <input
            type="text"
            placeholder="title name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label className="title-label">Content :</label>
          <textarea
            placeholder="Write your content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <label className="title-label">Choose Images/Videos :</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaChange}
          />

          {media.length > 0 && (
            <div className="preview-container" style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
              {media.map((file, index) => {
                const isVideo = file.type.startsWith("video/");
                return (
                  <div key={index} style={{ position: "relative", width: 120, height: 120 }}>
                    {isVideo ? (
                      <video src={URL.createObjectURL(file)} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} controls />
                    ) : (
                      <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        background: "rgba(255,0,0,0.7)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 22,
                        height: 22,
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <br /><br />
          <button type="submit">Publish</button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
