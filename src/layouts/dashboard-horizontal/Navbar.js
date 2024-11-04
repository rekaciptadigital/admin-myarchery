import classname from "classnames";
import React, { useEffect, useState } from "react";
//i18n
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Collapse } from "reactstrap";
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const Navbar = props => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  // const [app, setapp] = useState(false);
  const [event, setEvent] = useState(false)

  useEffect(() => {
    var matchingMenuItem = null;
    var ul = document.getElementById("navigation");
    var items = ul.getElementsByTagName("a");
    for (var i = 0; i < items.length; ++i) {
      if (props.location.pathname === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  });
  function activateParentDropdown(item) {
    item.classList.add("active");
    const parent = item.parentElement;
    if (parent) {
      parent.classList.add("active"); // li
      const parent2 = parent.parentElement;
      parent2.classList.add("active"); // li
      const parent3 = parent2.parentElement;
      if (parent3) {
        parent3.classList.add("active"); // li
        const parent4 = parent3.parentElement;
        if (parent4) {
          parent4.classList.add("active"); // li
          const parent5 = parent4.parentElement;
          if (parent5) {
            parent5.classList.add("active"); // li
            const parent6 = parent5.parentElement;
            if (parent6) {
              parent6.classList.add("active"); // li
            }
          }
        }
      }
    }
    return false;
  }

  return (
    <React.Fragment>
      <div className="topnav">
        <div className="container-fluid">
          <nav
            className="navbar navbar-light navbar-expand-lg topnav-menu"
            id="navigation"
          >
            <Collapse
              isOpen={props.leftMenu}
              className="navbar-collapse"
              id="topnav-menu-content"
            >
              <ul className="navbar-nav">
                {/* <li className="nav-item dropdown">
                  <Link className="nav-link" to="/dashboard">
                    <i className="bx bx-home-circle me-2"></i>
                    {props.t("Dashboard")} <div className="arrow-down"></div>
                  </Link>
                  <div className={classname("dropdown-menu", { show: event })}>
                    <Link className="dropdown-item" to="/dashboard/category">
                      {props.t("Category")}
                    </Link>
                    <Link className="dropdown-item" to="/dashboard/member">
                      {props.t("Member")}
                    </Link>
                    <Link className="dropdown-item" to="/dashboard/scoring">
                      {props.t("Scoring")}
                    </Link>
                    <Link className="dropdown-item" to="/dashboard/result">
                      {props.t("Result")}
                    </Link>
                  </div>
                </li> */}
                <li className="nav-item dropdown">
                  <Link to="/#"
                        onClick={e => {
                          e.preventDefault();
                          setEvent(!event);
                        }}
                        className="nav-link dropdown-togglez arrow-none"
                  >
                    <i className="bx bx-home-circle me-2"></i>
                    {props.t("Event")} <div className="arrow-down"></div>
                  </Link>
                  <div className={classname("dropdown-menu", { show: event })}>
                    <Link className="dropdown-item" to="/dashboard/events">
                      {props.t("List")}
                    </Link>
                    <Link className="dropdown-item" to="/dashboard/events/new">
                      {props.t("New")}
                    </Link>
                  </div>
                </li>
                {/* <li className="nav-item dropdown">
                  <Link
                    to="/#"
                    onClick={e => {
                      e.preventDefault();
                      setapp(!app);
                    }}
                    className="nav-link dropdown-togglez arrow-none"
                  >
                    <i className="bx bx-customize me-2"></i>
                    {props.t("Apps")} <div className="arrow-down"></div>
                  </Link>
                  <div className={classname("dropdown-menu", { show: app })}>
                    <Link to="/calendar" className="dropdown-item">
                      {props.t("Calendar")}
                    </Link>
                  </div>
                </li> */}
              </ul>
            </Collapse>
          </nav>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Navbar;
