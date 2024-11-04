// import logo from "assets/images/logo.svg"
// import images
// import profile from "assets/images/profile-img.png"
// availity-reactstrap-validation
import { AvField, AvForm } from "availity-reactstrap-validation"
import myachery from "assets/images/myachery/logo 3.png"
// import gmail from "assets/images/myachery/gmail.png"
// import google from "assets/images/myachery/Google.png"
// import facebook from "assets/images/myachery/Facebook.png"
// import ladBg from "assets/images/myachery/achery-lad.png"
import React, { useEffect, useState } from "react"
import MetaTags from "react-meta-tags"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, Link, useLocation, useParams, Navigate } from "react-router-dom"
import { Col, Row, Container, Card, CardBody } from "reactstrap"
import { AuthenticationService } from "services"
//Import config
import * as AuthenticationStore from "store/slice/authentication"
import toastr from "toastr"

function Login() {
  const dispatch = useDispatch()
  const { isLoggedIn } = useSelector(AuthenticationStore.getAuthenticationStore)
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [loginErrors, setLoginErrors] = useState()

  const handleValidSubmit = async (event, values) => {
    const { data, errors, message, success } =
      await AuthenticationService.login(values)
    if (success) {
      if (data) {
        dispatch(AuthenticationStore.login(data))
      }
    } else {
      console.log(errors)
      setLoginErrors(errors)
      toastr.error(message)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard")
    }
  }, [isLoggedIn])

  console.log(loginErrors)

  return (
    <React.Fragment>
      <MetaTags>
        <title>Login | MyArchery</title>
      </MetaTags>
      <div className="home-btn d-none d-sm-block">
        <Link to="/" className="text-dark">
          <i className="fas fa-home h2" />
        </Link>
      </div>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="overflow-hidden">
                <div className="bg-primary">
                  <Row>
                    <Col xs={7}>
                      <div className="text-light p-4">
                        <h5 className="text-light">Masuk MyArchery.id</h5>
                        {/* <p>Sign in to continue MyArchery.</p> */}
                      </div>
                    </Col>
                    {/* <Col className="col-5 align-self-end">
                      <img src={profile} alt="" className="img-fluid" />
                    </Col> */}
                  </Row>
                </div>
                <CardBody className="pt-0">
                  <div>
                    <Link to="/" className="auth-logo-light">
                      <div className="avatar-md profile-user-wid mb-4">
                        <span className="avatar-title rounded-circle bg-light">
                          <img
                            src={myachery}
                            alt=""
                            className="rounded-circle"
                            height="34"
                          />
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className="p-2">
                    <AvForm
                      className="form-horizontal"
                      onValidSubmit={(e, v) => {
                        handleValidSubmit(e, v)
                      }}
                    >
                      <div className="mb-3">
                        <AvField
                          name="email"
                          label="Email"
                          className="form-control"
                          placeholder="Enter email"
                          type="email"
                          required
                        />
                        {loginErrors?.email ? (
                          <div className="validated-response">
                            {loginErrors?.email.join(", ")}
                          </div>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <AvField
                          name="password"
                          label="Password"
                          type="password"
                          required
                          placeholder="Enter Password"
                        />
                      </div>

                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customControlInline"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customControlInline"
                        >
                          Remember me
                        </label>
                      </div>

                      <div className="mt-3 d-grid">
                        <button
                          className="btn btn-primary btn-block"
                          type="submit"
                        >
                          Masuk
                        </button>
                      </div>

                      {/* <div className="text-center mt-4">
                        <p className="font-size-14 color-black">Atau masuk dengan</p>
                        <div>
                          <img src={facebook} alt="" />
                          <img src={google} alt="" />
                        </div>
                      </div> */}

                      <div className="mt-4 text-center">
                        <Link
                          to="/forgot-password"
                          className="text-muted"
                        >
                          <i className="mdi mdi-lock me-1" />
                          Forgot your password?
                        </Link>
                      </div>
                    </AvForm>
                  </div>
                </CardBody>
              </Card>
              <div className="mt-5 text-center">
                <p>
                  Don&#39;t have an account ?{" "}
                  <Link to="/register" className="fw-medium text-primary">
                    {" "}
                    Signup now{" "}
                  </Link>{" "}
                </p>
                {/* <p>
                  © {new Date().getFullYear()} Skote. Crafted with{" "}
                  <i className="mdi mdi-heart text-danger" /> by Themesbrand
                </p> */}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
   )
}

export default Login
