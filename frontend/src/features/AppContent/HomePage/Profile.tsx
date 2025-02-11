import React, { useState } from "react";
import "./Profile.css"; // Optional, for styling

const Profile: React.FC = () => {
  // Sample user details
  const [userData, setUserData] = useState({
    name: "test",
    email: "test@gmail.com",
    profilePhoto: "", // URL or path to profile image
  });

  // State for file input (photo upload)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle file input changes (when user selects a photo)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle file upload (set the selected file as profile photo)
  const handleFileUpload = () => {
    if (selectedFile) {
      setUserData({
        ...userData,
        profilePhoto: URL.createObjectURL(selectedFile), // Generate a URL for the image
      });
    }
  };

  return (
    <div className="profile-container" style={{ padding: "20px", textAlign: "center" }}>
      <h2>Your Profile</h2>

      {/* Profile photo */}
      <div className="profile-photo-container" style={{ marginBottom: "20px" }}>
        <img
          src={userData.profilePhoto || "/default-avatar.png"} // Fallback image if no profile photo
          alt="Profile"
          className="profile-photo"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "10px",
          }}
        />
      </div>

      {/* Display user details */}
      <div className="profile-details">
        <p><strong>Name:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
      </div>

      {/* Photo upload section */}
      <div className="photo-upload">
        <label htmlFor="photo-upload" style={{ display: "block", marginBottom: "10px" }}>
          Upload Profile Photo:
        </label>
        <input
          type="file"
          id="photo-upload"
          accept="image/*"
          onChange={handleFileChange}
          style={{ marginBottom: "10px" }}
        />
        <button onClick={handleFileUpload}>Upload Photo</button>
      </div>
    </div>
  );
};

export default Profile;
