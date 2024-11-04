import React from "react";
import { Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { getAuthenticationStore } from "store/slice/authentication";
import { ErrorBoundary } from "components/ma/error-boundary";

const AuthenticationMiddleware = ({
  component: Component,
  layout: Layout,
  isAuthProtected,
  ...rest
}) => {
  let { isLoggedIn } = useSelector(getAuthenticationStore);
  // isLoggedIn = true;
  // isAuthProtected = false

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isAuthProtected && !isLoggedIn) {
          return (
            <Navigate
              to={{
                pathname: "/login",
                state: { from: props.location },
              }}
              replace
            />
          );
        }
        return (
          <Layout>
            <ErrorBoundary>
              <Component {...props} />
            </ErrorBoundary>
          </Layout>
        );
      }}
    />
  );
};

AuthenticationMiddleware.propTypes = {
  isAuthProtected: PropTypes.bool,
  component: PropTypes.any,
  location: PropTypes.object,
  layout: PropTypes.any,
};

function Component() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  return <div>...</div>;
}

export default AuthenticationMiddleware;
