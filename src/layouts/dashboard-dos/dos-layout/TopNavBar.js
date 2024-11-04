import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import * as AuthStore from "store/slice/authentication";
import { ArcherService } from "services";
import { withTranslation } from "react-i18next";

import {
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  List,
  ListInlineItem,
  Button,
} from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import { Link } from "react-router-dom";

import user1 from "assets/images/users/avatar-man.png";

const ProfileMenu = (props) => {
  const { push } = useNavigate();
  const dispatch = useDispatch();

  const [menu, setMenu] = useState(false);
  const { userProfile } = useSelector(AuthStore.getAuthenticationStore);
  const username = userProfile?.name || "Archer";
  const [confirmLogout, setConfirmLogout] = React.useState(false);

  React.useEffect(() => {
    if (userProfile) {
      return;
    }
    const getUser = async () => {
      const { data, success } = await ArcherService.profile();
      if (success) {
        dispatch(AuthStore.profile(data));
      }
    };
    getUser();
  }, []);

  const handleShowConfirmLogout = () => setConfirmLogout(true);
  const handleCancelLogout = () => setConfirmLogout(false);
  const handleLogout = () => push("/logout");

  return (
    <React.Fragment>
      {/* Menu ketika layar large ke atas */}
      <List className="d-none d-lg-flex my-auto">
        <ListInlineItem className="d-flex justify-content-center align-items-center">
          <Link to="/dashboard">
            <img className="rounded-circle header-profile-user" src={user1} alt="Header Avatar" />
            <span style={{ color: "#000" }} className="d-none d-lg-inline-block ms-2 me-1">
              {username}
            </span>
          </Link>
        </ListInlineItem>

        <ListInlineItem className="d-flex justify-content-center align-items-center">
          <Button tag="a" color="link" className="text-dark" onClick={handleShowConfirmLogout}>
            <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
            <span>{props.t("Logout")}</span>
          </Button>
        </ListInlineItem>
      </List>

      {/* Menu ketika layar medium ke bawah */}
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu((menu) => !menu)}
        className="d-inline-block d-lg-none"
      >
        <DropdownToggle className="btn header-item " id="page-header-user-dropdown" tag="button">
          <img className="rounded-circle header-profile-user" src={user1} alt="Header Avatar" />
          <span className="d-none d-xl-inline-block ms-2 me-1">{username}</span>
          <i className="mdi mdi-chevron-down d-none d-xl-inline-block" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownItem tag="a" href="/logout" className="dropdown-item">
            <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
            <span>{props.t("Logout")}</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <SweetAlert
        title=""
        show={confirmLogout}
        custom
        btnSize="md"
        reverseButtons={true}
        showCancel
        cancelBtnText="Batal"
        confirmBtnText="Ya"
        confirmBtnBsStyle="outline-primary"
        cancelBtnBsStyle="primary"
        onConfirm={handleLogout}
        onCancel={handleCancelLogout}
        style={{ padding: "30px 40px" }}
      >
        <p className="text-muted">
          Anda akan keluar dari aplikasi.
          <br />
          Lanjutkan?
        </p>
      </SweetAlert>
    </React.Fragment>
  );
};

export default withTranslation()(ProfileMenu);
