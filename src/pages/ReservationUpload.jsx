import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";

export default function ReservationUpload() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const reservationData = location.state || {};

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    const fileInput = document.getElementById("file-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const formatted = value
      .replace(/\D/g, "")
      .replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
    setPhoneNumber(formatted);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!uploadedFile) newErrors.file = "Please upload proof of payment";
    if (!phoneNumber.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (phoneNumber.replace(/\s/g, "").length < 11) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsUploading(true);

      setTimeout(() => {
        setIsUploading(false);
        navigate("/reservation-confirmation", {
          state: {
            ...reservationData,
            phoneNumber,
            uploadedFile: uploadedFile.name,
            paymentStatus: "completed",
          },
        });
      }, 2000);
    }
  };

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 90 }}>
        <section
          style={{
            background:
              "url('https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1600&auto=format&fit=crop') no-repeat center/cover",
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "56px 16px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom right, rgba(0,0,0,0.55), rgba(0,0,0,0.25))",
            }}
          ></div>

          <div
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: 600,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "#dc2626",
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#fff" }}>
                SISZUMGYUPSAL RESERVATION
              </h1>
              <button
                onClick={() => navigate("/reservation-form")}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "16px",
                  cursor: "pointer",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                Back
              </button>
            </div>

            <div style={{ padding: "32px" }}>
              {/* Payment Section */}
              <div
                style={{
                  background: "#f8f9fa",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "24px",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <img
                    src="/gcash-qr.png" // Replace with your real QR code
                    alt="GCash QR"
                    style={{
                      width: "200px",
                      height: "200px",
                      borderRadius: "12px",
                      marginBottom: "10px",
                    }}
                  />
                  <button
                    style={{
                      background: "#dc2626",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    SCAN ME
                  </button>
                </div>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: 0,
                  }}
                >
                  To secure your reservation, kindly send a{" "}
                  <strong>P100 down payment</strong> through GCash.
                </p>
              </div>

              {/* Proof of Payment */}
              <div style={{ marginBottom: "24px" }}>
                <h3>Proof of Payment</h3>
                <div
                  style={{
                    border: `2px dashed ${errors.file ? "#dc2626" : "#d1d5db"}`,
                    borderRadius: "8px",
                    padding: "24px",
                    textAlign: "center",
                    background: "#f9fafb",
                  }}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  {!uploadedFile ? (
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("file-upload").click()
                        }
                        style={{
                          background: "#f97316",
                          color: "#fff",
                          border: "none",
                          padding: "12px 24px",
                          borderRadius: "8px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Upload Here
                      </button>
                      <p style={{ fontSize: "12px", color: "#6b7280" }}>
                        Upload screenshot of your GCash payment
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                      }}
                    >
                      <span>{uploadedFile.name}</span>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        style={{
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                {errors.file && (
                  <p style={{ color: "#dc2626", fontSize: "12px" }}>
                    {errors.file}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div style={{ marginBottom: "24px" }}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="0949 123 4567"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: `1px solid ${
                      errors.phone ? "#dc2626" : "#e2e8f0"
                    }`,
                    borderRadius: "8px",
                  }}
                />
                {errors.phone && (
                  <p style={{ color: "#dc2626", fontSize: "12px" }}>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                style={{
                  width: "100%",
                  background: isUploading ? "#9ca3af" : "#dc2626",
                  color: "#fff",
                  padding: "14px 24px",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: isUploading ? "not-allowed" : "pointer",
                }}
              >
                {isUploading ? "Processing..." : "RESERVE NOW"}
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
