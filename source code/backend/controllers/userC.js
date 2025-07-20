const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const userSchema = require("../schemas/userModel");
const docSchema = require("../schemas/docModel");
const appointmentSchema = require("../schemas/appointmentModel");


/// for registering the user
const registerController = async (req, res) => {
  try {
    const existsUser = await userSchema.findOne({ email: req.body.email });
    if (existsUser) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    const newUser = new userSchema(req.body);
    await newUser.save();

    return res.status(201).send({ message: "Register Success", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
       .send({ message: "something went wrong", success: false, error: error.message });
  }
};


const loginController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ email: req.body.email });
    if (!user) {
      // 1. BEST PRACTICE: Use more appropriate status codes
      return res
        .status(404) // User not found (more accurate than 200)
        .send({ message: "User not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      // 2. BEST PRACTICE: Use more appropriate status codes
      return res
        .status(401) // Unauthorized (invalid credentials)
        .send({ message: "Invalid email or password", success: false });
    }
    // 3. CRITICAL FIX: Ensure process.env.JWT_SECRET is used consistently
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    user.password = undefined; // Good practice to remove password before sending to frontend
    return res.status(200).send({
      message: "Login success successfully",
      success: true,
      token,
      userData: user,
    });
  } catch (error) {
    console.log(error); // This will log the actual error that's causing the 500
    // 4. FIX: Ensure 'return' is used and status is consistent
    return res
      .status(500)
      .send({ message: "something went wrong", success: false, error: error.message });
  }
};

// ... (registerController and authController are already good for status codes, but ensure 'return' is used)

////auth controller
const authController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.user.userId });

    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    } else {
      return res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
       .send({ message: "something went wrong", success: false, error: error.message });
  }
};


const docController = async (req, res) => {
  try {
    const { doctor } = req.body; // userId will now come from req.user
    const userId = req.user.id; // <--- CHANGE HERE

    const newDoctor = new docSchema({
      ...doctor,
      userId: userId.toString(),
      status: "pending",
    });
    await newDoctor.save();

    const adminUser = await userSchema.findOne({ type: "admin" });
    const notification = adminUser.notification;
    notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.fullName} has applied for doctor registration`,
      data: {
        userId: newDoctor._id,
        fullName: newDoctor.fullName,
        onClickPath: "/admin/doctors",
      },
    });

    await userSchema.findByIdAndUpdate(adminUser._id, { notification });

    return res.status(201).send({
      success: true,
      message: "Doctor Registration request sent successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "error while applying", success: false, error });
  }
};


////for the notification 
const getallnotificationController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.user.userId });
    const seennotification = user.seennotification;
    const notification = user.notification;

    seennotification.push(...notification);
    user.notification = [];
    user.seennotification = seennotification;

    const updatedUser = await user.save();
    return res.status(200).send({
      success: true,
      message: "All notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "unable to fetch", success: false, error });
  }
};


////for deleting the notification
const deleteallnotificationController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.user.userId });
    user.notification = [];
    user.seennotification = [];

    const updatedUser = await user.save();
    updatedUser.password = undefined;
    return res.status(200).send({
      success: true,
      message: "notification deleted",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "unable to delete", success: false, error });
  }
};

////displaying all doctors in user profile
const getAllDoctorsControllers = async (req, res) => {
  try {
    const docUsers = await docSchema.find({ status: "approved" });
    return res.status(200).send({
      message: "doctor Users data list",
      success: true,
      data: docUsers,
    });
  } catch (error) {
    console
      .log(error)
      .status(500)
      .send({ message: "something went wrong", success: false, error });
  }
};

////getting appointments done in user
const appointmentController = async (req, res) => {
  try {
    let { userInfo, doctorInfo } = req.body;
    userInfo = JSON.parse(userInfo)
    doctorInfo = JSON.parse(doctorInfo)

    // Ensure req.user.id is available here (as we changed it in middleware)
    const userId = req.user.id; // Corrected from previous discussion

    // --- ADD THESE DEBUG LOGS ---
    console.log("Appointment Request Body:", req.body);
    console.log("Parsed userInfo:", userInfo);
    console.log("Parsed doctorInfo:", doctorInfo);
    console.log("Authenticated userId:", userId);
    console.log("Req.file (if present):", req.file);

    let documentData = null;
    if (req.file) {
      documentData = {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
      };
      console.log("Document Data:", documentData);
    }

    req.body.status = "pending"; // This modifies req.body, but userId should come from req.user
    
    const newAppointment = new appointmentSchema({
      userId: userId, // Ensure this is the correct user ID from the token
      doctorId: req.body.doctorId, // Ensure this is present and correct
      userInfo: userInfo,
      doctorInfo: doctorInfo,
      date: req.body.date, // Ensure date is passed correctly
      document: documentData,
      status: req.body.status,
    });

    console.log("New Appointment Object (before save):", newAppointment); // Check constructed object

    await newAppointment.save();
    console.log("Appointment saved successfully!"); // Confirmation

    const user = await userSchema.findOne({ _id: doctorInfo.userId });

    if (user) {
      user.notification.push({
        type: "New Appointment",
        message: `New Appointment request from ${userInfo.fullName}`,
      });

      await user.save();
      console.log("Doctor notification updated!"); // Confirmation
    }

    return res.status(200).send({
      message: "Appointment book successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error in appointmentController:", error); // More specific log
    return res
      .status(500)
      .send({ message: "something went wrong (booking)", success: false, error: error.message });
  }
};
const getAllUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming req.user.id is correctly set by middleware
    console.log("Fetching appointments for userId:", userId); // Debug log

    const allAppointments = await appointmentSchema.find({
      userId: userId, // Use the userId from req.user
    });
    console.log("Found appointments:", allAppointments); // Debug log

    const doctorIds = allAppointments.map(
      (appointment) => appointment.doctorId
    );
    console.log("Extracted doctor IDs:", doctorIds); // Debug log

    const doctors = await docSchema.find({
      _id: { $in: doctorIds },
    });
    console.log("Found doctors:", doctors); // Debug log

    const appointmentsWithDoctor = allAppointments.map((appointment) => {
      const doctor = doctors.find(
        (doc) => doc._id.toString() === appointment.doctorId.toString()
      );
      const docName = doctor ? doctor.fullName : "";
      console.log(`Mapping appointment ${appointment._id} with doctor ${docName}`); // Debug log per item
      return {
        ...appointment.toObject(),
        docName,
      };
    });
    console.log("Final appointments data:", appointmentsWithDoctor); // Debug log

    return res.status(200).send({
      message: "All the appointments are listed below.",
      success: true,
      data: appointmentsWithDoctor,
    });
  } catch (error) {
    console.log("Error in getAllUserAppointments:", error); // More specific log
    return res
      .status(500)
      .send({ message: "something went wrong (fetching appointments)", success: false, error: error.message });
  }
};
const getDocsController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.user.userId });
    const allDocs = user.documents;
    if (!allDocs) {
      return res.status(201).send({
        message: "No documnets",
        success: true,
      });
    }
    return res.status(200).send({
      message: "All the appointments are listed below.",
      success: true,
      data: allDocs,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "something went wrong", success: false, error });
  }
};



module.exports = {
  registerController,
  loginController,
  authController,
  docController,
  getallnotificationController,
  deleteallnotificationController,
  getAllDoctorsControllers,
  appointmentController,
  getAllUserAppointments,
  getDocsController,
};
