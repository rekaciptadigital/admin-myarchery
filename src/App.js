import React from "react";
import { BrowserRouter as Router, Redirect, Switch } from "react-router-dom";
import { AuthLayout } from "./layouts";
import { AuthenticationMiddleware } from "./middlewares";
import { authenticationRoutes, dashboardRoutes, certificateRoutes, workingRoutes, dosRoutes } from "./routes";

import { LayoutDashboard } from "layouts/ma";
import { LayoutDashboardDos } from "layouts/dashboard-dos";

import "./assets/scss/theme.scss";
import "react-datepicker/dist/react-datepicker.css";

const App = () => {
  return (
    <React.Fragment>
      <Router>
        <Switch>
          <AuthenticationMiddleware
            path="/"
            layout={React.Fragment}
            component={() => <Redirect to="/login" />}
            isAuthProtected={false}
            exact
          />
          {authenticationRoutes.map((route, idx) => (
            <AuthenticationMiddleware
              path={route.path}
              layout={AuthLayout}
              component={route.component}
              key={idx}
              isAuthProtected={false}
              exact
            />
          ))}
          {dashboardRoutes.map((route, idx) => (
            <AuthenticationMiddleware
              path={route.path}
              layout={LayoutDashboard}
              component={route.component}
              key={idx}
              isAuthProtected={true}
              exact
            />
          ))}
          {certificateRoutes.map((route, idx) => (
            <AuthenticationMiddleware
              path={route.path}
              layout={LayoutDashboard}
              component={route.component}
              key={idx}
              isAuthProtected={true}
              exact
            />
          ))}
          {workingRoutes.map((route, idx) => (
            <AuthenticationMiddleware
              path={route.path}
              layout={AuthLayout}
              component={route.component}
              key={idx}
              isAuthProtected={false}
              exact
            />
          ))}
           {dosRoutes.map((route, idx) => (
            <AuthenticationMiddleware
              path={route.path}
              layout={LayoutDashboardDos}
              component={route.component}
              key={idx}
              isAuthProtected={false}
              exact
            />
          ))}
          <Redirect to="/working/not-found" />
        </Switch>
      </Router>
    </React.Fragment>
  );
};

export default App;
