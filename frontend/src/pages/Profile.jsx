import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
    };

    fetchProfile();
  }, []);

  if (!user) return <p className="text-center mt-20">Loading profile...</p>;

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
        <p className="text-lg mb-2">Name: {user.name}</p>
        <p className="text-lg mb-2">Email: {user.email}</p>
        <p className="text-sm text-gray-500">Joined: {new Date(user.createdAt).toDateString()}</p>
      </div>
    </div>
  );
}
