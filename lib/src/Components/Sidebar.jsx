import React, { useContext } from 'react';
import { AuthContext } from '../Context/AuthProvider';


const Sidebar = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="sidebar">
      <h3>User Info</h3>
      <p>Username: {user?.username}</p>
      <p>ID: {user?.id}</p>
    </div>
  );
};

export default Sidebar;
