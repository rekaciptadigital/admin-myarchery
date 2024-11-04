import React, { Component } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import Footer from "./Footer"
// Layout Related Components
import Header from "./Header"
import Sidebar from "./Sidebar"

function Layout(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [isMobile, setIsMobile] = React.useState(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

  const toggleMenuCallback = () => {
    if (props.leftSideBarType === "default") {
      props.changeSidebarType("condensed", isMobile)
    } else if (props.leftSideBarType === "condensed") {
      props.changeSidebarType("default", isMobile)
    }
  }

  React.useEffect(() => {
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

    // Scroll Top to 0
    window.scrollTo(0, 0)
    // let currentage = capitalizeFirstLetter(props.location.pathname)

    // document.title =
    //   currentage + " | MyArchery"
    if (props.leftSideBarTheme) {
      props.changeSidebarTheme(props.leftSideBarTheme)
    }
    if (props.leftSideBarThemeImage) {
      props.changeSidebarThemeImage(props.leftSideBarThemeImage)
    }

    if (props.layoutWidth) {
      props.changeLayoutWidth(props.layoutWidth)
    }

    if (props.leftSideBarType) {
      props.changeSidebarType(props.leftSideBarType)
    }
    if (props.topbarTheme) {
      props.changeTopbarTheme(props.topbarTheme)
    }
  }, [props]);

  const capitalizeFirstLetter = string => {
    return string.charAt(1).toUpperCase() + string.slice(2)
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
        <Header toggleMenuCallback={toggleMenuCallback} />
        <Sidebar
          theme={props.leftSideBarTheme}
          type={props.leftSideBarType}
          isMobile={isMobile}
        />
        <div className="main-content">{props.children}</div>
        <Footer />
      </div>
    </React.Fragment>
  )
}

export default Layout;
