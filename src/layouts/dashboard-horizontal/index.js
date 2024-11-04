import React, { Component } from "react"
import { useNavigate, useLocation, useParams, Navigate } from "react-router-dom"

// Other Layout related Component
import Navbar from "./Navbar"
import Header from "./Header"
import Footer from "./Footer"

class Layout extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isMenuOpened: false,
    }
  }

  componentDidMount() {
    if (document.body) document.body.setAttribute('data-layout', 'horizontal')
    if (this.props.isPreloader === true) {
      document.getElementById("preloader").style.display = "block"
      document.getElementById("status").style.display = "block"

      setTimeout(function () {
        document.getElementById("preloader").style.display = "none"
        document.getElementById("status").style.display = "none"
      }, 2500)
    } else {
      document.getElementById("preloader").style.display = "none"
      document.getElementById("status").style.display = "none"
    }

    // Scrollto 0,0
    window.scrollTo(0, 0)

    // const title = this.props.location.pathname
    // let currentage = title.charAt(1).toUpperCase() + title.slice(2)
    document.title =
      "Dashboard" + " | MyArchery"
  }

  /**
   * Opens the menu - mobile
   */
  openMenu = () => {
    this.setState({ isMenuOpened: !this.state.isMenuOpened })
  }
  render() {
    return (
      <React.Fragment>
        <div id="preloader">
          <div id="status">
            <div className="spinner-chase">
              <div className="chase-dot" />
              <div className="chase-dot" />
              <div className="chase-dot" />
              <div className="chase-dot" />
              <div className="chase-dot" />
              <div className="chase-dot" />
            </div>
          </div>
        </div>

        <div id="layout-wrapper">
          <Header
            theme={this.props.topbarTheme}
            isMenuOpened={this.state.isMenuOpened}
            openLeftMenuCallBack={this.openMenu}
          />
          <Navbar menuOpen={this.state.isMenuOpened} />
          <div className="main-content">{this.props.children}</div>
          <Footer />
        </div>
      </React.Fragment>
    )
  }
}

function LayoutWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  return <Layout navigate={navigate} location={location} params={params} />;
}

export default LayoutWrapper;
