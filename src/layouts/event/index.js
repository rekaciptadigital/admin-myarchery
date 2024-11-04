import React, { Component } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"

// Other Layout related Component
import Navbar from "./Navbar"
import Header from "./Header"
import Footer from "./Footer"

function Layout(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [isMenuOpened, setIsMenuOpened] = React.useState(false);

  React.useEffect(() => {
    if (document.body) document.body.setAttribute('data-layout', 'horizontal')
    if (props.isPreloader === true) {
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

    const title = location.pathname
    let currentage = title.charAt(1).toUpperCase() + title.slice(2)

    document.title =
      currentage + " | Skote - React Admin & Dashboard Template"
  }, [location.pathname, props.isPreloader]);

  /**
   * Opens the menu - mobile
   */
  const openMenu = () => {
    setIsMenuOpened(!isMenuOpened)
  }

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
          theme={props.topbarTheme}
          isMenuOpened={isMenuOpened}
          openLeftMenuCallBack={openMenu}
        />
        <Navbar menuOpen={isMenuOpened} />
        <div className="main-content">{props.children}</div>
        <Footer />
      </div>
    </React.Fragment>
  )
}

export default Layout;
