import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/common/Home.jsx";
import Login from "./components/common/Login.jsx";
import Register from "./components/common/Register.jsx";
import UserHome from "./components/user/UserHome.jsx";
import AdminHome from "./components/admin/AdminHome.jsx";
import UserAppointments from "./components/user/UserAppointments.jsx";

function App() {
  const userLoggedIn = !!localStorage.getItem("userData");
  return (
    <div className="App">
      <Router>
        <div className="content">
          <Routes>
            <Route exact path="/" element={<Home/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            {userLoggedIn ? (
              <>
                <Route path="/adminhome" element={<AdminHome />} />
                <Route path="/userhome" element={<UserHome />} />
                <Route path="/userhome/userappointments/:doctorId" element={<UserAppointments />} />
              </>
            ) : (
              <Route path="/login" element={<Login />} />
            )}
          </Routes>
        </div>
        <footer className="bg-light text-center text-lg-start">
          <div className="text-center p-3">© 2023 Copyright: MediCareBook</div>
        </footer>
      </Router>
    </div>
  );
}

export default App;
