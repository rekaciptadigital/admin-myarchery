import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

function NonAuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return (
    <div>
      {/* Your layout content */}
    </div>
  );
}

export default NonAuthLayout;
