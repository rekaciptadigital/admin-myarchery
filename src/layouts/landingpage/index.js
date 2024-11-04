import PropTypes from 'prop-types'
import React, { Component } from "react"
import { useNavigate, useLocation, useParams, Navigate } from "react-router-dom"
import "toastr/build/toastr.min.css"

function LandingPageLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  navigate('/path');

  return <React.Fragment>{this.props.children}</React.Fragment>
}

LandingPageLayout.propTypes = {
  children: PropTypes.any,
  location: PropTypes.object
}

export default LandingPageLayout

