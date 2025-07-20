import React, { useState } from 'react'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { message } from 'antd';
import { Button, Form } from 'react-bootstrap';
import photo1 from '../../images/photo1.png'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBInput
}
  from 'mdb-react-ui-kit';

const Login = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState({
    email: '', password: ''
  })

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Change '/api/users/register' to '/api/users/login'
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/login`, user);
    //                                                      ^ CORRECTED TO 'login'

    console.log("Backend Response (res.data):", res.data); // Add this for debugging

    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userData', JSON.stringify(res.data.userData));
      message.success('Login successfully');
      const isLoggedIn = JSON.parse(localStorage.getItem("userData"));
      const { type } = isLoggedIn;

      switch (type) {
        case "admin":
          navigate("/AdminHome");
          break;
        case "user":
          navigate("/UserHome");
          break;
        default:
          navigate("/Login");
          break;
      }
    } else {
      // This block is for when success is false, and backend sends a message
      message.error(res.data.message);
    }
  } catch (error) {
    console.log("Axios Error:", error); // Keep this
    if (error.response) {
        console.log("Server Response Data (error.response.data):", error.response.data); // Add this
        console.log("Server Status (error.response.status):", error.response.status); // Add this
        message.error(error.response.data.message || 'Something went wrong on server'); // More specific error
    } else {
        message.error('Something went wrong (Network/Client issue)');
    }
  }
};


  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container fluid>
          <Navbar.Brand>
            <Link to={'/'}>MediCareBook</Link>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: '100px' }}
              navbarScroll
            >
            </Nav>
            <Nav>
              <Link to={'/'}>Home</Link>
              <Link to={'/login'}>Login</Link>
              <Link to={'/register'}>Register</Link>
            </Nav>

          </Navbar.Collapse>
        </Container>
      </Navbar>


      <MDBContainer className="my-5">

        <MDBCard style={{ border: 'none' }}>
          <MDBRow style={{ background: 'rgb(190, 203, 203)' }} className='g-0 border-none p-3'>

            <MDBCol md='6'>
              <MDBCardImage src={photo1} alt="login form" className='rounded-start w-100' />
            </MDBCol>

            <MDBCol md='6'>
              <MDBCardBody className='d-flex mx-5 flex-column'>

                <div className='d-flex flex-row mt-2 mb-5'>
                  <span className="h1 fw-bold mb-0">Sign in to your account</span>
                </div>

                <Form onSubmit={handleSubmit}>
                <label className="form-label" htmlFor="formControlLgEmail">Email</label>
                  <MDBInput
                    style={{ margin: '5px auto' }}
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    id="formControlLgEmail"
                    type="email"
                    size="md"
                    autoComplete='off'
                  />
                  <label className="form-label" htmlFor="formControlLgPassword">Password</label>
                  <MDBInput
                    style={{ margin: '5px auto' }}
                    name="password"
                    value={user.password}
                    onChange={handleChange}
                    id="formControlLgPassword"
                    type="password"
                    size="md"
                    autoComplete='off'
                  />
                  <Button className="mb-4 px-5 bg-dark" size='lg' type='submit'>Login</Button>
                </Form>
                <p className="mb-5 pb-lg-2" style={{ color: '#393f81' }}>Don't have an account? <Link to={'/register'} style={{ color: '#393f81' }}>Register here</Link></p>

              </MDBCardBody>
            </MDBCol>

          </MDBRow>
        </MDBCard>

      </MDBContainer>
    </>
  );
}

export default Login;