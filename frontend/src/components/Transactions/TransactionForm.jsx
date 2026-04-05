import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  FaDollarSign,
  FaCalendarAlt,
  FaRegCommentDots,
  FaWallet,
  FaPlus,
  FaArrowLeft,
} from "react-icons/fa";
import { listCategoriesAPI } from "../../services/category/categoryService";
import { addTransactionAPI, extractTransactionFromVoiceAPI } from "../../services/transactions/transactionService";
import AlertMessage from "../Alert/AlertMessage";

const validationSchema = Yup.object({
  type: Yup.string()
    .required("Transaction type is required")
    .oneOf(["income", "expense"]),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive"),
  category: Yup.string().required("Category is required"),
  date: Yup.date().required("Date is required"),
  description: Yup.string(),
});

const TransactionForm = () => {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);

  const {
    mutateAsync,
    isPending,
    isError: isAddTranErr,
    error: transErr,
    isSuccess,
  } = useMutation({
    mutationFn: addTransactionAPI,
    mutationKey: ["add-transaction"],
  });

  const { 
    data, 
    isError, 
    isLoading: isCategoriesLoading 
  } = useQuery({
    queryFn: listCategoriesAPI,
    queryKey: ["list-categories"],
  });

  const formik = useFormik({
    initialValues: {
      type: "",
      amount: "",
      category: "",
      date: "",
      description: "",
    },
    validationSchema,
    onSubmit: (values) => {
      mutateAsync(values)
        .then(() => navigate("/dashboard"))
        .catch(console.error);
    },
  });

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const recognition = new SR();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = async (event) => {
        const voiceText = event.results[0][0].transcript;
        console.log("Raw voice input:", voiceText);
        setListening(false);
        setVoiceLoading(true);
        try {
          const { transaction } = await extractTransactionFromVoiceAPI(voiceText);
          console.log("Extracted transaction:", transaction);
          if (transaction?.type && transaction?.amount && transaction?.category) {
            console.log("Voice transaction:", transaction);
            await mutateAsync(transaction);
            navigate("/dashboard");
          } else {
            alert("Gemini couldn't understand the voice input.");
          }
        } catch (err) {
          console.error("Voice processing error:", err);
          alert("Something went wrong while processing your voice input.");
        } finally {
          setVoiceLoading(false);
        }
      };

      recognition.onerror = recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleVoiceAdd = () => {
    if (recognitionRef.current && !listening) {
      setListening(true);
      recognitionRef.current.start();
    } else {
      alert("Voice recognition not supported in this browser.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-t-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-purple-500 transition-colors"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <h2 className="text-xl font-bold">Add Transaction</h2>
            <div className="w-8"></div>
          </div>
          <p className="text-center text-purple-200 text-sm mt-1">
            {formik.values.type === "income" 
              ? "Add money received" 
              : formik.values.type === "expense" 
                ? "Record money spent" 
                : "Track your finances"}
          </p>
        </div>

        <div className="bg-white rounded-b-2xl shadow-xl p-6">
          {/* Voice Processing Loader */}
          {voiceLoading && (
            <div className="flex items-center justify-center text-indigo-600 font-medium mb-4">
              <svg className="animate-spin h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Processing voice input and creating transaction...
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div className="space-y-3">
              {isError && (
                <AlertMessage
                  type="error"
                  message={
                    transErr?.response?.data?.message ||
                    "Failed to load categories"
                  }
                />
              )}
              {isAddTranErr && (
                <AlertMessage
                  type="error"
                  message={
                    transErr?.response?.data?.message ||
                    "Failed to add transaction"
                  }
                />
              )}
              {isSuccess && (
                <AlertMessage 
                  type="success" 
                  message="Transaction added!" 
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="block text-gray-700 text-sm font-medium">
                  <div className="flex items-center">
                    <FaWallet className="mr-1 text-purple-500 text-base" />
                    Type
                  </div>
                </label>
                <div className="relative">
                  <select
                    {...formik.getFieldProps("type")}
                    className={`w-full py-3 pl-10 pr-3 bg-purple-50 rounded-lg border ${
                      formik.touched.type && formik.errors.type
                        ? "border-red-500"
                        : "border-purple-200"
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-base`}
                  >
                    <option value="">Select type</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <FaWallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 text-base" />
                </div>
                {formik.touched.type && formik.errors.type && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.type}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-gray-700 text-sm font-medium">
                  <div className="flex items-center">
                    <FaDollarSign className="mr-1 text-purple-500 text-base" />
                    Amount
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...formik.getFieldProps("amount")}
                    placeholder="0.00"
                    className={`w-full py-3 pl-10 pr-3 bg-purple-50 rounded-lg border ${
                      formik.touched.amount && formik.errors.amount
                        ? "border-red-500"
                        : "border-purple-200"
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-base`}
                  />
                  <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 text-base" />
                </div>
                {formik.touched.amount && formik.errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.amount}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="block text-gray-700 text-sm font-medium">
                  <div className="flex items-center">
                    <FaRegCommentDots className="mr-1 text-purple-500 text-base" />
                    Category
                  </div>
                </label>
                <div className="relative">
                  <select
                    {...formik.getFieldProps("category")}
                    disabled={isCategoriesLoading}
                    className={`w-full py-3 pl-10 pr-3 bg-purple-50 rounded-lg border ${
                      formik.touched.category && formik.errors.category
                        ? "border-red-500"
                        : "border-purple-200"
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-base ${
                      isCategoriesLoading ? "bg-purple-100" : ""
                    }`}
                  >
                    <option value="">Select category</option>
                    {data?.map((category) => (
                      <option key={category?._id} value={category?.name}>
                        {category?.name}
                      </option>
                    ))}
                  </select>
                  <FaRegCommentDots className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 text-base" />
                </div>
                {formik.touched.category && formik.errors.category && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.category}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-gray-700 text-sm font-medium">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1 text-purple-500 text-base" />
                    Date
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    {...formik.getFieldProps("date")}
                    className={`w-full py-3 pl-10 pr-3 bg-purple-50 rounded-lg border ${
                      formik.touched.date && formik.errors.date
                        ? "border-red-500"
                        : "border-purple-200"
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-base`}
                  />
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 text-base" />
                </div>
                {formik.touched.date && formik.errors.date && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.date}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-gray-700 text-sm font-medium">
                <div className="flex items-center">
                  <FaRegCommentDots className="mr-1 text-purple-500 text-base" />
                  Description
                </div>
              </label>
              <textarea
                {...formik.getFieldProps("description")}
                placeholder="Add note (optional)"
                rows="3"
                className="w-full py-3 px-4 bg-purple-50 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-base"
              ></textarea>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={isPending}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center ${
                  isPending
                    ? "bg-purple-400"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                } transition-all duration-300 shadow hover:shadow-md text-base`}
              >
                {isPending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaPlus className="mr-2 text-base" />
                    <span>Add Transaction</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleVoiceAdd}
                disabled={voiceLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-medium rounded-lg shadow-md transition duration-300 disabled:opacity-60"
              >
                {voiceLoading ? "Processing voice..." : "Add via Voice"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;