import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import reservation from "../assets/reservation.jpg";
import gcash from "../assets/gcash.png"; 

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
        navigate("/reservation-confirmed", {
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
              `url(${reservation}) no-repeat center/cover`,
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
                <div style={{ 
                  textAlign: "center",
                  marginBottom: "20px",
                  position: "relative"
                }}>
                  <div style={{
                    position: "relative",
                    display: "inline-block",
                    padding: "16px",
                    background: "#fff",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    marginBottom: "20px"
                  }}>
                    <img
                      src={gcash}
                      alt="GCash QR"
                      style={{
                        width: "180px",
                        height: "180px",
                        borderRadius: "8px",
                        border: "1px solid #f0f0f0"
                      }}
                    />
                    <div style={{
                      position: "absolute",
                      top: "-8px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#dc2626",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "4px 16px",
                      borderRadius: "20px",
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)"
                    }}>
                      DOWN PAYMENT: ₱100.00
                    </div>
                  </div>
                  
                  <button
                    style={{
                      background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                      color: "#fff",
                      border: "none",
                      padding: "12px 32px",
                      borderRadius: "30px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      margin: "0 auto"
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(220, 38, 38, 0.35)";
                      e.currentTarget.querySelector('.scan-shine').style.transform = 'translateX(100%) rotate(15deg)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(220, 38, 38, 0.25)";
                      e.currentTarget.querySelector('.scan-shine').style.transform = 'translateX(-100%) rotate(15deg)';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
                    </svg>
                    SCAN ME
                    <span className="scan-shine" style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'translateX(-100%) rotate(15deg)',
                      transition: 'transform 0.6s ease',
                      pointerEvents: 'none'
                    }}></span>
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
