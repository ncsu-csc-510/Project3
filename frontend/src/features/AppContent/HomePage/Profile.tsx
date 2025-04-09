import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css"; // Optional, for styling

interface ProfileData {
  name: string;
  email: string;
  profilePhoto: string;
}

const Profile: React.FC = () => {
  // Initialize state with empty values
  const [userData, setUserData] = useState<ProfileData>({
    name: "",
    email: "",
    profilePhoto: "",
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Function to fetch profile from the backend
  const fetchProfile = async () => {
    try {
      // Assume you've stored the email during login
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        throw new Error("No user email found. Please log in.");
      }
      const response = await axios.get("http://127.0.0.1:8000/user/profile", {
        params: { email: userEmail },
      });
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle file input changes (photo upload)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file); // Convert to Base64
      reader.onload = () => {
        const base64String = reader.result as string;
        // Optionally update the backend with the new profile photo
        setUserData((prev) => ({ ...prev, profilePhoto: base64String }));
        // For now, store locally if needed
        localStorage.setItem("profilePhoto", base64String);
      };
    }
  };

  if (loading) return <p>Loading profile...</p>;

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
      </div>
    </div>
  );
};

export default Profile;
