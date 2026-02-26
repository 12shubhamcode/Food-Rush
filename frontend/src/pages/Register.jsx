import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { LuLoaderCircle } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/slice/userSlice";

const Register = () => {
  const [role, setRole] = useState("user");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegister = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${serverUrl}/api/auth/register`,
        {
          fullName,
          email,
          password,
          mobile,
          role,
        },
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        dispatch(setUserData(response.data));
        navigate("/login");
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!mobile) {
      return toast("Mobile number is required");
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    try {
      const response = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          role,
          mobile,
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        dispatch(setUserData(response.data))
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px] border-orange-200">
        <h1 className="font-bold text-3xl text-center text-orange-600">
          Food Rush
        </h1>
        <p className="text-sm text-gray-600  text-center mt-1">
          create your account to order delicious foods
        </p>

        <div className="mb-3">
          <label
            htmlFor="fullName"
            className="block text-gray-700 font-medium mb-1"
          >
            fullName
          </label>
          <input
            required
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="fullName"
            className="focus:outline-none  focus:border-orange-500 w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-3">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="focus:outline-none  focus:border-orange-500 w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-3">
          <label
            htmlFor="mobile"
            className="block text-gray-700 font-medium mb-1"
          >
            Mobile
          </label>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            type="text"
            placeholder="mobile number"
            className="focus:outline-none  focus:border-orange-500 w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-3">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1"
          >
            Password
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className="focus:outline-none  focus:border-orange-500 w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-3">
          <label
            htmlFor="role"
            className="block text-gray-700 font-medium mb-1"
          >
            Role
          </label>
          <div className="flex gap-2">
            {["user", "owner", "deliveryBoy"].map((r) => (
              <button
                onClick={() => setRole(r)}
                className={`flex-1 text-gray-900 border rounded-lg px-3 py-2 text-center font-medium cursor-pointer ${
                  role === r ? "bg-orange-500 text-white" : ""
                } `}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <button className="px-4 py-3 mt-4 text-center bg-orange-600 text-white w-full flex items-center justify-center gap-2 border cursor-pointer rounded-lg hover:bg-orange-500 transition-all duration-300">
            <LuLoaderCircle className="mr-4 h-5 w-5 animate-spin text-white" />{" "}
            please wait
          </button>
        ) : (
          <button
            onClick={handleRegister}
            className="px-4 py-3 mt-4 text-center bg-orange-600 text-white w-full flex items-center justify-center gap-2 border cursor-pointer rounded-lg hover:bg-orange-500 transition-all duration-300"
          >
            Signup
          </button>
        )}

        <button
          onClick={handleGoogleAuth}
          className="flex items-center justify-center w-full border px-3 py-2 mt-3 gap-2 hover:bg-gray-100    rounded-lg  transition-all duration-300 cursor-pointer"
        >
          <FcGoogle size={24} />
          <span>Sign up with google</span>
        </button>

        <p className="mt-3 text-sm text-gray-600 text-center ">
          Already have an account?{" "}
          <span className="text-blue-700 underline">
            {" "}
            <Link to="/login"> Login</Link>{" "}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
