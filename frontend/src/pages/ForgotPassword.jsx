import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { LuLoaderCircle } from "react-icons/lu";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setStep(2);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setStep(3);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      return null;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen p-4 bg-orange-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px] border-orange-200">
        <div className="flex items-center gap-2 mb-4">
          <IoIosArrowRoundBack
            onClick={() => navigate("/login")}
            size={30}
            className="cursor-pointer text-orange-600"
          />
          <h1 className="text-center text-2xl font-medium text-orange-600">
            Forgot Password
          </h1>
        </div>

        {step === 1 && (
          <div className="mt-4">
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

            {loading ? (
              <button className="px-4 py-3 mt-4 text-center bg-orange-600 text-white w-full flex items-center justify-center gap-2 border cursor-pointer rounded-lg hover:bg-orange-500 transition-all duration-300">
                <LuLoaderCircle className="mr-4 h-5 w-5 animate-spin text-white" />{" "}
                please wait
              </button>
            ) : (
              <button
                onClick={handleSendOtp}
                className="px-4 py-3 mt-4 text-center bg-orange-600 text-white w-full flex items-center justify-center gap-2 border cursor-pointer rounded-lg hover:bg-orange-500 transition-all duration-300"
              >
                Send Otp
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="mt-4">
            <div className="mb-3">
              <label
                htmlFor="otp"
                className="block text-gray-700 font-medium mb-1"
              >
                OTP
              </label>
              <input
                required
                type="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter otp"
                className="focus:outline-none  focus:border-orange-500 w-full border rounded-lg px-3 py-2"
              />
            </div>

            {loading ? (
              <button className="px-4 py-3 mt-4 text-center bg-orange-600 text-white w-full flex items-center justify-center gap-2 border cursor-pointer rounded-lg hover:bg-orange-500 transition-all duration-300">
                <LuLoaderCircle className="mr-4 h-5 w-5 animate-spin text-white" />{" "}
                please wait
              </button>
            ) : (
              <button
                onClick={handleVerifyOtp}
                className="px-4 py-3 mt-4 text-center bg-orange-600 text-white w-full flex items-center justify-center gap-2 border cursor-pointer rounded-lg hover:bg-orange-500 transition-all duration-300"
              >
                Verify
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="mt-4">
            <div className="mb-3">
              <label
                htmlFor="newPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                New Password
              </label>
              <input
                required
                type="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter New Password"
                className="focus:outline-none  focus:border-orange-500 w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                Confirm Password
              </label>
              <input
                required
                type="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="focus:outline-none  focus:border-orange-500 w-full border rounded-lg px-3 py-2"
              />
            </div>

            {loading ? (
              <button className="px-4 py-3 mt-4 text-center bg-orange-600 text-white w-full flex items-center justify-center gap-2 border cursor-pointer rounded-lg hover:bg-orange-500 transition-all duration-300">
                <LuLoaderCircle className="mr-4 h-5 w-5 animate-spin text-white" />{" "}
                please wait
              </button>
            ) : (
              <button
                onClick={handleResetPassword}
                className="px-4 py-3 mt-4 text-center bg-orange-600 text-white w-full flex items-center justify-center gap-2 border cursor-pointer rounded-lg hover:bg-orange-500 transition-all duration-300"
              >
                Rest Password
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
