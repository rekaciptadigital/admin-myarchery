import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as AuthenticationStore from "store/slice/authentication";
import { AdminService } from "services";
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

// TODO: Barangkali data source image bisa dari resource
import user1 from "../../assets/images/users/avatar-man.png";

const ProfileMenu = (props) => {
  const { push } = useHistory();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("Admin");
  const [menu, setMenu] = useState(false);
  const [confirmLogout, setConfirmLogout] = React.useState(false);

  const handleShowConfirmLogout = () => setConfirmLogout(true);
  const handleCancelLogout = () => setConfirmLogout(false);
  const handleLogout = () => push("/logout");

  useEffect(() => {
    const getUser = async () => {
      const { data, success } = await AdminService.profile();
      if (success) {
        setUsername(data.name);
        dispatch(AuthenticationStore.profile(data));
      }
    };
    getUser();
  }, [props.success]);

  return (
    <React.Fragment>
      {/* Menu ketika layar large ke atas */}
      <List className="d-none d-lg-flex my-auto">
        <ListInlineItem className="d-flex justify-content-center align-items-center">
          <img className="rounded-circle header-profile-user" src={user1} alt="Header Avatar" />
          <span className="d-none d-lg-inline-block ms-2 me-1">{username}</span>
        </ListInlineItem>

        <ListInlineItem className="d-flex justify-content-center align-items-center">
          <Button tag="a" color="link" className="text-dark" onClick={handleShowConfirmLogout}>
            <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
            <span>{props.t("Logout")}</span>
          </Button>
        </ListInlineItem>
      </List>

      {/* Menu ketika layar medium ke bawah */}
      <Dropdown isOpen={menu} toggle={() => setMenu(!menu)} className="d-inline-block d-lg-none">
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
