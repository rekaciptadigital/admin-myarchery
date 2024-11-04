import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "./layouts";
import { AuthenticationMiddleware } from "./middlewares";
import {
  authenticationRoutes,
  dashboardRoutes,
  certificateRoutes,
  workingRoutes,
  dosRoutes,
  liveScoreRoutes,
} from "./routes";

import { LayoutDashboard, LayoutLiveScores } from "layouts/ma";
import { LayoutDashboardDos } from "layouts/dashboard-dos";

import { EventDetailProvider } from "contexts/event-detail";

import "./assets/scss/theme.scss";
import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap/dist/css/bootstrap.min.css';

// In components using react-select
import Select from 'react-select';

// In components using reactstrap
import { 
  Button, 
  Form, 
  Input, 
  Label,
  // other components... 
} from 'reactstrap';

const App = () => {
  return (
    <React.Fragment>
      <Router>
        <EventDetailProvider>
          <Routes>
            <AuthenticationMiddleware
              path="/"
              layout={React.Fragment}
              element={<Navigate to="/login" replace />}
              isAuthProtected={false}
              exact
            />
            {authenticationRoutes.map((route, idx) => (
              <AuthenticationMiddleware
                path={route.path}
                layout={AuthLayout}
                element={<route.component />}
                key={idx}
                isAuthProtected={false}
                exact
              />
            ))}
            {dashboardRoutes.map((route, idx) => (
              <AuthenticationMiddleware
                path={route.path}
                layout={LayoutDashboard}
                element={<route.component />}
                key={idx}
                isAuthProtected={true}
                exact
              />
            ))}
            {certificateRoutes.map((route, idx) => (
              <AuthenticationMiddleware
                path={route.path}
                layout={LayoutDashboard}
                element={<route.component />}
                key={idx}
                isAuthProtected={true}
                exact
              />
            ))}
            {liveScoreRoutes.map((route, idx) => (
              <AuthenticationMiddleware
                path={route.path}
                layout={LayoutLiveScores}
                element={<route.component />}
                key={idx}
                isAuthProtected={false}
                exact
              />
            ))}
            {workingRoutes.map((route, idx) => (
              <AuthenticationMiddleware
                path={route.path}
                layout={AuthLayout}
                element={<route.component />}
                key={idx}
                isAuthProtected={false}
                exact
              />
            ))}
            {dosRoutes.map((route, idx) => (
              <AuthenticationMiddleware
                path={route.path}
                layout={LayoutDashboardDos}
                element={<route.component />}
                key={idx}
                isAuthProtected={false}
                exact
              />
            ))}
            <Navigate to="/working/not-found" replace />
          </Routes>
        </EventDetailProvider>
      </Router>
    </React.Fragment>
  );
};

export default App;
