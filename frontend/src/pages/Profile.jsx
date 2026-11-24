
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProfile(form);
      alert("Profile updated successfully");
    } catch {
      alert("Unable to update profile");
    }
  };

  return (
    <div className="container mt-5">
      <div className="form-container">
        <h2 className="text-success">My Profile</h2>

        <p>Username: {user?.username}</p>

        <form onSubmit={handleSubmit}>
          <label className="form-label">First Name</label>
          <input
            className="form-control mb-3"
            value={form.first_name}
            onChange={(e) =>
              setForm({ ...form, first_name: e.target.value })
            }
          />

          <label className="form-label">Last Name</label>
          <input
            className="form-control mb-3"
            value={form.last_name}
            onChange={(e) =>
              setForm({ ...form, last_name: e.target.value })
            }
          />

          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control mb-3"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <button className="btn btn-success">Update Profile</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
