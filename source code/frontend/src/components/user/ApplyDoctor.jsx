import React from 'react';
import { Container } from 'react-bootstrap';
import { Col, Form, Input, Row, TimePicker, message } from 'antd';
import axios from 'axios';

function ApplyDoctor({ userId }) {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const { timings, ...rest } = values;
      const doctor = { ...rest, timings };

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/registerdoc`,
        { doctor, userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (res.data.success) {
        message.success(res.data.message);
        form.resetFields();
      } else {
        message.error(res.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error(error);
      message.error('Something went wrong');
    }
  };

  return (
    <Container>
      <h2 className="text-center p-3">Apply for Doctor</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="m-3"
      >
        <h4>Personal Details:</h4>
        <Row gutter={20}>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: 'Please enter full name' }]}
            >
              <Input placeholder="Enter name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Phone"
              name="phone"
              rules={[{ required: true, message: 'Please enter phone number' }]}
            >
              <Input type="number" placeholder="Your phone" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please enter email' }]}
            >
              <Input type="email" placeholder="Your email" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: 'Please enter address' }]}
            >
              <Input placeholder="Your address" />
            </Form.Item>
          </Col>
        </Row>

        <h4>Professional Details:</h4>
        <Row gutter={20}>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Specialization"
              name="specialization"
              rules={[{ required: true, message: 'Please enter specialization' }]}
            >
              <Input placeholder="Your specialization" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Experience"
              name="experience"
              rules={[{ required: true, message: 'Please enter experience' }]}
            >
              <Input type="number" placeholder="Your experience" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Fees"
              name="fees"
              rules={[{ required: true, message: 'Please enter consultation fees' }]}
            >
              <Input type="number" placeholder="Your fees" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Timings"
              name="timings"
              rules={[{ required: true, message: 'Please select timings' }]}
            >
              <TimePicker.RangePicker format="HH:mm" />
            </Form.Item>
          </Col>
        </Row>

        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" type="submit">
            Submit
          </button>
        </div>
      </Form>
    </Container>
  );
}

export default ApplyDoctor;
