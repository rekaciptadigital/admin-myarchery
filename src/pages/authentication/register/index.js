import React, { useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as AuthenticationStore from "store/slice/authentication";
import toastr from "toastr";
import { useSubmitRegister } from "./hooks/submit-register";

import MetaTags from "react-meta-tags";
import { Col, Container, Row, Card, CardBody } from "reactstrap";
import { AvField, AvForm } from "availity-reactstrap-validation";
import { ButtonBlue, ButtonGhostBlue, LoadingScreen } from "components/ma";
import { ProcessingToast, toast } from "./components/processing-toast";
import { SelectInfoSource } from "./components/select-info-source";
import { SelectCity } from "./components/select-city";
import { SelectProvince } from "./components/select-province";
import { AlertSuccess } from "./components/alert-registration-success";

import IconArrowLeft from "components/ma/icons/mono/arrow-left";

import myachery from "assets/images/myachery/logo 3.png";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { isLoggedIn } = useSelector(AuthenticationStore.getAuthenticationStore);
  const [screen, setScreen] = React.useState(0);
  const [provinceId, setProvinceId] = React.useState();
  const [formStep1, setFormStep1] = React.useState(null);
  const { submit, isLoading, isSuccess, data: submitSuccessData } = useSubmitRegister();

  const handleValidSubmit = async (values) => {
    const payload = _makePayload(formStep1, values);
    submit(payload, {
      onError: (errors) => {
        if (!errors.length) {
          return;
        }
        errors.forEach((message) => toastr.error(message));
      },
    });
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    window.scrollTo(0, 100);
  }, [screen]);

  useEffect(() => {
    return () => toast.dismiss();
  }, []);

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
        <ProcessingToast />
        <LoadingScreen loading={isLoading} />
        <AlertSuccess
          isSuccess={isSuccess}
          onConfirm={() => {
            submitSuccessData && dispatch(AuthenticationStore.register());
          }}
        />
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="overflow-hidden">
                <div className="bg-primary">
                  <Row>
                    <Col xs={7}>
                      <div className="text-light p-4">
                        <h5 className="text-light">Daftar MyArchery.id</h5>
                        <p>
                          Get your free MyArchery.id <br />
                          account now.
                        </p>
                      </div>
                    </Col>
                  </Row>
                </div>
                <CardBody className="pt-0">
                  <div>
                    <Link to="/" className="auth-logo-light">
                      <div className="avatar-md profile-user-wid mb-4">
                        <span className="avatar-title rounded-circle bg-light">
                          <img src={myachery} alt="" className="rounded-circle" height="34" />
                        </span>
                      </div>
                    </Link>
                  </div>
                  {screen === 0 ? (
                    <div className="p-2" key="step-1">
                      <AvForm
                        className="form-horizontal"
                        onValidSubmit={(e, values) => {
                          toast.success("Lanjut ke langkah kedua");
                          setFormStep1(values);
                          setScreen(1);
                        }}
                      >
                        <div className="mb-3">
                          <AvField
                            name="name"
                            label="Nama Penyelengara"
                            className="form-control"
                            placeholder="Masukkan nama"
                            type="text"
                            required
                            errorMessage="Nama penyelenggara wajib diisi"
                            defaultValue={formStep1?.name}
                          />
                        </div>
                        <div className="mb-3">
                          <AvField
                            name="email"
                            label="Email"
                            className="form-control"
                            placeholder="Masukkan email (digunakan untuk masuk)"
                            type="email"
                            required
                            errorMessage="Email wajib diisi"
                            defaultValue={formStep1?.email}
                          />
                        </div>
                        <div className="mb-3">
                          <AvField
                            name="phone"
                            label="Nomor Telepon"
                            className="form-control"
                            placeholder="Masukkan nomor telepon (nomor WhatsApp)"
                            type="text"
                            required
                            errorMessage="Nomor telepon wajib diisi"
                            defaultValue={formStep1?.phone}
                          />
                        </div>
                        <div className="mb-3">
                          <AvField
                            name="password"
                            label="Kata Sandi"
                            type="password"
                            required
                            placeholder="Masukkan kata sandi"
                            errorMessage="Kata sandi wajib diisi"
                          />
                        </div>
                        <div className="mb-3">
                          <AvField
                            name="password_confirmation"
                            label="Konfirmasi Kata Sandi"
                            type="password"
                            required
                            placeholder="Masukkan ulang kata sandi di atas"
                            errorMessage="Kata sandi wajib dikonfirmasi"
                          />
                        </div>

                        <div className="mt-3 d-grid">
                          <ButtonBlue type="submit">Selanjutnya</ButtonBlue>
                        </div>
                      </AvForm>
                    </div>
                  ) : screen === 1 ? (
                    <div className="p-2" key="step-2">
                      <div className="mb-3">
                        <ButtonBack flexible onClick={() => setScreen(0)}>
                          <IconArrowLeft size="16" />
                        </ButtonBack>
                      </div>

                      <AvForm
                        className="form-horizontal"
                        onValidSubmit={(e, values) => handleValidSubmit(values)}
                      >
                        <div className="mb-3">
                          <AvField
                            name="province"
                            label="Provinsi"
                            className="form-control"
                            placeholder="Pilih provinsi"
                            tag={SelectProvince}
                            onChange={(value) => setProvinceId(value)}
                            required
                            errorMessage="Provinsi wajib diisi"
                          />
                        </div>
                        <div className="mb-3">
                          <AvField
                            name="city"
                            label="Kota"
                            className="form-control"
                            placeholder="Pilih kota"
                            provinceId={provinceId}
                            tag={SelectCity}
                            required
                            errorMessage="Kota wajib diisi"
                          />
                        </div>
                        <div className="mb-3">
                          <AvField
                            name="questionnaire_source"
                            label="Dari mana Anda mengetahui MyArchery?"
                            placeholder="Pilih opsi"
                            type="text"
                            tag={SelectInfoSource}
                            required
                            errorMessage="Silakan isi sesuai pertanyaan di atas"
                          />
                        </div>
                        <div className="mb-3">
                          <AvField
                            name="questionnaire_motive"
                            label="Mengapa Anda ingin menggunakan MyArchery?"
                            className="form-control"
                            placeholder="Sebutkan alasan"
                            type="text"
                            required
                            errorMessage="Silakan isi sesuai pertanyaan di atas"
                          />
                        </div>
                        <div className="mb-3">
                          <AvField
                            name="questionnaire_event_name"
                            label="Event terdekat apa yang ingin Anda selenggarakan?"
                            className="form-control"
                            placeholder="Sebutkan nama event"
                            type="text"
                            required
                            errorMessage="Silakan isi sesuai pertanyaan di atas"
                          />
                        </div>
                        <div className="mb-3">
                          <AvField
                            name="questionnaire_event_description"
                            label="Deskripsikan event yang akan Anda selenggarakan?"
                            className="form-control"
                            placeholder="Masukkan deskripsi singkat"
                            type="textarea"
                            required
                            errorMessage="Silakan isi sesuai pertanyaan di atas"
                          />
                        </div>

                        <div className="mt-3 d-grid">
                          <ButtonBlue type="submit">Buat Akun</ButtonBlue>
                        </div>
                      </AvForm>
                    </div>
                  ) : (
                    <div className="p-2">Tidak ada screen</div>
                  )}
                </CardBody>
              </Card>
              <div className="mt-5 text-center">
                <p>
                  Sudah punya akun?{" "}
                  <Link to="/login" className="fw-medium text-primary">
                    Login
                  </Link>
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

function _makePayload(formStep1, values) {
  return {
    // step 1
    name_organizer: formStep1.name,
    email: formStep1.email,
    password: formStep1.password,
    password_confirmation: formStep1.password_confirmation,
    phone_number: formStep1.phone,
    // step 2
    province_id: values.province,
    city_id: values.city,
    intro: {
      where: values.questionnaire_source,
      why: values.questionnaire_motive,
      what: values.questionnaire_event_name,
      description: values.questionnaire_event_description,
    },
  };
}

const ButtonBack = styled(ButtonGhostBlue)`
  > *:nth-child(1) {
    transform: translateX(-0.75rem);
    transition: transform 0.15s ease-in-out;
  }

  &:hover > *:nth-child(1) {
    transform: translateX(0);
  }

  > *:nth-child(2) {
    visibility: hidden;
    transition: visibility 0.35s ease-in-out;
  }

  &:hover > *:nth-child(2) {
    visibility: visible;
  }
`;

export default Register;
