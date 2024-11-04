import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import * as AuthenticationStore from "store/slice/authentication"
import { useNavigate } from "react-router-dom"

const Logout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoggedIn } = useSelector(AuthenticationStore.getAuthenticationStore)

  useEffect(() => {
    dispatch(AuthenticationStore.logout())
  })

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login")
    }
  }, [isLoggedIn])

  return <></>
}

export default Logout
