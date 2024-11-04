import React from 'react'
// src/components/UIElements/LoadingScreen/index.js
import { FadeLoader } from 'react-spinners';
import "./style.css"

function LoadingScreen({loading}) {
  return (
    <div className="loading-screen">
      <FadeLoader color="#123abc" loading={loading} />
    </div>
  );
}

export default LoadingScreen;
