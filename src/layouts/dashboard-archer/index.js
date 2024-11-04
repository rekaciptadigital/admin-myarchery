import React, { Component } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"

// Other Layout related Component
// import Navbar from "./Navbar"
// import HeaderForm from "../landingpage/HeaderForm"
import Footer from "./Footer"

function LayoutArcher(props) {
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

    // const title = location.pathname
    // let currentage = title.charAt(1).toUpperCase() + title.slice(2)
    document.title =
      "Dashboard" + " | MyArchery"
  }, [props.isPreloader, location.pathname]);

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
        {/* <Navbar menuOpen={isMenuOpened} /> */}
        <div className="main-content" style={{minHeight: "calc(100vh - 60px)"}}>{props.children}</div>
        <Footer />
      </div>
    </React.Fragment>
  )
}

export default LayoutArcher;
